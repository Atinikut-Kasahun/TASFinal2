"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_URL } from "@/lib/api";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const cleanBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBase}/v1/applicant/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    token,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to reset password.");

            setSuccess(true);
            localStorage.setItem("applicant_token", data.token);
            setTimeout(() => {
                router.push("/my-applications");
            }, 2000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to reset password.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!email || !token) {
        return (
            <div className="text-center p-8 bg-red-50 border border-red-100 rounded-3xl">
                <p className="text-red-600 font-bold mb-4">Invalid reset link.</p>
                <Link href="/my-applications" className="text-black font-black hover:underline uppercase text-[10px] tracking-widest">
                    Back to Login
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center p-8 bg-emerald-50 border border-emerald-100 rounded-3xl">
                <p className="text-emerald-600 font-bold mb-2">Password reset successfully!</p>
                <p className="text-emerald-600/70 text-xs">Redirecting to your applications...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-bold">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all"
                />
            </div>

            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-[#FDF22F] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10 mt-2"
            >
                {loading ? "Resetting..." : "Reset Password & Sign In"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[480px] space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden"
                >
                    <div className="bg-[#FDF22F] px-10 pt-10 pb-8 rounded-t-[32px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#FDF22F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block">Applicant Portal</span>
                                <span className="text-[10px] font-bold text-black/60">Reset your password to access your dashboard</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-black">Reset Password</h1>
                    </div>

                    <div className="p-10">
                        <Suspense fallback={<div className="text-center p-8">Loading reset form...</div>}>
                            <ResetPasswordForm />
                        </Suspense>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <Link href="/my-applications" className="block text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
