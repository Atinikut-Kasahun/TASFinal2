"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

const defaultCulturePoints = [
    { heading: "Continuous Growth", text: "We invest heavily in the professional development of our team members." },
    { heading: "Inclusive Environment", text: "Diversity is our strength. We welcome talent from all backgrounds." },
    { heading: "Health & Wellness", text: "Comprehensive benefits to keep you and your family healthy." }
];

export default function Culture({ settings }: { settings?: any }) {
    const [cultureText, setCultureText] = useState({
        heading: "Life at Droga Group",
        bullets: defaultCulturePoints
    });
    const [cultureImages, setCultureImages] = useState({ img1: '', img2: '', img3: '' });
    const [teamDiversity, setTeamDiversity] = useState([
        { label: 'Addis Ababa', value: 45 },
        { label: 'Dire Dawa', value: 20 },
        { label: 'Hawassa', value: 35 }
    ]);

    useEffect(() => {
        if (settings?.site_culture_text) {
            const cText = settings.site_culture_text;
            setCultureText(typeof cText === 'string' ? JSON.parse(cText) : cText);
        }
        if (settings?.site_culture_images) {
            const cImages = settings.site_culture_images;
            const parsed = typeof cImages === 'string' ? JSON.parse(cImages) : cImages;
            setCultureImages(prev => ({ ...prev, ...parsed }));
        }
        if (settings?.site_team_diversity) {
            const diversity = settings.site_team_diversity;
            setTeamDiversity(typeof diversity === 'string' ? JSON.parse(diversity) : diversity);
        }
    }, [settings]);

    const getImageUrl = (path: string, fallback: string) => {
        if (!path || path === "") return fallback;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const baseUrl = API_URL.split('/api')[0];
        return `${baseUrl}/storage/${cleanPath}`;
    };

    return (
        <section className="py-16 sm:py-20 md:py-24 bg-[#FDF22F]" id="about-us">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                {/* Left Text */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center lg:text-left"
                >
                    <span className="text-[#000000] font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 block">Our DNA</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] mb-6">
                        {cultureText.heading}
                    </h2>
                    <div className="space-y-5 md:space-y-8">
                        {cultureText.bullets.map((point: any, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="flex flex-row items-start gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#000000]/10 flex items-center justify-center text-[#000000] text-xs font-bold mt-1 group-hover:bg-[#000000] group-hover:text-white transition-colors">•</span>
                                    <div className="text-left">
                                        <p className="text-[#000000] text-base md:text-xl font-bold mb-1">{point.heading || point.text}</p>
                                        <p className="text-[#000000]/50 text-xs md:text-sm font-medium">{point.text || point.detail}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Visual Grid */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7 }}
                    className="grid grid-cols-2 gap-3 md:gap-4"
                >
                    {/* Image 1 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
                        style={{
                            backgroundImage: `url('${getImageUrl(cultureImages.img1, "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80")}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Image 2 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg"
                        style={{
                            backgroundImage: `url('${getImageUrl(cultureImages.img2, "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80")}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Image 3 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg hidden md:block"
                        style={{
                            backgroundImage: `url('${getImageUrl(cultureImages.img3, "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80")}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Team Distribution Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#FDF22F] rounded-3xl md:rounded-[40px] p-3 md:p-6 shadow-none hover:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 relative overflow-hidden border-none"
                    >
                        <div className="flex items-center justify-between mb-3 md:mb-6">
                            <div>
                                <h4 className="text-xs md:text-lg font-bold text-[#000000]">Diversity</h4>
                                <p className="text-[10px] text-[#000000]/40 font-medium">By region</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[#000000]/5 flex items-center justify-center text-[10px] md:text-xs">📊</div>
                            </div>
                        </div>
                        <div className="space-y-2 md:space-y-4">
                            {(teamDiversity || []).map((row, i) => (
                                <div key={i} className="space-y-1 md:space-y-2">
                                    <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-[#000000]/60 uppercase tracking-widest text-left">
                                        <span className="truncate max-w-[55px] sm:max-w-[70px] md:max-w-none">{row.label}</span>
                                        <span>{row.value}%</span>
                                    </div>
                                    <div className="h-1.5 md:h-2 w-full bg-[#000000]/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${Math.min(100, Math.max(0, Number(row.value)))}%` }}
                                            viewport={{ once: false }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${i % 2 === 0 ? 'bg-[#000000]' : 'bg-[#FFBA49]'} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
