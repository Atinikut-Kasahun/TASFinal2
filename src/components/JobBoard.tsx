import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const defaultCategories = ["All Departments", "Engineering", "Design", "Product", "Operations", "Sales"];
const ITEMS_PER_PAGE = 3;

export default function JobBoard({ settings, searchQuery, onClearSearch }: { settings?: any, searchQuery?: string, onClearSearch?: () => void }) {
    // Dynamic categories from settings, fall back to default if not available
    const [jobCategories, setJobCategories] = useState<string[]>(["All Departments"]);
    const [activeCategory, setActiveCategory] = useState("All Departments");
    const [jobs, setJobs] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [showNoResultsMessage, setShowNoResultsMessage] = useState(false);

    React.useEffect(() => {
        if (settings?.site_job_departments) {
            const dynamicDepts = typeof settings.site_job_departments === 'string'
                ? JSON.parse(settings.site_job_departments)
                : settings.site_job_departments;
            if (Array.isArray(dynamicDepts)) {
                setJobCategories(["All Departments", ...dynamicDepts]);
            } else {
                setJobCategories(defaultCategories);
            }
        } else {
            setJobCategories(defaultCategories);
        }
    }, [settings]);

    React.useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage.toString(),
                    per_page: ITEMS_PER_PAGE.toString()
                });
                if (activeCategory !== "All Departments") params.set('department', activeCategory);
                if (searchQuery) params.set('search', searchQuery);

                const response = await fetch(`${API_URL}/v1/public/jobs?${params.toString()}`);
                const data = await response.json();

                setJobs(data.data || []);
                setMeta(data);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [currentPage, activeCategory, searchQuery]);

    const filteredJobs = jobs; // Server-side filtered now

    // Handle "No Results" auto-clear
    React.useEffect(() => {
        if (searchQuery && jobs.length === 0 && !loading) { // Check !loading to ensure fetch is complete
            setShowNoResultsMessage(true);
            const timer = setTimeout(() => {
                setShowNoResultsMessage(false);
                if (onClearSearch) onClearSearch();
            }, 5000); // Wait 5 seconds
            return () => clearTimeout(timer);
        } else {
            setShowNoResultsMessage(false);
        }
    }, [searchQuery, jobs.length, onClearSearch, loading]);

    // Pagination Logic
    const totalPages = meta?.last_page || 1;
    const paginatedJobs = jobs; // Server-side filtered now, so 'jobs' is already the paginated/filtered list

    return (
        <section className="py-20 md:py-24 bg-white" id="jobs">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 md:mb-12 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <span className="text-[#000000] font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 block">Available Roles</span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#000000]">
                            {searchQuery ? `Results for "${searchQuery}"` : "Help us build the future."}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap gap-2 justify-center lg:justify-start"
                    >
                        {jobCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all ${activeCategory === cat
                                    ? "bg-[#000000] text-white shadow-xl shadow-[#000000]/20"
                                    : "bg-[#FDF22F] text-[#000000] hover:bg-[#000000]/5"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>
                </div>

                {showNoResultsMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 md:mb-12 p-8 md:p-12 bg-[#FDF22F] border border-[#000000]/10 rounded-3xl md:rounded-[40px] text-center shadow-sm"
                    >
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#000000]/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-[#000000] font-black text-xl md:text-2xl mb-2 md:mb-4">No matching opportunities found</h3>
                        <p className="text-[#000000]/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                            While we don't have an exact match for your current search criteria, we've refreshed the view to show all open positions at <span className="font-bold text-[#000000]">Droga Group</span>.
                        </p>
                        <p className="text-[#000000]/50 text-[10px] md:text-sm mt-4 md:mt-6 font-medium italic">We've automatically cleared the search filters for you.</p>
                    </motion.div>
                )}

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                    <AnimatePresence mode='popLayout'>
                        {paginatedJobs.map((job) => (
                            <motion.div
                                layout
                                key={job.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ y: -5 }}
                                className="group p-5 bg-[#FDF22F]/20 rounded-2xl border border-[#000000]/5 hover:border-[#000000]/20 hover:bg-white transition-all hover:shadow-2xl hover:shadow-[#000000]/5 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="px-2 py-1 rounded-md bg-[#EFE21A] text-[8px] font-bold text-[#000000] uppercase tracking-wider">
                                            {job.department}
                                        </span>
                                        <span className="text-[#000000]/30 text-[9px] font-bold">{job.type}</span>
                                    </div>
                                    <h3 className="text-base font-bold text-[#000000] mb-1 group-hover:text-[#000000] transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-[#000000]/50 text-xs font-medium flex items-center gap-1.5">
                                        📍 {job.location || '—'}
                                    </p>

                                    {/* Status Badges Row - Time & Deadline */}
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {(job.published_at || job.created_at) && (
                                            <div className="bg-white/60 px-2 py-1 rounded-lg flex items-center gap-1 border border-[#000000]/5 shadow-sm">
                                                <svg className="w-3 h-3 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-[9px] font-bold text-[#000000]/60 whitespace-nowrap">
                                                    {(() => {
                                                        const d = new Date(job.published_at || job.created_at);
                                                        const now = new Date();
                                                        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                                                        return diffDays === 0 ? 'Posted Today' : diffDays === 1 ? 'Posted 1 day ago' : `Posted ${diffDays} days ago`;
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="bg-[#000000]/5 px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-[#000000]/5">
                                            <svg className="w-3 h-3 text-[#000000]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[9px] font-bold text-[#000000]/60 whitespace-nowrap">
                                                {(() => {
                                                    const d = job.deadline
                                                        ? new Date(job.deadline)
                                                        : new Date(new Date(job.published_at || job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
                                                    const now = new Date();
                                                    const diffTime = d.getTime() - now.getTime();
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return diffDays <= 0 ? 'Closes Today' : `Closes in ${diffDays} days`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/careers?apply=${job.id}`}
                                    className="mt-4 w-full py-2.5 rounded-lg bg-white border border-[#000000]/5 text-[#000000] text-[11px] font-bold group-hover:bg-[#000000] group-hover:text-white group-hover:border-[#000000] transition-all text-center block"
                                >
                                    Apply Now <span>→</span>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-16 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDF22F] text-[#000000] transition-all hover:bg-[#000000]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                if (pageNum > totalPages) pageNum = totalPages;
                                if (pageNum < 1) pageNum = 1;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum
                                            ? "bg-[#000000] text-white shadow-lg shadow-[#000000]/20"
                                            : "bg-[#FDF22F] text-[#000000] hover:bg-[#000000]/10"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FDF22F] text-[#000000] transition-all hover:bg-[#000000]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
