'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import { Check, ChevronLeft, ChevronRight, FileText, CheckCircle2, TrendingUp, TrendingDown, Users, Briefcase, Target, Clock, Download, Filter, BarChart2, PieChart, Activity } from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-[13px] font-black uppercase tracking-widest text-[#FDF22F] flex items-center gap-3 border border-[#FDF22F]/20 bg-black"
        >
            <CheckCircle2 size={18} className="text-[#FDF22F] shrink-0" />
            <span>{msg}</span>
        </motion.div>
    );
}

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, trend, trendUp, accent }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={`relative bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-7 group cursor-default`}
        >
            {accent && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FDF22F]" />
            )}
            <div className="flex items-start justify-between mb-4 sm:mb-5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${accent ? 'bg-[#FDF22F]' : 'bg-gray-50 border border-gray-100'}`}>
                    <Icon size={18} className={accent ? 'text-black' : 'text-gray-400'} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {trend}
                </span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">{value}</p>
        </motion.div>
    );
}

/* ─── Funnel Bar ─────────────────────────────────────────── */
function FunnelBar({ label, value, max, color }: any) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className="text-[13px] font-black text-black tabular-nums">{value}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                />
            </div>
            <p className="text-[10px] font-bold text-gray-300 text-right">{pct}% conv.</p>
        </div>
    );
}

interface Requisition {
    id: number; title: string; department: string; headcount: number;
    budget: number | null; position_type: 'new' | 'replacement'; priority: string;
    location: string; status: string; description: string | null; jd_path: string | null;
    jd_content?: string; created_at: string;
    requester?: { id: number; name: string; email: string };
    tenant?: { name: string };
    job_posting?: { created_at: string; published_at?: string; deadline?: string; title: string; id: number };
}

export default function HRManagerDashboard({ user, activeTab: initialTab, onLogout }: { user: any; activeTab: string; onLogout: () => void }) {
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [reqsMeta, setReqsMeta] = useState<any>(null);
    const [reqsPage, setReqsPage] = useState(1);
    const [jobs, setJobs] = useState<any[]>([]);
    const [jobsMeta, setJobsMeta] = useState<any>(null);
    const [jobsPage, setJobsPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [drawerReq, setDrawerReq] = useState<Requisition | null>(null);
    const [feedbackTarget, setFeedbackTarget] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'reject' | 'amend' | null>(null);
    const [feedbackReason, setFeedbackReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [localTab, setLocalTab] = useState(initialTab === 'HiringPlan' ? 'HIRING PLAN' : initialTab === 'Reports' ? 'REPORTS' : 'JOBS');
    const [subTab, setSubTab] = useState(initialTab === 'HiringPlan' ? 'PENDING' : initialTab === 'Reports' ? 'OVERVIEW' : 'ACTIVE');
    const [stats, setStats] = useState<any>(null);
    const [recentApplicants, setRecentApplicants] = useState<any[]>([]);
    const [reportFilters, setReportFilters] = useState({ dateRange: '30', department: 'All', jobId: 'All' });
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const mapped = initialTab === 'HiringPlan' ? 'HIRING PLAN' : initialTab === 'Reports' ? 'REPORTS' : 'JOBS';
        setLocalTab(mapped);
        setSubTab(mapped === 'HIRING PLAN' ? 'PENDING' : mapped === 'REPORTS' ? 'OVERVIEW' : 'ACTIVE');
    }, [initialTab]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            if (localTab === 'JOBS') {
                const status = subTab === 'ARCHIVED' ? 'archived' : 'active';
                const jobsJson = await apiFetch(`/v1/jobs?page=${jobsPage}&status=${status}`);
                setJobs(jobsJson.data || []);
                setJobsMeta(jobsJson);
            } else if (localTab === 'HIRING PLAN') {
                const status = subTab === 'PENDING' ? 'pending_hr' : 'all';
                const reqsJson = await apiFetch(`/v1/requisitions?page=${reqsPage}&status=${status}`);
                setRequisitions(reqsJson.data || []);
                setReqsMeta(reqsJson);
            }
            if (localTab === 'REPORTS') {
                const params = new URLSearchParams({ date_range: reportFilters.dateRange, department: reportFilters.department, job_id: reportFilters.jobId });
                const [statsData, jobsJson, appsJson] = await Promise.all([
                    apiFetch(`/v1/applicants/stats?${params.toString()}`),
                    apiFetch(`/v1/jobs?page=1&limit=100`),
                    apiFetch(`/v1/applicants?page=1&limit=8`)
                ]);
                setStats(statsData);
                setJobs(jobsJson.data || []);
                setRecentApplicants(appsJson.data || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [localTab, subTab, reportFilters, reqsPage, jobsPage]);

    const isMD = user?.roles?.some((r: any) => r.slug === 'managing_director');
    const isHR = user?.roles?.some((r: any) => r.slug === 'hr_manager');

    const canApprove = (req: Requisition) => {
        if (isMD && req.status === 'pending_md') return true;
        if (isHR && req.status === 'pending_hr') return true;
        return false;
    };

    const handleApprove = async (id: number) => {
        setActionLoading(true);
        try {
            await apiFetch(`/v1/requisitions/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
            setRequisitions(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            if (drawerReq?.id === id) setDrawerReq(prev => prev ? { ...prev, status: 'approved' } : null);
            showToast('Requisition Approved ✓ — visible until you leave this tab');
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleAction = async () => {
        if (!feedbackTarget || !feedbackReason.trim() || !actionType) return;
        setActionLoading(true);
        try {
            const newStatus = actionType === 'amend' ? 'amendment_required' : 'rejected';
            if (actionType === 'amend') {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/amend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: feedbackReason }) });
                showToast('Sent back for amendment');
            } else {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', rejection_reason: feedbackReason }) });
                showToast('Requisition Rejected');
            }
            setRequisitions(prev => prev.map(r => r.id === feedbackTarget ? { ...r, status: newStatus } : r));
            setFeedbackTarget(null); setFeedbackReason(''); setActionType(null); setDrawerReq(null);
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        setActionLoading(true);
        try {
            await apiFetch('/v1/requisitions/bulk-approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) });
            setRequisitions(prev => prev.map(r => selectedIds.includes(r.id) ? { ...r, status: 'approved' } : r));
            showToast(`${selectedIds.length} Requisitions Approved ✓`);
            setSelectedIds([]);
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const pendingReqs = requisitions.filter(r => r.status === 'pending_md' || r.status === 'pending_hr');
    const activeJobs = jobs.filter((j: any) => j.status === 'active').length;
    const appliedCount = stats?.funnel?.applied || 0;
    const hiredCount = stats?.funnel?.hired || 0;
    const funnelMax = appliedCount;

    const statusColor: Record<string, string> = {
        new: 'bg-blue-50 text-blue-600 border-blue-100',
        written_exam: 'bg-purple-50 text-purple-600 border-purple-100',
        technical_interview: 'bg-amber-50 text-amber-600 border-amber-100',
        final_interview: 'bg-orange-50 text-orange-600 border-orange-100',
        offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        hired: 'bg-green-50 text-green-700 border-green-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center border-b border-gray-100 gap-y-2">
                        <div className="pb-3 text-[13px] font-black tracking-[0.2em] text-[#000000] relative">
                            {localTab}
                            <motion.div layoutId="categoryIndicator" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FDF22F]" />
                        </div>
                        <div className="flex gap-5 sm:gap-8 ml-6 sm:ml-10 border-l border-gray-100 pl-6 sm:pl-10 mb-3 h-5 items-center">
                            {(() => {
                                let tabs: string[] = [];
                                if (localTab === 'JOBS') tabs = ['ACTIVE', 'ARCHIVED'];
                                else if (localTab === 'HIRING PLAN') tabs = ['PENDING', 'ALL'];
                                else if (localTab === 'REPORTS') tabs = ['OVERVIEW'];
                                return tabs.map(t => (
                                    <button key={t} onClick={() => setSubTab(t)} className={`text-[11px] font-black tracking-widest transition-all relative ${subTab === t ? 'text-[#000000]' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {t}
                                        {subTab === t && <motion.div layoutId="activeSubTabHR" className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#FDF22F] rounded-full" />}
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
                {localTab === 'HIRING PLAN' && selectedIds.length > 0 && (
                    <button onClick={handleBulkApprove} disabled={actionLoading} className="w-full sm:w-auto bg-[#FDF22F] hover:bg-black text-[#000000] hover:text-[#FDF22F] px-6 sm:px-8 py-3.5 rounded-2xl font-black text-[12px] sm:text-[13px] tracking-widest uppercase shadow-xl shadow-[#FDF22F]/10 transition-all flex items-center justify-center gap-2 group border border-[#FDF22F]">
                        <Check size={16} className="transition-transform group-hover:scale-125" />
                        Approve Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            {/* Content Body */}
            {loading ? (
                <div className="bg-white rounded-[32px] border border-gray-100 p-20 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">

                    {/* ── JOBS TAB ── */}
                    {localTab === 'JOBS' && (
                        <>
                            {/* Desktop table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                        <tr>
                                            {['Position', 'Department', 'Location', 'Status', 'Applicants'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {jobs.length === 0 ? (
                                            <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">No jobs posted yet.</td></tr>
                                        ) : jobs.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-6 font-black text-[13px] text-[#000000]">{job.title}</td>
                                                <td className="px-6 py-6 text-[13px] text-gray-600">{job.department || job.requisition?.department || '—'}</td>
                                                <td className="px-6 py-6 text-[13px] text-gray-600">{job.location || '—'}</td>
                                                <td className="px-6 py-6">
                                                    <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span>
                                                </td>
                                                <td className="px-6 py-6 text-[13px] font-black text-[#000000]">{job.applicants_count ?? 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="sm:hidden divide-y divide-gray-50">
                                {jobs.length === 0 ? (
                                    <p className="px-5 py-16 text-center text-gray-400 italic text-sm">No jobs posted yet.</p>
                                ) : jobs.map((job) => (
                                    <div key={job.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-black text-[14px] text-[#000000] leading-snug">{job.title}</p>
                                            <span className="shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <span className="text-[12px] text-gray-400">{job.department || job.requisition?.department || '—'}</span>
                                            <span className="text-[12px] text-gray-400">{job.location || '—'}</span>
                                            <span className="text-[12px] font-black text-[#000000]">{job.applicants_count ?? 0} applicants</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {jobsMeta?.last_page > 1 && (
                                <div className="px-5 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Page {jobsPage} of {jobsMeta.last_page}</span>
                                    <div className="flex items-center gap-2">
                                        <button disabled={jobsPage === 1} onClick={() => setJobsPage(p => p - 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] hover:text-black transition-all disabled:opacity-30">
                                            <ChevronLeft size={16} />
                                        </button>
                                        {/* Hide page numbers on mobile, show on sm+ */}
                                        <div className="hidden sm:flex items-center gap-2">
                                            {[...Array(jobsMeta.last_page)].map((_, i) => (
                                                <button key={i} onClick={() => setJobsPage(i + 1)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${jobsPage === i + 1 ? 'bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black'}`}>{i + 1}</button>
                                            ))}
                                        </div>
                                        <button disabled={jobsPage === jobsMeta.last_page} onClick={() => setJobsPage(p => p + 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] hover:text-black transition-all disabled:opacity-30">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ── HIRING PLAN TAB ── */}
                    {localTab === 'HIRING PLAN' && (
                        <>
                            {/* Desktop table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                        <tr>
                                            <th className="pl-6 py-4 w-10">
                                                <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])} checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length} className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer" />
                                            </th>
                                            {['REQUISITION', 'GENERAL MANAGER (GM)', 'LOCATION', 'SALARY', 'SUBMITTED ON', 'POSTED TO PORTAL', 'STATUS'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requisitions.length === 0 ? (
                                            <tr><td colSpan={8} className="px-8 py-20 text-center text-gray-400 italic text-sm">No requisitions in the plan.</td></tr>
                                        ) : requisitions.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                <td className="pl-6 py-6" onClick={(e) => e.stopPropagation()}>
                                                    {(req.status === 'pending_md' || req.status === 'pending_hr') && (
                                                        <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))} className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-6" onClick={() => setDrawerReq(req)}>
                                                    <p className="font-black text-[13px] text-[#000000] hover:text-[#FDF22F] transition-colors">REQ{req.id} {req.title}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 tracking-tight font-bold">{req.department}</p>
                                                </td>
                                                <td className="px-6 py-6 text-[13px] text-gray-600">{req.requester?.name || 'General Manager'}</td>
                                                <td className="px-6 py-6 text-[13px] text-gray-600">{req.location || '—'}</td>
                                                <td className="px-6 py-6 text-[13px] text-[#000000] font-black tabular-nums">{req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo</td>
                                                <td className="px-6 py-6">
                                                    {req.created_at ? (() => { const d = new Date(req.created_at); return (<div><p className="text-[12px] font-bold text-[#000000]">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-[11px] text-gray-400 mt-0.5">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p></div>); })() : <span className="text-gray-300">—</span>}
                                                </td>
                                                <td className="px-6 py-6 border-l border-gray-50/50">
                                                    {req.job_posting?.created_at ? (() => { const d = new Date(req.job_posting.published_at || req.job_posting.created_at); const deadline = req.job_posting.deadline ? new Date(req.job_posting.deadline) : null; return (<div className="space-y-1"><div><p className="text-[12px] font-bold text-[#000000]">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-[11px] text-emerald-600 font-bold">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p></div>{deadline && (<div className="pt-1 border-t border-gray-100"><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Deadline</p><p className="text-[10px] font-black text-amber-600">{deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>)}</div>); })() : (<span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">Not Posted</span>)}
                                                </td>
                                                <td className="px-6 py-6">
                                                    {canApprove(req) ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }} className="text-[10px] font-black text-[#000000] bg-[#FDF22F] px-4 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all border border-[#FDF22F]/30 uppercase tracking-widest shadow-lg shadow-[#FDF22F]/10">Approve</button>
                                                            {isMD && (<button onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('amend'); setFeedbackReason(''); setDrawerReq(req); }} className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all border border-amber-100 uppercase tracking-widest">Amend</button>)}
                                                            <button onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('reject'); setFeedbackReason(''); setDrawerReq(req); }} className="text-[10px] font-black text-gray-400 bg-white px-4 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all border border-gray-100 uppercase tracking-widest">Reject</button>
                                                        </div>
                                                    ) : (
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : req.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : req.status === 'amendment_required' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                            {req.status.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile + Tablet cards */}
                            <div className="lg:hidden divide-y divide-gray-50">
                                {/* Select all bar */}
                                {pendingReqs.length > 0 && (
                                    <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-100">
                                        <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])} checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length} className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer" />
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select All Pending</span>
                                    </div>
                                )}
                                {requisitions.length === 0 ? (
                                    <p className="px-5 py-16 text-center text-gray-400 italic text-sm">No requisitions in the plan.</p>
                                ) : requisitions.map((req) => (
                                    <div key={req.id} className="px-4 py-5 hover:bg-gray-50 transition-colors" onClick={() => setDrawerReq(req)}>
                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3">
                                                {(req.status === 'pending_md' || req.status === 'pending_hr') && (
                                                    <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={(e) => { e.stopPropagation(); setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id)); }} onClick={(e) => e.stopPropagation()} className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer mt-0.5 shrink-0" />
                                                )}
                                                <div>
                                                    <p className="font-black text-[13px] text-[#000000] leading-snug">REQ{req.id} {req.title}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{req.department}</p>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'rejected' ? 'bg-red-50 text-red-600' : req.status === 'amendment_required' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {/* Details grid */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">GM</p>
                                                <p className="text-[12px] text-gray-600">{req.requester?.name || 'General Manager'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Salary</p>
                                                <p className="text-[12px] font-black text-[#000000]">{req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                                <p className="text-[12px] text-gray-600">{req.location || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Submitted</p>
                                                <p className="text-[12px] text-gray-600">
                                                    {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {canApprove(req) && (
                                            <div className="flex gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => handleApprove(req.id)} className="flex-1 text-[10px] font-black text-[#000000] bg-[#FDF22F] px-3 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all uppercase tracking-widest">Approve</button>
                                                {isMD && (<button onClick={() => { setFeedbackTarget(req.id); setActionType('amend'); setFeedbackReason(''); setDrawerReq(req); }} className="flex-1 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-100 transition-all uppercase tracking-widest">Amend</button>)}
                                                <button onClick={() => { setFeedbackTarget(req.id); setActionType('reject'); setFeedbackReason(''); setDrawerReq(req); }} className="flex-1 text-[10px] font-black text-gray-400 bg-white px-3 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all border border-gray-100 uppercase tracking-widest">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        REPORTS TAB
                    ══════════════════════════════════════════════════════ */}
                    {localTab === 'REPORTS' && (
                        <div className="bg-[#F5F6FA] min-h-screen flex flex-col lg:flex-row">

                            {/* ── Mobile sidebar toggle ── */}
                            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#FDF22F] rounded-xl flex items-center justify-center font-black text-black text-base shadow-md">D</div>
                                    <p className="text-[13px] font-black text-black">Droga Pharma · Hiring Hub</p>
                                </div>
                                <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-black transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>

                            {/* ── Left Sidebar ── */}
                            <div className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-60 bg-white border-r border-gray-100 flex-col shrink-0`} style={{ minHeight: '800px' }}>
                                {/* Brand */}
                                <div className="hidden lg:block px-5 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#FDF22F] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md">D</div>
                                        <div>
                                            <p className="text-[13px] font-black text-black leading-none">Droga Pharma</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mt-0.5">Hiring Hub</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Main Nav */}
                                <div className="px-3 py-5 flex-1 space-y-1 overflow-y-auto">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">Main</p>
                                    {([
                                        { label: 'Dashboard', icon: BarChart2, active: true, onClick: undefined },
                                        { label: 'Candidates', icon: Users, active: false, onClick: () => router.push('/dashboard?tab=Candidates') },
                                        { label: 'Jobs', icon: Briefcase, active: false, onClick: () => router.push('/dashboard?tab=Jobs') },
                                        { label: 'Hiring Plan', icon: FileText, active: false, onClick: () => router.push('/dashboard?tab=HiringPlan') },
                                        { label: 'Interviews', icon: Activity, active: false, onClick: undefined },
                                        { label: 'Reports', icon: PieChart, active: false, onClick: undefined },
                                    ] as { label: string; icon: any; active: boolean; onClick: (() => void) | undefined }[]).map((item) => (
                                        <button key={item.label} onClick={item.onClick}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${item.active ? 'bg-[#FDF22F] text-black shadow-md shadow-[#FDF22F]/20' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
                                            <item.icon size={15} className={item.active ? 'text-black' : 'text-gray-400 group-hover:text-black'} />
                                            <span className="text-[13px] font-bold">{item.label}</span>
                                            {item.active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />}
                                        </button>
                                    ))}
                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">Analytics</p>
                                        {([
                                            { label: 'Employees', icon: Users },
                                            { label: 'Turnover', icon: TrendingDown },
                                            { label: 'Performance', icon: TrendingUp },
                                        ] as { label: string; icon: any }[]).map((item) => (
                                            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-black transition-all group">
                                                <item.icon size={15} className="group-hover:text-black transition-colors" />
                                                <span className="text-[13px] font-bold">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">System</p>
                                        {[{ label: 'Settings', icon: '⚙️' }, { label: 'Help & Support', icon: '❓' }].map(item => (
                                            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-black transition-all">
                                                <span className="text-sm">{item.icon}</span>
                                                <span className="text-[13px] font-bold">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* User card */}
                                <div className="px-3 py-4 border-t border-gray-100">
                                    <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
                                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shrink-0">{user.name.charAt(0)}</div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[12px] font-black text-black truncate leading-none">{user.name}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">HR Manager</p>
                                        </div>
                                        <button onClick={onLogout} title="Logout" className="text-gray-300 hover:text-black transition-colors font-black text-sm">→</button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Right Content Area ── */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                                {/* ── Top Bar ── */}
                                <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm gap-3">
                                    <div className="relative w-full sm:w-80 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                                        <input type="text" placeholder="Search anything..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#FDF22F]/50 focus:border-[#FDF22F] border border-transparent transition-all" />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Date Filter */}
                                        <select
                                            value={reportFilters.dateRange}
                                            onChange={e => setReportFilters(f => ({ ...f, dateRange: e.target.value }))}
                                            className="hidden sm:block text-[11px] font-black uppercase tracking-widest bg-white border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#FDF22F] cursor-pointer"
                                        >
                                            <option value="7">Last 7 Days</option>
                                            <option value="30">Last 30 Days</option>
                                            <option value="90">Last 90 Days</option>
                                            <option value="365">This Year</option>
                                        </select>
                                        <button className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-xl hover:bg-gray-50 border border-gray-100">
                                            <span className="text-lg">🔔</span>
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                                        </button>
                                        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-100">
                                            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shadow-lg">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-black leading-none">{user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">HR Manager</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile date filter */}
                                <div className="sm:hidden px-4 py-2 bg-white border-b border-gray-100">
                                    <select
                                        value={reportFilters.dateRange}
                                        onChange={e => setReportFilters(f => ({ ...f, dateRange: e.target.value }))}
                                        className="w-full text-[11px] font-black uppercase tracking-widest bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#FDF22F] cursor-pointer"
                                    >
                                        <option value="7">Last 7 Days</option>
                                        <option value="30">Last 30 Days</option>
                                        <option value="90">Last 90 Days</option>
                                        <option value="365">This Year</option>
                                    </select>
                                </div>

                                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto flex-1">

                                    {/* ── Welcome Row ── */}
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                        <div>
                                            <h2 className="text-[24px] sm:text-[32px] font-black text-black tracking-tight leading-none">
                                                Welcome back, <span className="text-black">{user.name.split(' ')[0]}</span>
                                                <span className="inline-block ml-2 w-3 h-3 rounded-full bg-[#FDF22F] shadow-[0_0_12px_rgba(253,242,47,0.8)] animate-pulse align-middle" />
                                            </h2>
                                            <p className="text-gray-400 text-[12px] font-medium mt-2 uppercase tracking-[0.2em]">Talent Acquisition · Real-time Overview</p>
                                        </div>
                                        <div className="flex gap-2 sm:gap-3">
                                            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-[11px] tracking-widest uppercase hover:border-black transition-all shadow-sm">
                                                <Download size={13} /> Export
                                            </button>
                                            <button className="flex items-center gap-2 bg-black text-[#FDF22F] px-4 sm:px-7 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-[11px] tracking-widest uppercase shadow-xl shadow-black/10 hover:bg-[#FDF22F] hover:text-black transition-all border border-black">
                                                <Briefcase size={13} /> Post Job
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* ── KPI Cards ── */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                                        {[
                                            { label: 'Total Employees', value: stats?.employees?.total ?? '—', icon: Users, trend: '+4.2%', trendUp: true, accent: true },
                                            { label: 'Active Applicants', value: appliedCount || '—', icon: FileText, trend: '-1.3%', trendUp: false },
                                            { label: 'Retention Rate', value: '89%', icon: Target, trend: '+2% YoY', trendUp: true },
                                            { label: 'Open Positions', value: activeJobs || '—', icon: Briefcase, trend: 'Live now', trendUp: true },
                                        ].map((card, i) => (
                                            <StatCard key={i} {...card} />
                                        ))}
                                    </div>

                                    {/* ── Charts Row ── */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                                        {/* Employee Turnover Chart */}
                                        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                                                <div>
                                                    <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Employee Turnover</h3>
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Growth Analytics · 12 Month View</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-[#FDF22F]/10 border border-[#FDF22F]/30 px-3 py-1.5 rounded-xl">
                                                        <div className="w-2 h-2 rounded-full bg-[#FDF22F] shadow-[0_0_8px_rgba(253,242,47,1)] animate-pulse" />
                                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Live</span>
                                                    </div>
                                                    <select className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 rounded-xl px-3 py-2 outline-none cursor-pointer">
                                                        <option>Yearly</option>
                                                        <option>Monthly</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {/* Chart */}
                                            <div className="relative h-40 sm:h-52">
                                                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#FDF22F" stopOpacity="0.25" />
                                                            <stop offset="100%" stopColor="#FDF22F" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    {[40, 80, 120, 160, 200].map(y => (
                                                        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F3F4F6" strokeWidth="1" />
                                                    ))}
                                                    <path d="M0,180 C50,175 100,170 150,165 S230,155 280,150 S360,145 400,148 S480,160 530,140 S620,80 680,50 S760,30 800,20" fill="url(#areaGrad)" stroke="none" />
                                                    <path d="M0,180 C50,175 100,170 150,165 S230,155 280,150 S360,145 400,148 S480,160 530,140 S620,80 680,50 S760,30 800,20" fill="none" stroke="#FDF22F" strokeWidth="3" strokeLinecap="round" className="drop-shadow-[0_2px_8px_rgba(253,242,47,0.5)]" />
                                                    <circle cx="680" cy="50" r="6" fill="#FDF22F" className="drop-shadow-[0_0_8px_rgba(253,242,47,1)]" />
                                                    <circle cx="680" cy="50" r="10" fill="#FDF22F" fillOpacity="0.2" />
                                                </svg>
                                            </div>
                                            <div className="flex justify-between mt-3 px-1">
                                                {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map(m => (
                                                    <span key={m} className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-tighter">{m}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Hiring Funnel */}
                                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8">
                                            <div className="mb-6">
                                                <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Hiring Funnel</h3>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Candidate Pipeline · 2026</p>
                                            </div>
                                            <div className="space-y-5">
                                                <FunnelBar label="Applied" value={stats?.funnel?.applied ?? 0} max={funnelMax || 1} color="#FDF22F" />
                                                <FunnelBar label="Screening" value={stats?.funnel?.written_exam ?? 0} max={funnelMax || 1} color="#000000" />
                                                <FunnelBar label="Interviewing" value={stats?.funnel?.technical_interview ?? 0} max={funnelMax || 1} color="#374151" />
                                                <FunnelBar label="Offered" value={stats?.funnel?.offer ?? 0} max={funnelMax || 1} color="#6B7280" />
                                                <FunnelBar label="Hired" value={stats?.funnel?.hired ?? 0} max={funnelMax || 1} color="#10B981" />
                                            </div>
                                            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                                                <div className="bg-[#FDF22F]/10 border border-[#FDF22F]/20 rounded-2xl p-4 text-center">
                                                    <p className="text-2xl font-black text-black">{appliedCount}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Applied</p>
                                                </div>
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                                                    <p className="text-2xl font-black text-emerald-600">{hiredCount}</p>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Hired</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Secondary Stats Row ── */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {/* Dept Breakdown */}
                                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-[15px] sm:text-[16px] font-black text-black">By Department</h3>
                                                <PieChart size={16} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-4">
                                                {(stats?.by_department?.slice(0, 5) || [
                                                    { department: 'IT', count: 12 },
                                                    { department: 'Finance', count: 8 },
                                                    { department: 'HR', count: 5 },
                                                    { department: 'Operations', count: 7 },
                                                    { department: 'Sales', count: 4 },
                                                ]).map((dept: any, i: number) => {
                                                    const total = stats?.by_department?.reduce((a: number, d: any) => a + d.count, 0) || 36;
                                                    const pct = Math.round((dept.count / total) * 100);
                                                    const colors = ['#FDF22F', '#000000', '#374151', '#6B7280', '#D1D5DB'];
                                                    return (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[i] }} />
                                                            <span className="text-[12px] font-bold text-gray-600 flex-1">{dept.department}</span>
                                                            <div className="w-16 sm:w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                                                            </div>
                                                            <span className="text-[12px] font-black text-black w-6 text-right tabular-nums">{dept.count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Time to Hire */}
                                        <div className="bg-black rounded-[32px] shadow-sm p-5 sm:p-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FDF22F]/5 rounded-full -translate-y-10 translate-x-10" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FDF22F]/5 rounded-full translate-y-10 -translate-x-10" />
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-[15px] sm:text-[16px] font-black text-white">Time to Hire</h3>
                                                    <Clock size={16} className="text-[#FDF22F]" />
                                                </div>
                                                <div className="text-center py-4">
                                                    <p className="text-6xl sm:text-7xl font-black text-[#FDF22F] tabular-nums leading-none">{stats?.avg_time_to_hire ?? '—'}</p>
                                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mt-3">Average Days</p>
                                                </div>
                                                <div className="mt-6 grid grid-cols-2 gap-3">
                                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                        <p className="text-2xl font-black text-white tabular-nums">{stats?.funnel?.hired ?? 0}</p>
                                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Hired</p>
                                                    </div>
                                                    <div className="bg-[#FDF22F]/10 rounded-2xl p-4 border border-[#FDF22F]/20">
                                                        <p className="text-2xl font-black text-[#FDF22F] tabular-nums">{activeJobs}</p>
                                                        <p className="text-[9px] font-black text-[#FDF22F]/60 uppercase tracking-widest mt-1">Open Roles</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Feed */}
                                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-[15px] sm:text-[16px] font-black text-black">Live Activity</h3>
                                                <Activity size={16} className="text-gray-300" />
                                            </div>
                                            <div className="space-y-4">
                                                {(recentApplicants.slice(0, 4).length > 0 ? recentApplicants.slice(0, 4) : Array(4).fill(null)).map((app, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-xs shrink-0">
                                                            {app?.name?.charAt(0) ?? 'A'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-black text-black truncate">{app?.name ?? 'New Applicant'}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold truncate">{app?.job?.title ?? 'Applied for position'}</p>
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${statusColor[app?.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                            {app?.status?.replace('_', ' ') ?? 'New'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Recent Applications Table ── */}
                                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-5 sm:px-10 py-5 sm:py-7 border-b border-gray-50">
                                            <div>
                                                <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Recent Applications</h3>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Latest candidate submissions</p>
                                            </div>
                                            <div className="flex gap-2 sm:gap-3">
                                                <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                                                    <Filter size={12} /> Filter
                                                </button>
                                                <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                                                    <Download size={12} /> Export
                                                </button>
                                            </div>
                                        </div>

                                        {/* Desktop table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50/80">
                                                    <tr>
                                                        {['Candidate', 'Position Applied', 'Department', 'Experience', 'Matching', 'Status', 'Applied On'].map(h => (
                                                            <th key={h} className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {(recentApplicants.length > 0 ? recentApplicants : Array(5).fill(null)).map((app, i) => (
                                                        <motion.tr
                                                            key={i}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                                        >
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center font-black text-xs text-[#FDF22F] shadow-md">
                                                                        {app?.name?.charAt(0) ?? 'A'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-black text-black">{app?.name ?? '—'}</p>
                                                                        <p className="text-[10px] text-gray-400 font-bold">{app?.email ?? '—'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <p className="text-[13px] font-black text-gray-700">{app?.job?.title ?? '—'}</p>
                                                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">{app?.job?.requisition_id ? `REQ${app.job.requisition_id}` : '—'}</p>
                                                            </td>
                                                            <td className="px-8 py-5 text-[13px] text-gray-500 font-bold">{app?.job?.department ?? '—'}</td>
                                                            <td className="px-8 py-5 text-[13px] font-black text-black tabular-nums">{app?.years_of_experience != null ? `${app.years_of_experience} Yrs` : '—'}</td>
                                                            <td className="px-8 py-5">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#FDF22F] rounded-full" style={{ width: `${app?.match_score ?? 85}%` }} />
                                                                    </div>
                                                                    <span className="text-[12px] font-black text-black tabular-nums">{app?.match_score ?? 85}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-5">
                                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${statusColor[app?.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                                    {app?.status?.replace('_', ' ') ?? 'New'}
                                                                </span>
                                                            </td>
                                                            <td className="px-8 py-5 text-[12px] font-bold text-gray-400 tabular-nums">
                                                                {app?.created_at ? new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile applicant cards */}
                                        <div className="md:hidden divide-y divide-gray-50">
                                            {(recentApplicants.length > 0 ? recentApplicants : Array(5).fill(null)).map((app, i) => (
                                                <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center font-black text-xs text-[#FDF22F] shadow-md shrink-0">
                                                                {app?.name?.charAt(0) ?? 'A'}
                                                            </div>
                                                            <div>
                                                                <p className="text-[13px] font-black text-black">{app?.name ?? '—'}</p>
                                                                <p className="text-[11px] text-gray-400">{app?.job?.title ?? '—'}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColor[app?.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                            {app?.status?.replace('_', ' ') ?? 'New'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 ml-12">
                                                        <span className="text-[11px] text-gray-400">{app?.job?.department ?? '—'}</span>
                                                        <span className="text-[11px] text-gray-400">{app?.years_of_experience != null ? `${app.years_of_experience} Yrs exp` : '—'}</span>
                                                        <span className="text-[11px] font-black text-black">{app?.match_score ?? 85}% match</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Table Footer */}
                                        <div className="px-5 sm:px-10 py-4 sm:py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Showing {recentApplicants.length} recent</p>
                                            <button onClick={() => router.push('/dashboard?tab=Candidates')} className="text-[11px] font-black text-black uppercase tracking-widest flex items-center gap-1.5 bg-[#FDF22F] px-4 sm:px-5 py-2.5 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all">
                                                View All <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                    {/* ══ END REPORTS ══ */}

                </div>
            )}

            {/* ── Side Drawer ── */}
            <AnimatePresence>
                {drawerReq && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-2xl z-[120] overflow-y-auto">
                            <div className="p-5 sm:p-8 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-[#000000] tracking-widest uppercase mb-1">REQ{drawerReq.id}</p>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#000000]">{drawerReq.title}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{drawerReq.department}</p>
                                </div>
                                <button onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-5 sm:p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Location / Branch</p><p className="text-sm font-bold text-[#000000]">{drawerReq.location}</p></div>
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Salary Range</p><p className="text-sm font-black text-[#000000]">{drawerReq.budget ? drawerReq.budget.toLocaleString() : '15,000'} ETB /mo</p></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description</h3>
                                        {drawerReq.jd_path && !drawerReq.jd_content && (
                                            <a href={`${API_URL}/v1/requisitions/${drawerReq.id}/jd?token=${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-[#000000] hover:underline uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg transition-all">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                View Legacy JD Doc
                                            </a>
                                        )}
                                    </div>
                                    <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100 border-dashed max-h-[300px] overflow-y-auto">
                                        {drawerReq.jd_content ? <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: drawerReq.jd_content }} /> : <p className="text-sm text-gray-400 italic">No text-based JD content provided.</p>}
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Justification / Description</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100 italic">{drawerReq.description || 'No detailed description provided.'}</p>
                                    </div>
                                </div>
                                {canApprove(drawerReq) && (
                                    <div className="pt-8 space-y-4 border-t border-gray-100">
                                        {feedbackTarget === drawerReq.id ? (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">{actionType === 'amend' ? 'Amendment Feedback for GM' : 'Rejection Reason'}</p>
                                                <textarea value={feedbackReason} onChange={(e) => setFeedbackReason(e.target.value)} placeholder={actionType === 'amend' ? "e.g. 'The salary range is too high for this quarter'" : "Provide professional feedback..."} className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none text-sm h-32 font-medium transition-all ${actionType === 'amend' ? 'border-amber-100 focus:ring-4 focus:ring-amber-50 focus:border-amber-500' : 'border-red-100 focus:ring-4 focus:ring-red-50 focus:border-red-500'}`} />
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setFeedbackTarget(null); setActionType(null); }} className="flex-1 px-4 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-gray-200 transition-all">Cancel</button>
                                                    <button onClick={handleAction} disabled={!feedbackReason.trim() || actionLoading} className={`flex-[2] px-4 py-4 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${actionType === 'amend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-red-600'}`}>Confirm & Notify GM</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => handleApprove(drawerReq.id)} disabled={actionLoading} className="flex-[2] px-6 py-5 bg-[#FDF22F] text-black rounded-[20px] text-[12px] font-black tracking-widest uppercase shadow-2xl shadow-[#FDF22F]/20 hover:bg-black hover:text-[#FDF22F] transition-all flex items-center justify-center gap-3 group">
                                                    Approve Requisition <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                {isMD && (<button onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('amend'); }} className="flex-1 px-6 py-5 bg-amber-50 text-amber-600 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-amber-100 hover:border-amber-500 transition-all">Amend</button>)}
                                                <button onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('reject'); }} className="flex-1 px-6 py-5 bg-white text-gray-400 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-gray-100 hover:border-red-500 hover:text-red-500 transition-all">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} />}
            </AnimatePresence>
        </div>
    );
}
