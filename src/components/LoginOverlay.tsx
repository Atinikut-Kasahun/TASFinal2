"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { Eye, EyeOff, X, ShieldCheck, Mail, Lock, ChevronRight, Users, Sparkles, Key, CheckCircle2 } from "lucide-react";

export default function LoginOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Prevent scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await auth.login({ email, password });
            localStorage.setItem("auth_token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));

            const roles = data.user?.roles;
            const firstRole = roles?.[0];
            const roleSlug = (typeof firstRole === 'string'
                ? firstRole
                : firstRole?.slug || firstRole?.name || 'ta_manager'
            ).toLowerCase();

            // Close overlay and redirect
            onClose();
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
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with extreme blur and dark tint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[12px] transition-all cursor-pointer"
                    />

                    {/* Premium Glassmorphic Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-[480px] px-4"
                    >
                        <div className="relative bg-white/[0.85] backdrop-blur-[32px] rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] border border-white/50 p-10 overflow-hidden group">

                            {/* Animated Background Highlight */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FDF22F]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#FDF22F]/30 transition-all duration-700" />
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/5 rounded-full blur-[80px] pointer-events-none" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 transition-colors text-black/40 hover:text-black z-20"
                            >
                                <X size={20} />
                            </button>

                            {/* Header Section */}
                            <div className="text-center mb-10 relative z-10">
                                <div className="inline-flex items-center justify-center p-4 bg-[#FDF22F] rounded-2xl mb-6 shadow-lg shadow-[#FDF22F]/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <ShieldCheck size={32} className="text-black" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-4xl font-black text-black tracking-tighter mb-2">LOGIN</h1>
                                <div className="h-1 w-12 bg-[#FDF22F] mx-auto rounded-full mb-4" />
                                <p className="text-[14px] font-medium text-black/40">Secure access to Hiring Intelligence</p>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mb-8 p-3 bg-red-50 border-l-4 border-red-500 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-r-xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="animate-pulse" />
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                {/* Email Field */}
                                <div className="group/field relative">
                                    <div className="absolute left-0 bottom-3 text-black/20 group-focus-within/field:text-[#FDF22F] transition-colors pointer-events-none">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-black/5 py-2.5 pl-8 outline-none transition-all placeholder:text-black/20 focus:border-[#FDF22F] text-black font-bold text-[15px]"
                                        placeholder="Enter Email Address"
                                        required
                                    />
                                    <div className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-[#FDF22F] group-focus-within/field:w-full transition-all duration-500" />
                                </div>

                                {/* Password Field */}
                                <div className="group/field relative">
                                    <div className="absolute left-0 bottom-3 text-black/20 group-focus-within/field:text-[#FDF22F] transition-colors pointer-events-none">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent border-b-2 border-black/5 py-2.5 pl-8 pr-10 outline-none transition-all placeholder:text-black/20 focus:border-[#FDF22F] text-black font-bold text-[15px]"
                                        placeholder="Enter Security Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 bottom-3 text-black/20 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <div className="absolute left-0 bottom-[-2px] w-0 h-[2px] bg-[#FDF22F] group-focus-within/field:w-full transition-all duration-500" />
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative flex items-center gap-3 bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] hover:bg-[#FDF22F] hover:text-black transition-all group/btn overflow-hidden shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                    >
                                        <span className="relative z-10">{loading ? "Authorizing..." : "Login"}</span>
                                        <ChevronRight size={16} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                                        <div className="absolute inset-0 bg-[#FDF22F] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                                    </button>
                                    <a href="#" className="text-[10px] font-black text-black/30 hover:text-[#FDF22F] uppercase tracking-widest transition-colors">Recover?</a>
                                </div>
                            </form>

                            {/* Speed Pass Section */}
                            <div className="mt-12 pt-8 border-t border-black/5 relative z-10">
                                <p className="text-center text-[9px] font-black text-black/15 uppercase tracking-[0.4em] mb-6">Speed Pass Portal</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        { id: 'admin', label: 'ADM', email: 'admin@droga.com', icon: <ShieldCheck size={14} /> },
                                        { id: 'hr', label: 'HRM', email: 'hr.droga@droga.com', icon: <Users size={14} /> },
                                        { id: 'pharma', label: 'DMP', email: 'dm.pharma@droga.com', icon: <Sparkles size={14} /> },
                                        { id: 'ta', label: 'TAP', email: 'ta.droga-pharma@droga.com', icon: <CheckCircle2 size={14} /> }
                                    ].map((acc) => (
                                        <button
                                            key={acc.id}
                                            onClick={() => { setEmail(acc.email); setPassword("password"); }}
                                            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-black/[0.02] border border-black/[0.03] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all group/acc"
                                        >
                                            <span className="text-black/20 group-hover/acc:text-black transition-colors">{acc.icon}</span>
                                            <span className="text-[8px] font-black text-black/30 group-hover/acc:text-black transition-colors uppercase tracking-widest">{acc.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
