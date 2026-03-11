<?php

use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicantController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('mock.auth')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user()->load('tenant', 'roles');
    });

    // Requisition API
    Route::prefix('v1')->group(function () {
        Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
        // ─────────────────────────────────────────────────────────
        // TENANT-SCOPED ROUTES (Requires a valid company assignment)
        // ─────────────────────────────────────────────────────────
        Route::middleware('tenant.scope')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
            Route::get('/requisitions', [\App\Http\Controllers\JobRequisitionController::class, 'index']);
            Route::get('/requisitions/{id}/jd', [\App\Http\Controllers\JobRequisitionController::class, 'downloadJd']);
            Route::post('/requisitions', [\App\Http\Controllers\JobRequisitionController::class, 'store']);
            Route::post('/requisitions/bulk-approve', [\App\Http\Controllers\JobRequisitionController::class, 'bulkApprove']);
            Route::post('/requisitions/{id}/duplicate', [\App\Http\Controllers\JobRequisitionController::class, 'duplicate']);
            Route::patch('/requisitions/{id}/status', [\App\Http\Controllers\JobRequisitionController::class, 'updateStatus']);
            Route::post('/requisitions/{id}/amend', [\App\Http\Controllers\JobRequisitionController::class, 'amend']);
            Route::post('/requisitions/{id}', [\App\Http\Controllers\JobRequisitionController::class, 'update']);

            Route::apiResource('jobs', \App\Http\Controllers\JobController::class)->except(['store', 'update', 'destroy']);
            Route::get('/jobs', [\App\Http\Controllers\JobPostingController::class, 'index']);
            Route::post('/jobs', [\App\Http\Controllers\JobPostingController::class, 'store']);
            Route::patch('/jobs/{id}', [\App\Http\Controllers\JobController::class, 'update']);
            Route::delete('/jobs/{id}', [\App\Http\Controllers\JobController::class, 'destroy']);
            Route::post('/jobs/{id}/close', [\App\Http\Controllers\JobPostingController::class, 'close']);

            // Applicant Management
            Route::get('/applicants/export', [\App\Http\Controllers\ApplicantController::class, 'export']);
            Route::get('/applicants/stats', [\App\Http\Controllers\ApplicantController::class, 'stats']);
            Route::get('/applicants', [\App\Http\Controllers\ApplicantController::class, 'index']);
            Route::post('/applicants', [\App\Http\Controllers\ApplicantController::class, 'store']);
            Route::patch('/applicants/{id}/status', [\App\Http\Controllers\ApplicantController::class, 'updateStatus']);
            Route::patch('/applicants/{id}/employment-status', [\App\Http\Controllers\ApplicantController::class, 'updateEmploymentStatus']);
            Route::post('/applicants/{id}/mention', [\App\Http\Controllers\ApplicantController::class, 'mention']);

            // Interview Management
            Route::get('/interviews', [\App\Http\Controllers\InterviewController::class, 'index']);
            Route::post('/interviews', [\App\Http\Controllers\InterviewController::class, 'store']);
            Route::patch('/interviews/{id}', [\App\Http\Controllers\InterviewController::class, 'update']);

            // Offer Management
            Route::post('/offers/generate', [\App\Http\Controllers\OfferController::class, 'generate']);

            // Notifications & Messages
            Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
            Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
            Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
            Route::post('/notifications/{id}/reply', [\App\Http\Controllers\NotificationController::class, 'reply']);
            Route::get('/notifications/{id}/download', [\App\Http\Controllers\NotificationController::class, 'downloadAttachment']);
            Route::post('/notifications/{id}/pin', [\App\Http\Controllers\NotificationController::class, 'togglePin']);
            Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy']);

            Route::get('/users', [\App\Http\Controllers\MessageController::class, 'users']);
            Route::post('/messages/send', [\App\Http\Controllers\MessageController::class, 'send']);
            Route::get('/team-users', [\App\Http\Controllers\UserController::class, 'index']);

            // Employee Management & Turnover Tracking
            Route::get('/employees', [\App\Http\Controllers\EmployeeController::class, 'index']);
            Route::patch('/employees/{id}/status', [\App\Http\Controllers\EmployeeController::class, 'updateStatus']);
            Route::get('/employees/turnover', [\App\Http\Controllers\EmployeeController::class, 'turnoverData']);
        });

        // ─────────────────────────────────────────────────────────
        // GLOBAL ADMIN ROUTES (No tenant scope, requires Admin role)
        // ─────────────────────────────────────────────────────────
        Route::get('/global-settings', [\App\Http\Controllers\GroupContentController::class, 'getSettings']);
        Route::post('/global-settings', [\App\Http\Controllers\GroupContentController::class, 'updateSetting']);
        Route::post('/global-settings/upload', [\App\Http\Controllers\GroupContentController::class, 'uploadFile']);
        Route::get('/global-events', [\App\Http\Controllers\GroupContentController::class, 'listEvents']);
        Route::post('/global-events', [\App\Http\Controllers\GroupContentController::class, 'storeEvent']);

        Route::get('/global-users', [\App\Http\Controllers\UserController::class, 'index']);
        Route::post('/global-users', [\App\Http\Controllers\UserController::class, 'store']);
        Route::patch('/global-users/{id}/role', [\App\Http\Controllers\UserController::class, 'updateRole']);
        Route::post('/global-users/{id}/reset-password', [\App\Http\Controllers\UserController::class, 'resetPassword']);
        Route::delete('/global-users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
        Route::post('/account/change-password', [\App\Http\Controllers\UserController::class, 'changePassword']);

        Route::get('/tenants', [\App\Http\Controllers\TenantController::class, 'index']);
        Route::post('/tenants', [\App\Http\Controllers\TenantController::class, 'store']);
        Route::patch('/tenants/{id}', [\App\Http\Controllers\TenantController::class, 'update']);
        Route::delete('/tenants/{id}', [\App\Http\Controllers\TenantController::class, 'destroy']);

        // ─────────────────────────────────────────────────────────
        // GLOBAL ADMIN — Cross-Tenant Analytics & Management
        // ─────────────────────────────────────────────────────────
        Route::get('/admin/jobs', [\App\Http\Controllers\JobPostingController::class, 'indexGlobal']);
        Route::get('/admin/applicants', [\App\Http\Controllers\ApplicantController::class, 'index']);
        Route::patch('/admin/applicants/{id}/status', [\App\Http\Controllers\ApplicantController::class, 'updateStatus']);
        Route::get('/admin/interviews', [\App\Http\Controllers\InterviewController::class, 'indexGlobal']);
        Route::post('/admin/interviews', [\App\Http\Controllers\InterviewController::class, 'store']);
        Route::get('/admin/reports', [\App\Http\Controllers\DashboardController::class, 'reportsData']);
        Route::get('/admin/search', [\App\Http\Controllers\GlobalSearchController::class, 'search']);
        Route::get('/admin/users', [\App\Http\Controllers\MessageController::class, 'users']);
        Route::post('/admin/messages/send', [\App\Http\Controllers\MessageController::class, 'send']);

        // Notification attachment inline viewer — auth via ?token= query param (handled by mock.auth)
        Route::get('/notifications/{id}/view', [\App\Http\Controllers\NotificationController::class, 'viewAttachment']);
    });
});



// Public API
Route::prefix('v1')->group(function () {
    Route::get('/public/settings', [\App\Http\Controllers\GroupContentController::class, 'getSettings']);
    Route::get('/public/events', [\App\Http\Controllers\GroupContentController::class, 'listEvents']);
    Route::get('/public/jobs', [\App\Http\Controllers\JobPostingController::class, 'publicIndex']);
    Route::get('/public/jobs/{id}', [\App\Http\Controllers\JobPostingController::class, 'publicShow']);

    // ─────────────────────────────────────────────────────────
    // EMAIL VERIFICATION (OTP) — used by the public careers page
    // ─────────────────────────────────────────────────────────
    Route::post('/public/send-otp', [\App\Http\Controllers\OtpController::class, 'send']);
    Route::post('/public/verify-otp', [\App\Http\Controllers\OtpController::class, 'verify']);

    Route::post('/apply', [\App\Http\Controllers\JobApplicationController::class, 'store']);

    // Applicant Account (self-service portal)
    Route::post('/applicant/register', [\App\Http\Controllers\ApplicantAuthController::class, 'register']);
    Route::post('/applicant/login', [\App\Http\Controllers\ApplicantAuthController::class, 'login']);
    Route::get('/applicant/me', [\App\Http\Controllers\ApplicantAuthController::class, 'me']);
    Route::post('/applicant/logout', [\App\Http\Controllers\ApplicantAuthController::class, 'logout']);
    Route::post('/applicant/forgot-password', [\App\Http\Controllers\ApplicantAuthController::class, 'sendResetLink']);
    Route::post('/applicant/reset-password', [\App\Http\Controllers\ApplicantAuthController::class, 'resetPassword']);
    Route::post('/applicant/update', [\App\Http\Controllers\ApplicantAuthController::class, 'updateProfile']);
    Route::post('/applicant/change-password', [\App\Http\Controllers\ApplicantAuthController::class, 'changePassword']);
    Route::post('/applicant/send-message', [\App\Http\Controllers\ApplicantAuthController::class, 'sendMessage']);
    Route::get('/applicant/notifications/{id}/attachment', [\App\Http\Controllers\ApplicantAuthController::class, 'downloadNotificationAttachment']);

    // Applicant Notifications
    Route::get('/applicant/notifications', [\App\Http\Controllers\ApplicantAuthController::class, 'notifications']);
    Route::post('/applicant/notifications/{id}/read', [\App\Http\Controllers\ApplicantAuthController::class, 'markNotificationRead']);
    Route::delete('/applicant/notifications/{id}', [\App\Http\Controllers\ApplicantAuthController::class, 'deleteNotification']);
    Route::post('/applicant/notifications/mark-all-read', [\App\Http\Controllers\ApplicantAuthController::class, 'markAllNotificationsRead']);

    // ─────────────────────────────────────────────────────────
    // PUBLIC DOCUMENT ACCESS
    // Opens files inline in the browser (PDF viewer).
    // ✅ Fixed for Windows: uses DIRECTORY_SEPARATOR to avoid
    //    mixed slash paths like storage\\app\/public\/resumes\/
    // ─────────────────────────────────────────────────────────
    Route::get('/applicants/{id}/resume', function ($id) {
        $applicant = \App\Models\Applicant::findOrFail($id);

        $resumePath = ltrim(str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $applicant->resume_path), DIRECTORY_SEPARATOR);
        $path = storage_path('app' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . $resumePath);

        if (!file_exists($path)) {
            return response()->json(['error' => 'File not found at ' . $path], 404);
        }

        $contentType = 'application/pdf';
        try {
            $contentType = \Illuminate\Support\Facades\File::mimeType($path);
        } catch (\Exception $e) {
        }

        return response()->file($path, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline; filename="resume_' . $applicant->id . '.pdf"',
        ]);
    });

    Route::get('/attachments/{id}/view', function ($id) {
        $attachment = \App\Models\ApplicantAttachment::findOrFail($id);

        $filePath = ltrim(str_replace(['\\', '/'], DIRECTORY_SEPARATOR, $attachment->file_path), DIRECTORY_SEPARATOR);
        $path = storage_path('app' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . $filePath);

        if (!file_exists($path)) {
            return response()->json(['error' => 'File not found at ' . $path], 404);
        }

        $contentType = 'application/octet-stream';
        try {
            $contentType = \Illuminate\Support\Facades\File::mimeType($path);
        } catch (\Exception $e) {
        }

        return response()->file($path, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline; filename="' . $attachment->label . '"',
        ]);
    });
});
