'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import { Check, ChevronLeft, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-[13px] font-black uppercase tracking-widest text-[#FDF22F] flex items-center gap-3 border border-[#FDF22F]/20 bg-black animate-in slide-in-from-bottom-5 duration-300`}
        >
            <CheckCircle2 size={18} className="text-[#FDF22F]" />
            <span>{msg}</span>
        </motion.div>
    );
}

interface Requisition {
    id: number;
    title: string;
    department: string;
    headcount: number;
    budget: number | null;
    position_type: 'new' | 'replacement';
    priority: string;
    location: string;
    status: string;
    description: string | null;
    jd_path: string | null;
    jd_content?: string;
    created_at: string;
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
    const [localTab, setLocalTab] = useState(initialTab === 'HiringPlan' ? 'HIRING PLAN' : 'JOBS');
    const [stats, setStats] = useState<any>(null);
    const [reportFilters, setReportFilters] = useState({ dateRange: '30', department: 'All', jobId: 'All' });
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        try {
            const [reqsJson, jobsJson] = await Promise.all([
                apiFetch(`/v1/requisitions?page=${reqsPage}`),
                apiFetch(`/v1/jobs?page=${jobsPage}`)
            ]);
            setRequisitions(reqsJson.data || []);
            setReqsMeta(reqsJson);
            setJobs(jobsJson.data || []);
            setJobsMeta(jobsJson);

            if (localTab === 'REPORTS') {
                const params = new URLSearchParams({
                    date_range: reportFilters.dateRange,
                    department: reportFilters.department,
                    job_id: reportFilters.jobId
                });
                const statsData = await apiFetch(`/v1/applicants/stats?${params.toString()}`);
                setStats(statsData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [localTab, reportFilters, reqsPage, jobsPage]);

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
            await apiFetch(`/v1/requisitions/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
            });
            setDrawerReq(null);
            showToast('Requisition Approved Successfully');
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAction = async () => {
        if (!feedbackTarget || !feedbackReason.trim() || !actionType) return;
        setActionLoading(true);
        try {
            if (actionType === 'amend') {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/amend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment: feedbackReason }),
                });
                showToast('Sent back for amendment');
            } else {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'rejected', rejection_reason: feedbackReason }),
                });
                showToast('Requisition Rejected');
            }
            setFeedbackTarget(null);
            setFeedbackReason('');
            setActionType(null);
            setDrawerReq(null);
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };



    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        setActionLoading(true);
        try {
            await apiFetch('/v1/requisitions/bulk-approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            setSelectedIds([]);
            showToast(`${selectedIds.length} Requisitions Approved`);
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setActionLoading(false);
        }
    };

    const pendingReqs = requisitions.filter(r => r.status === 'pending_md' || r.status === 'pending_hr');

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex justify-between items-end mb-4">
                <div className="space-y-4">
                    {/* Sub Tabs */}
                    <div className="flex gap-8 border-b border-gray-100">
                        {['JOBS', 'HIRING PLAN', 'REPORTS'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setLocalTab(t)}
                                className={`pb-3 text-[13px] font-black tracking-widest transition-all relative ${localTab === t ? 'text-[#000000]' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t}
                                {localTab === t && (
                                    <motion.div
                                        layoutId="activeSubTabHR"
                                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#000000]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {localTab === 'HIRING PLAN' && selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkApprove}
                        disabled={actionLoading}
                        className="bg-[#FDF22F] hover:bg-black text-[#000000] hover:text-[#FDF22F] px-8 py-3.5 rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-xl shadow-[#FDF22F]/10 transition-all flex items-center gap-2 group border border-[#FDF22F]"
                    >
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
                    {localTab === 'JOBS' && (
                        <div className="overflow-x-auto">
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
                                                <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-[13px] font-black text-[#000000]">
                                                {job.applicants_count ?? 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {jobsMeta?.last_page > 1 && (
                                <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        Showing Page {jobsPage} of {jobsMeta.last_page}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={jobsPage === 1}
                                            onClick={() => setJobsPage(p => p - 1)}
                                            className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] hover:text-black transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        {[...Array(jobsMeta.last_page)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setJobsPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${jobsPage === i + 1 ? 'bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            disabled={jobsPage === jobsMeta.last_page}
                                            onClick={() => setJobsPage(p => p + 1)}
                                            className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] hover:text-black transition-all disabled:opacity-30 disabled:hover:border-gray-200"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {localTab === 'HIRING PLAN' && (
                        <table className="w-full text-left">
                            <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                <tr>
                                    <th className="pl-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])}
                                            checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length}
                                            className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer"
                                        />
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
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(req.id)}
                                                    onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))}
                                                    className="accent-[#FDF22F] rounded-lg w-4 h-4 cursor-pointer"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-6" onClick={() => setDrawerReq(req)}>
                                            <p className="font-black text-[13px] text-[#000000] hover:text-[#FDF22F] transition-colors">
                                                REQ{req.id} {req.title}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5 tracking-tight font-bold">
                                                {req.department}
                                            </p>
                                        </td>
                                        <td className="px-6 py-6 text-[13px] text-gray-600">
                                            {req.requester?.name || 'General Manager'}
                                        </td>
                                        <td className="px-6 py-6 text-[13px] text-gray-600">
                                            {req.location || '—'}
                                        </td>
                                        <td className="px-6 py-6 text-[13px] text-[#000000] font-black tabular-nums">
                                            {req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo
                                        </td>
                                        <td className="px-6 py-6">
                                            {req.created_at ? (() => {
                                                const d = new Date(req.created_at);
                                                return (
                                                    <div>
                                                        <p className="text-[12px] font-bold text-[#000000]">
                                                            {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                                            {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                );
                                            })() : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-6 py-6 border-l border-gray-50/50">
                                            {req.job_posting?.created_at ? (() => {
                                                const d = new Date(req.job_posting.published_at || req.job_posting.created_at);
                                                const deadline = req.job_posting.deadline ? new Date(req.job_posting.deadline) : null;
                                                return (
                                                    <div className="space-y-1">
                                                        <div>
                                                            <p className="text-[12px] font-bold text-[#000000]">
                                                                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                            <p className="text-[11px] text-emerald-600 font-bold">
                                                                {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        {deadline && (
                                                            <div className="pt-1 border-t border-gray-100">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Deadline</p>
                                                                <p className="text-[10px] font-black text-amber-600">
                                                                    {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })() : (
                                                <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                                                    Not Posted
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            {canApprove(req) ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }}
                                                        className="text-[10px] font-black text-[#000000] bg-[#FDF22F] px-4 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all border border-[#FDF22F]/30 uppercase tracking-widest shadow-lg shadow-[#FDF22F]/10"
                                                    >
                                                        Approve
                                                    </button>
                                                    {isMD && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('amend'); setFeedbackReason(''); setDrawerReq(req); }}
                                                            className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all border border-amber-100 uppercase tracking-widest"
                                                        >
                                                            Amend
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('reject'); setFeedbackReason(''); setDrawerReq(req); }}
                                                        className="text-[10px] font-black text-gray-400 bg-white px-4 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all border border-gray-100 uppercase tracking-widest"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    req.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                        req.status === 'amendment_required' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {localTab === 'REPORTS' && (
                        <div className="p-10 space-y-10">
                            {/* Filter Bar */}
                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">📅</div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Timeframe</p>
                                            <select
                                                value={reportFilters.dateRange}
                                                onChange={e => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                                className="text-sm font-bold text-[#000000] bg-transparent outline-none cursor-pointer"
                                            >
                                                <option value="7">Last 7 Days</option>
                                                <option value="30">Last 30 Days</option>
                                                <option value="90">Last 90 Days</option>
                                                <option value="All">All Time</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">🏢</div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Department</p>
                                            <select
                                                value={reportFilters.department}
                                                onChange={e => setReportFilters(prev => ({ ...prev, department: e.target.value }))}
                                                className="text-sm font-bold text-[#000000] bg-transparent outline-none cursor-pointer"
                                            >
                                                <option value="All">All Departments</option>
                                                {[...new Set(jobs.map(j => j.department || j.requisition?.department).filter(Boolean))].map(dept => (
                                                    <option key={String(dept)} value={String(dept)}>{String(dept)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-gray-100" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">💼</div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Specific Role</p>
                                            <select
                                                value={reportFilters.jobId}
                                                onChange={e => setReportFilters(prev => ({ ...prev, jobId: e.target.value }))}
                                                className="text-sm font-bold text-[#000000] bg-transparent outline-none cursor-pointer w-48 truncate"
                                            >
                                                <option value="All">All Open Roles</option>
                                                {jobs.map(job => (
                                                    <option key={job.id} value={job.id}>{job.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={() => fetchData()} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
                                        ↻ Refresh
                                    </button>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                date_range: reportFilters.dateRange,
                                                department: reportFilters.department,
                                                job_id: reportFilters.jobId
                                            });
                                            const token = localStorage.getItem('auth_token');
                                            const exportUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/applicants/export?${params.toString()}&token=${token}`;
                                            window.open(exportUrl, '_blank');
                                        }}
                                        className="px-6 py-3 bg-[#FDF22F] text-[#000000] hover:bg-black hover:text-[#FDF22F] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-[#FDF22F]/10 flex items-center gap-2"
                                    >
                                        <FileText size={14} /> Export CSV
                                    </button>
                                </div>
                            </div>

                            {/* Stat Grid */}
                            <div className="grid grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Placements', value: stats?.funnel?.hired || 0, icon: '🏆', color: 'emerald' },
                                    { label: 'Active Pipeline', value: (stats?.funnel?.applied || 0) - (stats?.funnel?.hired || 0) - (stats?.funnel?.rejected || 0), icon: '🔥', color: 'blue' },
                                    { label: 'Pending Reqs', value: stats?.requisitions?.pending || 0, icon: '⏳', color: 'amber' },
                                    { label: 'Success Rate', value: stats?.funnel?.applied > 0 ? Math.round((stats.funnel.hired / stats.funnel.applied) * 100) + '%' : '0%', icon: '📈', color: 'indigo' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 hover:scale-[1.02] transition-transform group">
                                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-xl mb-4 group-hover:rotate-12 transition-transform`}>{stat.icon}</div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-[#000000]">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Side Drawer Integration */}
            <AnimatePresence>
                {drawerReq && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[120] overflow-y-auto"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-[#000000] tracking-widest uppercase mb-1">REQ{drawerReq.id}</p>
                                    <h2 className="text-2xl font-black text-[#000000]">{drawerReq.title}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{drawerReq.department}</p>
                                </div>
                                <button onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Location / Branch</p>
                                        <p className="text-sm font-bold text-[#000000]">{drawerReq.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Salary Range</p>
                                        <p className="text-sm font-black text-[#000000]">{drawerReq.budget ? drawerReq.budget.toLocaleString() : '15,000'} ETB /mo</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description (JD) Content</h3>
                                        {drawerReq.jd_path && !drawerReq.jd_content && (
                                            <a
                                                href={`${API_URL}/v1/requisitions/${drawerReq.id}/jd?token=${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[10px] font-black text-[#000000] hover:underline uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                View Legacy JD Doc
                                            </a>
                                        )}
                                    </div>
                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 border-dashed max-h-[300px] overflow-y-auto">
                                        {drawerReq.jd_content ? (
                                            <div
                                                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: drawerReq.jd_content }}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No text-based JD content provided.</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Justification / Description</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100 italic">
                                            {drawerReq.description || 'No detailed description provided.'}
                                        </p>
                                    </div>
                                </div>

                                {canApprove(drawerReq) && (
                                    <div className="pt-8 space-y-4 border-t border-gray-100">
                                        {feedbackTarget === drawerReq.id ? (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">
                                                    {actionType === 'amend' ? 'Mandatory Amendment Feedback for GM' : 'Rejection Reason'}
                                                </p>
                                                <textarea
                                                    value={feedbackReason}
                                                    onChange={(e) => setFeedbackReason(e.target.value)}
                                                    placeholder={actionType === 'amend' ? "e.g. 'The salary range is too high for this quarter' - this will unlock the req for the General Manager to edit." : "Provide professional feedback for the manager..."}
                                                    className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none text-sm h-32 font-medium transition-all ${actionType === 'amend' ? 'border-amber-100 focus:ring-4 focus:ring-amber-50 focus:border-amber-500' : 'border-red-100 focus:ring-4 focus:ring-red-50 focus:border-red-500'
                                                        }`}
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setFeedbackTarget(null); setActionType(null); }} className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-gray-200 transition-all">Cancel</button>
                                                    <button
                                                        onClick={handleAction}
                                                        disabled={!feedbackReason.trim() || actionLoading}
                                                        className={`flex-[2] px-6 py-4 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${actionType === 'amend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-red-600'
                                                            }`}
                                                    >
                                                        Confirm & Notify GM
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(drawerReq.id)}
                                                    disabled={actionLoading}
                                                    className="flex-[2] px-6 py-5 bg-[#FDF22F] text-black rounded-[20px] text-[12px] font-black tracking-widest uppercase shadow-2xl shadow-[#FDF22F]/20 hover:bg-black hover:text-[#FDF22F] transition-all flex items-center justify-center gap-3 group"
                                                >
                                                    Approve Requisition
                                                    <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                {isMD && (
                                                    <button
                                                        onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('amend'); }}
                                                        className="flex-1 px-6 py-5 bg-amber-50 text-amber-600 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-amber-100 hover:border-amber-500 transition-all"
                                                    >
                                                        Amend
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('reject'); }}
                                                    className="flex-1 px-6 py-5 bg-white text-gray-400 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-gray-100 hover:border-red-500 hover:text-red-500 transition-all"
                                                >
                                                    Reject
                                                </button>
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
