"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [applicantToken, setApplicantToken] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { console.error("Failed to parse user", e); }
        }
        const appToken = localStorage.getItem('applicant_token');
        setApplicantToken(appToken);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        setUser(null);
        window.location.href = "/";
    };

    return (
        <>
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#000000]/5 py-3 md:py-4"
                    : "bg-white py-4 md:py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between h-full">
                    {/* Logo */}
                    <div className="flex-1 flex justify-start">
                        <motion.div whileHover="hover" className="relative shrink-0">
                            <Link href="/" className="flex flex-col group relative">
                                <div className="flex items-center">
                                    <motion.span
                                        variants={{ hover: { x: 2 } }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="text-[#000000] font-black text-xl sm:text-2xl md:text-3xl tracking-tight leading-none"
                                    >
                                        DROGA
                                    </motion.span>
                                    <motion.span
                                        variants={{ hover: { x: 4 } }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="text-[#000000]/60 font-medium text-xl sm:text-2xl md:text-3xl tracking-tight ml-2 leading-none"
                                    >
                                        GROUP
                                    </motion.span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-[0.5px] w-4 bg-[#000000]/40" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#000000]/60 whitespace-nowrap">Hiring Hub</span>
                                    <motion.div variants={{ hover: { scaleX: 1.1, originX: 0 } }} className="h-[0.5px] w-full bg-[#000000]/40 flex-1" />
                                </div>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Nav - Centered (desktop) */}
                    <nav className="hidden lg:flex flex-1 justify-center items-center gap-8">
                        {["Jobs", "About Us", "Contact"].map((item, i) => (
                            <motion.a
                                key={item}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                href={`/${item.toLowerCase() === "about us" ? "#about-us" : item.toLowerCase() === "contact" ? "#contact" : "#" + item.toLowerCase()}`}
                                className="text-[14px] font-bold text-gray-600 hover:text-black transition-colors duration-200"
                            >
                                {item}
                            </motion.a>
                        ))}
                    </nav>

                    {/* CTAs - Far Right */}
                    <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
                        {user ? (
                            <div className="hidden lg:flex items-center gap-6 pr-4 border-r border-gray-100">
                                <Link href="/dashboard" className="text-[13px] font-black uppercase tracking-wider text-black hover:opacity-70 transition-opacity">Dashboard</Link>
                                <button onClick={handleLogout} className="text-[13px] font-black uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors">Logout</button>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-4 pr-3">
                                <Link href="/login" className="text-[13px] font-bold text-gray-400 hover:text-black transition-colors mr-2">Staff Login</Link>
                                <Link 
                                    href="/my-applications" 
                                    className="bg-black text-white text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/80 transition-all shadow-md"
                                >
                                    <div className="relative flex h-2.5 w-2.5 shrink-0 ml-0.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1FE08F] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1FE08F]"></span>
                                    </div>
                                    <span className="mr-0.5">{applicantToken ? 'My Applications' : 'Track Application'}</span>
                                </Link>
                            </div>
                        )}

                        <motion.a
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            href="#jobs"
                            className="bg-[#FDF22F] text-black text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-5 sm:px-8 py-3 sm:py-3.5 rounded-lg hover:bg-black hover:text-[#FDF22F] transition-all duration-300 shadow-lg shadow-[#FDF22F]/20 hover:shadow-black/20 transform hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
                        >
                            View Positions →
                        </motion.a>

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 rounded-full z-[60]"
                        >
                            <div className="flex flex-col gap-1 w-5">
                                <motion.div animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="h-0.5 w-full bg-black rounded-full" />
                                <motion.div animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }} className="h-0.5 w-full bg-black rounded-full" />
                                <motion.div animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="h-0.5 w-full bg-black rounded-full" />
                            </div>
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isMenuOpen ? 1 : 0 }}
                style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-[#000000]/20 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isMenuOpen ? "0%" : "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[80%] max-w-[300px] sm:max-w-[320px] bg-white z-[55] lg:hidden shadow-2xl p-6 sm:p-8 flex flex-col"
            >
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                    <div className="flex flex-col">
                        <span className="text-[#000000] font-black text-xl sm:text-2xl tracking-tighter leading-none">DROGA GROUP</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#000000]/30 mt-1">Hiring Hub</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                    {["Jobs", "About Us", "Contact"].map((item, i) => (
                        <motion.a
                            key={item}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 20 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            href={`/${item.toLowerCase() === "about us" ? "#about-us" : item.toLowerCase() === "contact" ? "#contact" : "#" + item.toLowerCase()}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-2xl sm:text-3xl font-bold text-[#000000] tracking-tighter hover:bg-[#FDF22F] -mx-4 px-4 py-2.5 sm:py-3 rounded-xl transition-colors"
                        >
                            {item}
                        </motion.a>
                    ))}

                    <div className="h-px w-full bg-[#000000]/5 my-3 sm:my-4" />

                    {user ? (
                        <>
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-[#000000]">Dashboard</Link>
                            <button onClick={handleLogout} className="text-xl font-bold text-red-500 text-left">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/my-applications" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-lg sm:text-xl font-bold text-[#000000] tracking-tighter hover:bg-[#FDF22F] -mx-4 px-4 py-2.5 sm:py-3 rounded-xl transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                {applicantToken ? 'My Applications' : 'Track Application'}
                            </Link>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-xl sm:text-2xl font-bold text-[#000000]/40 tracking-tighter">Staff Login</Link>
                        </>
                    )}
                </div>

                <div className="mt-auto flex flex-col items-center">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-[#FDF22F] text-black rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-90 mb-6 sm:mb-8"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className="w-full pt-5 sm:pt-6 border-t border-[#000000]/5 flex justify-between items-center text-[10px] font-bold text-[#000000]/20 uppercase tracking-[0.2em]">
                        <span>Droga Group Hiring Hub</span>
                        <span>© 2026</span>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
