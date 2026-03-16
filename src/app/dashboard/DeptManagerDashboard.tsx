'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-[13px] font-black uppercase tracking-widest text-[#FDF22F] flex items-center gap-3 border border-[#FDF22F]/20 bg-black animate-in slide-in-from-bottom-5 duration-300`}
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
    jd_content?: string;
    amendment_comment?: string;
    created_at: string;
}

const INITIAL_FORM_DATA = {
    title: '',
    department: '',
    location: '',
    headcount: 1,
    priority: 'medium',
    budget: 0,
    position_type: 'new',
    description: '',
    jd_content: '',
};

export default function DeptManagerDashboard({ user, activeTab: initialTab, onLogout }: { user: any; activeTab: string; onLogout: () => void }) {
    const [requisitions, setRequisitions] = useState<Requisition[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const jdContentRef = useRef<HTMLDivElement>(null);
    const [jdFile, setJdFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [editingReqId, setEditingReqId] = useState<number | null>(null);
    const [jobs, setJobs] = useState<any[] | null>(null);
    const [jobsMeta, setJobsMeta] = useState<any>(null);
    const [reqsMeta, setReqsMeta] = useState<any>(null);
    const [jobsPage, setJobsPage] = useState(1);
    const [reqsPage, setReqsPage] = useState(1);
    const [localTab, setLocalTab] = useState(initialTab === 'HiringPlan' ? 'HIRING PLAN' : 'JOBS');
    const [search, setSearch] = useState(''); // live search term from URL
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        setLoading(true);
        setJobs(null);
        setRequisitions(null);
        setLocalTab(initialTab === 'HiringPlan' ? 'HIRING PLAN' : 'JOBS');
        fetchData();
    }, [initialTab]);

    useEffect(() => {
        // Poll URL for live search changes written by Navbar
        const interval = setInterval(() => {
            const params = new URLSearchParams(window.location.search);
            const s = params.get('search') ?? '';
            setSearch(prev => {
                const updated = prev !== s ? s : prev;
                if (prev !== s) console.log('[DM Dashboard] Search updated:', s);
                return updated;
            });
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (jp = jobsPage, rp = reqsPage) => {
        try {
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            console.log('[DM Dashboard] Fetching data with search:', search || '(none)');
            const [reqRes, jobsRes] = await Promise.all([
                apiFetch(`/v1/requisitions?page=${rp}&per_page=10${searchParam}`),
                apiFetch(`/v1/jobs?page=${jp}&per_page=10${searchParam}`)
            ]);
            setRequisitions(reqRes.data || []);
            setReqsMeta(reqRes);
            setJobs(jobsRes.data || []);
            setJobsMeta(jobsRes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(jobsPage, reqsPage); }, [jobsPage, reqsPage, search]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const fd = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                fd.append(key, value.toString());
            });
            if (jdFile) {
                fd.append('jd_file', jdFile);
            }

            fd.append('jd_content', formData.jd_content);

            await apiFetch(editingReqId ? `/v1/requisitions/${editingReqId}` : '/v1/requisitions', {
                method: 'POST',
                body: fd,
            });

            setDrawerOpen(false);
            setWizardStep(1);
            setFormData(INITIAL_FORM_DATA);
            setJdFile(null); // Clear file after submission
            setEditingReqId(null);
            showToast(editingReqId ? 'Requisition Updated Successfully!' : 'Requisition Created Successfully!');
            fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (req: Requisition) => {
        setEditingReqId(req.id);
        setFormData({
            title: req.title || '',
            department: req.department || '',
            location: req.location || '',
            headcount: req.headcount || 1,
            priority: req.priority || 'medium',
            budget: req.budget || 0,
            position_type: req.position_type || 'new',
            description: req.description || '',
            jd_content: req.jd_content || '',
            amendment_comment: req.amendment_comment,
        } as any);
        setJdFile(null);
        setWizardStep(2); // Changed from 4 to 2, assuming 2 steps
        setDrawerOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this requisition? This action cannot be undone.')) return;
        try {
            await apiFetch(`/v1/requisitions/${id}`, { method: 'DELETE' });
            showToast('Requisition Deleted Successfully!');
            fetchData();
        } catch (e) {
            console.error(e);
            showToast('Failed to delete requisition', 'error');
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await apiFetch(`/v1/requisitions/${id}/duplicate`, { method: 'POST' });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    // Effect to update contentEditable div when formData.jd_content changes
    useEffect(() => {
        if (drawerOpen && jdContentRef.current && jdContentRef.current.innerHTML !== formData.jd_content) {
            jdContentRef.current.innerHTML = formData.jd_content;
        }
    }, [formData.jd_content, drawerOpen]);

    return (
        <div className="space-y-6 pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                <div className="space-y-4">
                    {/* Sub Tabs */}
                    <div className="flex gap-6 sm:gap-10 border-b border-gray-100 mt-2">
                        <div className="pb-4 text-[11px] sm:text-[12px] font-black tracking-[0.1em] sm:tracking-[0.15em] text-[#000000] relative">
                            <span className="uppercase">{localTab}</span>
                            <motion.div
                                layoutId="activeSubTabDM"
                                className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#FDF22F] rounded-t-full shadow-[0_-2px_8px_rgba(253,242,47,0.4)]"
                            />
                        </div>
                    </div>
                </div>

                {localTab === 'HIRING PLAN' && (
                    <button
                        onClick={() => { setEditingReqId(null); setFormData(INITIAL_FORM_DATA); setDrawerOpen(true); }}
                        className="w-full sm:w-auto bg-[#FDF22F] hover:bg-black text-[#000000] hover:text-[#FDF22F] px-6 sm:px-8 py-3.5 rounded-2xl font-black text-[12px] sm:text-[13px] tracking-widest uppercase shadow-xl shadow-[#FDF22F]/10 transition-all flex items-center justify-center gap-2 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Create new requisition
                    </button>
                )}
            </div>

            {/* Content Body */}
            {loading ? (
                <div className="bg-white rounded-[32px] border border-gray-100 p-20 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">

                    {/* ── JOBS TAB ── */}
                    {localTab === 'JOBS' && (
                        <>
                            {/* Desktop table */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                        <tr>
                                            {['POSITION', 'LOCATION', 'DEPARTMENT', 'STATUS', 'POSTED ON'].map(h => (
                                                <th key={h} className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {jobs === null ? null : jobs.length === 0 ? (
                                            <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">No active jobs posted yet for {user.tenant?.name || 'this company'}.</td></tr>
                                        ) : jobs.map((job: any) => (
                                            <tr key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-[#000000] group-hover:text-[#000000] transition-colors">{job.title}</p>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-gray-500">{job.location || '—'}</td>
                                                <td className="px-8 py-6 text-sm text-gray-500">
                                                    {job.department || job.requisition?.department || 'General'}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600' : job.status === 'closed' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-[13px] text-gray-600">
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="sm:hidden divide-y divide-gray-50">
                                {jobs === null ? null : jobs.length === 0 ? (
                                    <p className="px-5 py-16 text-center text-gray-400 italic text-sm">No active jobs posted yet for {user.tenant?.name || 'this company'}.</p>
                                ) : jobs.map((job: any) => (
                                    <div key={job.id} className="px-5 py-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-bold text-[#000000] text-[14px] leading-snug">{job.title}</p>
                                            <span className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${job.status === 'active' ? 'bg-emerald-50 text-emerald-600' : job.status === 'closed' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <span className="text-[12px] text-gray-400">{job.location || '—'}</span>
                                            <span className="text-[12px] text-gray-400">{job.department || job.requisition?.department || 'General'}</span>
                                            <span className="text-[12px] text-gray-400">{new Date(job.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {jobsMeta?.last_page > 1 && (
                                <div className="px-5 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        Page {jobsPage} of {jobsMeta.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={jobsPage === 1}
                                            onClick={() => setJobsPage(p => p - 1)}
                                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30"
                                        >←</button>
                                        <button
                                            disabled={jobsPage === jobsMeta.last_page}
                                            onClick={() => setJobsPage(p => p + 1)}
                                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30"
                                        >→</button>
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
                                            {['REQUISITION', 'GENERAL MANAGER (GM)', 'LOCATION', 'SALARY', 'SUBMITTED ON', 'POSTED TO PORTAL', 'STATUS'].map(h => (
                                                <th key={h} className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requisitions === null ? null : requisitions.length === 0 ? (
                                            <tr><td colSpan={7} className="px-8 py-20 text-center text-gray-400 italic text-sm">No requisitions created yet for {user.tenant?.name || 'this company'}.</td></tr>
                                        ) : requisitions.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-[13px] text-[#000000] hover:text-[#FDF22F] transition-colors">
                                                        REQ{req.id} {req.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5 tracking-tight">
                                                        {req.department} · {req.position_type === 'replacement' ? '↺ Replacement' : '✦ New'}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-[13px] text-gray-600">
                                                    {user.name} (You)
                                                </td>
                                                <td className="px-8 py-6 text-[13px] text-gray-600">
                                                    {req.location || '—'}
                                                </td>
                                                <td className="px-8 py-6 text-[13px] text-[#000000] font-black">
                                                    {req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo
                                                </td>
                                                <td className="px-8 py-6">
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
                                                <td className="px-8 py-6">
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
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded">
                                                            Not Posted
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest mr-auto ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                            req.status === 'amendment_required' ? 'bg-amber-50 text-amber-600' :
                                                                (req.status === 'pending_md' || req.status === 'pending_hr') ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                                                            }`}>
                                                            {req.status.replace('_', ' ')}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {(req.status === 'amendment_required' || req.status === 'pending_md') && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"
                                                                    title="Amend"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDuplicate(req.id); }}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-[#000000] transition-all"
                                                                title="Duplicate"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile + Tablet cards */}
                            <div className="lg:hidden divide-y divide-gray-50">
                                {requisitions === null ? null : requisitions.length === 0 ? (
                                    <p className="px-5 py-16 text-center text-gray-400 italic text-sm">No requisitions created yet for {user.tenant?.name || 'this company'}.</p>
                                ) : requisitions.map((req: any) => (
                                    <div key={req.id} className="px-4 py-5 hover:bg-gray-50 transition-colors group">
                                        {/* Top row: title + status */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <p className="font-black text-[13px] text-[#000000] leading-snug">REQ{req.id} {req.title}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{req.department} · {req.position_type === 'replacement' ? '↺ Replacement' : '✦ New'}</p>
                                            </div>
                                            <span className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'amendment_required' ? 'bg-amber-50 text-amber-600' :
                                                    (req.status === 'pending_md' || req.status === 'pending_hr') ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                                                }`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        {/* Details grid */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                                                <p className="text-[12px] text-gray-600">{req.location || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Salary</p>
                                                <p className="text-[12px] font-black text-[#000000]">{req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Submitted</p>
                                                <p className="text-[12px] text-gray-600">
                                                    {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Posted</p>
                                                {req.job_posting?.created_at ? (
                                                    <p className="text-[12px] text-emerald-600 font-bold">
                                                        {new Date(req.job_posting.published_at || req.job_posting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                ) : (
                                                    <span className="text-[10px] font-black text-gray-400 uppercase">Not Posted</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            {(req.status === 'amendment_required' || req.status === 'pending_md') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                                                    className="flex items-center gap-1.5 px-3 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    Amend
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDuplicate(req.id); }}
                                                className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-[#000000] bg-gray-50 hover:bg-gray-100 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                Duplicate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {reqsMeta?.last_page > 1 && (
                                <div className="px-5 sm:px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        Page {reqsPage} of {reqsMeta.last_page}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={reqsPage === 1}
                                            onClick={() => setReqsPage(p => p - 1)}
                                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30"
                                        >←</button>
                                        <button
                                            disabled={reqsPage === reqsMeta.last_page}
                                            onClick={() => setReqsPage(p => p + 1)}
                                            className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30"
                                        >→</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Creation Wizard Side Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-2xl z-[120] flex flex-col"
                        >
                            <div className="p-5 sm:p-8 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#000000]">{editingReqId ? 'Edit Requisition' : 'New Requisition'}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#FDF22F] transition-all duration-500 shadow-[0_0_8px_rgba(253,242,47,0.6)]" style={{ width: wizardStep === 1 ? '50%' : '100%' }} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {wizardStep} of 2</span>
                                    </div>
                                </div>
                                <button onClick={() => { setDrawerOpen(false); setEditingReqId(null); }} className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
                                {(formData as any).amendment_comment && editingReqId && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center gap-2 text-amber-700 mb-2">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            <h4 className="text-[11px] font-black uppercase tracking-widest">Required Amendment Feedback</h4>
                                        </div>
                                        <p className="text-sm font-medium text-amber-900 leading-relaxed bg-white/50 p-4 rounded-lg">
                                            {(formData as any).amendment_comment}
                                        </p>
                                    </div>
                                )}
                                {wizardStep === 1 ? (
                                    <div className="space-y-6">
                                        <section className="space-y-4">
                                            <h3 className="text-[11px] font-black text-[#000000] uppercase tracking-widest">Job Details</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Job Title <span className="text-red-500">* Required</span></label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-bold text-[#000000]"
                                                        placeholder="e.g. Senior Pharmacist"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Department <span className="text-red-500">* Required</span></label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-bold text-[#000000]"
                                                        placeholder="e.g. Sales & Marketing"
                                                        value={formData.department}
                                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Location / Branch <span className="text-red-500">* Required</span></label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-bold text-[#000000]"
                                                        placeholder="e.g. Arat Kilo, Bole, or Regional"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4 pt-4 border-t border-gray-100 border-dashed">
                                            <h3 className="text-[11px] font-black text-[#000000] uppercase tracking-widest">Urgency & Capacity</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">Priority Level</label>
                                                    <div className="grid grid-cols-4 gap-1.5 sm:flex sm:gap-2">
                                                        {['low', 'medium', 'high', 'urgent'].map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => setFormData({ ...formData, priority: p })}
                                                                className={`py-3 sm:py-3.5 rounded-xl text-[10px] font-black uppercase border transition-all ${formData.priority === p
                                                                    ? 'bg-[#FDF22F] text-[#000000] border-[#FDF22F] shadow-lg shadow-[#FDF22F]/20'
                                                                    : 'bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black'
                                                                    }`}
                                                            >
                                                                {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Headcount</label>
                                                    <input
                                                        type="number"
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-bold text-black"
                                                        value={formData.headcount}
                                                        onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Type</label>
                                                    <select
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_1.25rem_center] bg-no-repeat text-black"
                                                        value={formData.position_type}
                                                        onChange={(e) => setFormData({ ...formData, position_type: e.target.value as any })}
                                                    >
                                                        <option value="new">✦ New Position</option>
                                                        <option value="replacement">↺ Replacement</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <section className="space-y-4">
                                            <h3 className="text-[11px] font-black text-[#000000] uppercase tracking-widest">Financials & Context</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Monthly Salary Budget (ETB)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-300">ETB</span>
                                                        <input
                                                            type="number"
                                                            className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all font-black text-[#000000]"
                                                            value={formData.budget || ''}
                                                            onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Internal Notes / Justification</label>
                                                    <textarea
                                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all text-sm font-medium h-36 sm:h-40 leading-relaxed placeholder:text-gray-300 text-black"
                                                        placeholder="Provide context for HR regarding why this role is needed now..."
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    />
                                                </div>
                                                <div className="pt-4 border-t border-gray-100 border-dashed">
                                                    <label className="block text-[11px] font-black text-[#000000] uppercase tracking-widest mb-3 flex justify-between items-center">
                                                        <span>Job Description (JD) Content</span>
                                                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full animate-pulse">Rich Layout Active</span>
                                                    </label>
                                                    <div className="relative group/jd bg-white rounded-[24px] sm:rounded-[32px] border border-gray-200 shadow-xl overflow-hidden min-h-[400px] sm:min-h-[500px] flex flex-col">
                                                        {/* Toolbar Decoration */}
                                                        <div className="px-6 py-3 border-b border-gray-50 bg-[#F9FAFB] flex gap-4 items-center">
                                                            <div className="flex gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-red-200" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-200" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Document View</span>
                                                        </div>

                                                        <div
                                                            ref={jdContentRef}
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            onInput={(e) => {
                                                                const html = e.currentTarget.innerHTML;
                                                                setFormData(prev => ({ ...prev, jd_content: html }));
                                                            }}
                                                            onBlur={(e) => {
                                                                const html = e.currentTarget.innerHTML;
                                                                setFormData(prev => ({ ...prev, jd_content: html }));
                                                            }}
                                                            className="flex-1 px-5 sm:px-10 py-6 sm:py-10 outline-none text-sm font-medium leading-relaxed text-black overflow-y-auto max-h-[400px] sm:max-h-[600px] prose prose-sm max-w-none"
                                                            dangerouslySetInnerHTML={{ __html: formData.jd_content }}
                                                        />

                                                        {!formData.jd_content && (
                                                            <div className="absolute inset-x-0 top-24 pointer-events-none flex flex-col items-center justify-center text-center px-10">
                                                                <svg className="w-12 h-12 text-gray-100 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                <p className="text-gray-300 text-sm font-medium">Paste your professional Job Description content here</p>
                                                                <p className="text-gray-200 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Rich formatting & layout will be preserved</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-4 italic font-medium flex items-center gap-2">
                                                        <span className="text-[#FDF22F]">✨</span>
                                                        Pro Tip: Copy EVERYTHING (Headers, Lists, Tables) from your local file and paste it directly. The system catch the exact layout.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 sm:p-8 border-t border-gray-100 flex gap-3 sm:gap-4 bg-gray-50/50">
                                {wizardStep === 2 && (
                                    <button
                                        onClick={() => setWizardStep(1)}
                                        className="flex-1 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border border-gray-200 hover:bg-white rounded-lg transition-all"
                                    >
                                        <span className="hidden sm:inline">Back to Details</span>
                                        <span className="sm:hidden">Back</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => wizardStep === 1 ? setWizardStep(2) : handleSubmit()}
                                    disabled={submitting || !formData.title || !formData.department || !formData.location}
                                    className="flex-[2] py-4 bg-[#FDF22F] hover:bg-black text-[#000000] hover:text-white rounded-xl text-[11px] font-black tracking-widest uppercase shadow-xl shadow-[#FDF22F]/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">{wizardStep === 1 ? 'Continue to Financials' : 'Submit for Approval'}</span>
                                            <span className="sm:hidden">{wizardStep === 1 ? 'Continue' : 'Submit'}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {toast && <Toast msg={toast.msg} type={toast.type} />}
            </AnimatePresence>
        </div >
    );
}
