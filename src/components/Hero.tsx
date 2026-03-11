"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";

export default function Hero({ settings, onSearch, currentSearch }: { settings?: any, onSearch: (query: string) => void, currentSearch?: string }) {
    const [heroStats, setHeroStats] = useState({ title: "Training Hours", value: "1,200+", icon: "BookOpen" });
    const [mockStats, setMockStats] = useState({ rating: "9.8", members: "500+", cta_text: "Join 200+ team members", cta_badge: "+12" });
    const [teamDiversity, setTeamDiversity] = useState([
        { label: 'Location A', value: 45 },
        { label: 'Location B', value: 20 },
        { label: 'Location C', value: 35 }
    ]);
    const [content, setContent] = useState({
        title: "Build the Future with Droga Group",
        subtitle: "Join a team of innovators, creators, and problem-solvers who are redefining what's possible in technology."
    });
    const [searchInput, setSearchInput] = useState("");

    useEffect(() => {
        if (currentSearch !== undefined && currentSearch !== searchInput) {
            setSearchInput(currentSearch);
        }
    }, [currentSearch]);

    useEffect(() => {
        if (settings?.site_hero_stats) {
            const stats = settings.site_hero_stats;
            setHeroStats(typeof stats === 'string' ? JSON.parse(stats) : stats);
        }
        if (settings?.site_hero_mock_stats) {
            const mStats = settings.site_hero_mock_stats;
            setMockStats(typeof mStats === 'string' ? JSON.parse(mStats) : mStats);
        }
        if (settings?.site_team_diversity) {
            const diversity = settings.site_team_diversity;
            setTeamDiversity(typeof diversity === 'string' ? JSON.parse(diversity) : diversity);
        }
        if (settings?.hero_content) {
            const hContent = settings.hero_content;
            setContent(typeof hContent === 'string' ? JSON.parse(hContent) : hContent);
        }
    }, [settings]);

    const IconComponent = (LucideIcons as any)[heroStats.icon] || LucideIcons.BookOpen;

    const handleSearchSubmit = () => {
        onSearch(searchInput);
        const jobBoard = document.getElementById('jobs');
        if (jobBoard) jobBoard.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="min-h-[85vh] flex items-center bg-[#FDF22F] pt-16 sm:pt-20 md:pt-32 pb-12 sm:pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">
                {/* Left Content */}
                <div className="text-center lg:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-[#000000] mb-5 sm:mb-6 whitespace-pre-line"
                    >
                        {content.title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="text-sm sm:text-base md:text-lg text-[#000000]/80 font-medium leading-relaxed mb-8 md:mb-12 max-w-xl mx-auto lg:mx-0"
                    >
                        {content.subtitle}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                        className="relative max-w-xl mb-8 md:mb-12 group mx-auto lg:mx-0"
                    >
                        <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            placeholder="Search jobs..."
                            className="w-full bg-white border border-[#000000]/10 rounded-full py-4 sm:py-5 md:py-6 pl-11 sm:pl-14 md:pl-16 pr-28 sm:pr-32 md:pr-40 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#000000]/5 focus:bg-white transition-all text-[#000000] font-bold text-xs sm:text-sm"
                        />
                        <button
                            onClick={handleSearchSubmit}
                            className="absolute right-2 top-2 bottom-2 bg-[#000000] text-white font-black text-[9px] sm:text-[11px] uppercase tracking-widest px-4 sm:px-6 md:px-10 rounded-full hover:bg-black transition-all flex items-center gap-2"
                        >
                            Find <span>→</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center lg:justify-start"
                    >
                        <a href="#positions" className="text-[#000000] font-bold border-b-2 border-[#000000]/20 hover:border-[#000000] transition-all pb-1 flex items-center gap-2 text-sm">
                            Explore Opportunities <span className="text-[#000000]">→</span>
                        </a>
                        <div className="hidden sm:block h-4 w-px bg-[#000000]/20" />
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#FDF22F] bg-[#EFE21A] flex items-center justify-center text-[10px] text-[#000000]">👤</div>
                                ))}
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#FDF22F] bg-[#000000] text-white flex items-center justify-center text-[10px] font-bold">{mockStats.cta_badge}</div>
                            </div>
                            <p className="text-[10px] md:text-xs text-[#000000]/60 font-medium">{mockStats.cta_text}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right — Abstract Illustration (hidden on mobile) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative hidden md:block"
                >
                    <motion.div
                        animate={{ y: [0, -16, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="rounded-[40px] overflow-hidden bg-white border border-[#000000]/5 p-4 aspect-[4/3] flex flex-col gap-4 shadow-2xl shadow-[#000000]/5"
                    >
                        <div className="flex items-center justify-between px-4 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#EFE21A]" />
                                <div className="w-24 h-2 rounded-full bg-[#000000]/5" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-[#000000]/5 flex items-center justify-center text-xs">🔔</div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 p-4 mt-2">
                            <div className="bg-[#EFE21A]/20 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="text-[10px] font-bold text-[#000000]/60 uppercase tracking-wider">Average Rating</div>
                                <div className="text-3xl font-bold text-[#000000]">{mockStats.rating}<span className="text-lg text-[#000000]/40">/10</span></div>
                            </div>
                            <div className="bg-[#000000]/5 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="text-[10px] font-bold text-[#000000]/40 uppercase tracking-wider">Team Members</div>
                                <div className="text-3xl font-bold text-[#000000]">{mockStats.members}</div>
                            </div>
                            <div className="col-span-2 bg-[#FDF22F] rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-[#000000]/40 uppercase tracking-wider">Scale & Reach</div>
                                    <div className="text-[10px] font-bold text-[#000000]">Global Presence</div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {teamDiversity.map((item, idx) => (
                                        <div key={idx} className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-[#000000] border border-[#000000]/5">{item.label}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 border border-[#000000]/5"
                    >
                        <div className="w-10 h-10 md:w-11 md:h-11 bg-[#EFE21A] rounded-full flex items-center justify-center text-[#000000] font-bold">
                            <IconComponent strokeWidth={1.5} size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] text-[#000000]/40 font-bold uppercase tracking-wider">{heroStats.title}</p>
                            <p className="text-base md:text-lg font-bold text-[#000000]">{heroStats.value}</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
