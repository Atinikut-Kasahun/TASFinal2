'use client';
// Professional HR Manager Dashboard - Rebuild trigger

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import ExportModal from '@/components/ExportModal';
import {
    Check, ChevronLeft, ChevronRight, FileText, CheckCircle2,
    TrendingUp, TrendingDown, Users, Briefcase, Target, Clock,
    Download, Filter, BarChart2, PieChart, Activity, X,
    Calendar, ArrowRight, LifeBuoy, BookOpen, MessageCircle,
    ExternalLink, HelpCircle, Search, Layers, ShieldCheck, Globe, Award
} from 'lucide-react';

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl text-[13px] font-black uppercase tracking-widest text-[#FDF22F] flex items-center gap-3 border border-[#FDF22F]/20 bg-black">
            <CheckCircle2 size={18} className="shrink-0" /><span>{msg}</span>
        </motion.div>
    );
}

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, trend, trendUp, accent, delay = 0 }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30, rotateX: 10 }} 
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }} 
            viewport={{ once: false, amount: 0.15, margin: "-50px 0px" }}
            whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 40px -12px rgba(0,0,0,0.15)', transition: { duration: 0.3 } }} 
            transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1], delay }}
            className="relative bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden p-5 sm:p-7 cursor-default group"
        >
            {accent && <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FDF22F] group-hover:h-2 transition-all" />}
            <div className="flex items-start justify-between mb-4 sm:mb-5">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${accent ? 'bg-[#FDF22F]' : 'bg-gray-50 border border-gray-100'} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={18} className={accent ? 'text-black' : 'text-gray-400'} />
                </div>
                <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: delay + 0.3 }}
                    className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}
                >
                    {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{trend}
                </motion.span>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl sm:text-4xl font-black text-black tracking-tight">{value}</p>
        </motion.div>
    );
}

/* ─── Funnel Bar ─────────────────────────────────────────── */
function FunnelBar({ label, value, max, color, index = 0 }: any) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
        >
            <div className="flex justify-between items-center">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className="text-[13px] font-black text-black tabular-nums">{value}</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: `${pct}%` }} 
                    viewport={{ once: false }}
                    transition={{ duration: 1.2, ease: [0.21, 0.85, 0.44, 1], delay: 0.2 + (index * 0.1) }} 
                    className="h-full rounded-full" 
                    style={{ background: color }} 
                />
            </div>
            <p className="text-[10px] font-bold text-gray-300 text-right">{pct}% of applied</p>
        </motion.div>
    );
}

/* ─── Donut Chart ────────────────────────────────────────── */
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    let offset = 0;
    const r = 40, circ = 2 * Math.PI * r, cx = 60, cy = 60;
    return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
            {data.map((d, i) => {
                const pct = d.value / total, dash = pct * circ, gap = circ - dash;
                const rot = (offset / total) * 360 - 90;
                offset += d.value;
                return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={colors[i] || '#E5E7EB'} strokeWidth="18" strokeDasharray={`${dash} ${gap}`} transform={`rotate(${rot} ${cx} ${cy})`} className="transition-all duration-700" />;
            })}
            <circle cx={cx} cy={cy} r="28" fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 14, fontWeight: 900, fill: '#000' }}>{total}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 7, fontWeight: 700, fill: '#9CA3AF', letterSpacing: 1 }}>TOTAL</text>
        </svg>
    );
}

/* ─── Bar Timeline ───────────────────────────────────────── */
function BarTimeline({ data }: { data: { label: string; count: number }[] }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1 sm:gap-1.5 h-full w-full">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-all tabular-nums">{d.count}</span>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.count / max) * 100, 2)}%` }} transition={{ duration: 0.6, delay: i * 0.04 }} className="w-full rounded-t-lg group-hover:bg-black transition-colors" style={{ background: '#FDF22F', minHeight: 3 }} />
                    <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Side Panel ─────────────────────────────────────────── */
function SidePanel({ title, subtitle, onClose, children, loading }: any) {
    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[130]" onClick={onClose} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[560px] bg-white shadow-2xl z-[140] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 sm:px-8 py-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                    <div>
                        <h2 className="text-[20px] font-black text-black tracking-tight">{title}</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {loading ? <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" /></div> : children}
                </div>
            </motion.div>
        </>
    );
}

/* ─── CSV Builder ────────────────────────────────────────── */
function buildAndDownloadCSV(stats: any, allApplicants: any[], jobs: any[], reportFilters: any) {
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const periodMap: Record<string, string> = { '7': 'Last 7 Days', '30': 'Last 30 Days', '90': 'Last 90 Days', '365': 'Last Year' };
    const period = periodMap[reportFilters.dateRange] || `Year ${reportFilters.dateRange}`;
    const esc = (v: any) => { const s = String(v ?? '').replace(/"/g, '""'); return /[,"\n]/.test(s) ? `"${s}"` : s; };
    const row = (...cells: any[]) => cells.map(esc).join(',');
    const L: string[] = [];

    // Cover
    L.push(row('TALENT ACQUISITION REPORT — DROGA PHARMA'));
    L.push(row('Generated On', now));
    L.push(row('Reporting Period', period));
    L.push(row('Department', reportFilters.department === 'All' ? 'All Departments' : reportFilters.department));
    L.push('');

    // 1. KPI Summary
    L.push('"### 1. KPI SUMMARY ###"');
    L.push(row('Metric', 'Value'));
    L.push(row('Total Employees (Headcount)', stats?.metrics?.total_employees ?? 0));
    L.push(row('Active Applicants in Pipeline', stats?.funnel?.applied ?? 0));
    L.push(row('Retention Rate (%)', stats?.metrics?.retention_rate ?? 0));
    L.push(row('Open Positions', stats?.metrics?.active_jobs ?? 0));
    L.push(row('Avg. Time to Hire (Days)', stats?.avg_time_to_hire ?? 0));
    L.push(row('Total Hired (Period)', stats?.funnel?.hired ?? 0));
    L.push(row('Total Offered (Period)', stats?.funnel?.offer ?? 0));
    L.push('');

    // 2. Hiring Funnel
    L.push('"### 2. HIRING FUNNEL ###"');
    L.push(row('Stage', 'Count', 'Conversion Rate'));
    const ap = stats?.funnel?.applied || 1;
    L.push(row('Applied', stats?.funnel?.applied ?? 0, '100%'));
    L.push(row('Screening', stats?.funnel?.screening ?? 0, `${Math.round(((stats?.funnel?.screening ?? 0) / ap) * 100)}%`));
    L.push(row('Interviewing', stats?.funnel?.interviewing ?? 0, `${Math.round(((stats?.funnel?.interviewing ?? 0) / ap) * 100)}%`));
    L.push(row('Offered', stats?.funnel?.offer ?? 0, `${Math.round(((stats?.funnel?.offer ?? 0) / ap) * 100)}%`));
    L.push(row('Hired', stats?.funnel?.hired ?? 0, `${Math.round(((stats?.funnel?.hired ?? 0) / ap) * 100)}%`));
    L.push('');

    // 3. Monthly Timeline
    L.push('"### 3. MONTHLY APPLICATION VOLUME ###"');
    L.push(row('Month', 'Applications'));
    (stats?.timeline ?? []).forEach((t: any) => L.push(row(t.label, t.count)));
    L.push('');

    // 4. Turnover
    L.push('"### 4. MONTHLY EMPLOYEE TURNOVER ###"');
    L.push(row('Month', 'Turnover Rate (%)', 'Resigned', 'Terminated', 'Total Separations'));
    (stats?.turnover ?? []).forEach((t: any) => L.push(row(t.full_label, t.rate, t.resigned, t.terminated, t.total)));
    L.push('');

    // 5. Dept breakdown
    L.push('"### 5. APPLICANTS BY DEPARTMENT ###"');
    L.push(row('Department', 'Applicants', 'Share (%)'));
    const dt = (stats?.by_department ?? []).reduce((s: number, d: any) => s + d.count, 0) || 1;
    (stats?.by_department ?? []).forEach((d: any) => L.push(row(d.department, d.count, `${Math.round((d.count / dt) * 100)}%`)));
    L.push('');

    // 6. Sources
    L.push('"### 6. APPLICATION SOURCE ATTRIBUTION ###"');
    L.push(row('Source', 'Applications', 'Share (%)'));
    const st2 = (stats?.sources ?? []).reduce((s: number, d: any) => s + d.count, 0) || 1;
    (stats?.sources ?? []).forEach((s: any) => L.push(row(s.source || 'Unknown', s.count, `${Math.round((s.count / st2) * 100)}%`)));
    L.push('');

    // 7. Active Jobs
    L.push('"### 7. ACTIVE JOB POSTINGS ###"');
    L.push(row('Job Title', 'Department', 'Location', 'Status', 'Applicants'));
    jobs.forEach((j: any) => L.push(row(j.title, j.department || j.requisition?.department || '—', j.location || '—', j.status, j.applicants_count ?? 0)));
    L.push('');

    // 8. Applicant Roster
    L.push('"### 8. APPLICANT ROSTER ###"');
    L.push(row('Name', 'Email', 'Phone', 'Position Applied', 'Department', 'Experience (Yrs)', 'Status', 'Employment Status', 'Applied On', 'Hired On'));
    allApplicants.forEach((a: any) => L.push(row(
        a.name,
        a.email,
        a.phone || '—',
        a.job_posting?.title ?? a.jobPosting?.title ?? '—',
        a.job_posting?.department ?? a.jobPosting?.department ?? '—',
        a.years_of_experience ?? '—',
        (a.status ?? 'new').replace(/_/g, ' ').toUpperCase(),
        (a.employment_status ?? 'active').toUpperCase(),
        a.created_at ? new Date(a.created_at).toLocaleDateString('en-US') : '—',
        a.hired_at ? new Date(a.hired_at).toLocaleDateString('en-US') : '—',
    )));

    const csv = L.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HR_TalentAcquisition_${(periodMap[reportFilters.dateRange] || reportFilters.dateRange).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ─── Types ──────────────────────────────────────────────── */
interface Requisition {
    id: number; title: string; department: string; headcount: number;
    budget: number | null; position_type: 'new' | 'replacement'; priority: string;
    location: string; status: string; description: string | null; jd_path: string | null;
    jd_content?: string; created_at: string;
    requester?: { id: number; name: string; email: string };
    tenant?: { name: string };
    job_posting?: { created_at: string; published_at?: string; deadline?: string; title: string; id: number };
}

interface Applicant {
    id: number; name: string; email: string; phone?: string;
    years_of_experience?: number; status: string;
    employment_status: string; created_at: string;
    hired_at?: string; job_posting?: { title: string; department: string };
    jobPosting?: { title: string; department: string };
}

type ActivePanel = null | 'employees' | 'turnover' | 'performance' | 'interviews' | 'candidates' | 'help';

const STATUS_COLOR: Record<string, string> = {
    new: 'bg-blue-50 text-blue-600 border-blue-100',
    written_exam: 'bg-purple-50 text-purple-600 border-purple-100',
    technical_interview: 'bg-amber-50 text-amber-600 border-amber-100',
    final_interview: 'bg-orange-50 text-orange-600 border-orange-100',
    offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    hired: 'bg-green-50 text-green-700 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
};
const DEPT_COLORS = ['#FDF22F', '#000000', '#374151', '#6B7280', '#D1D5DB'];

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
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
    const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);
    const [supportMessage, setSupportMessage] = useState('');
    const [isSendingSupport, setIsSendingSupport] = useState(false);
    const [showSupportForm, setShowSupportForm] = useState(false);
    const [reportFilters, setReportFilters] = useState({ dateRange: '30', department: 'All', jobId: 'All' });
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [hoveredTurnover, setHoveredTurnover] = useState<any>(null);
    const [activePanel, setActivePanel] = useState<ActivePanel>(null);
    const [panelData, setPanelData] = useState<any>(null);
    const [panelLoading, setPanelLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportModal, setExportModal] = useState(false);
    const [recentFilter, setRecentFilter] = useState({ status: 'All', department: 'All' });
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
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
                const j = await apiFetch(`/v1/jobs?page=${jobsPage}&status=${subTab === 'ARCHIVED' ? 'archived' : 'active'}`);
                setJobs(j.data || []); setJobsMeta(j);
            } else if (localTab === 'HIRING PLAN') {
                const r = await apiFetch(`/v1/requisitions?page=${reqsPage}&status=${subTab === 'PENDING' ? 'pending_hr' : 'all'}`);
                setRequisitions(r.data || []); setReqsMeta(r);
            }
            if (localTab === 'REPORTS') {
                const params = new URLSearchParams({ date_range: reportFilters.dateRange, department: reportFilters.department, job_id: reportFilters.jobId });
                const [sd, jd, ad] = await Promise.all([
                    apiFetch(`/v1/applicants/stats?${params}`),
                    apiFetch(`/v1/jobs?page=1&limit=100`),
                    apiFetch(`/v1/applicants?page=1&limit=10`),
                ]);
                setStats(sd); setJobs(jd.data || []); setRecentApplicants(ad.data || []);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    /* Lightweight fetch — only updates the recent applicants table, no scroll */
    const [recentLoading, setRecentLoading] = useState(false);
    const fetchRecentApplicants = async (filter: { status: string; department: string }) => {
        setRecentLoading(true);
        try {
            const p = new URLSearchParams({ page: '1', limit: '10' });
            if (filter.status !== 'All') p.set('status', filter.status);
            if (filter.department !== 'All') p.set('department', filter.department);
            const ad = await apiFetch(`/v1/applicants?${p.toString()}`);
            setRecentApplicants(ad.data || []);
        } catch (e) { console.error(e); }
        finally { setRecentLoading(false); }
    };

    useEffect(() => { fetchData(); }, [localTab, subTab, reportFilters, reqsPage, jobsPage]);

    /* Re-fetch ONLY the recent table when filter changes — no full page reload */
    useEffect(() => {
        if (localTab === 'REPORTS') {
            fetchRecentApplicants(recentFilter);
        }
    }, [recentFilter]);

    /* ── Open panel ──────────────────────────────────────── */
    const openPanel = useCallback(async (panel: ActivePanel) => {
        setActivePanel(panel);
        setPanelData(null);
        setPanelLoading(true);
        try {
            if (panel === 'help') { setPanelLoading(false); return; }
            const params = new URLSearchParams({ date_range: reportFilters.dateRange, department: reportFilters.department });
            switch (panel) {
                case 'employees': {
                    const r = await apiFetch(`/v1/applicants?page=1&limit=100&status=hired`);
                    setPanelData(r.data || []);
                    break;
                }
                case 'turnover':
                case 'performance': {
                    const r = await apiFetch(`/v1/applicants/stats?${params}`);
                    setPanelData(r);
                    break;
                }
                case 'interviews': {
                    const r = await apiFetch(`/v1/interviews?page=1&limit=50`);
                    setPanelData(r.data || r || []);
                    break;
                }
                case 'candidates': {
                    const r = await apiFetch(`/v1/applicants?page=1&limit=50`);
                    setPanelData(r.data || []);
                    break;
                }
            }
        } catch (e) { console.error(e); }
        finally { setPanelLoading(false); }
    }, [reportFilters]);

    /* ── Export ──────────────────────────────────────────── */
    const handleExport = () => setExportModal(true);

    const isMD = user?.roles?.some((r: any) => r.slug === 'managing_director');
    const isHR = user?.roles?.some((r: any) => r.slug === 'hr_manager');
    const canApprove = (req: Requisition) => (isMD && req.status === 'pending_md') || (isHR && req.status === 'pending_hr');

    const handleApprove = async (id: number) => {
        setActionLoading(true);
        try {
            await apiFetch(`/v1/requisitions/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
            setRequisitions(p => p.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            if (drawerReq?.id === id) setDrawerReq(p => p ? { ...p, status: 'approved' } : null);
            showToast('Requisition Approved ✓');
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
            setRequisitions(p => p.map(r => r.id === feedbackTarget ? { ...r, status: actionType === 'amend' ? 'amendment_required' : 'rejected' } : r));
            setFeedbackTarget(null); setFeedbackReason(''); setActionType(null); setDrawerReq(null);
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const handleBulkApprove = async () => {
        if (!selectedIds.length) return;
        setActionLoading(true);
        try {
            await apiFetch('/v1/requisitions/bulk-approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedIds }) });
            setRequisitions(p => p.map(r => selectedIds.includes(r.id) ? { ...r, status: 'approved' } : r));
            showToast(`${selectedIds.length} Requisitions Approved ✓`);
            setSelectedIds([]);
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const pendingReqs = requisitions.filter(r => r.status === 'pending_md' || r.status === 'pending_hr');
    const appliedCount = stats?.funnel?.applied ?? 0;
    const hiredCount = stats?.funnel?.hired ?? 0;
    const funnelMax = appliedCount || 1;
    const activeJobsCount = stats?.metrics?.active_jobs ?? 0;
    const totalEmployees = stats?.metrics?.total_employees ?? 0;
    const retentionRate = stats?.metrics?.retention_rate ?? 0;
    const avgTimeToHire = stats?.avg_time_to_hire ?? 0;
    const byDepartment = stats?.by_department ?? [];
    const turnoverData = stats?.turnover ?? [];

    // SVG turnover chart
    const tRates = turnoverData.map((d: any) => d.rate);
    const minRate = Math.min(...tRates, 0);
    const maxRate = Math.max(...tRates, 1);
    const toY = (r: number) => 180 - ((r - minRate) / (maxRate - minRate || 1)) * 140 + 20;
    const svgPts = turnoverData.map((d: any, i: number) => ({ x: turnoverData.length > 1 ? (i * 800) / (turnoverData.length - 1) : 400, y: toY(d.rate) }));
    let svgPath = '', svgArea = '';
    if (svgPts.length > 1) {
        let p = `M${svgPts[0].x},${svgPts[0].y}`;
        for (let i = 0; i < svgPts.length - 1; i++) { const p0 = svgPts[i], p1 = svgPts[i + 1], cx = (p0.x + p1.x) / 2; p += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`; }
        svgPath = p;
        svgArea = `${p} L${svgPts[svgPts.length - 1].x},200 L${svgPts[0].x},200 Z`;
    }

    const handleSendSupport = async () => {
        if (!supportMessage.trim()) return;
        setIsSendingSupport(true);
        try {
            const users = await apiFetch('/v1/messages/users');
            // Look for any user with admin role or specific admin email
            const admin = users.find((u: any) => u.email === 'admin@droga.com') || users[0];
            
            if (!admin) {
                showToast('No administrator found', 'error');
                return;
            }

            await apiFetch('/v1/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to_user_id: admin.id, message: supportMessage })
            });

            showToast('Message sent to Global Admin ✓');
            setSupportMessage('');
            setShowSupportForm(false);
        } catch (e) {
            showToast('Could not reach support', 'error');
        } finally {
            setIsSendingSupport(false);
        }
    };

    /* ── Panel content ───────────────────────────────────── */
    const renderPanel = () => {
        switch (activePanel) {

            case 'help':
                return (
                    <div className="space-y-8">

                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Popular Topics</p>
                            <div className="space-y-2">
                                {[
                                    { t: 'Managing user permissions', d: 'Invite team members and set roles', i: <Users size={16} /> },
                                    { t: 'Candidate scorecards', d: 'Standardize your interview feedback', i: <CheckCircle2 size={16} /> },
                                    { t: 'Automated email sequences', d: 'Nurture candidates at scale', i: <MessageCircle size={16} /> },
                                    { t: 'Advanced report building', d: 'Visualize your hiring efficiency', i: <TrendingUp size={16} /> },
                                ].map((topic, i) => (
                                    <button 
                                        key={topic.t} 
                                        onClick={() => showToast(`Opening article: ${topic.t}`)}
                                        className="w-full flex items-center gap-4 p-4 rounded-[20px] hover:bg-gray-50 active:bg-gray-100 transition-all text-left group outline-none focus:ring-2 focus:ring-gray-100"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-[#FDF22F] group-hover:border-black transition-all shadow-sm">
                                            {topic.i}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-black text-black leading-snug">{topic.t}</p>
                                            <p className="text-[11px] text-gray-400 font-medium">{topic.d}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-gray-200 group-hover:text-black transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black rounded-[32px] p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-[#FDF22F]/10 rounded-full -translate-x-12 -translate-y-12" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-[#FDF22F] rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-xl">
                                    <LifeBuoy size={24} className="text-black" />
                                </div>
                                <h4 className="text-white text-lg font-black tracking-tight mb-2 text-center">Still stuck?</h4>
                                <p className="text-white/50 text-[12px] font-medium mb-6 leading-relaxed text-center">Our support heroes are available 24/7 to help you with your hiring needs.</p>
                                
                                <AnimatePresence mode="wait">
                                    {!showSupportForm ? (
                                        <motion.button 
                                            key="btn"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => setShowSupportForm(true)}
                                            className="w-full py-4 bg-[#FDF22F] text-black rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-white active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3"
                                        >
                                            <MessageCircle size={16} /> Chat With Support
                                        </motion.button>
                                    ) : (
                                        <motion.div 
                                            key="form"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="space-y-4"
                                        >
                                            <textarea 
                                                autoFocus
                                                value={supportMessage}
                                                onChange={(e) => setSupportMessage(e.target.value)}
                                                placeholder="Write your message to Global Admin..."
                                                className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-4 text-white text-[13px] font-medium outline-none focus:ring-2 focus:ring-[#FDF22F]/50 transition-all placeholder:text-white/20 resize-none"
                                            />
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setShowSupportForm(false)}
                                                    className="flex-1 py-3 bg-white/5 text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleSendSupport}
                                                    disabled={!supportMessage.trim() || isSendingSupport}
                                                    className="flex-[2] py-3 bg-[#FDF22F] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white active:scale-95 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isSendingSupport ? 'Sending...' : 'Send Message'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <p className="text-white/30 text-[9px] font-bold mt-4 uppercase tracking-[0.2em] text-center">Direct to Global Admin</p>
                            </div>
                        </div>

                        <div className="text-center pt-2">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">System Version 2.4.0-pro</p>
                        </div>
                    </div>
                );

            case 'employees':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[{ l: 'Headcount', v: totalEmployees }, { l: 'Hired (Period)', v: hiredCount }, { l: 'Open Roles', v: activeJobsCount }].map((m, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                    <p className="text-2xl font-black text-black tabular-nums">{m.v}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{m.l}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Hired Employees</p>
                        {!(panelData || []).length ? <p className="text-sm text-gray-400 italic text-center py-8">No hired employees found</p>
                            : (panelData || []).map((emp: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-black transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shrink-0">{emp.name?.charAt(0) ?? 'E'}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-black text-black truncate">{emp.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold truncate">{emp.job_posting?.title ?? emp.jobPosting?.title ?? '—'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-gray-500">{emp.job_posting?.department ?? '—'}</p>
                                        <p className="text-[9px] text-gray-300 font-bold mt-0.5">{emp.hired_at ? new Date(emp.hired_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</p>
                                    </div>
                                    <span className="shrink-0 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">{emp.employment_status || 'Active'}</span>
                                </div>
                            ))}
                    </div>
                );

            case 'turnover': {
                const tv = panelData?.turnover ?? turnoverData;
                const tvTotal = tv.reduce((s: number, d: any) => s + d.total, 0);
                const tvRes = tv.reduce((s: number, d: any) => s + d.resigned, 0);
                const tvTerm = tv.reduce((s: number, d: any) => s + d.terminated, 0);
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            {[{ l: 'Separations', v: tvTotal, c: 'text-black' }, { l: 'Resigned', v: tvRes, c: 'text-emerald-600' }, { l: 'Terminated', v: tvTerm, c: 'text-red-500' }].map((m, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                                    <p className={`text-2xl font-black tabular-nums ${m.c}`}>{m.v}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{m.l}</p>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>{['Month', 'Rate', 'Resigned', 'Term.', 'Total'].map(h => <th key={h} className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tv.map((d: any, i: number) => (
                                        <tr key={i} className={`${d.total > 0 ? 'bg-red-50/30' : ''} hover:bg-gray-50`}>
                                            <td className="px-4 py-3 text-[12px] font-black text-black">{d.full_label}</td>
                                            <td className="px-4 py-3"><span className={`text-[11px] font-black tabular-nums ${d.rate > 5 ? 'text-red-500' : d.rate > 2 ? 'text-amber-500' : 'text-emerald-600'}`}>{d.rate}%</span></td>
                                            <td className="px-4 py-3 text-[12px] text-emerald-600 font-black tabular-nums">{d.resigned}</td>
                                            <td className="px-4 py-3 text-[12px] text-red-500 font-black tabular-nums">{d.terminated}</td>
                                            <td className="px-4 py-3 text-[12px] font-black text-black tabular-nums">{d.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            }

            case 'performance': {
                const pf = panelData;
                const pfAp = pf?.funnel?.applied || 1;
                const offerAcc = pf?.funnel?.offer > 0 ? Math.round((pf.funnel.hired / pf.funnel.offer) * 100) : 0;
                const hireRate = Math.round(((pf?.funnel?.hired ?? 0) / pfAp) * 100);
                const screenP = Math.round(((pf?.funnel?.screening ?? 0) / pfAp) * 100);
                const intConv = pf?.funnel?.screening > 0 ? Math.round(((pf?.funnel?.interviewing ?? 0) / pf.funnel.screening) * 100) : 0;
                return (
                    <div className="space-y-6">
                        <div className="bg-black rounded-[24px] p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF22F]/10 rounded-full -translate-y-8 translate-x-8" />
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Avg. Time to Hire</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-[#FDF22F] tabular-nums">{pf?.avg_time_to_hire || avgTimeToHire || '—'}</span>
                                <span className="text-[13px] font-black text-white/40">days</span>
                            </div>
                            <p className="text-[10px] text-white/30 font-bold mt-2 uppercase tracking-widest">Industry benchmark: 28–42 days</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Funnel Conversion Rates</p>
                            <div className="space-y-4">
                                {[
                                    { l: 'Application → Screening', v: screenP, n: 'Screening pass rate' },
                                    { l: 'Screening → Interview', v: intConv, n: 'Interview conversion' },
                                    { l: 'Offer Acceptance Rate', v: offerAcc, n: 'Accepted / Offered' },
                                    { l: 'Overall Hire Rate', v: hireRate, n: 'Hired / Total Applied' },
                                ].map((m, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[11px] font-black text-gray-600">{m.l}</span>
                                            <span className="text-[13px] font-black text-black tabular-nums">{m.v}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(m.v, 100)}%` }} transition={{ duration: 0.7, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: m.v >= 50 ? '#10B981' : m.v >= 25 ? '#FDF22F' : '#EF4444' }} />
                                        </div>
                                        <p className="text-[9px] text-gray-300 font-bold mt-1">{m.n}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[{ l: 'Total Applied', v: pf?.funnel?.applied ?? 0 }, { l: 'Total Hired', v: pf?.funnel?.hired ?? 0 }, { l: 'Active Jobs', v: pf?.metrics?.active_jobs ?? 0 }, { l: 'Retention Rate', v: `${pf?.metrics?.retention_rate ?? 0}%` }].map((m, i) => (
                                <div key={i} className={`rounded-2xl p-4 border text-center ${i === 0 ? 'bg-[#FDF22F]/10 border-[#FDF22F]/20' : 'bg-gray-50 border-gray-100'}`}>
                                    <p className="text-2xl font-black text-black tabular-nums">{m.v}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{m.l}</p>
                                </div>
                            ))}
                        </div>
                        {(pf?.sources ?? []).length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Application Sources</p>
                                <div className="space-y-3">
                                    {pf.sources.map((s: any, i: number) => {
                                        const st = pf.sources.reduce((a: number, x: any) => a + x.count, 0) || 1;
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-[11px] font-bold text-gray-600 w-24 truncate capitalize">{s.source || 'Unknown'}</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((s.count / st) * 100)}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} className="h-full bg-black rounded-full" />
                                                </div>
                                                <span className="text-[11px] font-black text-black w-8 text-right tabular-nums">{s.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            case 'interviews': {
                const ivs = Array.isArray(panelData) ? panelData : [];
                return (
                    <div className="space-y-4">
                        {ivs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Calendar size={32} className="text-gray-200" />
                                <p className="text-sm text-gray-400 italic">No interviews scheduled</p>
                            </div>
                        ) : ivs.map((iv: any, i: number) => {
                            const dt = iv.scheduled_at ? new Date(iv.scheduled_at) : null;
                            const isPast = dt ? dt < new Date() : false;
                            return (
                                <div key={i} className={`p-4 rounded-2xl border ${isPast ? 'bg-gray-50 border-gray-100' : 'bg-white border-[#FDF22F]/30 shadow-sm'}`}>
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-[#FDF22F] text-black'}`}>{iv.applicant?.name?.charAt(0) ?? 'A'}</div>
                                            <div>
                                                <p className="text-[13px] font-black text-black">{iv.applicant?.name ?? '—'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{iv.type?.replace(/_/g, ' ') ?? 'Interview'}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${isPast ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#FDF22F]/10 text-black border-[#FDF22F]/30'}`}>{isPast ? 'Completed' : 'Upcoming'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 ml-12">
                                        {dt && <span className="text-[11px] text-gray-500 font-bold">{dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
                                        {iv.location && <span className="text-[11px] text-gray-400">📍 {iv.location}</span>}
                                        {iv.interviewer?.name && <span className="text-[11px] text-gray-400">👤 {iv.interviewer.name}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }

            case 'candidates':
                return (
                    <div className="space-y-3">
                        {!(panelData || []).length ? <p className="text-sm text-gray-400 italic text-center py-8">No candidates found</p>
                            : (panelData || []).map((app: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-black transition-all bg-white">
                                    <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shrink-0">{app.name?.charAt(0)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-black truncate">{app.name}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{app.job_posting?.title ?? '—'}</p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${STATUS_COLOR[app.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}>{app.status?.replace(/_/g, ' ') ?? 'new'}</span>
                                </div>
                            ))}
                        <button onClick={() => { setActivePanel(null); router.push('/dashboard?tab=Candidates'); }} className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FDF22F] text-black font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-[#FDF22F] transition-all">
                            View Full Candidate List <ArrowRight size={14} />
                        </button>
                    </div>
                );

            default: return null;
        }
    };

    const PANEL_META: Record<string, { title: string; subtitle: string }> = {
        employees: { title: 'Employees', subtitle: 'Active hired headcount' },
        turnover: { title: 'Turnover Analysis', subtitle: 'Monthly separation data' },
        performance: { title: 'Performance', subtitle: 'Hiring efficiency metrics' },
        interviews: { title: 'Interviews', subtitle: 'Scheduled & recent sessions' },
        candidates: { title: 'Candidates', subtitle: 'Full applicant pipeline' },
    };

    /* ── RENDER ──────────────────────────────────────────── */
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
                                const tabs = localTab === 'JOBS' ? ['ACTIVE', 'ARCHIVED'] : localTab === 'HIRING PLAN' ? ['PENDING', 'ALL'] : ['OVERVIEW'];
                                return tabs.map(t => (
                                    <button key={t} onClick={() => setSubTab(t)} className={`text-[11px] font-black tracking-widest transition-all relative ${subTab === t ? 'text-[#000000]' : 'text-gray-400 hover:text-gray-600'}`}>
                                        {t}{subTab === t && <motion.div layoutId="activeSubTabHR" className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#FDF22F] rounded-full" />}
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
                {localTab === 'HIRING PLAN' && selectedIds.length > 0 && (
                    <button onClick={handleBulkApprove} disabled={actionLoading} className="w-full sm:w-auto bg-[#FDF22F] hover:bg-black text-[#000000] hover:text-[#FDF22F] px-6 sm:px-8 py-3.5 rounded-2xl font-black text-[12px] sm:text-[13px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#FDF22F]">
                        <Check size={16} /> Approve Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            {loading ? (
                <div className="bg-white rounded-[32px] border border-gray-100 p-20 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">

                    {/* JOBS TAB */}
                    {localTab === 'JOBS' && (
                        <>
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                        <tr>{['Position', 'Department', 'Location', 'Status', 'Applicants'].map(h => <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {jobs.length === 0 ? <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">No jobs posted yet.</td></tr>
                                            : jobs.map(job => (
                                                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-6 font-black text-[13px]">{job.title}</td>
                                                    <td className="px-6 py-6 text-[13px] text-gray-600">{job.department || job.requisition?.department || '—'}</td>
                                                    <td className="px-6 py-6 text-[13px] text-gray-600">{job.location || '—'}</td>
                                                    <td className="px-6 py-6"><span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span></td>
                                                    <td className="px-6 py-6 text-[13px] font-black">{job.applicants_count ?? 0}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="sm:hidden divide-y divide-gray-50">
                                {jobs.map(job => (
                                    <div key={job.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-black text-[14px]">{job.title}</p>
                                            <span className="shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">{job.status}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                            <span className="text-[12px] text-gray-400">{job.department || '—'}</span>
                                            <span className="text-[12px] font-black">{job.applicants_count ?? 0} applicants</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {jobsMeta?.last_page > 1 && (
                                <div className="px-5 sm:px-8 py-4 sm:py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Page {jobsPage} of {jobsMeta.last_page}</span>
                                    <div className="flex items-center gap-2">
                                        <button disabled={jobsPage === 1} onClick={() => setJobsPage(p => p - 1)} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] disabled:opacity-30"><ChevronLeft size={16} /></button>
                                        <button disabled={jobsPage === jobsMeta.last_page} onClick={() => setJobsPage(p => p + 1)} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-[#FDF22F] disabled:opacity-30"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* HIRING PLAN TAB */}
                    {localTab === 'HIRING PLAN' && (
                        <>
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                        <tr>
                                            <th className="pl-6 py-4 w-10"><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? pendingReqs.map(r => r.id) : [])} checked={pendingReqs.length > 0 && selectedIds.length === pendingReqs.length} className="accent-[#FDF22F] w-4 h-4" /></th>
                                            {['REQUISITION', 'GENERAL MANAGER', 'LOCATION', 'SALARY', 'SUBMITTED ON', 'POSTED TO PORTAL', 'STATUS'].map(h => <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {requisitions.length === 0 ? <tr><td colSpan={8} className="px-8 py-20 text-center text-gray-400 italic">No requisitions.</td></tr>
                                            : requisitions.map(req => (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <td className="pl-6 py-6" onClick={e => e.stopPropagation()}>
                                                        {(req.status === 'pending_md' || req.status === 'pending_hr') && <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={e => setSelectedIds(p => e.target.checked ? [...p, req.id] : p.filter(id => id !== req.id))} className="accent-[#FDF22F] w-4 h-4" />}
                                                    </td>
                                                    <td className="px-6 py-6" onClick={() => setDrawerReq(req)}>
                                                        <p className="font-black text-[13px]">REQ{req.id} {req.title}</p>
                                                        <p className="text-[11px] text-gray-400 mt-0.5">{req.department}</p>
                                                    </td>
                                                    <td className="px-6 py-6 text-[13px] text-gray-600">{req.requester?.name || 'General Manager'}</td>
                                                    <td className="px-6 py-6 text-[13px] text-gray-600">{req.location || '—'}</td>
                                                    <td className="px-6 py-6 text-[13px] font-black tabular-nums">{req.budget ? req.budget.toLocaleString() : '15,000'} ETB /mo</td>
                                                    <td className="px-6 py-6">{req.created_at ? (() => { const d = new Date(req.created_at); return <div><p className="text-[12px] font-bold">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-[11px] text-gray-400">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p></div>; })() : <span className="text-gray-300">—</span>}</td>
                                                    <td className="px-6 py-6">{req.job_posting?.created_at ? <span className="text-[12px] font-bold text-emerald-600">{new Date(req.job_posting.published_at || req.job_posting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> : <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">Not Posted</span>}</td>
                                                    <td className="px-6 py-6">
                                                        {canApprove(req) ? (
                                                            <div className="flex gap-2">
                                                                <button onClick={e => { e.stopPropagation(); handleApprove(req.id); }} className="text-[10px] font-black bg-[#FDF22F] px-4 py-2 rounded-xl hover:bg-black hover:text-[#FDF22F] transition-all uppercase tracking-widest">Approve</button>
                                                                {isMD && <button onClick={e => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('amend'); setDrawerReq(req); }} className="text-[10px] font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-xl uppercase tracking-widest">Amend</button>}
                                                                <button onClick={e => { e.stopPropagation(); setFeedbackTarget(req.id); setActionType('reject'); setDrawerReq(req); }} className="text-[10px] font-black text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest">Reject</button>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : req.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>{req.status.replace(/_/g, ' ')}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="lg:hidden divide-y divide-gray-50">
                                {requisitions.map(req => (
                                    <div key={req.id} className="px-4 py-5" onClick={() => setDrawerReq(req)}>
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <p className="font-black text-[13px]">REQ{req.id} {req.title}</p>
                                            <span className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{req.status.replace(/_/g, ' ')}</span>
                                        </div>
                                        {canApprove(req) && (
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleApprove(req.id)} className="flex-1 text-[10px] font-black bg-[#FDF22F] py-2 rounded-xl uppercase tracking-widest">Approve</button>
                                                <button onClick={() => { setFeedbackTarget(req.id); setActionType('reject'); setDrawerReq(req); }} className="flex-1 text-[10px] font-black text-gray-400 bg-white py-2 rounded-xl border border-gray-100 uppercase tracking-widest">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* REPORTS TAB */}
                    {localTab === 'REPORTS' && (
                        <div className="bg-[#F5F6FA] h-[calc(100vh-180px)] flex flex-col lg:flex-row overflow-hidden">

                            {/* Mobile top bar */}
                            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#FDF22F] rounded-xl flex items-center justify-center font-black text-black text-base shadow-md">D</div>
                                    <p className="text-[13px] font-black text-black">Droga Pharma · Hiring Hub</p>
                                </div>
                                <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-xl border border-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                </button>
                            </div>

                            {/* Sidebar */}
                            <div className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-[280px] bg-white border-r border-gray-100 flex-col shrink-0 h-full shadow-xl z-20`}>
                                <div className="hidden lg:block px-5 py-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-[#FDF22F] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md">D</div>
                                        <div><p className="text-[13px] font-black text-black leading-none">Droga Pharma</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mt-0.5">Hiring Hub</p></div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0 pb-10">
                                    <div className="px-3 py-5 flex flex-col space-y-3 h-max min-h-min">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">Main</p>

                                        {/* Dashboard - active */}
                                        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FDF22F] text-black shadow-md shrink-0">
                                            <BarChart2 size={15} /><span className="text-[13px] font-bold">Dashboard</span><div className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />
                                        </div>

                                    {/* Candidates → opens panel */}
                                    <button onClick={() => openPanel('candidates')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                        <Users size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Candidates</span>
                                    </button>

                                    {/* Jobs → navigates */}
                                    <button onClick={() => router.push('/dashboard?tab=Jobs')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                        <Briefcase size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Jobs</span>
                                    </button>

                                    {/* Hiring Plan → navigates */}
                                    <button onClick={() => router.push('/dashboard?tab=HiringPlan')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                        <FileText size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Hiring Plan</span>
                                    </button>

                                    {/* Interviews → opens panel */}
                                    <button onClick={() => openPanel('interviews')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                        <Activity size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Interviews</span>
                                    </button>

                                    {/* Reports */}
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                        <PieChart size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Reports</span>
                                    </button>

                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">Analytics</p>

                                        {/* Employees → opens panel */}
                                        <button onClick={() => openPanel('employees')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                            <Users size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Employees</span>
                                        </button>

                                        {/* Turnover → opens panel */}
                                        <button onClick={() => openPanel('turnover')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                            <TrendingDown size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Turnover</span>
                                        </button>

                                        {/* Performance → opens panel */}
                                        <button onClick={() => openPanel('performance')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                                            <TrendingUp size={15} className="text-gray-400 group-hover:text-black transition-colors" /><span className="text-[13px] font-bold">Performance</span>
                                        </button>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-gray-100">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">System</p>
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-black transition-all">
                                            <span className="text-sm">⚙️</span><span className="text-[13px] font-bold">Settings</span>
                                        </button>
                                        <button 
                                            onClick={() => openPanel('help')}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activePanel === 'help' ? 'bg-[#FDF22F] text-black shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
                                        >
                                            <span className="text-sm">❓</span><span className="text-[13px] font-bold">Help & Support</span>
                                        </button>
                                    </div>

                                    {/* Professional Awareness Card - Strategic Insight Command Center */}
                                    <div className="mx-3 mt-8 p-6 bg-gradient-to-br from-white to-gray-50 rounded-[40px] border border-gray-200/60 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group/card transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col">
                                        {/* Subtle pattern background */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#FDF22F_1px,transparent_1px)] [background-size:16px_16px]" />
                                        
                                        <div className="relative z-10">
                                            {/* 1. Management: Insights Hub */}
                                            <div className="mb-10">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-9 h-9 rounded-2xl bg-[#FDF22F] flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(253,242,47,0.4)] transition-transform duration-500 group-hover/card:scale-110">
                                                        <Target size={18} className="text-black" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[12px] font-black text-black uppercase tracking-[0.2em] block leading-none">Management</span>
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Insights Hub</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-[15px] font-black text-black leading-tight mb-2 tracking-tight">Lead with Purpose</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                                            Identifying the next generation of leaders who resonate with the mission to deliver health with excellence.
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        {[
                                                            { title: 'Value Alignment', desc: 'Prioritizing candidate-culture fit for sustainable retention.' },
                                                            { title: 'Brand Authority', desc: 'Your reputation is your most effective recruiter.' },
                                                            { title: 'Data Intelligence', desc: 'Shift from reactive hiring to predictive talent mapping.' }
                                                        ].map((item, idx) => (
                                                            <div key={idx} className="flex items-start gap-3.5 group/item">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FDF22F] mt-1.5 shrink-0 shadow-[0_0_10px_rgba(253,242,47,0.6)]" />
                                                                <div>
                                                                    <p className="text-[10px] text-black font-black uppercase tracking-wider leading-none">{item.title}</p>
                                                                    <p className="text-[9px] text-gray-400 font-bold mt-1.5 leading-tight">{item.desc}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Global Standards (Performance Metrics) */}
                                            <div className="mb-10 pt-8 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Globe size={13} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Standards</span>
                                                </div>
                                                <div className="bg-white/60 rounded-[28px] p-5 border border-gray-100 relative shadow-sm">
                                                    <p className="text-[10px] text-gray-600 font-bold leading-relaxed italic pr-4">
                                                        &ldquo;Premium employer branding reduces <span className="text-black">cost-per-hire by 50%</span> and <span className="text-black">turnover by 28%</span>.&rdquo;
                                                    </p>
                                                    <div className="absolute right-4 bottom-4 opacity-10"><BarChart2 size={16} /></div>
                                                </div>
                                            </div>

                                            {/* 3. Global HR Standards (Certifications) */}
                                            <div className="mb-10 pt-8 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <CheckCircle2 size={13} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Standards</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#FDF22F]/40 group/std">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-black text-black">ISO 30414 Certified</span>
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 font-bold leading-tight line-clamp-2">
                                                            Adhering to international Human Capital Reporting standards for sustainable organizational growth.
                                                        </p>
                                                    </div>
                                                    <div className="p-4 rounded-3xl bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-[#FDF22F]/40 group/std">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-black text-black">DEI Governance</span>
                                                            <span className="text-[8px] font-black text-[#FDF22F] bg-black px-1.5 py-0.5 rounded-full">LEVEL 4</span>
                                                        </div>
                                                        <p className="text-[9px] text-gray-400 font-bold leading-tight line-clamp-2">
                                                            Maintaining Level 4 on the Global Diversity and Inclusion Maturity Index.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. HR Advocacy Trends */}
                                            <div className="mb-10 pt-8 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <Award size={13} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advocacy Trends</span>
                                                </div>
                                                <div className="bg-[#FDF22F]/5 rounded-[32px] p-5 border border-[#FDF22F]/20">
                                                    <h5 className="text-[11px] font-black text-black uppercase tracking-tight mb-2">Employer of Choice</h5>
                                                    <p className="text-[9px] text-gray-500 font-bold leading-relaxed mb-4">
                                                        Currently recognized in the top 5% for workplace culture and employee advocacy indices.
                                                    </p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-[#FDF22F]/20">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Hiring Hub Vision</span>
                                                        <span className="text-[8px] font-black text-black uppercase bg-[#FDF22F] px-2 py-0.5 rounded-full">Core Release</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6. Growth Roadmap */}
                                            <div className="pt-8 border-t border-gray-100 mt-auto">
                                                <div className="flex items-center gap-2 mb-6">
                                                    <Layers size={13} className="text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Roadmap</span>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="relative pl-7 group/step">
                                                        <div className="absolute left-0 top-0 w-[2px] h-full bg-gray-100 group-last/step:h-0" />
                                                        <div className="absolute left-[-4px] top-0 w-2.5 h-2.5 rounded-full bg-[#FDF22F] ring-4 ring-white shadow-sm" />
                                                        <h6 className="text-[10px] font-black text-black uppercase tracking-wide leading-none mb-1.5">AI Integration Phase</h6>
                                                        <p className="text-[9px] text-gray-400 font-bold leading-relaxed">Implementing intelligent, automated screening workflows for high-volume technical roles.</p>
                                                    </div>
                                                    <div className="relative pl-7 group/step">
                                                        <div className="absolute left-0 top-0 w-[2px] h-full bg-gray-100 group-last/step:h-0" />
                                                        <div className="absolute left-[-3px] top-0 w-2 h-2 rounded-full bg-gray-200 ring-4 ring-white" />
                                                        <h6 className="text-[10px] font-black text-gray-300 uppercase tracking-wide leading-none mb-1.5">Global Expansion</h6>
                                                        <p className="text-[9px] text-gray-400 font-bold leading-relaxed">Integrated multi-currency and localized portal support for international hiring pipelines.</p>
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-6 border-t border-gray-100 bg-white/50 backdrop-blur-md">
                                    <div className="bg-white rounded-3xl p-4 flex items-center gap-4 border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.08)] transition-all cursor-pointer group/profile">
                                        <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shrink-0 shadow-lg group-hover/profile:scale-110 transition-transform">{user.name.charAt(0)}</div>
                                        <div className="min-w-0 flex-1"><p className="text-[13px] font-black text-black truncate group-hover/profile:text-[#FDF22F] transition-colors">{user.name}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">HR Manager</p></div>
                                        <button onClick={onLogout} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-[#FDF22F] transition-all group-hover/profile:rotate-45">
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right content */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                                {/* Top bar */}
                                <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center shadow-sm gap-3">
                                    <div className="relative w-full sm:w-80">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                                        <input type="text" placeholder="Search anything..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#FDF22F]/50 border border-transparent transition-all" />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="relative">
                                            <button onClick={() => setDateDropdownOpen(!dateDropdownOpen)} className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] bg-black text-[#FDF22F] rounded-xl px-5 py-2.5 cursor-pointer hover:bg-[#1a1a1a] transition-all">
                                                <span>{[{ label: 'Last 7 Days', value: '7' }, { label: 'Last 30 Days', value: '30' }, { label: 'Last 90 Days', value: '90' }, { label: 'Last Year', value: '365' }].find(o => o.value === reportFilters.dateRange)?.label || `Year ${reportFilters.dateRange}`}</span>
                                                <Filter size={12} className={dateDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                            </button>
                                            <AnimatePresence>
                                                {dateDropdownOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-[110]" onClick={() => setDateDropdownOpen(false)} />
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[120] py-2">
                                                            {[{ label: 'Last 7 Days', value: '7' }, { label: 'Last 30 Days', value: '30' }, { label: 'Last 90 Days', value: '90' }, { label: 'Last Year', value: '365' }, { label: `${new Date().getFullYear()}`, value: `${new Date().getFullYear()}` }, { label: `${new Date().getFullYear() - 1}`, value: `${new Date().getFullYear() - 1}` }].map(opt => (
                                                                <button key={opt.value} onClick={() => { setReportFilters(f => ({ ...f, dateRange: opt.value })); setDateDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-between ${reportFilters.dateRange === opt.value ? 'bg-[#FDF22F] text-black' : 'text-gray-500 hover:bg-gray-50'}`}>
                                                                    {opt.label}{reportFilters.dateRange === opt.value && <Check size={12} />}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-100">
                                            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shadow-lg">{user.name.charAt(0)}</div>
                                            <div><p className="text-[13px] font-black text-black leading-none">{user.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">HR Manager</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-10 space-y-10 sm:space-y-12 overflow-y-auto flex-1 bg-[#F5F6FA]/50">

                                    {/* Welcome */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }} 
                                        whileInView={{ opacity: 1, x: 0 }} 
                                        viewport={{ once: false }}
                                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                                    >
                                        <div>
                                            <h2 className="text-[28px] sm:text-[36px] font-black text-black tracking-tight leading-none group">
                                                Welcome back, {user.name.split(' ')[0]}
                                                <motion.span 
                                                    animate={{ scale: [1, 1.2, 1] }} 
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="inline-block ml-3 w-3 h-3 rounded-full bg-[#FDF22F] shadow-[0_0_15px_rgba(253,242,47,1)] align-middle" 
                                                />
                                            </h2>
                                            <p className="text-gray-400 text-[12px] font-black mt-3 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Target size={12} className="text-[#FDF22F]" />
                                                Talent Acquisition Dashboard · Performance Hub
                                            </p>
                                        </div>
                                        {/* Export Excel */}
                                        <button
                                            onClick={handleExport}
                                            disabled={!stats}
                                            className="flex items-center gap-2 bg-[#FDF22F] text-black px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-[11px] tracking-widest uppercase hover:bg-black hover:text-[#FDF22F] transition-all shadow-lg shadow-[#FDF22F]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Download size={13} />
                                            Export Report
                                        </button>
                                    </motion.div>

                                    {/* KPI Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                                        {[
                                            { label: 'Total Employees', value: totalEmployees > 0 ? totalEmployees.toLocaleString() : '—', icon: Users, trend: `${activeJobsCount} open`, trendUp: true, accent: true },
                                            { label: 'Active Applicants', value: appliedCount > 0 ? appliedCount.toLocaleString() : '—', icon: FileText, trend: `${hiredCount} hired`, trendUp: hiredCount > 0 },
                                            { label: 'Retention Rate', value: stats ? `${retentionRate}%` : '—', icon: Target, trend: retentionRate >= 80 ? 'Healthy' : 'At Risk', trendUp: retentionRate >= 80 },
                                            { label: 'Open Positions', value: stats ? activeJobsCount.toLocaleString() : '—', icon: Briefcase, trend: 'Live now', trendUp: true },
                                        ].map((card, i) => <StatCard key={i} {...card} delay={i * 0.1} />)}
                                    </div>

                                    {/* Charts */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                                        {/* Turnover */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30, rotateX: 5 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                                            whileHover={{ y: -8, boxShadow: '0 30px 45px -15px rgba(0,0,0,0.15)' }}
                                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
                                            className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                                                <div>
                                                    <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Employee Turnover</h3>
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Monthly Rate · {reportFilters.dateRange.length > 3 ? `Year ${reportFilters.dateRange}` : '12 Month View'}</p>
                                                </div>
                                                <div className="flex items-center gap-2 bg-[#FDF22F]/10 border border-[#FDF22F]/30 px-3 py-1.5 rounded-xl">
                                                    <div className="w-2 h-2 rounded-full bg-[#FDF22F] animate-pulse" /><span className="text-[10px] font-black text-black uppercase tracking-widest">Live</span>
                                                </div>
                                            </div>
                                            <div className="relative h-40 sm:h-52">
                                                <AnimatePresence>
                                                    {hoveredTurnover && (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-0 z-30 pointer-events-none"
                                                            style={{ left: `${turnoverData.length > 1 ? (hoveredTurnover.index * 100) / (turnoverData.length - 1) : 50}%`, transform: hoveredTurnover.index === 0 ? 'translateX(0)' : hoveredTurnover.index === turnoverData.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)', marginTop: '-60px' }}>
                                                            <div className="bg-white/95 backdrop-blur-xl text-black px-5 py-4 rounded-[24px] shadow-2xl border border-gray-100 whitespace-nowrap min-w-[190px]">
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{hoveredTurnover.data.full_label}</p>
                                                                <div className="flex items-baseline gap-1 mb-3"><span className="text-[26px] font-black text-black tabular-nums">{hoveredTurnover.data.rate}</span><span className="text-[14px] font-black text-[#FDF22F]">%</span></div>
                                                                <div className="flex gap-4 border-t border-gray-100 pt-2">
                                                                    <div><p className="text-[8px] font-black text-emerald-500 uppercase">Resigned</p><p className="text-[15px] font-black">{hoveredTurnover.data.resigned}</p></div>
                                                                    <div><p className="text-[8px] font-black text-rose-500 uppercase">Terminated</p><p className="text-[15px] font-black">{hoveredTurnover.data.terminated}</p></div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {turnoverData.length > 1 ? (
                                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                                                        <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FDF22F" stopOpacity="0.25" /><stop offset="100%" stopColor="#FDF22F" stopOpacity="0" /></linearGradient></defs>
                                                        {[50, 100, 150].map(y => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F3F4F6" strokeWidth="1" />)}
                                                        <path d={svgArea} fill="url(#areaGrad)" />
                                                        <path d={svgPath} fill="none" stroke="#FDF22F" strokeWidth="3.5" strokeLinecap="round" />
                                                        {svgPts.map((p: { x: number; y: number }, i: number) => (
                                                            <g key={i} onMouseEnter={() => setHoveredTurnover({ data: turnoverData[i], index: i })} onMouseLeave={() => setHoveredTurnover(null)}>
                                                                <circle cx={p.x} cy={p.y} r="22" fill="transparent" className="cursor-pointer" />
                                                                <circle cx={p.x} cy={p.y} r={hoveredTurnover?.index === i ? 7 : 4} fill={hoveredTurnover?.index === i ? '#000' : '#FDF22F'} stroke={hoveredTurnover?.index === i ? '#FDF22F' : '#fff'} strokeWidth="2" className="transition-all duration-200" />
                                                            </g>
                                                        ))}
                                                    </svg>
                                                ) : <div className="flex items-center justify-center h-full"><p className="text-[12px] text-gray-400">No turnover data for this period</p></div>}
                                            </div>
                                            <div className="flex justify-between mt-2 px-1">
                                                {turnoverData.map((d: any, i: number) => <span key={i} className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase">{d.label}</span>)}
                                            </div>
                                        </motion.div>

                                        {/* Funnel */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30, rotateX: -5 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                                            whileHover={{ y: -8, boxShadow: '0 30px 45px -15px rgba(0,0,0,0.15)' }}
                                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
                                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8"
                                        >
                                            <div className="mb-6">
                                                <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Hiring Funnel</h3>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">Candidate Pipeline · {reportFilters.dateRange.length > 3 ? reportFilters.dateRange : new Date().getFullYear()}</p>
                                            </div>
                                            <div className="space-y-5">
                                                <FunnelBar label="Applied" value={stats?.funnel?.applied ?? 0} max={funnelMax} color="#FDF22F" index={0} />
                                                <FunnelBar label="Screening" value={stats?.funnel?.screening ?? 0} max={funnelMax} color="#000000" index={1} />
                                                <FunnelBar label="Interviewing" value={stats?.funnel?.interviewing ?? 0} max={funnelMax} color="#374151" index={2} />
                                                <FunnelBar label="Offered" value={stats?.funnel?.offer ?? 0} max={funnelMax} color="#6B7280" index={3} />
                                                <FunnelBar label="Hired" value={stats?.funnel?.hired ?? 0} max={funnelMax} color="#10B981" index={4} />
                                            </div>
                                            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                                                <div className="bg-[#FDF22F]/10 border border-[#FDF22F]/20 rounded-2xl p-4 text-center">
                                                    <p className="text-2xl font-black text-black tabular-nums">{appliedCount}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Applied</p>
                                                </div>
                                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                                                    <p className="text-2xl font-black text-emerald-600 tabular-nums">{hiredCount}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Hired</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Secondary row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                                        {/* Dept breakdown */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30, rotateX: 5 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                                            whileHover={{ y: -8, boxShadow: '0 30px 45px -15px rgba(0,0,0,0.15)' }}
                                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.3 }}
                                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8"
                                        >
                                            <div className="flex items-center justify-between mb-5">
                                                <div><h3 className="text-[15px] sm:text-[16px] font-black text-black">By Department</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Applicant distribution</p></div>
                                                <div className="w-14 h-14">{byDepartment.length > 0 ? <DonutChart data={byDepartment.slice(0, 5).map((d: any) => ({ label: d.department, value: d.count }))} colors={DEPT_COLORS} /> : <PieChart size={20} className="text-gray-200 m-auto mt-3" />}</div>
                                            </div>
                                            <div className="space-y-3.5">
                                                {byDepartment.length > 0 ? byDepartment.slice(0, 5).map((dept: any, i: number) => {
                                                    const total = byDepartment.reduce((a: number, d: any) => a + d.count, 0) || 1;
                                                    return (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DEPT_COLORS[i] }} />
                                                            <span className="text-[12px] font-bold text-gray-600 flex-1 truncate">{dept.department}</span>
                                                            <div className="w-16 sm:w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }} 
                                                                    whileInView={{ width: `${Math.round((dept.count / total) * 100)}%` }} 
                                                                    viewport={{ once: false }}
                                                                    transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }} 
                                                                    className="h-full rounded-full" 
                                                                    style={{ background: DEPT_COLORS[i] }} 
                                                                />
                                                            </div>
                                                            <span className="text-[12px] font-black text-black w-8 text-right tabular-nums">{dept.count}</span>
                                                        </div>
                                                    );
                                                }) : <p className="text-[12px] text-gray-400 italic text-center py-4">No department data</p>}
                                            </div>
                                        </motion.div>

                                        {/* Time to hire */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                            viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                                            whileHover={{ y: -10, scale: 1.02, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', transition: { duration: 0.3 } }}
                                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.4 }}
                                            className="bg-black rounded-[32px] shadow-sm p-5 sm:p-8 relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FDF22F]/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FDF22F]/5 rounded-full translate-y-10 -translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-[15px] sm:text-[16px] font-black text-white">Time to Hire</h3>
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><Clock size={16} className="text-[#FDF22F]" /></motion.div>
                                                </div>
                                                <div className="text-center py-4">
                                                    <motion.p 
                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                        whileInView={{ scale: 1, opacity: 1 }}
                                                        viewport={{ once: false }}
                                                        transition={{ duration: 0.8, type: "spring", damping: 12, delay: 0.6 }}
                                                        className="text-6xl sm:text-7xl font-black text-[#FDF22F] tabular-nums leading-none"
                                                    >
                                                        {stats ? (avgTimeToHire > 0 ? avgTimeToHire : '—') : '—'}
                                                    </motion.p>
                                                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mt-3">Average Days to Hire</p>
                                                </div>
                                                <div className="mt-6 grid grid-cols-2 gap-3">
                                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:border-white/20 transition-colors"><p className="text-2xl font-black text-white tabular-nums">{hiredCount}</p><p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-1">Hired</p></div>
                                                    <div className="bg-[#FDF22F]/10 rounded-2xl p-4 border border-[#FDF22F]/20 group-hover:border-[#FDF22F]/40 transition-colors"><p className="text-2xl font-black text-[#FDF22F] tabular-nums">{activeJobsCount}</p><p className="text-[9px] font-black text-[#FDF22F]/60 uppercase tracking-widest mt-1">Open Roles</p></div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Applications bar chart */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 30, rotateX: -5 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                                            whileHover={{ y: -8, boxShadow: '0 30px 45px -15px rgba(0,0,0,0.15)' }}
                                            transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: 0.5 }}
                                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8"
                                        >
                                            <div className="flex items-center justify-between mb-5">
                                                <div><h3 className="text-[15px] sm:text-[16px] font-black text-black">Applications</h3><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Monthly volume trend</p></div>
                                                <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-[#FDF22F] group-hover:text-black transition-colors"><BarChart2 size={16} className="text-gray-400 group-hover:text-inherit" /></div>
                                            </div>
                                            <div className="h-32 sm:h-36">{stats?.timeline?.length > 0 ? <BarTimeline data={stats.timeline} /> : <div className="flex items-center justify-center h-full"><p className="text-[12px] text-gray-400 italic">No timeline data</p></div>}</div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Period</p><p className="text-xl font-black text-black tabular-nums">{appliedCount}</p></div>
                                                <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg / Month</p><p className="text-xl font-black text-black tabular-nums">{stats?.timeline?.length > 0 ? Math.round(stats.timeline.reduce((s: number, d: any) => s + d.count, 0) / stats.timeline.length) : '—'}</p></div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Recent applications */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 30 }} 
                                        whileInView={{ opacity: 1, y: 0 }} 
                                        viewport={{ once: false, amount: 0.1, margin: "-50px 0px" }}
                                        transition={{ duration: 0.7, delay: 0.6 }}
                                        className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-5 sm:px-10 py-5 sm:py-7 border-b border-gray-50">
                                            <div>
                                                <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">Recent Applications</h3>
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">
                                                    {recentFilter.status !== 'All' ? `Filtered: ${recentFilter.status.replace(/_/g, ' ')}` : 'Latest candidate submissions'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 sm:gap-3 items-center relative">
                                                {/* Filter Button + Dropdown */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setFilterDropdownOpen(v => !v)}
                                                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            recentFilter.status !== 'All' || recentFilter.department !== 'All'
                                                                ? 'bg-black text-[#FDF22F] border-black'
                                                                : 'bg-white border-gray-200 hover:border-black'
                                                        }`}
                                                    >
                                                        <Filter size={12} />
                                                        Filter
                                                        {(recentFilter.status !== 'All' || recentFilter.department !== 'All') && (
                                                            <span className="w-4 h-4 rounded-full bg-[#FDF22F] text-black flex items-center justify-center text-[8px] font-black">
                                                                {[recentFilter.status !== 'All', recentFilter.department !== 'All'].filter(Boolean).length}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Dropdown */}
                                                    {filterDropdownOpen && (
                                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4 space-y-4">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter Applicants</p>
                                                                <button onClick={() => { setRecentFilter({ status: 'All', department: 'All' }); setFilterDropdownOpen(false); }} className="text-[9px] font-black text-gray-300 hover:text-black uppercase tracking-widest transition-colors">Clear All</button>
                                                            </div>

                                                            {/* Status filter */}
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Status</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {['All', 'new', 'written_exam', 'technical_interview', 'final_interview', 'offer', 'hired', 'rejected'].map(s => (
                                                                        <button
                                                                            key={s}
                                                                            onClick={() => setRecentFilter(f => ({ ...f, status: s }))}
                                                                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                                                recentFilter.status === s
                                                                                    ? 'bg-black text-[#FDF22F]'
                                                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                                            }`}
                                                                        >
                                                                            {s === 'All' ? 'All' : s.replace(/_/g, ' ')}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Department filter */}
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Department</p>
                                                                <select
                                                                    value={recentFilter.department}
                                                                    onChange={e => setRecentFilter(f => ({ ...f, department: e.target.value }))}
                                                                    className="w-full text-[11px] font-bold text-black bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-black appearance-none"
                                                                >
                                                                    <option value="All">All Departments</option>
                                                                    {[...new Set((jobs || []).map((j: any) => j.department || j.requisition?.department).filter(Boolean))].map((dept) => (
                                                                        <option key={String(dept)} value={String(dept)}>{String(dept)}</option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <button
                                                                onClick={() => setFilterDropdownOpen(false)}
                                                                className="w-full py-2.5 bg-black text-[#FDF22F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FDF22F] hover:text-black transition-all"
                                                            >
                                                                Apply
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50/80"><tr>{['Candidate', 'Position Applied', 'Department', 'Experience', 'Status', 'Applied On'].map(h => <th key={h} className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{h}</th>)}</tr></thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {recentLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-12 text-center">
                                                                <div className="flex items-center justify-center gap-3 text-gray-400">
                                                                    <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                                                                    <span className="text-[11px] font-black uppercase tracking-widest">Loading…</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : recentApplicants.length > 0 ? recentApplicants.map((app, i) => (
                                                        <motion.tr 
                                                            key={i} 
                                                            initial={{ opacity: 0, x: -10 }} 
                                                            whileInView={{ opacity: 1, x: 0 }} 
                                                            viewport={{ once: false }}
                                                            transition={{ delay: i * 0.05 }} 
                                                            className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                        >
                                                            <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-black flex items-center justify-center font-black text-xs text-[#FDF22F] shadow-md">{app?.name?.charAt(0) ?? 'A'}</div><div><p className="text-[13px] font-black text-black">{app?.name ?? '—'}</p><p className="text-[10px] text-gray-400 font-bold">{app?.email ?? '—'}</p></div></div></td>
                                                            <td className="px-8 py-5"><p className="text-[13px] font-black text-gray-700">{app?.job_posting?.title ?? app?.jobPosting?.title ?? '—'}</p></td>
                                                            <td className="px-8 py-5 text-[13px] text-gray-500 font-bold">{app?.job_posting?.department ?? app?.jobPosting?.department ?? '—'}</td>
                                                            <td className="px-8 py-5 text-[13px] font-black tabular-nums">{app?.years_of_experience != null ? `${app.years_of_experience} Yrs` : '—'}</td>
                                                            <td className="px-8 py-5"><span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${STATUS_COLOR[app?.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}><div className="w-1.5 h-1.5 rounded-full bg-current" />{app?.status?.replace(/_/g, ' ') ?? 'New'}</span></td>
                                                            <td className="px-8 py-5 text-[12px] font-bold text-gray-400 tabular-nums">{app?.created_at ? new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                                        </motion.tr>
                                                    )) : <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 italic">No applicants found{recentFilter.status !== 'All' ? ` with status "${recentFilter.status.replace(/_/g, ' ')}"` : ''}</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-5 sm:px-10 py-4 sm:py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
                                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                                {recentFilter.status !== 'All' || recentFilter.department !== 'All'
                                                    ? `${recentApplicants.length} result${recentApplicants.length !== 1 ? 's' : ''} · filtered`
                                                    : `Showing ${recentApplicants.length} recent`
                                                }
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics side panel */}
            <AnimatePresence>
                {activePanel && (
                    <SidePanel title={PANEL_META[activePanel]?.title} subtitle={PANEL_META[activePanel]?.subtitle} onClose={() => setActivePanel(null)} loading={panelLoading}>
                        {renderPanel()}
                    </SidePanel>
                )}
            </AnimatePresence>

            {/* Requisition drawer */}
            <AnimatePresence>
                {drawerReq && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed right-0 top-0 bottom-0 w-full sm:max-w-xl bg-white shadow-2xl z-[120] overflow-y-auto">
                            <div className="p-5 sm:p-8 border-b border-gray-100 flex justify-between items-start">
                                <div><p className="text-[10px] font-black tracking-widest uppercase mb-1">REQ{drawerReq.id}</p><h2 className="text-xl sm:text-2xl font-black">{drawerReq.title}</h2><p className="text-gray-400 text-sm mt-1">{drawerReq.department}</p></div>
                                <button onClick={() => { setDrawerReq(null); setFeedbackTarget(null); setActionType(null); }} className="text-gray-300 hover:text-gray-500 p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="p-5 sm:p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p><p className="text-sm font-bold">{drawerReq.location}</p></div>
                                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Salary Range</p><p className="text-sm font-black">{drawerReq.budget ? drawerReq.budget.toLocaleString() : '15,000'} ETB /mo</p></div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Job Description</h3>
                                    <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl border border-gray-100 border-dashed max-h-[300px] overflow-y-auto">
                                        {drawerReq.jd_content ? <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: drawerReq.jd_content }} /> : <p className="text-sm text-gray-400 italic">No JD content provided.</p>}
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Justification</h3>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-100 italic">{drawerReq.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                                {canApprove(drawerReq) && (
                                    <div className="pt-8 space-y-4 border-t border-gray-100">
                                        {feedbackTarget === drawerReq.id ? (
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest">{actionType === 'amend' ? 'Amendment Feedback' : 'Rejection Reason'}</p>
                                                <textarea value={feedbackReason} onChange={e => setFeedbackReason(e.target.value)} className={`w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none text-sm h-32 font-medium transition-all ${actionType === 'amend' ? 'border-amber-100 focus:ring-4 focus:ring-amber-50' : 'border-red-100 focus:ring-4 focus:ring-red-50'}`} />
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setFeedbackTarget(null); setActionType(null); }} className="flex-1 px-4 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[11px] font-black tracking-widest uppercase">Cancel</button>
                                                    <button onClick={handleAction} disabled={!feedbackReason.trim() || actionLoading} className={`flex-[2] px-4 py-4 text-white rounded-2xl text-[11px] font-black tracking-widest uppercase disabled:opacity-50 ${actionType === 'amend' ? 'bg-amber-600' : 'bg-black hover:bg-red-600'}`}>Confirm & Notify GM</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <button onClick={() => handleApprove(drawerReq.id)} disabled={actionLoading} className="flex-[2] px-6 py-5 bg-[#FDF22F] text-black rounded-[20px] text-[12px] font-black tracking-widest uppercase hover:bg-black hover:text-[#FDF22F] transition-all flex items-center justify-center gap-3">
                                                    Approve Requisition <ChevronRight size={18} />
                                                </button>
                                                {isMD && <button onClick={() => { setFeedbackTarget(drawerReq.id); setActionType('amend'); }} className="flex-1 px-6 py-5 bg-amber-50 text-amber-600 rounded-[20px] text-[12px] font-black tracking-widest uppercase border border-amber-100">Amend</button>}
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

            <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

            <ExportModal
                open={exportModal}
                onClose={() => setExportModal(false)}
                stats={stats}
                jobs={jobs || []}
                reportFilters={reportFilters}
                apiFetch={apiFetch}
            />
            {/* Premium Scrollbar Styling */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #FDF22F;
                }
            `}</style>
        </div>
    );
}

