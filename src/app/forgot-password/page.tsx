"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const data = await auth.forgotPassword(email);
            setMessage(data.message);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl px-8 py-10 sm:p-12 border border-primary/5"
            >
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-primary">Forgot Password</h1>
                    <p className="text-primary/60 text-sm mt-2">Enter your staff email to receive a reset link</p>
                </div>

                {message ? (
                    <div className="text-center">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl font-medium mb-6">
                            {message}
                        </div>
                        <Link href="/login" className="text-sm font-bold text-primary hover:underline">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-xl border border-primary/10 focus:border-[#FDF22F] outline-none transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#FDF22F] text-black py-4 rounded-xl font-bold transition-all hover:bg-[#EBD92B] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>

                        <p className="text-center text-xs text-primary/40">
                            Remember your password? <Link href="/login" className="text-primary/60 font-semibold hover:underline">Sign In</Link>
                        </p>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
