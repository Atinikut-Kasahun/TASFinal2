"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/api";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            await auth.resetPassword({
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (!email || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-red-500 font-bold mb-4">Invalid or missing reset link parameters.</p>
                    <Link href="/login" className="text-primary underline">Go back to login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl px-8 py-10 border border-primary/5"
            >
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-primary">Reset Password</h1>
                    <p className="text-primary/60 text-sm mt-2">Enter your new password below</p>
                </div>

                {success ? (
                    <div className="text-center">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl font-medium mb-6">
                            Password reset successfully! Redirecting to login...
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-xl border border-primary/10 focus:border-[#FDF22F] outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-xl border border-primary/10 focus:border-[#FDF22F] outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#FDF22F] text-black py-4 rounded-xl font-bold transition-all hover:bg-[#EBD92B] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
