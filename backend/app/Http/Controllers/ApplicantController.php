<?php

namespace App\Http\Controllers;

use App\Mail\StatusChanged;
use App\Models\Applicant;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Notifications\ApplicantStatusUpdated;
use App\Notifications\DirectMessage;

class ApplicantController extends Controller
{
    /**
     * Display a listing of applicants.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');
        $tenantId = $user->tenant_id;

        $query = Applicant::query()
            ->with(['jobPosting', 'tenant']);

        if ($request->status === 'hired') {
            $query->orderBy('hired_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        if (!$isAdmin) {
            $query->where('tenant_id', $tenantId);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            if ($request->status === 'active') {
                $query->whereIn('status', ['new', 'written_exam', 'technical_interview', 'final_interview', 'interview', 'offer']);
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('job_id') && !in_array($request->job_id, ['All', 'ALL'])) {
            $query->where('job_posting_id', $request->job_id);
        }

        if ($request->has('experience') && $request->experience !== 'All') {
            match ($request->experience) {
                'under_1', '0-1' => $query->where('years_of_experience', '<', 1),
                '1-3'            => $query->whereBetween('years_of_experience', [1, 3]),
                '3-5'            => $query->whereBetween('years_of_experience', [3, 5]),
                '5-10'           => $query->whereBetween('years_of_experience', [5, 10]),
                '10+'            => $query->where('years_of_experience', '>', 10),
                default          => null,
            };
        }

        if ($request->has('department') && $request->department !== 'All') {
            $query->whereHas('jobPosting', fn($q) => $q->where('department', $request->department));
        }

        if ($request->has('gender') && $request->gender !== 'All') {
            $query->where('gender', $request->gender);
        }

        if ($request->has('min_score') && $request->min_score > 0) {
            $query->where(
                fn($q) => $q
                    ->where('written_exam_score', '>=', $request->min_score)
                    ->orWhere('technical_interview_score', '>=', $request->min_score)
            );
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(
                fn($q) => $q
                    ->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhereHas(
                        'jobPosting',
                        fn($jq) => $jq
                            ->where('title', 'LIKE', "%{$search}%")
                            ->orWhere('department', 'LIKE', "%{$search}%")
                    )
            );
        }

        if ($request->has('applied_on') && $request->applied_on !== 'All') {
            $query->where('created_at', '>=', now()->subDays((int) $request->applied_on));
        }

        if ($request->has('hired_on') && $request->hired_on !== 'All') {
            $query->where('hired_at', '>=', now()->subDays((int) $request->hired_on));
        }

        return response()->json($query->paginate($request->get('limit', 15)));
    }

    /**
     * Store a new applicant.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_posting_id' => 'required|exists:job_postings,id',
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|max:255',
            'phone'          => 'nullable|string|max:20',
            'resume_path'    => 'nullable|string',
            'source'         => 'nullable|string',
        ]);

        $jobPosting = JobPosting::findOrFail($request->job_posting_id);

        $applicant = Applicant::create([
            'tenant_id'      => $jobPosting->tenant_id,
            'job_posting_id' => $request->job_posting_id,
            'name'           => $request->name,
            'email'          => $request->email,
            'phone'          => $request->phone,
            'resume_path'    => $request->resume_path,
            'source'         => $request->source ?? 'website',
            'status'         => 'new',
        ]);

        return response()->json($applicant, 201);
    }

    /**
     * Display an applicant.
     */
    public function show($id, Request $request): JsonResponse
    {
        $applicant = Applicant::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('admin') && $applicant->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized access to applicant data.'], 403);
        }

        return response()->json($applicant->load(['jobPosting', 'tenant', 'interviews']));
    }

    /**
     * Update the applicant's pipeline status.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status'                    => 'required|string|in:new,written_exam,technical_interview,final_interview,offer,hired,onboarding,rejected',
            'written_exam_score'        => 'nullable|numeric',
            'technical_interview_score' => 'nullable|numeric',
            'interviewer_feedback'      => 'nullable|string',
            'exam_paper'                => 'nullable|file|mimes:pdf,doc,docx,jpg,png,jpeg|max:10240',
            'rejection_note'            => 'nullable|string',
            'offer_notes'               => 'nullable|string',
            'contract_path'             => 'nullable|string',
            'contract_signed'           => 'nullable|boolean',
            'id_verified'               => 'nullable|boolean',
            'bank_account'              => 'nullable|string',
            'tax_id'                    => 'nullable|string',
            'payroll_setup'             => 'nullable|boolean',
            'workstation_ready'         => 'nullable|boolean',
            'company_email'             => 'nullable|string',
            'email_created'             => 'nullable|boolean',
            'office_tour_done'          => 'nullable|boolean',
            'orientation_date'          => 'nullable|date',
            'orientation_done'          => 'nullable|boolean',
        ]);

        $applicant = Applicant::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('admin') && $applicant->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized: Cross-tenant modification denied.'], 403);
        }

        $data = $request->only([
            'status',
            'written_exam_score',
            'technical_interview_score',
            'interviewer_feedback',
            'offered_salary',
            'start_date',
            'contract_signed',
            'id_verified',
            'bank_account',
            'tax_id',
            'payroll_setup',
            'workstation_ready',
            'company_email',
            'email_created',
            'office_tour_done',
            'orientation_date',
            'orientation_done',
        ]);

        if ($request->hasFile('contract_file')) {
            $relativePath = $request->file('contract_file')->store('contracts', 'public');
            $data['contract_path'] = $relativePath;
        }

        if ($request->has('rejection_note')) {
            $data['interviewer_feedback'] = $request->rejection_note;
        } elseif ($request->has('offer_notes')) {
            $data['interviewer_feedback'] = $request->offer_notes;
        }

        $examPaperAbsPath = null;
        if ($request->hasFile('exam_paper')) {
            $relativePath = $request->file('exam_paper')->store('exam_papers', 'public');
            $data['exam_paper_path'] = $relativePath;
            $examPaperAbsPath = storage_path('app/public/' . $relativePath);
        } elseif ($applicant->exam_paper_path) {
            $examPaperAbsPath = storage_path('app/public/' . $applicant->exam_paper_path);
        }

        $offerLetterAbsPath = null;
        if ($request->hasFile('offer_letter')) {
            $relativePath = $request->file('offer_letter')->store('offer_letters', 'public');
            $data['offer_letter_path'] = $relativePath;
            $offerLetterAbsPath = storage_path('app/public/' . $relativePath);
        }

        if ($request->status === 'hired' && $applicant->status !== 'hired') {
            $data['hired_at'] = now();
        }

        $oldStatus = $applicant->status;
        $applicant->update($data);

        if ($oldStatus !== $applicant->status) {
            $this->sendStatusEmail(
                $applicant->fresh(['jobPosting', 'tenant']),
                $oldStatus,
                $applicant->status,
                $offerLetterAbsPath,
                $request->input('interview_message'),
                $examPaperAbsPath
            );
            $applicant->notify(new ApplicantStatusUpdated($applicant, $oldStatus, $applicant->status));
        } elseif ($request->has('written_exam_score') || $request->has('technical_interview_score')) {
            $applicant->notify(new ApplicantStatusUpdated($applicant, $oldStatus, $applicant->status));
        }

        return response()->json($applicant);
    }

    /**
     * Send the correct email for a given status transition.
     */
    private function sendStatusEmail(
        Applicant $applicant,
        string $oldStatus,
        string $newStatus,
        ?string $offerLetterPath = null,
        ?string $interviewMessage = null,
        ?string $examPaperPath = null
    ): void {
        $emailableStatuses = ['written_exam', 'technical_interview', 'final_interview', 'offer', 'hired', 'rejected'];

        if (!in_array($newStatus, $emailableStatuses)) return;
        if (empty($applicant->email)) return;

        try {
            Mail::to($applicant->email)
                ->send(new StatusChanged($applicant, $oldStatus, $newStatus, $offerLetterPath, null, $interviewMessage, $examPaperPath));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Status-change email failed', [
                'applicant_id' => $applicant->id,
                'email'        => $applicant->email,
                'new_status'   => $newStatus,
                'error'        => $e->getMessage(),
            ]);
        }
    }

    public function mention(Request $request, $id): JsonResponse
    {
        $request->validate(['message' => 'required|string']);

        $applicant = Applicant::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('admin') && $applicant->tenant_id !== $user->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $applicant->notify(new DirectMessage(
            $user->name,
            $user->id,
            $request->message,
            $applicant->name,
            $applicant->id
        ));

        return response()->json(['message' => 'Notification sent to applicant successfully']);
    }

    /**
     * Promote an onboarding applicant to a Staff (User) record.
     */
    public function promoteToStaff(Request $request, $id): JsonResponse
    {
        $admin = $request->user();
        $applicant = Applicant::findOrFail($id);

        if (!$admin->hasRole('admin') && $applicant->tenant_id !== $admin->tenant_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if already promoted or exists
        $existingUser = \App\Models\User::where('email', $applicant->email)->first();
        if ($existingUser) {
            // Ensure the 'employee' role exists
            $employeeRole = \App\Models\Role::firstOrCreate(['slug' => 'employee'], ['name' => 'Staff Employee (Hired)']);
            
            // Link them up and update both User and Applicant
            $existingUser->roles()->syncWithoutDetaching([$employeeRole->id]);
            $existingUser->update([
                'employment_status' => 'active',
                'department' => $existingUser->department ?? ($applicant->jobPosting->department ?? 'Operations')
            ]);
            
            $applicant->update([
                'status' => 'staff', 
                'employment_status' => 'active',
                'hired_at' => $applicant->hired_at ?? now()
            ]);

            return response()->json([
                'message' => 'Staff record updated and linked. They should now appear in the Staff tab.',
                'user'    => $existingUser->load('roles')
            ]);
        }

        return \Illuminate\Support\Facades\DB::transaction(function() use ($applicant, $admin) {
            // Create user
            $user = \App\Models\User::create([
                'name'              => $applicant->name,
                'email'             => $applicant->email,
                'password'          => $applicant->password ?? \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(12)),
                'tenant_id'         => $applicant->tenant_id,
                'department'        => $applicant->jobPosting->department ?? 'Operations',
                'joined_date'       => $applicant->start_date ?? now(),
                'employment_status' => 'active',
            ]);

            // Assign 'employee' role (ensure it exists)
            $employeeRole = \App\Models\Role::firstOrCreate(['slug' => 'employee'], ['name' => 'Staff Employee (Hired)']);
            $user->roles()->sync([$employeeRole->id]);

            // Update applicant status
            $applicant->update([
                'status' => 'staff',
                'employment_status' => 'active',
                'hired_at' => $applicant->hired_at ?? now()
            ]);

            // Clear cache
            \Illuminate\Support\Facades\Cache::forget("ta_manager_dashboard_stats_{$admin->tenant_id}");

            return response()->json([
                'message' => 'Applicant promoted to Staff successfully.',
                'user'    => $user
            ]);
        });
    }

    public function updateEmploymentStatus(Request $request, $id): JsonResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'employment_status' => 'required|in:active,resigned,terminated',
            'separation_date'   => 'nullable|date',
            'separation_reason' => 'nullable|string|max:500',
        ]);

        $applicant = Applicant::where('id', $id)
            ->where('tenant_id', $admin->tenant_id)
            ->firstOrFail();

        if (in_array($validated['employment_status'], ['resigned', 'terminated'])) {
            $validated['separation_date'] = $validated['separation_date'] ?? now()->toDateString();
        } else {
            $validated['separation_date']   = null;
            $validated['separation_reason'] = null;
        }

        $applicant->update($validated);

        \Illuminate\Support\Facades\Cache::forget("ta_manager_dashboard_stats_{$admin->tenant_id}");

        return response()->json([
            'message'   => 'Employment status updated successfully',
            'applicant' => $applicant,
        ]);
    }

    /**
     * Dashboard stats for the HR Manager Reports tab.
     * All response keys are aligned with HRManagerDashboard.tsx
     */
    public function stats(Request $request): JsonResponse
    {
        $user     = $request->user();
        $isAdmin  = $user->hasRole('admin');
        $tenantId = $user->tenant_id;

        // ── Base applicant query (tenant-scoped) ─────────────────────────────
        $query = \App\Models\Applicant::query()
            ->select('applicants.*')
            ->join('job_postings', 'applicants.job_posting_id', '=', 'job_postings.id')
            ->leftJoin('job_requisitions', 'job_postings.job_requisition_id', '=', 'job_requisitions.id')
            ->leftJoin('tenants', 'applicants.tenant_id', '=', 'tenants.id');

        if (!$isAdmin) {
            $query->where('applicants.tenant_id', $tenantId);
        }

        // ── Filters ──────────────────────────────────────────────────────────
        if ($request->filled('department') && $request->department !== 'All') {
            $dept = $request->department;
            $query->where(fn($q) => $q
                ->where('job_postings.department', $dept)
                ->orWhere('job_requisitions.department', $dept)
            );
        }

        if ($request->filled('job_id') && $request->job_id !== 'All') {
            $query->where('applicants.job_posting_id', $request->job_id);
        }

        $yearFilter = null;
        if ($request->filled('date_range') && $request->date_range !== 'All') {
            $val = $request->date_range;
            if (strlen($val) === 4 && is_numeric($val)) {
                $yearFilter = (int) $val;
                $query->whereYear('applicants.created_at', $yearFilter);
            } else {
                $query->where('applicants.created_at', '>=', now()->subDays((int) $val));
            }
        }

        // ── Funnel counts ────────────────────────────────────────────────────
        $funnelStats = (clone $query)->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN applicants.status = 'hired' THEN 1 ELSE 0 END) as hired,
            SUM(CASE WHEN applicants.status = 'offer' THEN 1 ELSE 0 END) as offer_count
        ")->first();

        $screeningCount    = (clone $query)
            ->whereIn('applicants.status', ['screening', 'written_exam'])
            ->count();

        $interviewingCount = (clone $query)
            ->whereIn('applicants.status', ['technical_interview', 'final_interview'])
            ->count();

        // ── Department breakdown ─────────────────────────────────────────────
        $byDepartment = (clone $query)
            ->selectRaw('COALESCE(job_postings.department, job_requisitions.department) as department, COUNT(applicants.id) as count')
            ->groupByRaw('COALESCE(job_postings.department, job_requisitions.department)')
            ->orderByDesc('count')
            ->get()
            ->filter(fn($d) => !empty($d->department))
            ->values();

        // ── Average time to hire ─────────────────────────────────────────────
        $driver = \Illuminate\Support\Facades\DB::connection()->getDriverName();
        $avgTimeToHire = $driver === 'sqlite'
            ? (clone $query)
                ->where('applicants.status', 'hired')
                ->selectRaw('AVG(julianday(applicants.updated_at) - julianday(applicants.created_at)) as avg_days')
                ->value('avg_days') ?? 0
            : (clone $query)
                ->where('applicants.status', 'hired')
                ->selectRaw('AVG(DATEDIFF(applicants.updated_at, applicants.created_at)) as avg_days')
                ->value('avg_days') ?? 0;

        // ── Application timeline (12 months) ────────────────────────────────
        $baseDate = $yearFilter
            ? now()->setYear($yearFilter)->setMonth(12)->setDay(31)
            : now();

        $timeline = [];
        for ($i = 11; $i >= 0; $i--) {
            $tempDate   = (clone $baseDate)->subMonths($i);
            $month      = $tempDate->format('Y-m');
            $timeline[] = [
                'label' => $tempDate->format('M'),
                'count' => (clone $query)
                    ->where('applicants.created_at', 'LIKE', "{$month}%")
                    ->count(),
            ];
        }

        // ── Turnover data (12 months) ────────────────────────────────────────
        $deptFilter = $request->input('department');

        $activeUsersCount = \App\Models\User::where('tenant_id', $tenantId)
            ->where(fn($q) => $q
                ->whereNull('employment_status')
                ->orWhere('employment_status', 'active')
            )->count();

        $activeApplicantsCount = \App\Models\Applicant::where('tenant_id', $tenantId)
            ->where('status', 'hired')
            ->where(fn($q) => $q
                ->whereNull('employment_status')
                ->orWhere('employment_status', 'active')
            )->count();

        $totalHeadcount = max($activeUsersCount + $activeApplicantsCount, 1);

        $turnoverData = [];
        for ($i = 11; $i >= 0; $i--) {
            $tempDate   = (clone $baseDate)->subMonths($i);
            $monthStart = (clone $tempDate)->startOfMonth();
            $monthEnd   = (clone $tempDate)->endOfMonth();

            $userSepsQ = \App\Models\User::where('tenant_id', $tenantId)
                ->whereIn('employment_status', ['resigned', 'terminated'])
                ->whereBetween('separation_date', [$monthStart, $monthEnd]);

            if ($deptFilter && $deptFilter !== 'All') {
                $userSepsQ->where('department', $deptFilter);
            }

            $appSepsQ = \App\Models\Applicant::where('applicants.tenant_id', $tenantId)
                ->join('job_postings', 'applicants.job_posting_id', '=', 'job_postings.id')
                ->leftJoin('job_requisitions', 'job_postings.job_requisition_id', '=', 'job_requisitions.id')
                ->whereIn('applicants.employment_status', ['resigned', 'terminated'])
                ->whereBetween('applicants.separation_date', [$monthStart, $monthEnd]);

            if ($deptFilter && $deptFilter !== 'All') {
                $appSepsQ->where(fn($q) => $q
                    ->where('job_postings.department', $deptFilter)
                    ->orWhere('job_requisitions.department', $deptFilter)
                );
            }

            $resigned   = (clone $userSepsQ)->where('employment_status', 'resigned')->count()
                        + (clone $appSepsQ)->where('applicants.employment_status', 'resigned')->count();

            $terminated = (clone $userSepsQ)->where('employment_status', 'terminated')->count()
                        + (clone $appSepsQ)->where('applicants.employment_status', 'terminated')->count();

            $totalSeps  = $resigned + $terminated;

            $turnoverData[] = [
                'label'      => $tempDate->format('M'),
                'full_label' => $tempDate->format('F Y'),
                'rate'       => round(($totalSeps / $totalHeadcount) * 100, 1),
                'resigned'   => $resigned,
                'terminated' => $terminated,
                'total'      => $totalSeps,
            ];
        }

        // ── Real retention rate ──────────────────────────────────────────────
        $periodSeparations = array_sum(array_column($turnoverData, 'total'));
        $retentionRate     = $totalHeadcount > 0
            ? round((1 - ($periodSeparations / $totalHeadcount)) * 100, 1)
            : 100.0;
        $retentionRate     = max(0, min(100, $retentionRate));

        // ── Active jobs count ────────────────────────────────────────────────
        $activeJobsCount = \App\Models\JobPosting::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        // ── Sources breakdown ────────────────────────────────────────────────
        $sources = (clone $query)
            ->selectRaw('applicants.source, COUNT(applicants.id) as count')
            ->groupBy('applicants.source')
            ->orderByDesc('count')
            ->get();

        // ── Requisitions summary ─────────────────────────────────────────────
        $reqQuery = \App\Models\JobRequisition::query();
        if (!$isAdmin) {
            $reqQuery->where('tenant_id', $tenantId);
        }
        if ($request->filled('department') && $request->department !== 'All') {
            $reqQuery->where('department', $request->department);
        }
        $reqStats = $reqQuery->selectRaw('COUNT(*) as total, SUM(CASE WHEN status IN ("pending_hr","pending_md") THEN 1 ELSE 0 END) as pending')->first();

        return response()->json([
            'funnel' => [
                'applied'      => $funnelStats->total,
                'screening'    => $screeningCount,
                'interviewing' => $interviewingCount,
                'offer'        => $funnelStats->offer_count,
                'hired'        => $funnelStats->hired,
            ],
            'by_department'    => $byDepartment,
            'avg_time_to_hire' => round($avgTimeToHire, 1),
            'timeline'         => $timeline,
            'turnover'         => $turnoverData,
            'metrics'          => [
                'total_employees' => $totalHeadcount,
                'retention_rate'  => $retentionRate,
                'active_jobs'     => $activeJobsCount,
            ],
            'sources'      => $sources,
            'requisitions' => [
                'total'   => $reqStats->total   ?? 0,
                'pending' => $reqStats->pending  ?? 0,
            ],
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Export logic not fully implemented yet']);
    }
}
