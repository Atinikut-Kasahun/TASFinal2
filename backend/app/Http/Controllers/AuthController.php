<?php

namespace App\Http\Controllers;

use App\Mail\StaffPasswordReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Fetch user with tenant + roles in ONE query (eager load)
        $user = User::with(['tenant', 'roles'])
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Use cached token if one already exists for this user (avoids re-generating)
        $token = Cache::remember("auth_token_{$user->id}", 3600, function () use ($user) {
            return $user->createToken('auth_token')->plainTextToken;
        });

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user, // already loaded with tenant + roles above
        ]);
    }

    public function logout(Request $request)
    {
        // Clear cached token on logout
        if ($request->user()) {
            Cache::forget("auth_token_{$request->user()->id}");
        }
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('tenant', 'roles'));
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $genericResponse = response()->json([
            'message' => 'If an account exists for this email, a reset link has been sent.'
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user)
            return $genericResponse;

        $token = Str::random(64);
        $user->update([
            'password_reset_token' => Hash::make($token),
            'password_reset_expires_at' => Carbon::now()->addMinutes(60),
        ]);

        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $resetUrl = $frontendUrl . '/reset-password?email=' . urlencode($user->email) . '&token=' . $token;

        try {
            Mail::to($user->email)->send(new StaffPasswordReset($resetUrl, $user->name));
        }
        catch (\Exception $e) {
            \Log::error('Staff reset email failing: ' . $e->getMessage());
        }

        return $genericResponse;
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->password_reset_token || !$user->password_reset_expires_at) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 400);
        }

        if (Carbon::now()->isAfter($user->password_reset_expires_at)) {
            return response()->json(['message' => 'Reset link expired.'], 400);
        }

        if (!Hash::check($request->token, $user->password_reset_token)) {
            return response()->json(['message' => 'Invalid token.'], 400);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'password_reset_token' => null,
            'password_reset_expires_at' => null,
        ]);

        // Clear any cached auth token so old sessions are invalidated
        Cache::forget("auth_token_{$user->id}");

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
