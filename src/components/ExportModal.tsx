"use client";
/**
 * ExportModal.tsx
 * Drop-in export modal for TADashboard.
 *
 * USAGE IN TADashboard.tsx:
 *
 *   1. Import:
 *        import ExportModal from "@/components/ExportModal";
 *        import { exportTAReport } from "@/lib/exportTAReport";
 *
 *   2. Add state:
 *        const [exportModal, setExportModal] = useState(false);
 *
 *   3. Render (anywhere inside the Reports section JSX):
 *        <ExportModal
 *          open={exportModal}
 *          onClose={() => setExportModal(false)}
 *          stats={stats}
 *          jobs={jobs || []}
 *          reportFilters={reportFilters}
 *          apiFetch={apiFetch}
 *        />
 *
 *   4. Trigger button (replace the old Export button in the Reports header):
 *        <button onClick={() => setExportModal(true)} ...>
 *          <Download size={14} /> Export Report
 *        </button>
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { exportTAReport } from "@/lib/exportTAReport";
import {
    Download, X, CheckSquare, Square,
    FileSpreadsheet, Users, Briefcase,
    Calendar, PieChart, TrendingDown, Check,
} from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    stats: any;
    jobs: any[];
    reportFilters: { dateRange: string; department: string; jobId: string };
    /** Pass the apiFetch from TADashboard so we can pull all applicants */
    apiFetch: (url: string, opts?: RequestInit) => Promise<any>;
}

const SHEETS = [
    {
        id: "summary",
        icon: <PieChart size={15} />,
        label: "Executive Summary",
        desc: "KPIs, funnel overview, meta info",
        required: true,
    },
    {
        id: "applicants",
        icon: <Users size={15} />,
        label: "Applicant Roster",
        desc: "Full candidate list with status & dates",
        required: false,
    },
    {
        id: "jobs",
        icon: <Briefcase size={15} />,
        label: "Job Postings",
        desc: "Active & archived positions",
        required: false,
    },
    {
        id: "timeline",
        icon: <Calendar size={15} />,
        label: "Monthly Volume",
        desc: "Application count per month",
        required: false,
    },
    {
        id: "departments",
        icon: <PieChart size={15} />,
        label: "Departments & Sources",
        desc: "Breakdown by dept + sourcing channels",
        required: false,
    },
    {
        id: "turnover",
        icon: <TrendingDown size={15} />,
        label: "Turnover Analysis",
        desc: "Monthly separations & risk levels",
        required: false,
    },
];

const PERIOD_LABELS: Record<string, string> = {
    "7": "Last 7 Days",
    "30": "Last 30 Days",
    "90": "Last 90 Days",
    "365": "Last Year",
    "All": "All Time",
};

export default function ExportModal({
    open, onClose, stats, jobs, reportFilters, apiFetch,
}: Props) {
    const [selected, setSelected] = useState<Set<string>>(
        new Set(SHEETS.map((s) => s.id))
    );
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState("");

    const toggle = (id: string) => {
        if (id === "summary") return; // always required
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allSelected = SHEETS.every((s) => selected.has(s.id));
    const toggleAll = () => {
        if (allSelected) {
            setSelected(new Set(["summary"]));
        } else {
            setSelected(new Set(SHEETS.map((s) => s.id)));
        }
    };

    const handleExport = async () => {
        setLoading(true);
        setProgress(0);
        setDone(false);

        try {
            setProgressLabel("Fetching applicant data…");
            setProgress(15);

            /* Fetch up to 1000 applicants for the roster sheet */
            let allApplicants: any[] = [];
            if (selected.has("applicants")) {
                const r = await apiFetch(`/v1/applicants?page=1&limit=1000`);
                allApplicants = r.data || r || [];
            }

            setProgress(45);
            setProgressLabel("Compiling job postings…");
            await new Promise((res) => setTimeout(res, 200));

            setProgress(65);
            setProgressLabel("Building Excel sheets…");
            await new Promise((res) => setTimeout(res, 150));

            /* Filter stats object to only include selected sheets */
            const filteredStats = { ...stats };
            if (!selected.has("timeline")) delete filteredStats.timeline;
            if (!selected.has("departments")) { delete filteredStats.by_department; delete filteredStats.sources; }
            if (!selected.has("turnover")) delete filteredStats.turnover;

            setProgress(80);
            setProgressLabel("Styling & formatting…");
            await new Promise((res) => setTimeout(res, 100));

            await exportTAReport(
                filteredStats,
                selected.has("applicants") ? allApplicants : [],
                selected.has("jobs") ? jobs : [],
                reportFilters
            );

            setProgress(100);
            setProgressLabel("Done!");
            setDone(true);

            setTimeout(() => {
                setDone(false);
                setProgress(0);
                setLoading(false);
                onClose();
            }, 1800);
        } catch (err) {
            console.error("Export failed:", err);
            setLoading(false);
            setProgress(0);
        }
    };

    const period = PERIOD_LABELS[reportFilters.dateRange] ?? reportFilters.dateRange;
    const dept =
        reportFilters.department === "All"
            ? "All Departments"
            : reportFilters.department;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.93, opacity: 0, y: 24 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.93, opacity: 0, y: 24 }}
                        transition={{ type: "spring", damping: 26, stiffness: 260 }}
                        className="relative z-10 bg-white w-full max-w-lg rounded-[36px] shadow-2xl overflow-hidden"
                    >
                        {/* ── Header ── */}
                        <div className="bg-black px-8 pt-8 pb-6 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#FDF22F]/10 rounded-full" />
                            <div className="absolute bottom-0 left-0 w-full h-px bg-[#FDF22F]/20" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-9 h-9 bg-[#FDF22F] rounded-xl flex items-center justify-center shadow-lg shadow-[#FDF22F]/20">
                                            <FileSpreadsheet size={18} className="text-black" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#FDF22F]/60 uppercase tracking-[0.3em]">
                                                TA Dashboard
                                            </p>
                                            <h2 className="text-[18px] font-black text-white tracking-tight leading-none">
                                                Export Report
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap mt-3">
                                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white/70 uppercase tracking-widest">
                                            <Calendar size={10} />
                                            {period}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white/70 uppercase tracking-widest">
                                            <Briefcase size={10} />
                                            {dept}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-[#FDF22F]/20 px-3 py-1 rounded-lg text-[10px] font-black text-[#FDF22F] uppercase tracking-widest">
                                            <FileSpreadsheet size={10} />
                                            Excel .xlsx
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ── Sheet Selector ── */}
                        <div className="px-8 py-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                    Select Sheets to Include
                                </p>
                                <button
                                    onClick={toggleAll}
                                    className="text-[10px] font-black text-black hover:text-[#FDF22F] uppercase tracking-widest flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-black transition-all"
                                >
                                    {allSelected ? <CheckSquare size={11} /> : <Square size={11} />}
                                    {allSelected ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            <div className="space-y-2">
                                {SHEETS.map((sheet) => {
                                    const isSelected = selected.has(sheet.id);
                                    return (
                                        <button
                                            key={sheet.id}
                                            onClick={() => toggle(sheet.id)}
                                            disabled={sheet.required}
                                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left group ${isSelected
                                                    ? "border-black bg-black/5"
                                                    : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
                                                } ${sheet.required ? "opacity-90 cursor-default" : "cursor-pointer"}`}
                                        >
                                            {/* Check indicator */}
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${isSelected
                                                        ? "bg-black"
                                                        : "bg-white border-2 border-gray-200"
                                                    }`}
                                            >
                                                {isSelected && <Check size={11} className="text-[#FDF22F]" />}
                                            </div>

                                            {/* Icon */}
                                            <div
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${isSelected
                                                        ? "bg-[#FDF22F] text-black"
                                                        : "bg-white border border-gray-100 text-gray-400"
                                                    }`}
                                            >
                                                {sheet.icon}
                                            </div>

                                            {/* Labels */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[12px] font-black tracking-tight ${isSelected ? "text-black" : "text-gray-500"}`}>
                                                    {sheet.label}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium">{sheet.desc}</p>
                                            </div>

                                            {sheet.required && (
                                                <span className="text-[9px] font-black text-[#FDF22F] bg-black px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                                    Required
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Stats preview */}
                            <div className="grid grid-cols-3 gap-3 pt-1">
                                {[
                                    { label: "Applicants", value: stats?.funnel?.applied ?? 0 },
                                    { label: "Jobs", value: jobs.length },
                                    { label: "Months", value: stats?.timeline?.length ?? 0 },
                                ].map((m) => (
                                    <div key={m.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                                        <p className="text-[18px] font-black text-black tabular-nums">{m.value}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{m.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Progress Bar (shown while loading) ── */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-8 pb-4"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {done ? "Complete!" : progressLabel}
                                            </p>
                                            <p className="text-[10px] font-black text-black tabular-nums">{progress}%</p>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className={`h-full rounded-full ${done ? "bg-emerald-500" : "bg-[#FDF22F]"}`}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Footer CTA ── */}
                        <div className="px-8 pb-8 flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-40"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleExport}
                                disabled={loading || selected.size === 0}
                                className={`flex-[2] py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl disabled:cursor-wait ${done
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-[#FDF22F] text-black shadow-[#FDF22F]/20 hover:bg-black hover:text-white hover:-translate-y-0.5"
                                    }`}
                            >
                                {done ? (
                                    <>
                                        <Check size={15} /> Downloaded!
                                    </>
                                ) : loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        Building Excel…
                                    </>
                                ) : (
                                    <>
                                        <Download size={15} />
                                        Download {selected.size} Sheet{selected.size !== 1 ? "s" : ""} (.xlsx)
                                    </>
                                )}
                            </button>
                        </div>

                        {/* ── Format note ── */}
                        <div className="px-8 pb-6 -mt-3">
                            <p className="text-[9px] font-bold text-gray-300 text-center uppercase tracking-widest">
                                Professional Excel format · Multi-sheet · Color-coded · Freeze panes
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
