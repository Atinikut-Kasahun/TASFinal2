<?php

namespace App\Http\Controllers;

use App\Mail\ApplicantPasswordReset;
use App\Models\Applicant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ApplicantAuthController extends Controller
{
    /**
     * Register an applicant account (called right after submitting an application).
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $applicant = Applicant::where('email', $request->email)->latest()->first();

        if (!$applicant) {
            return response()->json(['message' => 'No application found with this email address.'], 404);
        }

        if ($applicant->password) {
            return response()->json(['message' => 'An account already exists for this email. Please log in.'], 409);
        }

        $token = Str::random(60);
        $applicant->update([
            'password'        => Hash::make($request->password),
            'applicant_token' => $token,
        ]);

        return response()->json([
            'message'   => 'Account created successfully.',
            'token'     => $token,
            'applicant' => $this->formatApplicant($applicant),
        ], 201);
    }

    /**
     * Login with email + password.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $applicant = Applicant::where('email', $request->email)
            ->whereNotNull('password')
            ->latest()
            ->first();

        if (!$applicant || !Hash::check($request->password, $applicant->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $token = Str::random(60);
        $applicant->update(['applicant_token' => $token]);

        return response()->json([
            'token'     => $token,
            'applicant' => $this->formatApplicant($applicant),
        ]);
    }

    /**
     * Get the authenticated applicant's profile and all their applications.
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $applicant = Applicant::where('applicant_token', $token)->first();

        if (!$applicant) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        $applications = Applicant::where('email', $applicant->email)
            ->with(['jobPosting', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($app) {
                return [
                    'id'          => $app->id,
                    'status'      => $app->status,
                    'created_at'  => $app->created_at,
                    'hired_at'    => $app->hired_at,
                    'match_score' => $app->match_score,
                    'job_posting' => $app->jobPosting ? [
                        'id'         => $app->jobPosting->id,
                        'title'      => $app->jobPosting->title,
                        'department' => $app->jobPosting->department,
                        'location'   => $app->jobPosting->location,
                        'type'       => $app->jobPosting->type,
                        'created_at' => $app->jobPosting->created_at,
                    ] : null,
                    'company'      => $app->tenant ? $app->tenant->name : 'Droga Pharma',
                    'hiring_team'  => \App\Models\User::where('tenant_id', $app->tenant_id)
                        ->whereHas('roles', fn($q) => $q->where('slug', 'ta_manager'))
                        ->get(['name', 'email']),
                ];
            });

        return response()->json([
            'applicant'    => $this->formatApplicant($applicant),
            'applications' => $applications,
        ]);
    }

    /**
     * Logout by clearing the token.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if ($token) {
            Applicant::where('applicant_token', $token)->update(['applicant_token' => null]);
        }

        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PASSWORD RESET — works in production via SMTP (Mailgun / SendGrid / Gmail)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Send a password-reset link to the applicant's email.
     * Called when they click "Reset your password →" on the login page.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // Always return the same generic message to prevent user enumeration
        $genericResponse = response()->json([
            'message' => 'If an account exists for this email, a reset link has been sent.',
        ]);

        $applicant = Applicant::where('email', $request->email)->latest()->first();

        if (!$applicant) {
            return $genericResponse;
        }

        $token = Str::random(64);

        $applicant->update([
            'password_reset_token'      => Hash::make($token),
            'password_reset_expires_at' => Carbon::now()->addMinutes(60),
        ]);

        // Build the reset URL pointing to your frontend
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $resetUrl    = $frontendUrl . '/applicant/reset-password'
            . '?email=' . urlencode($applicant->email)
            . '&token=' . $token;

        // Send via the proper Mailable (uses MAIL_MAILER from .env)
        try {
            Mail::to($applicant->email)
                ->send(new ApplicantPasswordReset($resetUrl, $applicant->name));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email failed', [
                'email' => $applicant->email,
                'error' => $e->getMessage(),
            ]);
            // Still return generic message — don't expose mail errors to the public
        }

        return $genericResponse;
    }

    /**
     * Reset the password using the token from the email link.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $applicant = Applicant::where('email', $request->email)->latest()->first();

        if (!$applicant || !$applicant->password_reset_token || !$applicant->password_reset_expires_at) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 400);
        }

        if (Carbon::now()->isAfter($applicant->password_reset_expires_at)) {
            return response()->json(['message' => 'This reset link has expired. Please request a new one.'], 400);
        }

        if (!Hash::check($request->token, $applicant->password_reset_token)) {
            return response()->json(['message' => 'Invalid reset token.'], 400);
        }

        $newToken = Str::random(60);
        $applicant->update([
            'password'                  => Hash::make($request->password),
            'password_reset_token'      => null,
            'password_reset_expires_at' => null,
            'applicant_token'           => $newToken, // auto-login after reset
        ]);

        return response()->json([
            'message'   => 'Password reset successfully.',
            'token'     => $newToken,
            'applicant' => $this->formatApplicant($applicant),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PROFILE UPDATE
    // ─────────────────────────────────────────────────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        if (!$token) return response()->json(['message' => 'Unauthenticated.'], 401);

        $applicant = Applicant::where('applicant_token', $token)->first();
        if (!$applicant) return response()->json(['message' => 'Invalid session.'], 401);

        $validated = $request->validate([
            'first_name'              => 'required|string|max:255',
            'last_name'               => 'required|string|max:255',
            'headline'                => 'nullable|string|max:255',
            'phone'                   => 'nullable|string|max:20',
            'age'                     => 'nullable|integer',
            'gender'                  => 'nullable|string|max:50',
            'years_of_experience'     => 'nullable|integer',
            'professional_background' => 'nullable|string',
            'portfolio_link'          => 'nullable|url|max:255',
            'resume'                  => 'nullable|file|mimes:pdf|max:10000',
            'photo'                   => 'nullable|image|max:5000',
        ]);

        $profileData = [
            'name'                    => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'headline'                => $validated['headline'] ?? '',
            'phone'                   => $validated['phone'] ?? '',
            'age'                     => $validated['age'] ?? null,
            'gender'                  => $validated['gender'] ?? '',
            'years_of_experience'     => $validated['years_of_experience'] ?? null,
            'professional_background' => $validated['professional_background'] ?? '',
            'portfolio_link'          => $validated['portfolio_link'] ?? '',
        ];

        // Update ALL applications associated with this email so the TA dashboard sees real-time updates everywhere
        if ($applicant->email) {
            Applicant::where('email', $applicant->email)->update($profileData);
        } else {
            $applicant->update($profileData);
        }

        // Apply back to the current applicant model instance so the response contains updated data
        $applicant->fill($profileData);

        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            if ($applicant->email) {
                Applicant::where('email', $applicant->email)->update(['resume_path' => $path]);
            } else {
                $applicant->update(['resume_path' => $path]);
            }
            $applicant->resume_path = $path;
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('applicant_photos', 'public');
            if ($applicant->email) {
                Applicant::where('email', $applicant->email)->update(['photo_path' => $path]);
            } else {
                $applicant->update(['photo_path' => $path]);
            }
            $applicant->photo_path = $path;
        }

        return response()->json([
            'message'   => 'Profile updated successfully.',
            'applicant' => $this->formatApplicant($applicant),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $applicant->password)) {
            return response()->json(['message' => 'The current password you entered is incorrect.'], 422);
        }

        $applicant->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    public function notifications(Request $request): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        return response()->json([
            'notifications' => $applicant->notifications()->latest()->get(),
            'unread_count'  => $applicant->unreadNotifications()->count(),
        ]);
    }

    public function markNotificationRead(Request $request, $id): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $applicant->notifications()->findOrFail($id)->markAsRead();
        return response()->json(['success' => true]);
    }

    public function deleteNotification(Request $request, $id): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $applicant->notifications()->findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $applicant->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // MESSAGING
    // ─────────────────────────────────────────────────────────────────────────────

    public function sendMessage(Request $request): JsonResponse
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $request->validate([
            'application_id' => 'required|exists:applicants,id',
            'message'        => 'required|string|max:2000',
        ]);

        $application = Applicant::with('jobPosting')->findOrFail($request->application_id);

        if ($application->email !== $applicant->email) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $recipients = \App\Models\User::where('tenant_id', $application->tenant_id)
            ->whereHas('roles', fn($q) => $q->where('slug', 'ta_manager'))
            ->get();

        if ($recipients->isEmpty()) {
            return response()->json(['error' => 'No TA team identified for this company.'], 404);
        }

        foreach ($recipients as $user) {
            $user->notify(new \App\Notifications\ApplicantMessage(
                $applicant,
                $request->message,
                $application->jobPosting->title ?? 'Position',
                null,
                null
            ));
        }

        $applicant->notify(new \App\Notifications\SentMessage(
            $request->message,
            $application->company ?? 'the TA team',
            null,
            null
        ));

        return response()->json(['success' => true]);
    }

    public function downloadNotificationAttachment(Request $request, $id)
    {
        $applicant = $this->authApplicant($request);
        if (!$applicant) return response()->json(['message' => 'Unauthenticated.'], 401);

        $notification = $applicant->notifications()->findOrFail($id);
        $path         = $notification->data['attachment_path'] ?? null;

        if (!$path || !file_exists(storage_path('app/public/' . $path))) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return response()->file(storage_path('app/public/' . $path), [
            'Content-Disposition' => 'inline; filename="' . ($notification->data['attachment_name'] ?? 'attachment.pdf') . '"',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────────

    private function authApplicant(Request $request): ?Applicant
    {
        $token = $request->bearerToken();
        if (!$token) return null;
        return Applicant::where('applicant_token', $token)->first();
    }

    private function formatApplicant(Applicant $applicant): array
    {
        return [
            'id'                      => $applicant->id,
            'name'                    => $applicant->name,
            'email'                   => $applicant->email,
            'phone'                   => $applicant->phone,
            'headline'                => $applicant->headline,
            'age'                     => $applicant->age,
            'gender'                  => $applicant->gender,
            'years_of_experience'     => $applicant->years_of_experience,
            'professional_background' => $applicant->professional_background,
            'portfolio_link'          => $applicant->portfolio_link,
            'photo_path'              => $applicant->photo_path,
            'resume_path'             => $applicant->resume_path,
        ];
    }
}
