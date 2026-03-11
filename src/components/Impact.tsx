"use client";

import { motion } from "framer-motion";

export default function Impact({ settings }: { settings?: any }) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="py-20 md:py-32 bg-[#000000] text-center"
            id="positions"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    className="bg-[#EFE21A] text-[#000000] font-black text-[9px] md:text-[10px] uppercase tracking-widest px-6 py-2 rounded-full mb-6 md:mb-8 inline-block"
                >
                    Get Started
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 md:mb-8"
                >
                    Ready to Make an Impact?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-base md:text-lg text-white/60 mb-10 md:mb-12 max-w-2xl mx-auto font-medium"
                >
                    Explore our open positions and find the perfect role where you can
                    grow, innovate, and make a difference.
                </motion.p>
                <motion.a
                    href="#jobs"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.05, backgroundColor: "#EFE21A", color: "#000000" }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 md:gap-3 bg-white text-[#000000] font-black px-8 md:px-12 py-4 md:py-5 rounded-full text-base md:text-lg shadow-2xl hover:shadow-[#EFE21A]/20 transition-all duration-300"
                >
                    View All Open Positions <span>→</span>
                </motion.a>
            </div>
        </motion.section>
    );
}
