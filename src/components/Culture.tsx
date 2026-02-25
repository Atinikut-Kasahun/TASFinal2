"use client";

import { motion } from "framer-motion";

const culturePoints = [
    { text: "Flexible work arrangements with remote options", detail: "Work from anywhere in the world." },
    { text: "Comprehensive health benefits & wellness", detail: "We take care of your physical and mental health." },
    { text: "Professional development budget", detail: "$2,500 annual budget for your growth." },
];

export default function Culture() {
    return (
        <section className="py-32 bg-cream/50" id="culture">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 gap-24 items-center">
                {/* Left Text */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-accent font-bold text-xs uppercase tracking-widest mb-6 block">Our DNA</span>
                    <h2 className="text-5xl font-bold text-primary mb-10">
                        Our Culture
                    </h2>
                    <div className="space-y-8">
                        {culturePoints.map((point, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group"
                            >
                                <div className="flex items-start gap-5">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold mt-1 group-hover:bg-accent group-hover:text-white transition-colors">•</span>
                                    <div>
                                        <p className="text-primary text-xl font-bold mb-1">{point.text}</p>
                                        <p className="text-primary/50 text-sm font-medium">{point.detail}</p>
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
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="grid grid-cols-2 grid-rows-2 gap-4 h-[480px]"
                >
                    {/* Image 1 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Image 2 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Image 3 */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-2xl overflow-hidden"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                    {/* Team Distribution Chart Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-[40px] p-10 shadow-2xl shadow-primary/5 border border-primary/5 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h4 className="text-lg font-bold text-primary">Team Diversity</h4>
                                <p className="text-xs text-primary/40 font-medium">Distribution by region</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-xs">📊</div>
                            </div>
                        </div>

                        {/* Animated Bar Chart */}
                        <div className="space-y-6">
                            {[
                                { region: "North America", pct: "45%", color: "bg-primary" },
                                { region: "Europe", pct: "30%", color: "bg-accent" },
                                { region: "Asia Pacific", pct: "15%", color: "bg-accent/40" },
                                { region: "Remote Hubs", pct: "10%", color: "bg-primary/20" },
                            ].map((row, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                                        <span>{row.region}</span>
                                        <span>{row.pct}</span>
                                    </div>
                                    <div className="h-2 w-full bg-cream rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: row.pct }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            className={`h-full ${row.color} rounded-full`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Floating Stats */}
                        <div className="mt-12 grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-cream flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase">Total Members</p>
                                    <p className="text-2xl font-bold text-primary">200+</p>
                                </div>
                                <span className="text-2xl">🌍</span>
                            </div>
                            <div className="p-6 rounded-3xl bg-primary flex justify-between items-center text-white">
                                <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Global Hubs</p>
                                    <p className="text-2xl font-bold">15</p>
                                </div>
                                <span className="text-2xl opacity-40">📍</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
