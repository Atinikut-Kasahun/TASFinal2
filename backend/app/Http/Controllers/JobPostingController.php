<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use App\Models\JobRequisition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobPostingController extends Controller
{
    /**
     * Display internal job postings.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = JobPosting::with('requisition')->withCount('applicants');
        if (!$user->hasRole('admin')) {
            $query->where('tenant_id', $user->tenant_id);
        }

        // If the user is specifically a hiring manager (not an admin or TA manager),
        // only show jobs derived from their explicit requisitions.
        if ($user->hasRole('hiring_manager') && !$user->hasRole('admin') && !$user->hasRole('ta_manager')) {
            $query->whereHas('requisition', function ($q) use ($user) {
                $q->where('requested_by', $user->id);
            });
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhere('department', 'LIKE', "%{$search}%")
                    ->orWhereHas('requisition', function ($sq) use ($search) {
                        $sq->where('department', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($request->has('position') && $request->position) {
            $query->where('title', 'LIKE', '%' . $request->position . '%');
        }

        if ($request->has('location') && $request->location && $request->location !== 'All') {
            $query->where('location', 'LIKE', '%' . $request->location . '%');
        }

        if ($request->has('department') && $request->department && $request->department !== 'All') {
            $query->where(function ($q) use ($request) {
                $q->where('department', $request->department)
                    ->orWhereHas('requisition', function ($sq) use ($request) {
                        $sq->where('department', $request->department);
                    });
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            if ($request->status === 'ACTIVE' || $request->status === 'active') {
                $query->where('status', 'active');
            } else if ($request->status === 'ARCHIVED' || $request->status === 'closed') {
                $query->where('status', 'closed');
            } else {
                $query->where('status', strtolower($request->status));
            }
        } else if ($request->has('status') && $request->status) {
            // fallback logic
            $query->where('status', strtolower($request->status));
        }

        $perPage = $request->input('per_page', 10);
        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

    /**
     * Create a job posting from a requisition.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_requisition_id' => 'required|exists:job_requisitions,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string',
            'type' => 'required|in:full-time,part-time,contract',
            'deadline' => 'nullable|date|after:today',
        ]);

        $user = $request->user();
        $requisition = JobRequisition::findOrFail($request->job_requisition_id);

        // Security check
        if (!$user->hasRole('admin') && $requisition->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($requisition->status !== 'approved') {
            return response()->json(['error' => 'Requisition must be approved before posting.'], 400);
        }

        $job = JobPosting::create([
            'tenant_id' => $requisition->tenant_id,
            'job_requisition_id' => $requisition->id,
            'title' => $request->title,
            'department' => $requisition->department,
            'description' => $request->description,
            'location' => $requisition->location,
            'type' => $request->type,
            'published_at' => now(),
            'deadline' => $request->deadline,
            'status' => 'active',
        ]);

        return response()->json($job, 201);
    }

    /**
     * Public endpoint to list active jobs.
     */
    public function publicIndex(): JsonResponse
    {
        $perPage = request()->input('per_page', 9);
        $query = JobPosting::with('tenant')
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('deadline')
                    ->orWhere('deadline', '>=', now()->toDateString());
            });

        if (request()->has('department') && request()->department && request()->department !== 'All Departments') {
            $query->where('department', request()->department);
        }

        if (request()->has('search') && request()->search) {
            $search = request()->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%")
                    ->orWhere('department', 'LIKE', "%{$search}%");
            });
        }

        $jobs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Public endpoint to show a specific job.
     */
    public function publicShow(string $id): JsonResponse
    {
        $job = JobPosting::with('tenant')
            ->where('status', 'active')
            ->findOrFail($id);

        return response()->json($job);
    }

    /**
     * Global Admin: all jobs across all companies.
     */
    public function indexGlobal(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->role_slug === 'admin' && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Global analytical access is restricted to system administrators.'], 403);
        }

        $query = JobPosting::with(['tenant', 'requisition'])
            ->withCount('applicants');

        if ($request->has('tenant_id') && $request->tenant_id) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('department', 'LIKE', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

    /**
     * Manually close a job posting.
     */
    public function close(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $job = JobPosting::findOrFail($id);

        // Security check
        if (!$user->hasRole('admin') && $job->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $job->update(['status' => 'closed']);

        return response()->json(['message' => 'Job closed successfully', 'job' => $job]);
    }
}
