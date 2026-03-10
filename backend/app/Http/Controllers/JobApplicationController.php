<?php

namespace App\Http\Controllers;

use App\Mail\ApplicationReceived;
use App\Models\Applicant;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class JobApplicationController extends Controller
{
    /**
     * Public endpoint — applicant submits their application.
     * Sends a confirmation email immediately after storing.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_posting_id'          => 'required|exists:job_postings,id',
            'name'                    => 'required|string|max:255',
            'email'                   => 'required|email|max:255',
            'phone'                   => 'nullable|string|max:20',
            'years_of_experience'     => 'nullable|integer|min:0',
            'professional_background' => 'nullable|string',
            'portfolio_link'          => 'nullable|url|max:255',
            'source'                  => 'nullable|string|max:100',
            'resume'                  => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $jobPosting = JobPosting::with('tenant')->findOrFail($request->job_posting_id);

        // Check if this job is still accepting applications
        if ($jobPosting->status !== 'active') {
            return response()->json(['message' => 'This position is no longer accepting applications.'], 422);
        }

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        $applicant = Applicant::create([
            'tenant_id'               => $jobPosting->tenant_id,
            'job_posting_id'          => $jobPosting->id,
            'name'                    => $request->name,
            'email'                   => $request->email,
            'phone'                   => $request->phone,
            'resume_path'             => $resumePath,
            'years_of_experience'     => $request->years_of_experience,
            'professional_background' => $request->professional_background,
            'portfolio_link'          => $request->portfolio_link,
            'source'                  => $request->source ?? 'website',
            'status'                  => 'new',
        ]);

        // ── Send confirmation email to applicant ────────────────────────────────
        try {
            Mail::to($applicant->email)
                ->send(new ApplicationReceived($applicant, $jobPosting));
        } catch (\Throwable $e) {
            Log::error('Application confirmation email failed', [
                'applicant_id' => $applicant->id,
                'email'        => $applicant->email,
                'error'        => $e->getMessage(),
            ]);
            // Do NOT fail the request if email sending fails
        }

        return response()->json([
            'message'      => 'Application submitted successfully! A confirmation email has been sent to ' . $applicant->email,
            'applicant_id' => $applicant->id,
        ], 201);
    }
}
