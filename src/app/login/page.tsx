"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await auth.login({ email, password });
            localStorage.setItem("auth_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            const roles = data.user?.roles;
            const firstRole = roles?.[0];
            const roleSlug = (typeof firstRole === 'string'
                ? firstRole
                : firstRole?.slug || firstRole?.name || 'ta_manager'
            ).toLowerCase();

            if (roleSlug === 'admin') {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-primary/5 border border-primary/5 p-10"
            >
                <div className="text-center mb-10 relative">
                    {/* Back to Site Button - Pro Level */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute -top-14 left-0"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-primary/5 hover:border-[#FDF22F] hover:bg-white text-primary/40 hover:text-black transition-all text-[11px] font-black uppercase tracking-widest group shadow-sm hover:shadow-md active:scale-95"
                        >
                            <svg
                                className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Hub
                        </Link>
                    </motion.div>

                    <Link href="/" className="inline-block mb-8 group">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center">
                                <span className="text-black font-black text-3xl tracking-tighter leading-none">DROGA</span>
                                <span className="text-black font-extralight text-3xl tracking-tight ml-2 leading-none uppercase">Group</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 w-full">
                                <div className="h-[0.5px] bg-black/10 flex-1" />
                                <span className="text-[9px] font-bold text-black/30 uppercase tracking-[0.4em] whitespace-nowrap">Hiring Hub</span>
                                <div className="h-[0.5px] bg-black/10 flex-1" />
                            </div>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-primary">Login to Hiring Hub</h1>
                    <p className="text-primary/60 text-sm mt-2">Enter your credentials to access your dashboard</p>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium">
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl border border-primary/10 focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 focus:shadow-[0_0_15px_rgba(253,242,47,0.3)] outline-none transition-all placeholder:text-primary/30"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-primary">Password</label>
                            <a href="#" className="text-xs font-black text-[#FDF22F] hover:underline uppercase tracking-wide">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl border border-primary/10 focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 focus:shadow-[0_0_15px_rgba(253,242,47,0.3)] outline-none transition-all placeholder:text-primary/30"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#FDF22F] text-black py-4 rounded-xl font-bold transition-all hover:bg-[#EBD92B] active:bg-[#D9C726] hover:shadow-xl hover:shadow-[#FDF22F]/20 active:scale-[0.98] ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-primary/60 mb-4">
                        Don't have an account?{" "}
                        <a href="#" className="text-[#FDF22F] font-black hover:underline uppercase tracking-wide">Contact Admin</a>
                    </p>
                    <div className="pt-6 border-t border-primary/5">
                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest mb-3">Demo Accounts</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { label: 'Global Admin', email: 'admin@droga.com' },
                                { label: 'HR Manager', email: 'hr.droga@droga.com' },
                                { label: 'Pharma DM', email: 'dm.pharma@droga.com' },
                                { label: 'Pharma TA', email: 'ta.droga-pharma@droga.com' },
                                { label: 'Physio TA', email: 'ta.droga-physiotherapy@droga.com' },
                                { label: 'Health TA', email: 'ta.droga-health@droga.com' },
                                { label: 'Coffee TA', email: 'ta.droga-coffee@droga.com' },
                            ].map((acc) => (
                                <button
                                    key={acc.email}
                                    onClick={() => { setEmail(acc.email); setPassword("password"); }}
                                    className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary/60 text-[10px] font-bold hover:bg-accent hover:text-white transition-all"
                                >
                                    {acc.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
