"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="min-h-screen flex items-center bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] pt-24">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 gap-16 items-center py-20">
                {/* Left Content */}
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl font-bold leading-tight text-primary mb-6"
                    >
                        Build the Future with{" "}
                        <span className="text-accent underline decoration-brandYellow/30 underline-offset-8">
                            Droga Group
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-primary/70 font-medium leading-relaxed mb-10 max-w-xl"
                    >
                        Join a team of innovators, creators, and problem-solvers who are
                        redefining what&apos;s possible in technology.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative max-w-lg mb-12"
                    >
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <span className="text-primary/40 text-xl">🔍</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search jobs by title, skill, or location..."
                            className="w-full bg-white border border-primary/10 rounded-2xl py-5 pl-14 pr-32 shadow-2xl shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-primary font-medium"
                        />
                        <button className="absolute right-2.5 top-2.5 bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-black transition-all">
                            Find Jobs
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center gap-6"
                    >
                        <a
                            href="#positions"
                            className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent transition-all pb-1 flex items-center gap-2"
                        >
                            Explore Opportunities <span className="text-accent">→</span>
                        </a>
                        <div className="h-4 w-px bg-primary/20" />
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-cream bg-accent/20 flex items-center justify-center text-[10px] text-primary">👤</div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-cream bg-primary text-white flex items-center justify-center text-[10px] font-bold">+12</div>
                        </div>
                        <p className="text-xs text-primary/60 font-medium">Join 200+ team members</p>
                    </motion.div>
                </div>

                {/* Right — Abstract Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <motion.div
                        animate={{ y: [0, -16, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="rounded-[40px] overflow-hidden bg-white border border-primary/5 p-4 aspect-[4/3] flex flex-col gap-4 shadow-2xl shadow-primary/5"
                    >
                        {/* Mock Dashboard Snippet */}
                        <div className="flex items-center justify-between px-4 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-accent/20" />
                                <div className="w-24 h-2 rounded-full bg-primary/5" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-xs">🔔</div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 p-4 mt-2">
                            <div className="bg-accent/5 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="text-[10px] font-bold text-accent uppercase tracking-wider">Hired This Month</div>
                                <div className="text-3xl font-bold text-primary">12</div>
                            </div>
                            <div className="bg-primary/5 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="text-[10px] font-bold text-primary/40 uppercase tracking-wider">New Applicants</div>
                                <div className="text-3xl font-bold text-primary text-primary/60">48</div>
                            </div>
                            <div className="col-span-2 bg-cream rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-primary/40 uppercase tracking-wider">Top Skills Found</div>
                                    <div className="text-[10px] font-bold text-accent">View Report</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-primary border border-primary/5">React</div>
                                    <div className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-primary border border-primary/5">TypeScript</div>
                                    <div className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-primary border border-primary/5">AI</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="absolute -top-6 -right-6 bg-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 border border-primary/5"
                    >
                        <div className="w-11 h-11 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xl font-bold">
                            📈
                        </div>
                        <div>
                            <p className="text-[10px] text-primary/40 font-bold uppercase tracking-wider">Growth Pace</p>
                            <p className="text-lg font-bold text-primary">+150% YoY</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
