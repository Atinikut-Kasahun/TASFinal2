<?php

namespace App\Http\Controllers;

use App\Models\JobRequisition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobRequisitionController extends Controller
{
    /**
     * Display a listing of requisitions for the user's tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = JobRequisition::with(['requester', 'approvedBy', 'tenant', 'jobPosting']);

        // Tenant Isolation: Only Global Admins can see across companies.
        if (!$user->hasRole('admin')) {
            $query->where('tenant_id', $user->tenant_id);
        } elseif ($request->has('tenant_id') && !empty($request->tenant_id)) {
            // Allow Global Admin to filter by a specific tenant
            $query->where('tenant_id', $request->tenant_id);
        }

        // Role-based filtering:
        // 1. General Managers (GM) only see their own requests
        if ($user->hasRole('hiring_manager') && !$user->hasRole('managing_director') && !$user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            $query->where('requested_by', $user->id);
        }

        // 2. Managing Directors (MD) see everything in their tenant (to approve/amend)
        // 3. HR Managers see requisitions that passed MD approval (pending_hr) or are fully approved
        if ($user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            $query->whereIn('status', ['pending_hr', 'approved', 'rejected']);
        }

        // 4. TA managers see all fully approved requisitions in their tenant
        if ($user->hasRole('ta_manager') && !$user->hasRole('admin') && !$user->hasRole('hr_manager')) {
            $query->where('status', 'approved');
        }

        if ($request->has('location') && $request->location !== 'All') {
            $query->where('location', $request->location);
        }

        if ($request->has('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }

        if ($request->has('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        if ($request->has('salary_range') && $request->salary_range !== 'All') {
            $range = explode('-', $request->salary_range);
            if (count($range) === 2) {
                $query->whereBetween('budget', [(int) $range[0], (int) $range[1]]);
            } elseif ($request->salary_range === '100000+') {
                $query->where('budget', '>=', 100000);
            }
        }

        if ($request->has('submitted_on') && $request->submitted_on !== 'All') {
            $days = (int) $request->submitted_on;
            $query->where('created_at', '>=', now()->subDays($days));
        }

        if ($request->has('portal') && $request->portal !== 'All') {
            if ($request->portal === 'Posted') {
                $query->has('jobPosting');
            } else {
                $query->doesntHave('jobPosting');
            }
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('department', 'LIKE', "%{$search}%")
                    ->orWhere('priority', 'LIKE', "%{$search}%")
                    ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        // Calculate KPIs using query clones
        $kpis = [
            'open_requests' => (clone $query)->whereIn('status', ['pending_md', 'pending_hr'])->count(),
            'approved_this_quarter' => (clone $query)->where('status', 'approved')
                ->where('approved_at', '>=', now()->startOfQuarter())->count(),
            'team_growth' => (clone $query)->where('status', 'approved')->sum('headcount'),
            'awaiting_approval' => (clone $query)->whereIn('status', ['pending_md', 'pending_hr'])->count(),
            'avg_approval_time_hours' => round((clone $query)->where('status', 'approved')
                ->whereNotNull('approved_at')
                ->get()
                ->avg(function ($r) {
                    return $r->created_at->diffInHours($r->approved_at);
                }) ?? 0, 1),
        ];

        $requisitions = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => $requisitions,
            'kpis' => $kpis
        ]);
    }

    /**
     * Store a newly created requisition.
     */
    public function store(Request $request): JsonResponse
    {
        \Log::info('Requisition Store Request received', [
            'all_data' => $request->all(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type')
        ]);

        $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'headcount' => 'required|integer|min:1',
            'priority' => 'required|in:low,medium,high,urgent',
            'jd_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'jd_content' => 'nullable|string',
        ]);

        $user = $request->user();
        $tenantId = $user->tenant_id;

        if (!$tenantId) {
            return response()->json(['error' => 'No active company context found.'], 400);
        }

        $jdPath = null;
        if ($request->hasFile('jd_file')) {
            $file = $request->file('jd_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $jdPath = $file->storeAs('jds', $filename, 'public');
        }

        $requisition = JobRequisition::create([
            'tenant_id' => $tenantId,
            'requested_by' => $user->id,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'department' => $request->input('department'),
            'location' => $request->input('location'),
            'headcount' => $request->input('headcount') ?? 1,
            'budget' => $request->input('budget'),
            'position_type' => $request->input('position_type') ?? 'new',
            'priority' => $request->input('priority') ?? 'medium',
            'status' => 'pending_md',
            'jd_path' => $jdPath,
            'jd_content' => $request->input('jd_content'),
        ]);

        // Notify Managing Directors initially
        $directors = \App\Models\User::where('tenant_id', $tenantId)
            ->whereHas('roles', function ($q) {
                $q->where('slug', 'managing_director');
            })->get();

        /** @var \App\Models\User $director */
        foreach ($directors as $director) {
            $director->notify(new \App\Notifications\RequisitionApprovalAlert($requisition));
        }

        return response()->json($requisition, 201);
    }

    public function duplicate(string $id, Request $request): JsonResponse
    {
        $original = JobRequisition::findOrFail($id);

        // Security Check
        if (!$request->user()->hasRole('admin') && $original->tenant_id !== $request->user()->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $new = $original->replicate(['status', 'rejection_reason', 'approved_at', 'approved_by']);
        $new->requested_by = $request->user()->id;
        $new->status = 'pending';
        $new->save();

        return response()->json($new, 201);
    }

    /**
     * Bulk approve multiple requisitions (HR Manager only).
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Only HR Managers can bulk approve requisitions.'], 403);
        }

        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer']);

        $query = JobRequisition::whereIn('id', $request->ids)
            ->where('status', 'pending_hr');

        if (!$user->hasRole('admin')) {
            $query->where('tenant_id', $user->tenant_id);
        }

        $updated = $query->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $user->id,
            'hr_approved_at' => now(),
            'hr_approved_by' => $user->id,
        ]);

        return response()->json(['approved_count' => $updated]);
    }

    /**
     * Approve or reject a requisition (TA Manager Role).
     */
    public function updateStatus(string $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string',
        ]);

        $requisition = JobRequisition::findOrFail($id);

        if (!$user->hasRole('admin') && $requisition->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Logic for MD Approval
        if ($user->hasRole('managing_director') && $requisition->status === 'pending_md') {
            if ($request->status === 'rejected') {
                $requisition->update(['status' => 'rejected', 'rejection_reason' => $request->rejection_reason]);
            } else {
                $requisition->update([
                    'status' => 'pending_hr',
                    'md_approved_at' => now(),
                    'md_approved_by' => $user->id
                ]);

                // Notify HR for stage 2
                $hrManagers = \App\Models\User::where('tenant_id', $requisition->tenant_id)
                    ->whereHas('roles', function ($q) {
                        $q->where('slug', 'hr_manager');
                    })->get();
                /** @var \App\Models\User $hr */
                foreach ($hrManagers as $hr) {
                    $hr->notify(new \App\Notifications\RequisitionApprovalAlert($requisition));
                }
            }
            return response()->json($requisition);
        }

        // Logic for HR Approval
        if ($user->hasRole('hr_manager') && $requisition->status === 'pending_hr') {
            $requisition->update([
                'status' => $request->status,
                'rejection_reason' => $request->rejection_reason,
                'approved_at' => $request->status === 'approved' ? now() : null,
                'approved_by' => $request->status === 'approved' ? $user->id : null,
                'hr_approved_at' => $request->status === 'approved' ? now() : null,
                'hr_approved_by' => $request->status === 'approved' ? $user->id : null,
            ]);
            return response()->json($requisition);
        }

        return response()->json(['error' => 'Unauthorized or invalid status transition.'], 403);
    }

    /**
     * Send back for amendment (MD only).
     */
    public function amend(string $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $request->validate([
            'comment' => 'required|string',
        ]);

        $requisition = JobRequisition::findOrFail($id);

        if (!$user->hasRole('managing_director') && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Only Managing Directors can request amendments.'], 403);
        }

        $requisition->update([
            'status' => 'amendment_required',
            'amendment_comment' => $request->comment
        ]);

        // Notify GM (Requester)
        if ($requisition->requester) {
            $requisition->requester->notify(new \App\Notifications\GeneralNotification(
                "Amendment Required",
                "Your requisition '{$requisition->title}' needs revision: " . $request->comment
            ));
        }

        return response()->json($requisition);
    }

    /**
     * GM updates and resubmits for MD approval.
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $requisition = JobRequisition::findOrFail($id);
        $user = $request->user();

        if ($requisition->requested_by !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($requisition->status !== 'amendment_required' && $requisition->status !== 'pending_md') {
            return response()->json(['error' => 'Requisition is currently locked for editing.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'headcount' => 'required|integer|min:1',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        $requisition->update($request->only(['title', 'description', 'department', 'location', 'headcount', 'budget', 'position_type', 'priority', 'jd_content']));
        $requisition->update(['status' => 'pending_md']); // Reset to MD approval

        return response()->json($requisition);
    }

    /**
     * Securely serve the JD document.
     */
    public function downloadJd(string $id, Request $request)
    {
        $requisition = JobRequisition::findOrFail($id);

        // Security Check: Ensure user belongs to the same tenant or is global admin
        $user = $request->user();

        if ($user && !$user->hasRole('admin') && $requisition->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$requisition->jd_path) {
            return response()->json(['error' => 'No JD document attached to this requisition.'], 404);
        }

        // Use Laravel Storage facade for reliable cross-platform path resolution
        $disk = \Illuminate\Support\Facades\Storage::disk('public');

        if (!$disk->exists($requisition->jd_path)) {
            return response()->json([
                'error' => 'File not found on server.',
                'path' => $requisition->jd_path,
            ], 404);
        }

        $fullPath = $disk->path($requisition->jd_path);
        $extension = strtolower(pathinfo($requisition->jd_path, PATHINFO_EXTENSION));
        $originalName = basename($requisition->jd_path);

        // Determine MIME type and disposition
        $mimeMap = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        $contentType = $mimeMap[$extension] ?? 'application/octet-stream';

        // PDFs open inline in the browser; Word docs must be downloaded
        $disposition = ($extension === 'pdf') ? 'inline' : 'attachment';

        // Clean filename for the Content-Disposition header (remove non-ASCII chars)
        $safeFilename = 'JD_REQ' . $requisition->id . '.' . $extension;

        return response()->file($fullPath, [
            'Content-Type' => $contentType,
            'Content-Disposition' => $disposition . '; filename="' . $safeFilename . '"',
        ]);
    }
}
