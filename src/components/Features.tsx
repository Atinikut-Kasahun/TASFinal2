"use client";

import { motion } from "framer-motion";

const features = [
    {
        icon: "💡",
        title: "Innovation First",
        desc: "We push boundaries and embrace cutting-edge technologies.",
        tag: "Engineering"
    },
    {
        icon: "👥",
        title: "Collaborative Culture",
        desc: "Work with talented individuals who value teamwork and respect.",
        tag: "Culture"
    },
    {
        icon: "🚀",
        title: "Growth Mindset",
        desc: "Continuous learning and development are at our core.",
        tag: "Personal Growth"
    },
    {
        icon: "🌍",
        title: "Global Impact",
        desc: "Build products that reach millions of users worldwide.",
        tag: "Mission"
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } },
};

export default function Features() {
    return (
        <section className="py-32 bg-white" id="why-tas">
            <div className="max-w-7xl mx-auto px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-20 text-center"
                >
                    <span className="text-accent font-bold text-xs uppercase tracking-widest bg-accent/5 px-4 py-1.5 rounded-full mb-6 inline-block">
                        Why Droga?
                    </span>
                    <h2 className="text-5xl font-bold text-primary mb-6">
                        Why Droga Group?
                    </h2>
                    <p className="text-xl text-primary/60 max-w-2xl mx-auto font-medium">
                        We&apos;re more than just a workplace. We&apos;re a community committed to
                        excellence and innovation.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={cardVariants}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group p-8 bg-cream/30 rounded-[32px] border border-primary/5 hover:border-accent/20 hover:bg-white transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-default relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-accent uppercase tracking-tighter bg-accent/5 px-2 py-1 rounded-md">{feature.tag}</span>
                            </div>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-primary/60 text-sm leading-relaxed font-medium">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
