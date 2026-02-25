"use client";

import { motion } from "framer-motion";

export default function Impact() {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-32 bg-[#1A1C23] text-center"
            id="positions"
        >
            <div className="max-w-4xl mx-auto px-8">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-accent font-bold text-xs uppercase tracking-widest mb-6 block"
                >
                    Get Started
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl font-bold text-white mb-6"
                >
                    Ready to Make an Impact?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg text-white/60 mb-12 max-w-2xl mx-auto font-medium"
                >
                    Explore our open positions and find the perfect role where you can
                    grow, innovate, and make a difference.
                </motion.p>
                <motion.a
                    href="#positions"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block bg-accent text-white font-bold px-12 py-4 rounded-full text-lg hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300"
                >
                    View All Open Positions
                </motion.a>
            </div>
        </motion.section>
    );
}
