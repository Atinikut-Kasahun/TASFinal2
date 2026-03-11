"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const quickLinks = ["Open Positions", "About Us", "Life at Droga"];
const socials = [
    { id: "in", url: "https://www.linkedin.com/company/droga-pharma-pvt-ltd-co/about/" },
    { id: "W", url: "http://www.drogapharma.com/" }
];

export default function Footer() {
    return (
        <footer className="bg-[#FDF22F] pt-14 sm:pt-16 md:pt-20 pb-10" id="contact">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-20 pb-10 md:pb-16 border-b border-black/10">
                    {/* Brand */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start">
                        <Link href="/" className="flex flex-col group relative mb-6 md:mb-8">
                            <div className="flex items-center">
                                <span className="text-black font-black text-2xl tracking-tighter">DROGA</span>
                                <span className="text-black/60 font-light text-2xl tracking-normal ml-1.5">GROUP</span>
                            </div>
                            <div className="flex items-center gap-2 -mt-0.5 justify-center md:justify-start">
                                <div className="h-[1px] w-3 bg-black/30" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/60">Hiring Hub</span>
                            </div>
                            <div className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 md:group-hover:w-1/2" />
                        </Link>
                        <p className="text-black/50 text-sm font-medium leading-relaxed max-w-56 text-center md:text-left">
                            Building the future of quality care, one innovation at a time.
                        </p>
                        <div className="flex gap-3 mt-6 justify-center md:justify-start">
                            {socials.map((s) => (
                                <motion.a
                                    key={s.id}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1 }}
                                    className="w-9 h-9 bg-black/10 rounded-full flex items-center justify-center text-black text-xs font-bold hover:bg-black hover:text-[#FDF22F] transition-colors"
                                >
                                    {s.id}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center sm:text-left">
                        <h4 className="font-bold text-black mb-4 md:mb-6">Quick Links</h4>
                        <div className="flex flex-col gap-3 md:gap-4">
                            {quickLinks.map((link) => (
                                <a
                                    key={link}
                                    href={`#${link.toLowerCase().replace("life at droga", "about-us").replace("about us", "about-us").replace("open positions", "jobs").replace(" ", "-")}`}
                                    className="text-black/60 text-sm hover:text-black transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="text-center sm:text-left">
                        <h4 className="font-bold text-black mb-4 md:mb-6">Contact</h4>
                        <div className="flex flex-col gap-3 md:gap-4 text-sm text-black/60">
                            <a href="http://www.drogapharma.com/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">www.drogapharma.com</a>
                            <a href="mailto:info@drogapharma.com" className="hover:text-black transition-colors">info@drogapharma.com</a>
                            <a href="mailto:pharmadroga@gmail.com" className="hover:text-black transition-colors">pharmadroga@gmail.com</a>
                            <p>+251 91 366 7537</p>
                            <p>
                                Addis Ketema Subcity, Woreda 06<br />
                                House No. 670, Pasteur Square<br />
                                Addis Ababa, Ethiopia
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 text-center text-sm text-black/40">
                    &copy; {new Date().getFullYear()} Droga Group (Hiring Hub). All rights reserved.
                </div>
            </div>
        </footer>
    );
}
