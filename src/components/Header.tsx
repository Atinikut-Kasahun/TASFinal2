"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }

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
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#000000]/5 py-4"
                    : "bg-white py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
                    {/* Logo & Brand */}
                    <motion.div whileHover="hover" className="relative shrink-0">
                        <Link href="/" className="flex flex-col group relative">
                            <div className="flex items-center">
                                <motion.span
                                    variants={{ hover: { x: 2 } }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-[#000000] font-black text-2xl md:text-3xl tracking-tight leading-none"
                                >
                                    DROGA
                                </motion.span>
                                <motion.span
                                    variants={{ hover: { x: 4 } }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="text-[#000000]/60 font-medium text-2xl md:text-3xl tracking-tight ml-2 leading-none"
                                >
                                    GROUP
                                </motion.span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="h-[0.5px] w-4 bg-[#000000]/40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#000000]/60 whitespace-nowrap">
                                    Hiring Hub
                                </span>
                                <motion.div
                                    variants={{ hover: { scaleX: 1.1, originX: 0 } }}
                                    className="h-[0.5px] w-full bg-[#000000]/40 flex-1"
                                />
                            </div>
                        </Link>
                    </motion.div>

                    {/* Nav */}
                    <nav className="flex items-center gap-4 lg:gap-10">
                        <div className="hidden lg:flex items-center gap-10">
                            {["Jobs", "About Us", "Contact"].map((item, i) => (
                                <motion.a
                                    key={item}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    href={`/${item.toLowerCase() === "about us" ? "#about-us" : item.toLowerCase() === "contact" ? "#contact" : "#" + item.toLowerCase()}`}
                                    className="text-[13px] font-black uppercase tracking-wider transition-all hover:text-[#000000] text-[#000000]"
                                >
                                    {item}
                                </motion.a>
                            ))}

                            {user ? (
                                <div className="flex items-center gap-6 pl-4 border-l border-[#000000]/10">
                                    <Link
                                        href="/dashboard"
                                        className="text-[13px] font-black uppercase tracking-wider text-[#000000] hover:text-[#000000] transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-[13px] font-black uppercase tracking-wider text-red-500/80 hover:text-red-600 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-[13px] font-black uppercase tracking-wider text-[#000000] hover:text-[#000000] transition-colors pl-4 border-l border-[#000000]/10"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        <motion.a
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            href="#jobs"
                            className="bg-[#000000] text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] px-6 md:px-10 py-3 md:py-4 rounded-full hover:bg-black transition-all hover:shadow-2xl hover:shadow-[#000000]/20 whitespace-nowrap"
                        >
                            View Positions →
                        </motion.a>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center bg-[#000000]/5 rounded-full z-[60]"
                        >
                            <div className="flex flex-col gap-1 w-5">
                                <motion.div
                                    animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                                    className="h-0.5 w-full bg-[#000000] rounded-full"
                                />
                                <motion.div
                                    animate={isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                                    className="h-0.5 w-full bg-[#000000] rounded-full"
                                />
                                <motion.div
                                    animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                                    className="h-0.5 w-full bg-[#000000] rounded-full"
                                />
                            </div>
                        </button>
                    </nav>
                </div>
            </motion.header>

            {/* Mobile Sidebar Overlay */}
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
                className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-[55] lg:hidden shadow-2xl p-8 flex flex-col"
            >
                <div className="mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#000000]/40">Menu</span>
                </div>

                <div className="flex flex-col gap-8">
                    {["Jobs", "About Us", "Contact"].map((item, i) => (
                        <motion.a
                            key={item}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : 20 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            href={`/${item.toLowerCase() === "about us" ? "#about-us" : item.toLowerCase() === "contact" ? "#contact" : "#" + item.toLowerCase()}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-2xl font-black text-[#000000] uppercase tracking-tighter hover:bg-[#FDF22F] -mx-4 px-4 py-2 rounded-xl transition-colors"
                        >
                            {item}
                        </motion.a>
                    ))}

                    <div className="h-px w-full bg-[#000000]/5 my-4" />

                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-xl font-bold text-[#000000]"
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xl font-bold text-red-500 text-left"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xl font-black text-[#000000] uppercase tracking-tighter"
                        >
                            Login
                        </Link>
                    )}
                </div>

                <div className="mt-auto pt-10">
                    <p className="text-[10px] font-bold text-[#000000]/30 uppercase tracking-widest">
                        Droga Group Hiring Hub
                    </p>
                </div>
            </motion.div>
        </>
    );
}
