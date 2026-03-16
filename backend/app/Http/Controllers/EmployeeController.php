<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmployeeController extends Controller
{
    /**
     * List all users (employees) for the authenticated user's tenant.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantId = $request->attributes->get('tenant_id') ?? $user->tenant_id;
 
        $query = User::with('roles');
        
        if ($tenantId) {
            $query->where('tenant_id', $tenantId);
        }

        // TA Managers filter: See the regular workforce, but hide internal management/recruitment staff.
        if ($user->hasRole('ta_manager') && !$user->hasRole('admin')) {
            $query->where(function($q) {
                $q->whereHas('roles', function($rq) {
                    $rq->whereIn('slug', ['employee', 'staff']);
                })
                ->orWhereDoesntHave('roles'); // Show users with no roles (newly promoted fallback)
            })
            ->whereDoesntHave('roles', function($rq) {
                // But explicitly hide these internal roles from the TA view
                $rq->whereIn('slug', ['ta_manager', 'admin', 'managing_director']);
            });
        }

        // Allow filtering by status
        if ($request->has('status') && $request->status !== 'All') {
            $query->where('employment_status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('department', 'like', "%{$s}%");
            });
        }

        if ($request->has('department') && $request->department !== 'All') {
            $query->where('department', $request->department);
        }

        $perPage = $request->input('per_page', 20);
        $employees = $query->latest()->paginate($perPage);

        return response()->json($employees);
    }

    /**
     * Mark an employee as Resigned or Terminated.
     * Records the separation_date and separation_reason, then feeds turnover graph.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $admin = $request->user();

        $employee = User::where('id', $id)
            ->where('tenant_id', $admin->tenant_id)
            ->firstOrFail();

        $validated = $request->validate([
            'employment_status' => 'required|in:active,resigned,terminated',
            'separation_date' => 'nullable|date',
            'separation_reason' => 'nullable|string|max:500',
            'joined_date' => 'nullable|date',
        ]);

        // When marking as separated, default separation_date to today
        if (in_array($validated['employment_status'], ['resigned', 'terminated'])) {
            $validated['separation_date'] = $validated['separation_date'] ?? now()->toDateString();
        } else {
            // Re-activating clears separation info
            $validated['separation_date'] = null;
            $validated['separation_reason'] = null;
        }

        $employee->update($validated);
        $employee->load('roles');

        // Bust the dashboard cache so turnover graph updates immediately
        \Illuminate\Support\Facades\Cache::forget("ta_manager_dashboard_stats_{$admin->tenant_id}");

        return response()->json([
            'message' => 'Employee status updated successfully',
            'employee' => $employee,
        ]);
    }

    /**
     * Monthly turnover rate for the last N months.
     *
     * Formula per month:
     *   separations_in_month / avg(headcount_start_of_month, headcount_end_of_month) * 100
     *
     * Returns: [{ label: 'Jan', rate: 4.2 }, ...]
     */
    public function turnoverData(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        if (!$tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $months = (int) $request->input('months', 12);
        $months = max(3, min($months, 24));

        $result = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = Carbon::now()->startOfMonth()->subMonths($i);
            $monthEnd = $monthStart->copy()->endOfMonth();

            // Headcount at start of month = joined before start AND (still active OR separated after month end)
            $headcountStart = User::where('tenant_id', $tenantId)
                ->where(function ($q) use ($monthStart) {
                    $q->whereNull('joined_date')
                        ->orWhere('joined_date', '<=', $monthStart);
                })
                ->where(function ($q) use ($monthStart) {
                    // Either still active, or separated after month start
                    $q->where('employment_status', 'active')
                        ->orWhere(function ($q2) use ($monthStart) {
                        $q2->whereIn('employment_status', ['resigned', 'terminated'])
                            ->where('separation_date', '>=', $monthStart);
                    });
                })
                ->count();

            // Headcount at end of month
            $headcountEnd = User::where('tenant_id', $tenantId)
                ->where(function ($q) use ($monthEnd) {
                    $q->whereNull('joined_date')
                        ->orWhere('joined_date', '<=', $monthEnd);
                })
                ->where(function ($q) use ($monthEnd) {
                    $q->where('employment_status', 'active')
                        ->orWhere(function ($q2) use ($monthEnd) {
                            $q2->whereIn('employment_status', ['resigned', 'terminated'])
                                ->where('separation_date', '>', $monthEnd);
                        });
                })
                ->count();

            // Separations that happened within this month (users + hired applicants)
            $userSeparations = User::where('tenant_id', $tenantId)
                ->whereIn('employment_status', ['resigned', 'terminated'])
                ->whereBetween('separation_date', [$monthStart, $monthEnd])
                ->count();

            $applicantSeparations = Applicant::where('tenant_id', $tenantId)
                ->whereIn('employment_status', ['resigned', 'terminated'])
                ->whereBetween('separation_date', [$monthStart, $monthEnd])
                ->count();

            $separations = $userSeparations + $applicantSeparations;

            $avgHeadcount = ($headcountStart + $headcountEnd) / 2;
            $rate = $avgHeadcount > 0
                ? round(($separations / $avgHeadcount) * 100, 1)
                : 0;

            $result[] = [
                'label' => $monthStart->format('M'),
                'year' => (int) $monthStart->format('Y'),
                'month' => (int) $monthStart->format('n'),
                'separations' => $separations,
                'headcount' => round($avgHeadcount),
                'rate' => $rate,
            ];
        }

        // Trend: compare last month rate to the month before
        $lastRate = count($result) >= 1 ? $result[count($result) - 1]['rate'] : 0;
        $prevRate = count($result) >= 2 ? $result[count($result) - 2]['rate'] : 0;
        $trendPct = $prevRate > 0
            ? round((($lastRate - $prevRate) / $prevRate) * 100, 1)
            : ($lastRate > 0 ? 100 : 0);

        return response()->json([
            'turnover' => $result,
            'trend' => $trendPct,
            'last_rate' => $lastRate,
        ]);
    }
    /**
     * Detailed list of employees who left (resigned or terminated).
     * Includes Name, Status, Date, Department, Profession, and Reason.
     */
    public function turnoverList(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        if (!$tenantId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // 1. Get separations from User table (Internal Employees)
        $users = User::where('tenant_id', $tenantId)
            ->whereIn('employment_status', ['resigned', 'terminated'])
            ->select(['id', 'name', 'email', 'department', 'employment_status', 'separation_date', 'separation_reason'])
            ->get()
            ->map(function($u) {
                $u->profession = 'General Staff';
                $u->source = 'Employee';
                return $u;
            });

        // 2. Get separations from Applicant table (Portal Hires)
        $applicants = Applicant::where('applicants.tenant_id', $tenantId)
            ->join('job_postings', 'applicants.job_posting_id', '=', 'job_postings.id')
            ->leftJoin('job_requisitions', 'job_postings.job_requisition_id', '=', 'job_requisitions.id')
            ->whereIn('applicants.employment_status', ['resigned', 'terminated'])
            ->select([
                'applicants.id', 'applicants.name', 'applicants.email', 
                'applicants.employment_status', 'applicants.separation_date', 'applicants.separation_reason',
                'job_postings.title as profession',
                DB::raw('COALESCE(job_postings.department, job_requisitions.department) as department')
            ])
            ->get()
            ->map(function($a) {
                $a->source = 'System Hire';
                return $a;
            });

        $all = $users->concat($applicants)->sortByDesc('separation_date')->values();

        return response()->json($all);
    }
}
