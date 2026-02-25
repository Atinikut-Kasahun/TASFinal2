"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const quickLinks = ["Open Positions", "About Us", "Life at Droga", "Blog"];
const socials = ["in", "X", "gh"];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-black/5 pt-20 pb-10" id="contact">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-3 gap-20 pb-16 border-b border-black/5">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-4 mb-8">
                            <div className="relative w-[50px] h-[50px]">
                                <Image
                                    src="/TAS logo.png"
                                    alt="Droga Group Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex flex-col border-l border-primary/10 pl-4">
                                <span className="text-primary font-bold text-lg leading-none tracking-tight">
                                    Droga Group
                                </span>
                                <span className="text-accent text-[10px] font-bold uppercase tracking-widest mt-1">
                                    Hiring Hub
                                </span>
                            </div>
                        </Link>
                        <p className="text-primary/50 text-sm font-medium leading-relaxed max-w-56">
                            Building the future of quality care, one innovation at a time.
                        </p>
                        <div className="flex gap-3 mt-6">
                            {socials.map((s) => (
                                <motion.a
                                    key={s}
                                    href="#"
                                    whileHover={{ scale: 1.1 }}
                                    className="w-9 h-9 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#1A1C23] text-xs font-bold hover:bg-[#1A1C23] hover:text-white transition-colors"
                                >
                                    {s}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-[#1A1C23] mb-6">Quick Links</h4>
                        <div className="flex flex-col gap-4">
                            {quickLinks.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-[#64748B] text-sm hover:text-accent transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-[#1A1C23] mb-6">Contact</h4>
                        <div className="flex flex-col gap-4 text-sm text-[#64748B]">
                            <p>careers@drogagroup.com</p>
                            <p>+1 (555) 123-4567</p>
                            <p>
                                Droga Group HQ
                                <br />
                                Innovation District
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 text-center text-sm text-[#94A3B8]">
                    &copy; {new Date().getFullYear()} Droga Group (Hiring Hub). All rights
                    reserved.
                </div>
            </div>
        </footer>
    );
}
