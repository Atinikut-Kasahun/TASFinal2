'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import { Check, ChevronLeft, ChevronRight, FileText, CheckCircle2, Home, Briefcase, ClipboardList, BarChart2, Key, Calendar } from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-[13px] font-black uppercase tracking-widest text-[#FDF22F] flex items-center gap-3 border border-[#FDF22F]/20 bg-black animate-in slide-in-from-bottom-5 duration-300"
        >
            <CheckCircle2 size={18} className="text-[#FDF22F] shrink-0" />
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

export default function MDDashboard({ user, activeTab: initialTab, onLogout }: { user: any; activeTab: string; onLogout: () => void }) {
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
    const mapTab = (tab: string) => {
        if (tab === 'HiringPlan') return 'HIRING PLAN';
        if (tab === 'Jobs') return 'JOBS';
        if (tab === 'Reports') return 'REPORTS';
        if (tab === 'Home') return 'HOME';
        return 'HIRING PLAN';
    };
    const [localTab, setLocalTab] = useState(() => mapTab(initialTab));
    const [stats, setStats] = useState<any>(null);
    const [reportFilters, setReportFilters] = useState({ dateRange: '30', department: 'All', jobId: 'All' });
    const [interviews, setInterviews] = useState<any[]>([]);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Password reset modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Calendar modal state
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

    // Mobile: profile card toggle
    const [profileOpen, setProfileOpen] = useState(false);

    // Sync localTab whenever the URL tab param changes (Navbar clicks)
    useEffect(() => {
        setLocalTab(mapTab(initialTab));
    }, [initialTab]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        try {
            const [reqsJson, jobsJson, interviewsData] = await Promise.all([
                apiFetch(`/v1/requisitions?page=${reqsPage}`),
                apiFetch(`/v1/jobs?page=${jobsPage}`),
                apiFetch('/v1/interviews')
            ]);
            setRequisitions(reqsJson.data || []);
            setReqsMeta(reqsJson);
            setJobs(jobsJson.data || []);
            setJobsMeta(jobsJson);
            setInterviews(interviewsData || []);

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

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
        if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return; }
        setPasswordLoading(true);
        try {
            await apiFetch('/v1/account/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, new_password_confirmation: confirmPassword }),
            });
            showToast('Password changed successfully');
            setIsPasswordModalOpen(false);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password. Please check your current password.');
        } finally {
            setPasswordLoading(false);
        }
    };

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
            setDrawerReq(null);
            showToast('Requisition Approved Successfully');
            fetchData();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleAction = async () => {
        if (!feedbackTarget || !feedbackReason.trim() || !actionType) return;
        setActionLoading(true);
        try {
            if (actionType === 'amend') {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/amend`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment: feedbackReason }) });
                showToast('Sent back for amendment');
            } else {
                await apiFetch(`/v1/requisitions/${feedbackTarget}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', rejection_reason: feedbackReason }) });
                showToast('Requisition Rejected');
            }
            setFeedbackTarget(null); setFeedbackReason(''); setActionType(null); setDrawerReq(null);
            fetchData();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        setActionLoading(true);
        try {
            await apiFetch('/v1/requisitions/bulk-approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) });
            setSelectedIds([]);
            showToast(`${selectedIds.length} Requisitions Approved`);
            fetchData();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const pendingReqs = requisitions.filter(r => r.status === 'pending_md' || r.status === 'pending_hr');

    /* ─── helpers ─── */
    const reqStatusClass = (s: string) =>
        s === 'approved' ? 'bg-emerald-50 text-emerald-600' :
        s === 'rejected' ? 'bg-red-50 text-red-600' :
        s === 'amendment_required' ? 'bg-amber-50 text-amber-600' :
        (s === 'pending_md' || s === 'pending_hr') ? 'bg-yellow-50 text-amber-700' :
        'bg-gray-100 text-gray-500';

    const reqStatusLabel = (s: string) =>
        (s === 'pending_md' || s === 'pending_hr') ? 'Pending' : s.replace('_', ' ');

    return (
        <div className="relative bg-[#F5F6FA] pb-20 -mx-4 sm:-mx-8 min-h-screen">
            {/* Full-Width Yellow Banner */}
            <div className="absolute top-0 left-0 right-0 h-[180px] sm:h-[220px] bg-[#FDF22F] z-0 shadow-[0_2px_4px_rgba(0,0,0,0.1),_0_20px_40px_-4px_rgba(0,0,0,0.15)]" />

            <div className="relative z-10 px-4 sm:px-8 pt-6 sm:pt-10">

                {/* ── Page Title Row ── */}
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                        {localTab === 'HOME'        && <Home         size={28} strokeWidth={2.5} className="text-black" />}
                        {localTab === 'JOBS'        && <Briefcase    size={28} strokeWidth={2.5} className="text-black" />}
                        {localTab === 'HIRING PLAN' && <ClipboardList size={28} strokeWidth={2.5} className="text-black" />}
                        {localTab === 'REPORTS'     && <BarChart2    size={28} strokeWidth={2.5} className="text-black" />}
                        <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter text-black">
                            {localTab === 'HOME' ? 'Home' : localTab === 'JOBS' ? 'Jobs' : localTab === 'HIRING PLAN' ? 'Hiring Plan' : 'Reports'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Bulk approve — compact label on mobile */}
                        {localTab === 'HIRING PLAN' && selectedIds.length > 0 && (
                            <button
                                onClick={handleBulkApprove}
                                disabled={actionLoading}
                                className="bg-black text-[#FDF22F] px-4 sm:px-8 py-3 sm:py-3.5 rounded-xl font-black text-[12px] sm:text-[13px] tracking-widest uppercase flex items-center gap-2"
                            >
                                <Check size={15} />
                                <span className="hidden sm:inline">Approve ({selectedIds.length})</span>
                                <span className="sm:hidden">✓ {selectedIds.length}</span>
                            </button>
                        )}

                        {/* Mobile: avatar toggles profile accordion */}
                        <button
                            onClick={() => setProfileOpen(v => !v)}
                            className="lg:hidden w-10 h-10 bg-black rounded-full flex items-center justify-center text-[#FDF22F] font-black text-base shadow-lg shrink-0"
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Profile Accordion ── */}
                <AnimatePresence>
                    {profileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden overflow-hidden mb-4"
                        >
                            <div className="bg-white border border-gray-100 shadow-sm">
                                <div className="bg-[#FDF22F] px-5 py-4 flex items-center gap-4">
                                    <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center text-[#FDF22F] text-lg font-black shrink-0">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                                    </div>
                                    <h2 className="text-xl font-black text-black leading-tight">{user?.name || 'Managing Director'}</h2>
                                </div>
                                <div className="px-5 py-4 space-y-3">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                        <p className="text-sm font-semibold text-black break-all">{user?.email || 'md@example.com'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Role / Organization</p>
                                        <p className="text-sm font-semibold text-black">Managing Director (MD) · {user?.tenant?.name || 'Droga Group'}</p>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => { setIsPasswordModalOpen(true); setProfileOpen(false); }}
                                            title="Change Password"
                                            className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-black hover:text-[#FDF22F] transition-colors shrink-0"
                                        >
                                            <Key size={17} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => { setIsCalendarModalOpen(true); setProfileOpen(false); }}
                                            title="Hiring Calendar"
                                            className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-black hover:text-[#FDF22F] transition-colors shrink-0"
                                        >
                                            <Calendar size={17} />
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="flex-1 h-11 flex items-center justify-center gap-2 bg-red-50 text-red-500 font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Two-Column Layout ── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── Left: Profile Card (desktop only) ── */}
                    <div className="hidden lg:block w-[300px] shrink-0 bg-white overflow-hidden shadow-sm border border-gray-100">
                        <div className="bg-[#FDF22F] px-6 pt-6 pb-8 flex items-center gap-4">
                            <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-[#FDF22F] text-xl font-black shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                            <h2 className="text-2xl font-black text-black leading-tight">{user?.name || 'Managing Director'}</h2>
                        </div>
                        <div className="px-6 py-6 space-y-5">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                <p className="text-sm font-semibold text-black">{user?.email || 'md@example.com'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Role / Department</p>
                                <p className="text-sm font-semibold text-black">Managing Director (MD) • Management</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Organization</p>
                                <p className="text-sm font-semibold text-black">{user?.tenant?.name || 'Droga Group'}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsPasswordModalOpen(true)} title="Change Password" className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-black hover:text-[#FDF22F] transition-colors">
                                    <Key size={18} strokeWidth={2.5} />
                                </button>
                                <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center gap-2 bg-red-50 text-red-500 font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Logout
                                </button>
                                <button onClick={() => setIsCalendarModalOpen(true)} title="Hiring & Availability Calendar" className="h-12 w-12 flex items-center justify-center bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-black hover:text-[#FDF22F] transition-colors border border-gray-100 shrink-0">
                                    <Calendar size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Content Card ── */}
                    <div className="flex-1 w-full bg-white overflow-hidden shadow-sm border border-gray-100">
                        {/* Yellow label bar */}
                        <div className="bg-[#FDF22F] px-4 sm:px-6 py-3 flex items-center justify-between">
                            <span className="text-[11px] font-black text-black uppercase tracking-widest">
                                {localTab === 'HOME' ? 'System Snapshot' : localTab === 'JOBS' ? 'Job Board' : localTab === 'HIRING PLAN' ? 'Requisition Management' : 'System Reports'}
                            </span>
                            <button className="text-[11px] font-black text-black uppercase tracking-widest hover:underline">Filters</button>
                        </div>

                        {loading ? (
                            <div className="p-20 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* ── HOME ── */}
                                {localTab === 'HOME' && (
                                    <div className="p-6 sm:p-10 space-y-4">
                                        <h2 className="text-xl sm:text-2xl font-black">Welcome, {user?.name || 'Managing Director'}</h2>
                                        <p className="text-gray-500">Select a tab from the top navigation to begin.</p>
                                    </div>
                                )}

                                {/* ── JOBS TAB ── */}
                                {localTab === 'JOBS' && (
                                    <>
                                        {/* Desktop table */}
                                        <div className="hidden sm:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="border-b border-gray-100">
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
                                                            <td className="px-6 py-5 font-black text-[13px] text-black">{job.title}</td>
                                                            <td className="px-6 py-5 text-[13px] text-gray-600">{job.department || job.requisition?.department || '—'}</td>
                                                            <td className="px-6 py-5 text-[13px] text-gray-600">{job.location || '—'}</td>
                                                            <td className="px-6 py-5">
                                                                <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-[13px] font-black text-black">{job.applicants_count ?? 0}</td>
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
                                                <div key={job.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <p className="font-black text-[14px] text-black leading-snug">{job.title}</p>
                                                        <span className="shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                                        <span className="text-[12px] text-gray-400">{job.department || job.requisition?.department || '—'}</span>
                                                        <span className="text-[12px] text-gray-400">{job.location || '—'}</span>
                                                        <span className="text-[12px] font-black text-black">{job.applicants_count ?? 0} applicants</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {jobsMeta?.last_page > 1 && (
                                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Page {jobsPage} of {jobsMeta.last_page}</span>
                                                <div className="flex gap-2">
                                                    <button disabled={jobsPage === 1} onClick={() => setJobsPage(p => p - 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                                                    <div className="hidden sm:flex gap-2">
                                                        {[...Array(jobsMeta.last_page)].map((_, i) => (
                                                            <button key={i} onClick={() => setJobsPage(i + 1)} className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${jobsPage === i + 1 ? 'bg-[#FDF22F] text-black' : 'bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black'}`}>{i + 1}</button>
                                                        ))}
                                                    </div>
                                                    <button disabled={jobsPage === jobsMeta.last_page} onClick={() => setJobsPage(p => p + 1)} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ── HIRING PLAN TAB ── */}
                                {localTab === 'HIRING PLAN' && (
                                    <div className="flex flex-col w-full">
                                        {/* KPI row */}
                                        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-white">
                                            <div className="px-4 sm:px-6 py-4">
                                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Requisitions</p>
                                                <p className="text-xl sm:text-2xl font-black text-black tracking-tighter">{reqsMeta?.total || requisitions.length}</p>
                                            </div>
                                            <div className="px-4 sm:px-6 py-4">
                                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pending Approval</p>
                                                <p className="text-xl sm:text-2xl font-black text-amber-500 tracking-tighter">{pendingReqs.length}</p>
                                            </div>
                                            <div className="px-4 sm:px-6 py-4">
                                                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Approved</p>
                                                <p className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tighter">{requisitions.filter(r => r.status === 'approved').length}</p>
                                            </div>
                                        </div>

                                        {/* Desktop table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="border-b border-gray-100">
                                                    <tr>
                                                        <th className="pl-6 py-4 w-10">
                                                            <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])} checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length} className="w-4 h-4 cursor-pointer accent-black" />
                                                        </th>
                                                        {['Requisition', 'Requester', 'Location', 'Salary', 'Submitted', 'Status'].map(h => (
                                                            <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {requisitions.length === 0 ? (
                                                        <tr><td colSpan={7} className="px-8 py-20 text-center text-gray-400 italic text-sm">No requisitions in the plan.</td></tr>
                                                    ) : requisitions.map((req) => (
                                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                                            <td className="pl-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                                {(req.status === 'pending_md' || req.status === 'pending_hr') && (
                                                                    <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id))} className="w-4 h-4 cursor-pointer accent-black" />
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-5" onClick={() => setDrawerReq(req)}>
                                                                <p className="font-black text-[13px] text-black hover:underline">REQ{req.id} {req.title}</p>
                                                                <p className="text-[11px] text-gray-400 mt-0.5 font-bold uppercase">{req.department}</p>
                                                            </td>
                                                            <td className="px-6 py-5 text-[13px] text-gray-600 font-semibold">{req.requester?.name || 'Tesfish'}</td>
                                                            <td className="px-6 py-5 text-[13px] text-gray-600">{req.location || '—'}</td>
                                                            <td className="px-6 py-5 text-[13px] text-black font-black tabular-nums">{req.budget ? req.budget.toLocaleString() : '1,200'} ETB</td>
                                                            <td className="px-6 py-5 text-[12px] text-gray-500">{req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                                            <td className="px-6 py-5">
                                                                {canApprove(req) ? (
                                                                    <div className="flex gap-2">
                                                                        <button onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }} className="text-[10px] font-black text-black bg-[#FDF22F] px-4 py-1.5 rounded-lg hover:bg-black hover:text-[#FDF22F] transition-all uppercase tracking-widest">Approve</button>
                                                                        {isMD && <button onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('amend'); setFeedbackReason(''); setDrawerReq(req); }} className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-1.5 rounded-lg hover:bg-amber-100 transition-all uppercase tracking-widest">Amend</button>}
                                                                        <button onClick={(e) => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('reject'); setFeedbackReason(''); setDrawerReq(req); }} className="text-[10px] font-black text-gray-400 bg-white px-4 py-1.5 rounded-lg hover:bg-black hover:text-[#FDF22F] transition-all border border-gray-100 uppercase tracking-widest">Reject</button>
                                                                    </div>
                                                                ) : (
                                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${reqStatusClass(req.status)}`}>
                                                                        {reqStatusLabel(req.status)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile cards */}
                                        <div className="md:hidden divide-y divide-gray-50">
                                            {pendingReqs.length > 0 && (
                                                <div className="px-4 py-3 bg-gray-50 flex items-center gap-3 border-b border-gray-100">
                                                    <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])} checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length} className="w-4 h-4 cursor-pointer accent-black" />
                                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Select All Pending</span>
                                                </div>
                                            )}
                                            {requisitions.length === 0 ? (
                                                <p className="px-5 py-16 text-center text-gray-400 italic text-sm">No requisitions in the plan.</p>
                                            ) : requisitions.map((req) => (
                                                <div key={req.id} className="px-4 py-5 hover:bg-gray-50 transition-colors" onClick={() => setDrawerReq(req)}>
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-start gap-3">
                                                            {(req.status === 'pending_md' || req.status === 'pending_hr') && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(req.id)}
                                                                    onChange={(e) => { e.stopPropagation(); setSelectedIds(prev => e.target.checked ? [...prev, req.id] : prev.filter(id => id !== req.id)); }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="w-4 h-4 cursor-pointer accent-black mt-0.5 shrink-0"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-black text-[13px] text-black leading-snug">REQ{req.id} {req.title}</p>
                                                                <p className="text-[11px] text-gray-400 mt-0.5 uppercase font-bold">{req.department}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${reqStatusClass(req.status)}`}>
                                                            {reqStatusLabel(req.status)}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Requester</p>
                                                            <p className="text-[12px] text-gray-600">{req.requester?.name || 'Tesfish'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Salary</p>
                                                            <p className="text-[12px] font-black text-black">{req.budget ? req.budget.toLocaleString() : '1,200'} ETB</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                                            <p className="text-[12px] text-gray-600">{req.location || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Submitted</p>
                                                            <p className="text-[12px] text-gray-600">{req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Actions always visible on mobile */}
                                                    {canApprove(req) && (
                                                        <div className="flex gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                                                            <button onClick={() => handleApprove(req.id)} className="flex-1 text-[10px] font-black text-black bg-[#FDF22F] px-3 py-2 rounded-lg hover:bg-black hover:text-[#FDF22F] transition-all uppercase tracking-widest">Approve</button>
                                                            {isMD && <button onClick={() => { setFeedbackTarget(req.id); setActionType('amend'); setFeedbackReason(''); setDrawerReq(req); }} className="flex-1 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-all uppercase tracking-widest">Amend</button>}
                                                            <button onClick={() => { setFeedbackTarget(req.id); setActionType('reject'); setFeedbackReason(''); setDrawerReq(req); }} className="flex-1 text-[10px] font-black text-gray-400 bg-white px-3 py-2 rounded-lg hover:bg-black hover:text-[#FDF22F] transition-all border border-gray-100 uppercase tracking-widest">Reject</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── REPORTS TAB ── */}
                                {localTab === 'REPORTS' && (
                                    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                                        {/* Filter Bar */}
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Timeframe</p>
                                                        <select value={reportFilters.dateRange} onChange={e => setReportFilters(prev => ({ ...prev, dateRange: e.target.value }))} className="text-sm font-bold text-black bg-transparent outline-none cursor-pointer">
                                                            <option value="7">Last 7 Days</option>
                                                            <option value="30">Last 30 Days</option>
                                                            <option value="90">Last 90 Days</option>
                                                            <option value="All">All Time</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Department</p>
                                                        <select value={reportFilters.department} onChange={e => setReportFilters(prev => ({ ...prev, department: e.target.value }))} className="text-sm font-bold text-black bg-transparent outline-none cursor-pointer">
                                                            <option value="All">All Departments</option>
                                                            {[...new Set(jobs.map(j => j.department || j.requisition?.department).filter(Boolean))].map(dept => (
                                                                <option key={String(dept)} value={String(dept)}>{String(dept)}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-2 sm:col-span-1">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Specific Role</p>
                                                        <select value={reportFilters.jobId} onChange={e => setReportFilters(prev => ({ ...prev, jobId: e.target.value }))} className="text-sm font-bold text-black bg-transparent outline-none cursor-pointer w-full sm:w-40">
                                                            <option value="All">All Open Roles</option>
                                                            {jobs.map(job => (<option key={job.id} value={job.id}>{job.title}</option>))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 sm:gap-3">
                                                    <button onClick={() => fetchData()} className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200">↻ Refresh</button>
                                                    <button
                                                        onClick={() => {
                                                            const params = new URLSearchParams({ date_range: reportFilters.dateRange, department: reportFilters.department, job_id: reportFilters.jobId });
                                                            const token = localStorage.getItem('auth_token');
                                                            window.open(`${process.env.NEXT_PUBLIC_API_URL}/v1/applicants/export?${params.toString()}&token=${token}`, '_blank');
                                                        }}
                                                        className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-[#FDF22F] text-black hover:bg-black hover:text-[#FDF22F] rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <FileText size={13} />
                                                        <span className="hidden sm:inline">Export CSV</span>
                                                        <span className="sm:hidden">Export</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stat Grid — 2 cols mobile, 4 cols sm+ */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
                                            {[
                                                { label: 'Total Placements', value: stats?.funnel?.hired || 0, icon: '🏆' },
                                                { label: 'Active Pipeline', value: (stats?.funnel?.applied || 0) - (stats?.funnel?.hired || 0) - (stats?.funnel?.rejected || 0), icon: '🔥' },
                                                { label: 'Pending Reqs', value: stats?.requisitions?.pending || 0, icon: '⏳' },
                                                { label: 'Success Rate', value: stats?.funnel?.applied > 0 ? Math.round((stats.funnel.hired / stats.funnel.applied) * 100) + '%' : '0%', icon: '📈' },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100 hover:scale-[1.02] transition-transform">
                                                    <div className="text-xl sm:text-2xl mb-2 sm:mb-3">{stat.icon}</div>
                                                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                                    <p className="text-2xl sm:text-3xl font-black text-black">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Side Drawer ── */}
            <AnimatePresence>
                {drawerReq && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-2xl z-[120] overflow-y-auto">
                            <div className="p-5 sm:p-8 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-black tracking-widest uppercase mb-1">REQ{drawerReq.id}</p>
                                    <h2 className="text-xl sm:text-2xl font-black text-black">{drawerReq.title}</h2>
                                    <p className="text-gray-400 text-sm mt-1">{drawerReq.department}</p>
                                </div>
                                <button onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="text-gray-300 hover:text-gray-500 transition-colors p-1 shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-5 sm:p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location / Branch</p>
                                        <p className="text-sm font-bold text-black">{drawerReq.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Salary Range</p>
                                        <p className="text-sm font-black text-black">{drawerReq.budget ? drawerReq.budget.toLocaleString() : '15,000'} ETB /mo</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description (JD) Content</h3>
                                        {drawerReq.jd_path && !drawerReq.jd_content && (
                                            <a href={`${API_URL}/v1/requisitions/${drawerReq.id}/jd?token=${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-black hover:underline uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                                                <FileText size={12} /> View JD Doc
                                            </a>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-100 border-dashed max-h-[300px] overflow-y-auto">
                                        {drawerReq.jd_content
                                            ? <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: drawerReq.jd_content }} />
                                            : <p className="text-sm text-gray-400 italic">No text-based JD content provided.</p>}
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Justification / Description</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 italic">{drawerReq.description || 'No detailed description provided.'}</p>
                                    </div>
                                </div>
                                {canApprove(drawerReq) && (
                                    <div className="pt-8 space-y-4 border-t border-gray-100">
                                        {feedbackTarget === drawerReq.id ? (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">{actionType === 'amend' ? 'Mandatory Amendment Feedback for GM' : 'Rejection Reason'}</p>
                                                <textarea value={feedbackReason} onChange={(e) => setFeedbackReason(e.target.value)} placeholder={actionType === 'amend' ? "e.g. 'The salary range is too high for this quarter'..." : "Provide professional feedback for the manager..."} className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none text-sm h-32 font-medium transition-all ${actionType === 'amend' ? 'border-amber-100 focus:ring-4 focus:ring-amber-50 focus:border-amber-500' : 'border-red-100 focus:ring-4 focus:ring-red-50 focus:border-red-500'}`} />
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setFeedbackTarget(null); setActionType(null); }} className="flex-1 px-4 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:bg-gray-200 transition-all">Cancel</button>
                                                    <button onClick={handleAction} disabled={!feedbackReason.trim() || actionLoading} className={`flex-[2] px-4 py-4 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all disabled:opacity-50 ${actionType === 'amend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-black hover:bg-red-600'}`}>Confirm & Notify GM</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => handleApprove(drawerReq.id)} disabled={actionLoading} className="flex-[2] px-6 py-5 bg-[#FDF22F] text-black rounded-[20px] text-[12px] font-black tracking-widest uppercase hover:bg-black hover:text-[#FDF22F] transition-all flex items-center justify-center gap-3 group">
                                                    Approve Requisition <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                {isMD && <button onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('amend'); }} className="flex-1 px-6 py-5 bg-amber-50 text-amber-600 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-amber-100 hover:border-amber-500 transition-all">Amend</button>}
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

            {/* ── Password Change Modal ── */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !passwordLoading && setIsPasswordModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 mx-4 border border-gray-100">
                            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mb-6">Change Password</h2>
                            {passwordError && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {passwordError}
                                </div>
                            )}
                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Password</label>
                                    <input required type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-transparent focus:border-black rounded-xl font-medium outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">New Password (8+ chars)</label>
                                    <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-transparent focus:border-black rounded-xl font-medium outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Confirm New Password</label>
                                    <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-12 px-4 bg-gray-50 border border-transparent focus:border-black rounded-xl font-medium outline-none transition-all" />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsPasswordModalOpen(false)} disabled={passwordLoading} className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-500 font-black text-[11px] tracking-widest uppercase hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button type="submit" disabled={passwordLoading} className="flex-[2] h-12 rounded-xl bg-[#FDF22F] text-black font-black text-[11px] tracking-widest uppercase hover:bg-black hover:text-[#FDF22F] transition-colors disabled:opacity-50">
                                        {passwordLoading ? 'Updating...' : 'Save Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Calendar Modal ── */}
            <AnimatePresence>
                {isCalendarModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCalendarModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg p-6 sm:p-8 shadow-2xl z-10 mx-4 border border-gray-100">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-3">
                                    <Calendar className="text-black shrink-0" size={22} /> Hiring & Availability
                                </h2>
                                <button onClick={() => setIsCalendarModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-black hover:text-[#FDF22F] transition-colors shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
                                <div>
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#FDF22F] rounded-full" />
                                        Hiring Progress (Next 7 Days)
                                    </h3>
                                    {interviews.length === 0 ? (
                                        <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 border-dashed">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No scheduled hiring events</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {interviews.map((iv, idx) => (
                                                <div key={idx} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:border-black transition-all group">
                                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-[#FDF22F] text-xs font-black shrink-0 uppercase">
                                                            {iv.type?.split('_')[0]?.charAt(0) || 'I'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-tighter">{iv.type?.replace('_', ' ')}</span>
                                                                <span className="text-xs font-black text-black truncate">{iv.applicant?.name}</span>
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-tight truncate">Role: {iv.applicant?.job_posting?.title || 'System Role'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-3">
                                                        <p className="text-[11px] font-black text-black">{new Date(iv.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(iv.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} />}
            </AnimatePresence>
        </div>
    );
}
