"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5 py-4"
                : "bg-white/95 py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative w-[60px] h-[60px]">
                        <Image
                            src="/TAS logo.png"
                            alt="Droga Group Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col border-l border-primary/10 pl-4">
                        <span className="text-primary font-bold text-xl leading-none tracking-tight group-hover:text-accent transition-colors">
                            Droga Group
                        </span>
                        <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mt-1.5">
                            Hiring Hub
                        </span>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-10">
                    {["Jobs", "About Us", "Careers", "Contact"].map((item, i) => (
                        <motion.a
                            key={item}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            href={`#${item.toLowerCase().replace(" ", "-")}`}
                            className={`text-sm font-semibold transition-colors hover:text-accent ${scrolled ? "text-primary" : "text-primary"
                                }`}
                        >
                            {item}
                        </motion.a>
                    ))}
                    <motion.a
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        href="#positions"
                        className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-black transition-all hover:-translate-y-px hover:shadow-lg"
                    >
                        View Open Positions →
                    </motion.a>
                </nav>
            </div>
        </motion.header>
    );
}
