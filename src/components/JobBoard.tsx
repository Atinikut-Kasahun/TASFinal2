
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const jobCategories = ["All Departments", "Engineering", "Design", "Product", "Operations", "Sales"];

const initialJobs = [
    { id: 1, title: "Lead Frontend Engineer", dept: "Engineering", location: "London / Remote", type: "Full-time" },
    { id: 2, title: "Senior UI/UX Designer", dept: "Design", location: "San Francisco", type: "Full-time" },
    { id: 3, title: "Technical Product Manager", dept: "Product", location: "New York / Remote", type: "Full-time" },
    { id: 4, title: "DevOps Specialist", dept: "Engineering", location: "Global / Remote", type: "Contract" },
    { id: 5, title: "Head of Operations", dept: "Operations", location: "Berlin", type: "Full-time" },
    { id: 6, title: "Growth Sales Executive", dept: "Sales", location: "Remote", type: "Full-time" },
];

export default function JobBoard() {
    const [activeCategory, setActiveCategory] = useState("All Departments");

    const filteredJobs = activeCategory === "All Departments"
        ? initialJobs
        : initialJobs.filter(job => job.dept === activeCategory);

    return (
        <section className="py-32 bg-white" id="positions">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-accent font-bold text-xs uppercase tracking-widest mb-4 block">Available Roles</span>
                        <h2 className="text-5xl font-bold text-primary">Help us build the future.</h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap gap-2"
                    >
                        {jobCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "bg-cream text-primary hover:bg-primary/5"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredJobs.map((job) => (
                            <motion.div
                                layout
                                key={job.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ y: -5 }}
                                className="group p-8 bg-cream/20 rounded-[32px] border border-primary/5 hover:border-accent/20 hover:bg-white transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-3 py-1 rounded-lg bg-accent/5 text-[10px] font-bold text-accent uppercase tracking-wider">
                                            {job.dept}
                                        </span>
                                        <span className="text-primary/30 text-xs font-bold">{job.type}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-primary/50 text-sm font-medium flex items-center gap-2">
                                        📍 {job.location}
                                    </p>
                                </div>
                                <button className="mt-8 w-full py-4 rounded-2xl bg-white border border-primary/5 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                    Apply Now
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}
