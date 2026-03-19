"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch, API_URL, getStorageUrl } from "@/lib/api";
import ExportModal from "@/components/ExportModal";
import {
  Check, ChevronLeft, ChevronRight, FileText, CheckCircle2,
  TrendingUp, TrendingDown, Users, Briefcase, Target, Clock,
  Download, Filter, BarChart2, PieChart, Activity, X,
  Calendar, ArrowRight, LifeBuoy, BookOpen, MessageCircle,
  ExternalLink, HelpCircle, Search
} from "lucide-react";

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
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

  L.push(row('TALENT ACQUISITION REPORT — DROGA PHARMA'));
  L.push(row('Generated On', now));
  L.push(row('Reporting Period', period));
  L.push(row('Department', reportFilters.department === 'All' ? 'All Departments' : reportFilters.department));
  L.push('');

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

  L.push('"### 2. HIRING FUNNEL ###"');
  L.push(row('Stage', 'Count', 'Conversion Rate'));
  const ap = stats?.funnel?.applied || 1;
  L.push(row('Applied', stats?.funnel?.applied ?? 0, '100%'));
  L.push(row('Screening', stats?.funnel?.screening ?? 0, `${Math.round(((stats?.funnel?.screening ?? 0) / ap) * 100)}%`));
  L.push(row('Interviewing', stats?.funnel?.interviewing ?? 0, `${Math.round(((stats?.funnel?.interviewing ?? 0) / ap) * 100)}%`));
  L.push(row('Offered', stats?.funnel?.offer ?? 0, `${Math.round(((stats?.funnel?.offer ?? 0) / ap) * 100)}%`));
  L.push(row('Hired', stats?.funnel?.hired ?? 0, `${Math.round(((stats?.funnel?.hired ?? 0) / ap) * 100)}%`));
  L.push('');

  L.push('"### 3. MONTHLY APPLICATION VOLUME ###"');
  L.push(row('Month', 'Applications'));
  (stats?.timeline ?? []).forEach((t: any) => L.push(row(t.label, t.count)));
  L.push('');

  L.push('"### 4. APPLICANTS BY DEPARTMENT ###"');
  L.push(row('Department', 'Applicants', 'Share (%)'));
  const dt = (stats?.by_department ?? []).reduce((s: number, d: any) => s + d.count, 0) || 1;
  (stats?.by_department ?? []).forEach((d: any) => L.push(row(d.department, d.count, `${Math.round((d.count / dt) * 100)}%`)));
  L.push('');

  L.push('"### 5. APPLICATION SOURCE ATTRIBUTION ###"');
  L.push(row('Source', 'Applications', 'Share (%)'));
  const st2 = (stats?.sources ?? []).reduce((s: number, d: any) => s + d.count, 0) || 1;
  (stats?.sources ?? []).forEach((s: any) => L.push(row(s.source || 'Unknown', s.count, `${Math.round((s.count / st2) * 100)}%`)));
  L.push('');

  L.push('"### 6. ACTIVE JOB POSTINGS ###"');
  L.push(row('Job Title', 'Department', 'Location', 'Status', 'Applicants'));
  jobs.forEach((j: any) => L.push(row(j.title, j.department || j.requisition?.department || '—', j.location || '—', j.status, j.applicants_count ?? 0)));
  L.push('');

  L.push('"### 7. APPLICANT ROSTER ###"');
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
  a.download = `TA_TalentAcquisition_${(periodMap[reportFilters.dateRange] || reportFilters.dateRange).replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STATUS_COLOR_BAR: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600 border-blue-100',
  written_exam: 'bg-purple-50 text-purple-600 border-purple-100',
  technical_interview: 'bg-amber-50 text-amber-600 border-amber-100',
  final_interview: 'bg-orange-50 text-orange-600 border-orange-100',
  offer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  hired: 'bg-green-50 text-green-700 border-green-100',
  rejected: 'bg-red-50 text-red-600 border-red-100',
  talent_pool: 'bg-gray-100 text-gray-600 border-gray-200',
};
const DEPT_COLORS = ['#FDF22F', '#000000', '#374151', '#6B7280', '#D1D5DB'];

type ActivePanel = null | 'employees' | 'turnover' | 'performance' | 'interviews' | 'candidates' | 'help';


export default function TADashboard({
  user,
  activeTab: initialTab,
  onLogout,
}: {
  user: any;
  activeTab: string;
  onLogout: () => void;
}) {
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [requisitions, setRequisitions] = useState<any[] | null>(null);
  const [applicants, setApplicants] = useState<any[] | null>(null);
  const [applicantsPagination, setApplicantsPagination] = useState<any>(null);
  const [jobsPagination, setJobsPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState(""); // live search term from URL
  const [subTab, setSubTab] = useState("NEW"); // Represents the local view/stage
  const [drawerReq, setDrawerReq] = useState<any>(null);
  const [drawerApp, setDrawerApp] = useState<any>(null);
  const [postJobDeadline, setPostJobDeadline] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const [offerModal, setOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    salary: "",
    startDate: "",
    notes: "",
  });
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [reportFilters, setReportFilters] = useState({
    dateRange: "30",
    department: "All",
    jobId: "All",
  });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [interviewsList, setInterviewsList] = useState<any[]>([]);
  const [interviewsPagination, setInterviewsPagination] = useState<any>(null);
  const [applicantFilters, setApplicantFilters] = useState({
    experience: "All",
    department: "All",
    gender: "All",
    minScore: "",
  });
  const [jobFilters, setJobFilters] = useState({
    position: "",
    location: "All",
    department: "All",
    status: "All",
  });
  const [employeeFilters, setEmployeeFilters] = useState({
    experience: "All",
    department: "All",
    search: "",
    jobId: "All",
    hiredOn: "All",
    appliedOn: "All",
  });
  const [hiringPlanFilters, setHiringPlanFilters] = useState({
    location: "All",
    department: "All",
    salaryRange: "All",
    submittedOn: "All",
    portal: "All",
    status: "All",
    search: "",
  });



  // Unified Scheduling State
  const [globalScheduleModal, setGlobalScheduleModal] = useState(false);
  const [scheduleContext, setScheduleContext] = useState({
    targetStatus: "",
    interviewType: "",
    title: "",
    label: "",
  });
  const [globalScheduleForm, setGlobalScheduleForm] = useState<{
    date: string;
    time: string;
    location: string;
    interviewer_id: string;
    message: string;
    offered_salary: string;
    start_date: string;
    offer_notes: string;
    rejection_note: string;
    offer_letter: File | null;
  }>({
    date: "",
    time: "",
    location: "Main Office",
    interviewer_id: "",
    message: "You are invited for the next stage of the recruitment process.",
    // Extra fields for Offer/Hired/Rejected
    offered_salary: "",
    start_date: "",
    offer_notes: "",
    rejection_note: "",
    offer_letter: null,
  });

  // Scoring & Results Modal State
  const [scoringModal, setScoringModal] = useState(false);
  const [scoringForm, setScoringForm] = useState({
    written_exam_score: "",
    technical_interview_score: "",
    written_raw_score: "",
    written_out_of: "100",
    tech_raw_score: "",
    tech_out_of: "100",
    interviewer_feedback: "",
    exam_paper: null as File | null,
  });

  // Notifications & Mentions
  const [mentionUser, setMentionUser] = useState("");
  const [mentionNote, setMentionNote] = useState("");
  const [candidateViewMode, setCandidateViewMode] = useState<"table" | "grid">(
    "table",
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionSuccess, setMentionSuccess] = useState(false);
  const [departmentUsers, setDepartmentUsers] = useState<any[]>([]);

  // Manual Candidate Add Modal
  const [addCandidateModal, setAddCandidateModal] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "LinkedIn",
    job_posting_id: "",
  });
  const [candidateSuccess, setCandidateSuccess] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [employeeStatusModal, setEmployeeStatusModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employeeStatusForm, setEmployeeStatusForm] = useState({
    status: "active",
    reason: "",
    date: "",
  });
  const [employees, setEmployees] = useState<any[] | null>(null);
  const [employeesPagination, setEmployeesPagination] = useState<any>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pinnedNotifications, setPinnedNotifications] = useState<any[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedEmployeeSearch, setDebouncedEmployeeSearch] = useState("");
  const [debouncedHiringPlanSearch, setDebouncedHiringPlanSearch] =
    useState("");
  const [onboardingStartDate, setOnboardingStartDate] = useState("");
  const [onboardingForm, setOnboardingForm] = useState({
    contract_signed: false,
    id_verified: false,
    bank_account: "",
    tax_id: "",
    payroll_setup: false,
    workstation_ready: false,
    company_email: "",
    email_created: false,
    office_tour_done: false,
    orientation_date: "",
    orientation_done: false,
  });
  const [hiringPlanKpis, setHiringPlanKpis] = useState<any>(null);

  // Debounce global search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce employee-specific search
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedEmployeeSearch(employeeFilters.search),
      500,
    );
    return () => clearTimeout(timer);
  }, [employeeFilters.search]);

  // Debounce hiring plan search
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedHiringPlanSearch(hiringPlanFilters.search),
      500,
    );
    return () => clearTimeout(timer);
  }, [hiringPlanFilters.search]);

  // Sidebar & Analytics State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [panelData, setPanelData] = useState<any>(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [hoveredTurnover, setHoveredTurnover] = useState<any>(null);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [recentApplicants, setRecentApplicants] = useState<any[]>([]);


  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (drawerApp) {
      apiFetch("/v1/users").then((data) => setDepartmentUsers(data || []));
      
      if (drawerApp.status === "onboarding") {
        setOnboardingForm({
          contract_signed: !!drawerApp.contract_signed,
          id_verified: !!drawerApp.id_verified,
          bank_account: drawerApp.bank_account || "",
          tax_id: drawerApp.tax_id || "",
          payroll_setup: !!drawerApp.payroll_setup,
          workstation_ready: !!drawerApp.workstation_ready,
          company_email: drawerApp.company_email || "",
          email_created: !!drawerApp.email_created,
          office_tour_done: !!drawerApp.office_tour_done,
          orientation_date: drawerApp.orientation_date ? drawerApp.orientation_date.split('T')[0] : "",
          orientation_done: !!drawerApp.orientation_done,
        });
      }
    }
  }, [drawerApp]);

  /* ── Open panel ──────────────────────────────────────── */
  const openPanel = useCallback(async (panel: ActivePanel) => {
    setActivePanel(panel);
    setPanelData(null);
    setPanelLoading(true);
    try {
      if (panel === 'help') { setPanelLoading(false); return; }
      const params = new URLSearchParams({ 
        date_range: reportFilters.dateRange, 
        department: reportFilters.department 
      });
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

  const PANEL_META: Record<string, { title: string; subtitle: string }> = {
    employees: { title: 'Employees', subtitle: 'Active hired headcount' },
    turnover: { title: 'Turnover Analysis', subtitle: 'Monthly separation data' },
    performance: { title: 'Performance', subtitle: 'Hiring efficiency metrics' },
    interviews: { title: 'Interviews', subtitle: 'Scheduled & recent sessions' },
    candidates: { title: 'Candidates', subtitle: 'Full applicant pipeline' },
    help: { title: 'Help & Support', subtitle: 'Knowledge base & direct support' },
  };

  /* ── Panel content ───────────────────────────────────── */
  const renderPanel = () => {
    // Metrics derived from stats for side panels
    const appliedCount = stats?.funnel?.applied ?? 0;
    const hiredCount = stats?.funnel?.hired ?? 0;
    const activeJobsCount = stats?.metrics?.active_jobs ?? 0;
    const totalEmployees = stats?.metrics?.total_employees ?? 0;
    const retentionRate = stats?.metrics?.retention_rate ?? 0;
    const avgTimeToHire = stats?.avg_time_to_hire ?? 0;

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
        const tv = panelData?.turnover ?? stats?.turnover ?? [];
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
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shrink-0 ${STATUS_COLOR_BAR[app.status] ?? 'bg-gray-50 text-gray-400 border-gray-100'}`}>{app.status?.replace(/_/g, ' ') ?? 'new'}</span>
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


  /* ── Export ──────────────────────────────────────────── */
  const handleExport = () => setExportModal(true);

  const handleSendSupport = async () => {
    if (!supportMessage.trim()) return;
    setIsSendingSupport(true);
    try {
      const users = await apiFetch('/v1/messages/users');
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


  const searchParams = useSearchParams();
  const liveSearch = searchParams.get("search") ?? "";

  // Sync local search state with URL search param
  useEffect(() => {
    setSearch(liveSearch);
  }, [liveSearch]);

  const handleSendMention = async () => {
    if (!mentionUser || !mentionNote.trim()) return;
    setMentionLoading(true);
    setMentionSuccess(false);
    try {
      await apiFetch(`/v1/applicants/${drawerApp.id}/mention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: mentionUser, note: mentionNote }),
      });
      setMentionNote("");
      setMentionSuccess(true);
      setTimeout(() => setMentionSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setMentionLoading(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !candidateForm.name ||
      !candidateForm.email ||
      !candidateForm.job_posting_id
    )
      return;
    setActionLoading(true);
    try {
      await apiFetch("/v1/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateForm),
      });
      setCandidateSuccess(true);

      // Refresh data immediately
      fetchData(currentPage);

      // Wait 2 seconds before closing modal to show success message
      setTimeout(() => {
        setCandidateSuccess(false);
        setAddCandidateModal(false);
        setCandidateForm({
          name: "",
          email: "",
          phone: "",
          source: "LinkedIn",
          job_posting_id: "",
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to add candidate", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartOnboarding = async () => {
    if (!drawerApp || !onboardingStartDate) {
      showToast("Please select a start date", "error");
      return;
    }
    setActionLoading(true);
    try {
      await apiFetch(`/v1/applicants/${drawerApp.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "onboarding",
          start_date: onboardingStartDate
        })
      });
      showToast(`Successfully moved ${drawerApp.name} to Onboarding!`, "success");
      setDrawerApp(null);
      fetchData(currentPage);
    } catch (e) {
      console.error(e);
      showToast("Failed to start onboarding", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerApp) return;
    setActionLoading(true);
    try {
      await apiFetch(`/v1/applicants/${drawerApp.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          ...onboardingForm,
          status: "onboarding", // Keep status as onboarding
        }),
      });
      showToast("Onboarding details updated successfully", "success");
      setDrawerApp(null);
      fetchData(currentPage);
    } catch (err) {
      console.error("Failed to update onboarding", err);
      showToast("Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromoteToStaff = async () => {
    if (!drawerApp) return;
    setActionLoading(true);
    try {
      await apiFetch(`/v1/applicants/${drawerApp.id}/promote`, {
        method: "POST",
      });
      showToast(`${drawerApp.name} is now a member of the staff!`, "success");
      setDrawerApp(null);
      fetchData(currentPage);
    } catch (err: any) {
      console.error("Failed to promote to staff", err);
      showToast(err.message || "Promotion failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployeeStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setActionLoading(true);

    // If we're in 'HIRED' or 'ACTIVE' sub-tabs, these are applicant records.
    // 'STAFF' and 'SEPARATED' tabs use the /v1/employees endpoint (User model).
    const isApplicant = subTab === "HIRED" || subTab === "ACTIVE" || subTab === "ONBOARDING";
    const endpoint = isApplicant
      ? `/v1/applicants/${selectedEmployee.id}/employment-status`
      : `/v1/employees/${selectedEmployee.id}/status`;

    try {
      await apiFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employment_status: employeeStatusForm.status,
          separation_reason: employeeStatusForm.reason,
          separation_date: employeeStatusForm.date,
        }),
      });
      showToast("Employee status updated successfully", "success");
      setEmployeeStatusModal(false);
      fetchData(currentPage);
    } catch (err) {
      showToast("Failed to update employee status", "error");
      console.error("Failed to update employee status", err);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        // --- REPORTS TAB: only fetch stats, skip all other expensive calls ---
        if (initialTab === "Reports") {
          setStatsLoading(true);
          const params = new URLSearchParams({
            date_range: reportFilters.dateRange,
            department: reportFilters.department,
            job_id: reportFilters.jobId,
            search: search,
          });
          const [statsData, jobsData] = await Promise.all([
            apiFetch(`/v1/applicants/stats?${params.toString()}`),
            apiFetch("/v1/jobs?page=1"), // Fetch jobs for filters
          ]);
          setStats(statsData);
          if (jobsData?.data) setJobs(jobsData.data);
          else setJobs(jobsData || []);
          setStatsLoading(false);
          setLoading(false);
          return; // Stop here — no need for reqs/applicants on Reports
        }

        if (initialTab === "Employees") {
          if (subTab === "HIRED" || subTab === "ONBOARDING") {
            // Fetch Pipeline/Newly Hired (Applicants)
            const statusParam = subTab === "HIRED" ? "hired" : "onboarding";
            const params = new URLSearchParams({
              page: page.toString(),
              status: statusParam,
              search: debouncedEmployeeSearch || debouncedSearch || "", // Use debounced values
              experience: employeeFilters.experience,
              department: employeeFilters.department,
              job_id: employeeFilters.jobId,
              hired_on: employeeFilters.hiredOn,
              applied_on: employeeFilters.appliedOn,
            });
            const [appsResponse, jobsResponse] = await Promise.all([
              apiFetch(`/v1/applicants?${params.toString()}`),
              apiFetch("/v1/jobs?page=1&limit=100"), // Fetch all active jobs for filters
            ]);

            if (jobsResponse?.data) {
              setJobs(jobsResponse.data);
            } else if (jobsResponse) {
              setJobs(jobsResponse);
            }

            if (appsResponse?.data) {
              setApplicants(appsResponse.data);
              setApplicantsPagination({
                total: appsResponse.total,
                current_page: appsResponse.current_page,
                last_page: appsResponse.last_page,
                from: appsResponse.from,
                to: appsResponse.to,
              });
              setCurrentPage(appsResponse.current_page);
            } else {
              setApplicants(appsResponse || []);
              setApplicantsPagination(null);
            }
          } else {
            // Fetch Staff
            const params = new URLSearchParams({
              page: page.toString(),
              status: "active",
              search: debouncedEmployeeSearch || debouncedSearch || "", // Use debounced values
              department: employeeFilters.department,
            });
            const [employeesResponse, jobsResponse] = await Promise.all([
              apiFetch(`/v1/employees?${params.toString()}`),
              apiFetch("/v1/jobs?page=1&limit=100"),
            ]);

            if (jobsResponse?.data) {
              setJobs(jobsResponse.data);
            } else if (jobsResponse) {
              setJobs(jobsResponse);
            }

            if (employeesResponse?.data) {
              setEmployees(employeesResponse.data);
              setEmployeesPagination({
                total: employeesResponse.total,
                current_page: employeesResponse.current_page,
                last_page: employeesResponse.last_page,
                from: employeesResponse.from,
                to: employeesResponse.to,
              });
              setCurrentPage(employeesResponse.current_page);
            } else {
              setEmployees(employeesResponse || []);
              setEmployeesPagination(null);
            }
          }
          setLoading(false);
          return;
        }

        if (initialTab === "Calendar") {
          // Calendar: fetch scheduled interviews with pagination
          const interviewsResponse = await apiFetch(
            `/v1/interviews?status=scheduled&upcoming=true&page=${page}&limit=10`,
          );
          
          if (interviewsResponse?.data) {
            setInterviewsList(interviewsResponse.data);
            setInterviewsPagination({
              total: interviewsResponse.total,
              current_page: interviewsResponse.current_page,
              last_page: interviewsResponse.last_page,
              from: interviewsResponse.from,
              to: interviewsResponse.to,
            });
            setCurrentPage(interviewsResponse.current_page);
          } else {
            setInterviewsList(interviewsResponse || []);
            setInterviewsPagination(null);
          }
          
          setApplicants([]);
          setApplicantsPagination(null);
        } else if (initialTab === "Jobs") {
          // Jobs tab: only fetch jobs — no applicants or requisitions needed here
          const searchParam = search
            ? `&search=${encodeURIComponent(search)}`
            : "";
          const posParam = jobFilters.position
            ? `&position=${encodeURIComponent(jobFilters.position)}`
            : "";
          const locParam =
            jobFilters.location !== "All"
              ? `&location=${encodeURIComponent(jobFilters.location)}`
              : "";
          const deptParam =
            jobFilters.department !== "All"
              ? `&department=${encodeURIComponent(jobFilters.department)}`
              : "";

          // If the user uses the 'Status' filter in the dropdown, pass that to the backend. Otherwise, respect the SUBTAB default.
          const statusQuery =
            jobFilters.status !== "All"
              ? jobFilters.status
              : subTab === "ARCHIVED"
                ? "archived"
                : subTab === "TOTAL"
                  ? "All"
                  : "active";

          const jobsQuery = `/v1/jobs?page=${page}&status=${encodeURIComponent(statusQuery)}${searchParam}${posParam}${locParam}${deptParam}`;
          const jobsResponse = await apiFetch(jobsQuery);
          if (jobsResponse?.data) {
            setJobs(jobsResponse.data);
            setJobsPagination({
              total: jobsResponse.total,
              current_page: jobsResponse.current_page,
              last_page: jobsResponse.last_page,
              from: jobsResponse.from,
              to: jobsResponse.to,
            });
            setCurrentPage(jobsResponse.current_page);
          } else {
            setJobs(jobsResponse || []);
            setJobsPagination(null);
          }
        } else if (initialTab === "HiringPlan") {
          // Hiring Plan: only fetch requisitions
          const params = new URLSearchParams({
            search: debouncedHiringPlanSearch || debouncedSearch || "",
            location: hiringPlanFilters.location,
            department: hiringPlanFilters.department,
            salary_range: hiringPlanFilters.salaryRange,
            status: hiringPlanFilters.status,
            submitted_on: hiringPlanFilters.submittedOn,
            portal: hiringPlanFilters.portal,
          });
          const reqsResponse = await apiFetch(
            `/v1/requisitions?${params.toString()}`,
          );
          setRequisitions(reqsResponse?.data || []);
          setHiringPlanKpis(reqsResponse?.kpis || null);
        } else {
          // Candidates, Employees, and other tabs: fetch applicants + jobs (for filter dropdowns)
          const searchParam = search
            ? `&search=${encodeURIComponent(search)}`
            : "";
          const currentStatus = (() => {
            const m: { [k: string]: string } = {
              NEW: "new",
              "WRITTEN EXAM": "written_exam",
              "TECHNICAL INTERVIEW": "technical_interview",
              "FINAL INTERVIEW": "final_interview",
              OFFERS: "offer",
              "TALENT POOL": "talent_pool",
              REJECTED: "rejected",
              HIRED: "hired",
              ACTIVE: "active",
              ARCHIVED: "archived",
              REQUISITIONS: "ALL",
              OVERVIEW: "ALL",
            };
            return m[subTab] ?? "ALL";
          })();
          const statusParam =
            currentStatus !== "ALL" ? `&status=${currentStatus}` : "";
          const filterParams = new URLSearchParams({
            experience: applicantFilters.experience,
            department: applicantFilters.department,
            gender: applicantFilters.gender,
            min_score: applicantFilters.minScore,
          }).toString();

          const [jobsResponse, appsResponse] = await Promise.all([
            apiFetch(`/v1/jobs?page=1&limit=100`),
            apiFetch(
              `/v1/applicants?page=${page}${statusParam}${searchParam}&limit=${itemsPerPage}&${filterParams}`,
            ),
          ]);

          if (jobsResponse?.data) {
            setJobs(jobsResponse.data);
            setJobsPagination(null);
          } else {
            setJobs(jobsResponse || []);
          }

          if (appsResponse?.data) {
            setApplicants(appsResponse.data);
            setApplicantsPagination({
              total: appsResponse.total,
              current_page: appsResponse.current_page,
              last_page: appsResponse.last_page,
              from: appsResponse.from,
              to: appsResponse.to,
            });
            setCurrentPage(appsResponse.current_page);
          } else {
            setApplicants(appsResponse || []);
            setApplicantsPagination(null);
          }

          // --- FETCH PINNED NOTIFICATIONS ---
          const notifsResponse = await apiFetch("/v1/notifications");
          if (notifsResponse?.notifications) {
            setPinnedNotifications(
              notifsResponse.notifications.filter((n: any) => n.is_pinned),
            );
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard data", err);
        setFetchError(err?.message || "Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    },
    [
      initialTab,
      subTab,
      debouncedSearch,
      jobFilters,
      reportFilters,
      employeeFilters,
      debouncedEmployeeSearch,
      hiringPlanFilters,
      debouncedHiringPlanSearch,
    ],
  );

  // Refetch when filters change
  useEffect(() => {
    if (initialTab === "Reports" || initialTab === "Jobs") {
      fetchData(1);
    }
  }, [reportFilters, jobFilters, initialTab, fetchData]);

  useEffect(() => {
    // Reset loading and clear data when tab changes to prevent "No Results" flicker
    setLoading(true);
    // Keep jobs/stats if they exist to avoid filter flicker, only clear content
    setApplicants(null);
    setRequisitions(null);
    setEmployees(null);
    // setStats(null); // Keep stats for a bit for smoother transition
    // setJobs(null); // DO NOT CLEAR JOBS, they are needed for filters across tabs!

    // Default sub-tab when global category changes
    if (initialTab === "Candidates") setSubTab("NEW");
    else if (initialTab === "Jobs") setSubTab("TOTAL");
    else if (initialTab === "Employees") setSubTab("HIRED");
    else if (initialTab === "HiringPlan") setSubTab("REQUISITIONS");
    else if (initialTab === "Reports") setSubTab("OVERVIEW");
    else if (initialTab === "Calendar") setSubTab("UPCOMING");

    // fetchData(1) will be triggered by [initialTab, subTab, search] effect
  }, [initialTab]);

  useEffect(() => {
    fetchData();
  }, [
    initialTab,
    subTab,
    debouncedSearch,
    applicantFilters,
    employeeFilters,
    debouncedEmployeeSearch,
    hiringPlanFilters,
    debouncedHiringPlanSearch,
    itemsPerPage,
  ]);

  const handlePostJob = async (req: any) => {
    setActionLoading(true);
    try {
      await apiFetch("/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_requisition_id: req.id,
          title: req.title,
          description:
            req.jd_content ||
            req.description ||
            `New opening for ${req.title} in ${req.department} department.`,
          location: req.location,
          type: "full-time",
          deadline: postJobDeadline,
        }),
      });
      setDrawerReq(null);
      showToast("Job Posted to Public Portal successfully!", "success");
      fetchData();
      setPostJobDeadline("");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/v1/applicants/${applicantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Professional success message mapping
      const statusLabels: { [key: string]: string } = {
        written_exam: "Written Exam stage",
        technical_interview: "Technical Interview stage",
        final_interview: "Final Interview stage",
        offer: "Offer stage",
        hired: "Hired status",
        rejected: "Rejected",
        talent_pool: "Talent Pool",
      };
      const label = statusLabels[newStatus] || newStatus;
      showToast(`Candidate successfully moved to ${label}`, "success");

      setDrawerApp(null);
      fetchData(currentPage);
    } catch (e) {
      console.error(e);
      showToast("Failed to update candidate status", "error");
    } finally {
      setActionLoading(false);
    }
  };



  interface ScheduleContext {
    targetStatus: string;
    interviewType: string;
    title: string;
    label: string;
  }

  const openStageScheduleModal = (targetStatus: string) => {
    const contexts: { [key: string]: ScheduleContext } = {
      written_exam: {
        targetStatus: "written_exam",
        interviewType: "written_exam",
        title: "WRITTEN EXAM",
        label: "Written Assessment",
      },
      technical_interview: {
        targetStatus: "technical_interview",
        interviewType: "technical",
        title: "TECH INTERVIEW",
        label: "Technical Assessment",
      },
      final_interview: {
        targetStatus: "final_interview",
        interviewType: "final",
        title: "FINAL INTERVIEW",
        label: "Final Selection Round",
      },
      offer: {
        targetStatus: "offer",
        interviewType: "offer_meeting",
        title: "OFFER MEETING",
        label: "Offer Negotiation/Discussion",
      },
      hired: {
        targetStatus: "hired",
        interviewType: "onboarding",
        title: "ONBOARDING",
        label: "Hire & Start Onboarding",
      },
      rejected: {
        targetStatus: "rejected",
        interviewType: "rejection_call",
        title: "CLOSURE CALL",
        label: "Rejection / Feedback Session",
      },
    };

    const ctx = contexts[targetStatus];
    if (ctx) {
      setScheduleContext(ctx);
      setGlobalScheduleForm({
        date: "",
        time: "",
        location: "Main Office",
        interviewer_id: "",
        message: `You are invited for the ${ctx.label} stage.`,
        // Resetting extended fields
        offered_salary: "",
        start_date: "",
        offer_notes: "",
        rejection_note: "",
        offer_letter: null,
      });
      setGlobalScheduleModal(true);
    }
  };

  const handleGlobalSchedule = async () => {
    if (
      !globalScheduleForm.date ||
      !globalScheduleForm.time ||
      !globalScheduleForm.interviewer_id
    ) {
      showToast("Please fill in date, time and assigned staff", "error");
      return;
    }
    setActionLoading(true);
    try {
      const scheduledAt = new Date(
        `${globalScheduleForm.date}T${globalScheduleForm.time}`,
      ).toISOString();

      // 1. Create the 'interview' / event record
      await apiFetch("/v1/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant_id: drawerApp.id,
          interviewer_id: globalScheduleForm.interviewer_id,
          scheduled_at: scheduledAt,
          type: scheduleContext.interviewType,
          location: globalScheduleForm.location,
          message: globalScheduleForm.message,
          skip_email: true,
        }),
      });

      // 2. Update applicant status — use FormData when an offer letter PDF is attached
      if (scheduleContext.targetStatus === "offer" && globalScheduleForm.offer_letter) {
        const fd = new FormData();
        fd.append("status", scheduleContext.targetStatus);
        if (globalScheduleForm.offered_salary) fd.append("offered_salary", globalScheduleForm.offered_salary);
        if (globalScheduleForm.start_date) fd.append("start_date", globalScheduleForm.start_date);
        if (globalScheduleForm.offer_notes) fd.append("offer_notes", globalScheduleForm.offer_notes);
        if (globalScheduleForm.rejection_note) fd.append("rejection_note", globalScheduleForm.rejection_note);
        fd.append("interview_message", globalScheduleForm.message || "");
        fd.append("interview_location", globalScheduleForm.location || "");
        fd.append("offer_letter", globalScheduleForm.offer_letter);
        fd.append("_method", "PATCH");
        await apiFetch(`/v1/applicants/${drawerApp.id}/status`, {
          method: "POST",
          body: fd,
        });
      } else {
        await apiFetch(`/v1/applicants/${drawerApp.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: scheduleContext.targetStatus,
            ...(scheduleContext.targetStatus === "offer" && {
              offered_salary: globalScheduleForm.offered_salary,
              start_date: globalScheduleForm.start_date,
              offer_notes: globalScheduleForm.offer_notes,
            }),
            interview_message: globalScheduleForm.message,
            interview_location: globalScheduleForm.location,
            ...(scheduleContext.targetStatus === "rejected" && {
              rejection_note: globalScheduleForm.rejection_note,
            }),
          }),
        });
      }

      // 3. ✅ Send formal offer letter email (only when moving to offer stage)
      if (
        scheduleContext.targetStatus === "offer" &&
        globalScheduleForm.offered_salary &&
        globalScheduleForm.start_date
      ) {
        try {
          await apiFetch("/v1/offers/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              applicant_id: drawerApp.id,
              salary: globalScheduleForm.offered_salary.replace(/[^0-9.]/g, ""),
              start_date: globalScheduleForm.start_date,
              notes: globalScheduleForm.offer_notes || null,
            }),
          });
        } catch (offerErr) {
          console.error("Offer email failed (non-blocking):", offerErr);
          // Non-blocking — status already updated, don't fail the whole flow
        }
      }

      if (scheduleContext.targetStatus === "hired") {
        showToast(`Successfully hired ${drawerApp.name}! Redirecting to Employees...`, "success");
        setTimeout(() => {
          router.push("/dashboard?tab=Employees");
        }, 1500);
      } else {
        showToast(
          `${scheduleContext.title} scheduled for ${drawerApp.name}`,
          "success",
        );
      }
      setDrawerApp((prev: any) => ({
        ...prev,
        status: scheduleContext.targetStatus,
      }));
      setGlobalScheduleModal(false);
      fetchData(currentPage);
    } catch (e) {
      console.error(e);
      showToast(
        `Failed to move candidate to ${scheduleContext.title.toLowerCase()}`,
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateScores = async (advanceToStatus?: string) => {
    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PATCH");
      // Use current status for saving scores; let the scheduling modal handle the transition.
      formData.append("status", drawerApp.status);
      formData.append("written_exam_score", scoringForm.written_exam_score);
      formData.append(
        "technical_interview_score",
        scoringForm.technical_interview_score,
      );
      // Send raw scores so the backend stores X/Y for email display
      if (scoringForm.written_raw_score) {
        formData.append("written_raw_score", scoringForm.written_raw_score);
        formData.append("written_out_of", scoringForm.written_out_of || "100");
      }
      if (scoringForm.tech_raw_score) {
        formData.append("technical_raw_score", scoringForm.tech_raw_score);
        formData.append("technical_out_of", scoringForm.tech_out_of || "100");
      }
      formData.append("interviewer_feedback", scoringForm.interviewer_feedback);

      if (scoringForm.exam_paper) {
        formData.append("exam_paper", scoringForm.exam_paper);
      }

      const res = await apiFetch(`/v1/applicants/${drawerApp.id}/status`, {
        method: "POST", // Use POST with _method: PATCH for Laravel file uploads
        body: formData,
      });

      setDrawerApp(res);
      setScoringModal(false);

      if (advanceToStatus) {
        // After saving scores, trigger the scheduling modal for the next stage
        openStageScheduleModal(advanceToStatus);
      } else {
        showToast("Scores saved successfully!", "success");
      }

      fetchData(currentPage);
    } catch (e) {
      console.error(e);
      showToast("Failed to save scores", "error");
    } finally {
      setActionLoading(false);
    }
  };



  const handleToggleJobStatus = async (jobId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/v1/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Job status updated to ${newStatus} successfully!`, "success");
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Failed to update job status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/v1/jobs/${jobId}`, {
        method: "DELETE",
      });
      showToast("Job posting deleted successfully!", "success");
      setDeleteConfirmId(null);
      fetchData();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete job posting", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const computedTurnoverData = stats?.turnover ?? [];

  // SVG turnover chart
  const tRates = computedTurnoverData.map((d: any) => d.rate);
  const minRate = Math.min(...tRates, 0);
  const maxRate = Math.max(...tRates, 1);
  const toY = (r: number) =>
    180 - ((r - minRate) / (maxRate - minRate || 1)) * 140 + 20;
  const svgPts = computedTurnoverData.map((d: any, i: number) => ({
    x:
      computedTurnoverData.length > 1
        ? (i * 800) / (computedTurnoverData.length - 1)
        : 400,
    y: toY(d.rate),
  }));
  let svgPath = "",
    svgArea = "";
  if (svgPts.length > 1) {
    let p = `M${svgPts[0].x},${svgPts[0].y}`;
    for (let i = 0; i < svgPts.length - 1; i++) {
      const p0 = svgPts[i],
        p1 = svgPts[i + 1],
        cx = (p0.x + p1.x) / 2;
      p += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    svgPath = p;
    svgArea = `${p} L${svgPts[svgPts.length - 1].x},200 L${svgPts[0].x},200 Z`;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Connection error banner */}
      <AnimatePresence>
        {fetchError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-10 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-red-700 uppercase tracking-wide">
                Connection Error
              </p>
              <p className="text-xs text-red-600 mt-0.5">{fetchError}</p>
            </div>
            <button
              onClick={() => {
                setFetchError(null);
                fetchData(1);
              }}
              className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all"
            >
              Retry
            </button>
            <button
              onClick={() => setFetchError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Active Banner */}
      <AnimatePresence>
        {search && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-10 mt-2 p-3 bg-[#FDF22F]/10 border border-[#FDF22F]/20 rounded-2xl flex items-center gap-4"
          >
            <svg
              className="w-4 h-4 text-black shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-xs font-bold text-black flex-1">
              Showing results for:{" "}
              <span className="font-black">&quot;{search}&quot;</span>
            </p>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("search");
                window.history.replaceState({}, "", url);
                setSearch("");
              }}
              className="text-[10px] font-black text-black uppercase tracking-widest hover:bg-black hover:text-white px-3 py-1.5 rounded-lg transition-all"
            >
              Clear ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Page Header */}

      <div className="flex justify-between items-end mb-4">
        <div className="space-y-4">


          {/* Hierarchical Sub Tabs - Contextual Logic */}
          <div className="flex gap-4 sm:gap-10 border-b border-gray-100 mt-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 sm:pb-0">
            {(() => {
              let items: string[] = [];
              if (initialTab === "Candidates")
                items = [
                  "NEW",
                  "WRITTEN EXAM",
                  "TECHNICAL INTERVIEW",
                  "FINAL INTERVIEW",
                  "OFFERS",
                  "TALENT POOL",
                  "REJECTED",
                ];
              else if (initialTab === "Jobs")
                items = ["TOTAL", "ARCHIVED"];
              else if (initialTab === "HiringPlan")
                items = ["REQUISITIONS"];
              else if (initialTab === "Employees")
                items = ["HIRED", "ONBOARDING", "STAFF"];
              else if (initialTab === "Reports") items = ["OVERVIEW"];
              else items = ["OVERVIEW"];

              return items.map((t) => {
                const isActive = subTab === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setSubTab(t);
                      setCurrentPage(1);
                    }}
                    className={`pb-4 text-[12px] font-black tracking-[0.15em] transition-all relative ${isActive
                      ? "text-[#000000]"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    <span className="uppercase">{t}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeSubTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#FDF22F] rounded-t-full shadow-[0_-2px_10px_rgba(253,242,47,0.4)]"
                      />
                    )}
                  </button>
                );
              });
            })()}


          </div>
        </div>
      </div>

      {/* Pinned Alerts Section */}
      <AnimatePresence>
        {pinnedNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {pinnedNotifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-5 rounded-3xl border border-[#FDF22F]/40 shadow-xl shadow-[#FDF22F]/5 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDF22F]/5 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-[#FDF22F]/10 transition-colors" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF22F] flex items-center justify-center shrink-0 shadow-lg shadow-[#FDF22F]/20">
                    <svg
                      className="w-5 h-5 text-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 5h14l-4 4v7l-3 3-3-3v-7L5 5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-[#FDF22F] bg-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
                        Pinned Workspace Alert
                      </p>
                      <button
                        onClick={async () => {
                          await apiFetch(`/v1/notifications/${notif.id}/pin`, {
                            method: "POST",
                          });
                          setPinnedNotifications((prev) =>
                            prev.filter((n) => n.id !== notif.id),
                          );
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <h3 className="text-sm font-black text-black leading-tight mb-1">
                      {notif.data.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                      {notif.data.message}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-black">
                        {notif.data.sender_name?.charAt(0) || "S"}
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {notif.data.sender_name || "System"} ·{" "}
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Content Table */}
      {loading ? (
        initialTab === "Jobs" ? (
          /* Jobs skeleton */
          <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-gray-100">
                <tr>
                  {[
                    "POSITION",
                    "LOCATION",
                    "DEPARTMENT",
                    "STATUS",
                    "ACTIONS",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-5">
                      <div className="h-3.5 bg-gray-100 rounded w-40 mb-1.5" />
                      <div className="h-2.5 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-3 bg-gray-100 rounded w-28" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-3 bg-gray-100 rounded w-32" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-6 bg-gray-100 rounded-full w-16" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-3 bg-gray-100 rounded w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-100 p-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
          </div>
        )
      ) : null}

      {(initialTab === "Candidates" || initialTab === "Employees" || initialTab === "Jobs") && (
        <div className="flex flex-col">
          {/* Header Section without inner filters */}
          <div className="px-4 sm:px-10 py-6 sm:py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 bg-white">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#000000] flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#FDF22F] rounded-full" />
                {initialTab === "Jobs" ? `${subTab} POSITIONS` : `${subTab} PIPELINE`}
              </h2>
              <p className="text-[10px] sm:text-xs font-medium text-gray-400">
                {initialTab === "Jobs" ? `Manage and track ${subTab.toLowerCase()} job openings` : `Manage talent through the ${subTab.toLowerCase()} stage`}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {(initialTab === "Candidates" || (initialTab === "Employees" && subTab !== "STAFF" && subTab !== "ONBOARDING")) && (
                <button
                  onClick={() => setAddCandidateModal(true)}
                  className="flex-1 sm:flex-none justify-center bg-[#FDF22F] hover:bg-black text-black hover:text-white px-3 sm:px-4 py-2 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest shadow-lg shadow-[#FDF22F]/20 transition-all flex items-center gap-1.5 sm:gap-2"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Add <span className="hidden sm:inline">Candidate</span>
                </button>
              )}
              <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 sm:px-4 py-2 rounded-full border border-gray-100 whitespace-nowrap">
                Total:{" "}
                <span className="text-[#000000]">
                  {loading
                    ? "..."
                    : initialTab === "Employees" &&
                      (subTab === "STAFF" || subTab === "SEPARATED")
                      ? (employeesPagination?.total ?? 0)
                      : initialTab === "Jobs"
                        ? (jobsPagination?.total ?? 0)
                        : (applicantsPagination?.total ?? 0)}
                </span>
              </p>
            </div>
          </div>

          {/* Professional Filter Bar for Candidates */}
          {initialTab === "Candidates" && (
            <div className="px-4 sm:px-10 py-4 sm:py-5 bg-gray-50/30 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-[10]">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
                  <div className="flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <select value={applicantFilters.experience} onChange={(e) => setApplicantFilters((p) => ({ ...p, experience: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all">
                      <option value="All">All Experience</option>
                      <option value="0-1">Under 1 Year</option>
                      <option value="1-3">1 - 3 Years</option>
                      <option value="3-5">3 - 5 Years</option>
                      <option value="5-10">5 - 10 Years</option>
                      <option value="10+">10+ Years</option>
                    </select>

                    <select value={applicantFilters.department} onChange={(e) => setApplicantFilters((p) => ({ ...p, department: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all">
                      <option value="All">All Departments</option>
                      {Array.from(new Set((jobs || []).map((j) => j.department).filter(Boolean))).map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>

                    <select value={applicantFilters.gender} onChange={(e) => setApplicantFilters((p) => ({ ...p, gender: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all">
                      <option value="All">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>

                    <input type="number" placeholder="Min % Score" value={applicantFilters.minScore} onChange={(e) => setApplicantFilters((p) => ({ ...p, minScore: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all w-full sm:w-28" />

                    <button onClick={() => setApplicantFilters({ experience: "All", department: "All", gender: "All", minScore: "" })} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest ml-1 sm:ml-2 w-full sm:w-auto mt-2 sm:mt-0 text-right sm:text-left">
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm self-end sm:self-auto mt-4 sm:mt-0">
                  <button onClick={() => setCandidateViewMode("table")} className={`p-2 rounded-lg transition-all ${candidateViewMode === "table" ? "bg-[#FDF22F] text-black" : "text-gray-400 hover:text-black"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </button>
                  <button onClick={() => setCandidateViewMode("grid")} className={`p-2 rounded-lg transition-all ${candidateViewMode === "grid" ? "bg-[#FDF22F] text-black" : "text-gray-400 hover:text-black"}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Professional Filter Bar for Employees (Hired/Staff) */}
          {initialTab === "Employees" && (
            <div className="px-4 sm:px-10 py-4 sm:py-5 bg-gray-50/30 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-[10]">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
                  <div className="flex items-center gap-2 shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Name Search for Employees */}
                    <div className="relative w-full sm:w-auto">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Search employees..." value={employeeFilters.search} onChange={(e) => setEmployeeFilters((p) => ({ ...p, search: e.target.value }))} className="bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all w-full sm:w-48 placeholder:text-gray-400" />
                    </div>

                    {/* Applied For (Job) Filter */}
                    {subTab === "HIRED" && (
                      <select value={employeeFilters.jobId} onChange={(e) => setEmployeeFilters((p) => ({ ...p, jobId: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[150px]">
                        <option value="All">{loading && !jobs ? "Loading Jobs..." : "Applied For (All)"}</option>
                        {(jobs || []).map((j) => (<option key={j.id} value={j.id}>{j.title}</option>))}
                      </select>
                    )}

                    {/* Department Filter */}
                    <select value={employeeFilters.department} onChange={(e) => setEmployeeFilters((p) => ({ ...p, department: e.target.value }))} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer">
                      <option value="All">Department (All)</option>
                      {Array.from(new Set((employees || []).map((e) => e.department).filter(Boolean))).map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                    </select>

                    {/* Applied/Hired On Filter */}
                    <select value={subTab === "HIRED" ? employeeFilters.appliedOn : employeeFilters.hiredOn} onChange={(e) => setEmployeeFilters((p) => subTab === "HIRED" ? { ...p, appliedOn: e.target.value } : { ...p, hiredOn: e.target.value })} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[120px]">
                      <option value="All">{subTab === "HIRED" ? "Applied (All Time)" : "Hired (All Time)"}</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>

                    <button onClick={() => setEmployeeFilters({ search: "", experience: "All", department: "All", jobId: "All", hiredOn: "All", appliedOn: "All" })} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-1.5 ml-1 sm:ml-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Professional Filter Bar for Jobs */}
          {initialTab === "Jobs" && (
            <div className="flex flex-col gap-6">
              <div className="px-4 sm:px-10 py-4 sm:py-5 bg-gray-50/30 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-[10]">
                <div className="flex items-center gap-2 shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filters</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="relative w-full sm:w-auto">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search titles..." value={jobFilters.position} onChange={(e) => setJobFilters({...jobFilters, position: e.target.value})} className="bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all w-full sm:w-48 placeholder:text-gray-400" />
                  </div>

                  <select value={jobFilters.location} onChange={(e) => setJobFilters({ ...jobFilters, location: e.target.value })} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer">
                    <option value="All">All Locations</option>
                    {Array.from(new Set((jobs || []).map((j) => j.location).filter(Boolean))).map((loc) => (<option key={loc} value={loc}>{loc}</option>))}
                  </select>

                  <select value={jobFilters.department} onChange={(e) => setJobFilters({ ...jobFilters, department: e.target.value })} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer">
                    <option value="All">All Departments</option>
                    {Array.from(new Set((jobs || []).map((j) => j.department || j.requisition?.department).filter(Boolean))).map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                  </select>

                  <select value={jobFilters.status} onChange={(e) => setJobFilters({ ...jobFilters, status: e.target.value })} className="flex-1 sm:flex-none bg-white border border-gray-100 rounded-xl px-2 sm:px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>

                  <button onClick={() => setJobFilters({ position: "", location: "All", department: "All", status: "All" })} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest ml-1 sm:ml-2 transition-colors flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 justify-end sm:justify-start">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Reset
                  </button>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F9FAFB] border-b border-gray-100">
                      <tr>
                        {["POSITION", "LOCATION", "DEPARTMENT", "STATUS", "ACTIONS"].map((h) => (
                          <th key={h} className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {jobs === null ? null : jobs.length === 0 ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">No {subTab.toLowerCase()} jobs found for {user.tenant?.name || "this company"}.</td></tr>
                      ) : (
                        jobs.map((job: any) => (
                          <tr key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                            <td className="px-8 py-6">
                              <p className="font-bold text-[#000000] group-hover:text-[#000000] transition-colors">{job.title}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                {job.published_at && (() => {
                                  const d = new Date(job.published_at);
                                  const now = new Date();
                                  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                                  const relative = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
                                  return <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Posted {relative}</span>;
                                })()}
                                {job.deadline && (() => {
                                  const d = new Date(job.deadline);
                                  const now = new Date();
                                  const exactDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                  const diffTime = d.getTime() - now.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return <span className={`text-[10px] font-black uppercase tracking-widest ${diffDays <= 3 ? "text-red-500 animate-pulse" : "text-amber-600"}`}>{exactDate} ({diffDays <= 0 ? "Today" : `${diffDays}d left`})</span>;
                                })()}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm text-gray-500">{job.location || "—"}</td>
                            <td className="px-8 py-6 text-sm text-gray-500">{job.department || job.requisition?.department || "General"}</td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${job.status === "active" ? "bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/10" : (job.status === "closed" || job.status === "archived") ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>{job.status}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex gap-2">
                                {job.status === "active" ? (
                                  <button onClick={(e) => { e.stopPropagation(); handleToggleJobStatus(job.id, "archived"); }} className="px-4 py-2 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all">Close Job</button>
                                ) : (job.status === "closed" || job.status === "archived") ? (
                                  <button onClick={(e) => { e.stopPropagation(); handleToggleJobStatus(job.id, "active"); }} className="px-4 py-2 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all">Re-open</button>
                                ) : null}
                                {(job.status === "closed" || job.status === "archived") && (
                                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(job.id); handleDeleteJob(job.id); }} className="px-4 py-2 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all font-bold">Delete</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View for Jobs */}
                <div className="md:hidden flex flex-col gap-4 p-4">
                  {jobs === null ? null : jobs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 italic text-sm border border-dashed border-gray-200 rounded-3xl">No {subTab.toLowerCase()} jobs found.</div>
                  ) : (
                    jobs.map((job: any) => (
                      <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#000000]">{job.title}</p>
                          <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${job.status === "active" ? "bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/10" : (job.status === "closed" || job.status === "archived") ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>{job.status}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                          <p><span className="font-semibold">Location:</span> {job.location || "—"}</p>
                          <p><span className="font-semibold">Department:</span> {job.department || job.requisition?.department || "General"}</p>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {job.status === "active" ? (
                            <button onClick={(e) => { e.stopPropagation(); handleToggleJobStatus(job.id, "archived"); }} className="px-4 py-2 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all flex-1">Close</button>
                          ) : (job.status === "closed" || job.status === "archived") ? (
                            <button onClick={(e) => { e.stopPropagation(); handleToggleJobStatus(job.id, "active"); }} className="px-4 py-2 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 transition-all flex-1">Re-open</button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Jobs Pagination */}
                {jobsPagination && jobsPagination.last_page > 1 && (
                  <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Showing <span className="text-[#000000]">{jobsPagination.from}</span> - <span className="text-[#000000]">{jobsPagination.to}</span> of <span className="text-[#000000]">{jobsPagination.total}</span></p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fetchData(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button onClick={() => fetchData(currentPage + 1)} disabled={currentPage === jobsPagination.last_page} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {initialTab !== "Jobs" && (
            <>
              {candidateViewMode === "grid" && initialTab === "Candidates" ? (
            <div className="p-10 bg-gray-50/20">
              {applicants === null ? null : applicants.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                  No {subTab.toLowerCase()} talent currently in the pipeline.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {applicants.map((app: any) => (
                    <div
                      key={app.id}
                      onClick={() => setDrawerApp(app)}
                      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-2xl hover:border-[#FDF22F] transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF22F]/5 rounded-bl-[100px] -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                      <div className="flex items-start justify-between relative mb-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md group-hover:rotate-3 transition-transform duration-500">
                              {app.photo_path ? (
                                <img
                                  src={getStorageUrl(app.photo_path)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=FDF22F&color=000&bold=true`;
                                  }}
                                />
                              ) : (
                                <span className="text-xl font-black text-black">
                                  {app.name[0]}
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-[#FDF22F] shadow-sm flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-black text-[16px] text-black tracking-tight leading-tight group-hover:text-[#FDF22F] transition-colors">
                              {app.name}
                            </h3>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {app.email}
                              </span>
                              <p className="text-[11px] font-black text-black/40 uppercase tracking-tighter">
                                {app.job_posting?.title || "Unknown Role"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm shadow-black/5 ${app.status === "hired"
                              ? "bg-green-50 text-green-600 ring-1 ring-green-100"
                              : app.status === "onboarding"
                                ? "bg-[#FDF22F] text-black ring-1 ring-black/5"
                              : app.status === "rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {app.status}
                          </span>
                          <div className="bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-black">
                              {app.match_score || 85}% Match
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 relative">
                        <div className="space-y-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Experience
                          </p>
                          <p className="text-[13px] font-black text-black">
                            {app.years_of_experience || "0"} Years
                          </p>
                        </div>
                        <div className="space-y-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Applied
                          </p>
                          <p className="text-[13px] font-black text-black">
                            {app.created_at
                              ? new Date(app.created_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )
                              : "Today"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-end">
                        <button className="text-[10px] font-black text-black uppercase tracking-widest hover:text-[#FDF22F] transition-colors flex items-center gap-1 group/btn">
                          Review Profile
                          <svg
                            className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-gray-100">
                <tr>
                  {initialTab === "Employees" && subTab === "STAFF"
                    ? [
                      "CANDIDATE",
                      "ROLE",
                      "DEPARTMENT",
                      "STATUS",
                      "JOINED DATE",
                      "ACTIONS",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${h === "ACTIONS" ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))
                    : initialTab === "Employees"
                      ? [
                        "CANDIDATE",
                        "APPLIED FOR",
                        "DEPARTMENT",
                        "EXPERIENCE",
                        "MATCHING",
                        "STATUS",
                        "HIRED ON",
                        "APPLIED ON",
                        subTab === "ONBOARDING" ? null : "ACTIONS",
                      ].filter(Boolean).map((h) => (
                        <th
                          key={h as string}
                          className={`px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${h === "ACTIONS" ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))
                      : [
                        "CANDIDATE",
                        "APPLIED FOR",
                        "DEPARTMENT",
                        "EXPERIENCE",
                        "MATCHING",
                        "STATUS",
                        subTab === "HIRED" ? "HIRED ON" : null,
                        "APPLIED ON",
                      ]
                        .filter(Boolean)
                        .map((h) => (
                          <th
                            key={h as string}
                            className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialTab === "Employees" && subTab === "STAFF" ? (
                  employees === null ? null : employees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-8 py-20 text-center text-gray-400 italic text-sm"
                      >
                        No internal users found in this category.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp: any) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-[#000000]">
                              {emp.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <p className="font-black text-[14px] text-[#000000]">
                                {emp.name}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-[13px] text-gray-600 font-medium lowercase">
                          {emp.roles?.map((r: any) => r.name).join(", ") ||
                            "Staff"}
                        </td>
                        <td className="px-5 py-5 text-[13px] text-gray-600 font-medium">
                          {emp.department || "Operations"}
                        </td>
                        <td className="px-5 py-5">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${emp.employment_status === "active"
                              ? "bg-[#FDF22F] text-[#000000] shadow-sm shadow-[#FDF22F]/30 ring-1 ring-[#FDF22F]/50"
                              : "bg-red-50 text-red-600"
                              }`}
                          >
                            {emp.employment_status}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-[13px] text-gray-600">
                          {emp.joined_date
                            ? new Date(emp.joined_date).toLocaleDateString()
                            : emp.created_at
                              ? new Date(emp.created_at).toLocaleDateString()
                              : "-"}
                        </td>
                        <td className="px-5 py-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setEmployeeStatusForm({
                                status: emp.employment_status,
                                reason: emp.separation_reason || "",
                                date:
                                  emp.separation_date ||
                                  new Date().toISOString().split("T")[0],
                              });
                              setEmployeeStatusModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-black text-[10px] font-black text-[#FDF22F] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : applicants === null ? null : applicants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-8 py-20 text-center text-gray-400 italic text-sm"
                    >
                      No {subTab.toLowerCase()} talent currently in the pipeline
                      for {user.tenant?.name || "this company"}.
                    </td>
                  </tr>
                ) : (
                  applicants.map((app: any) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => setDrawerApp(app)}
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="relative group/avatar">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-[#FDF22F] transition-all duration-300 shadow-sm">
                              {app.photo_path ? (
                                <img
                                  src={
                                    app.photo_path.startsWith("http")
                                      ? app.photo_path
                                      : `${API_URL.replace("/api", "/storage")}/${app.photo_path}`
                                  }
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&background=FDF22F&color=000&bold=true`;
                                  }}
                                />
                              ) : (
                                <span className="text-[11px] font-black text-[#000000]">
                                  {app.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </span>
                              )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-[#FDF22F] shadow-sm" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-black text-[13px] text-[#000000] tracking-tight truncate">
                              {app.name}
                            </p>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                {app.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <p className="text-[12px] font-bold text-[#000000] truncate max-w-[140px]">
                          {app.job_posting?.title || "Open Role"}
                        </p>
                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                          REQ
                          {app.job_posting?.job_requisition_id || "---"}
                        </p>
                      </td>
                      <td className="px-5 py-5 text-[12px] text-gray-600 font-medium">
                        {app.job_posting?.department ||
                          app.job_posting?.requisition?.department ||
                          "-"}
                      </td>
                      <td className="px-5 py-5 text-[12px] text-gray-600">
                        {app.years_of_experience || "0"} Years
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FDF22F] rounded-full"
                              style={{ width: `${app.match_score || 85}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-[#000000]">
                            {app.match_score || 85}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        {app.status === "interview" &&
                          app.interviews &&
                          app.interviews.length > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600">
                            Scheduled
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${app.status === "hired"
                              ? "bg-green-50 text-green-600 border border-green-100"
                              : app.status === "onboarding"
                                ? "bg-[#FDF22F] text-[#000000] shadow-sm ring-1 ring-[#FDF22F]/50"
                              : app.status === "rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                              }`}
                          >
                            {app.status === "onboarding" ? "Undergoing Onboarding" : app.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        {app.hired_at ? (
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] font-black text-black">
                              {new Date(app.hired_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </p>
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                              Officially Hired
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-200 text-[10px] font-black tracking-widest">—</span>
                        )}
                      </td>
                      <td className="px-5 py-5">
                        {app.created_at ? (
                          (() => {
                            const d = new Date(app.created_at);
                            return (
                              <div className="flex flex-col gap-0.5">
                                <p className="text-[11px] font-black text-black">
                                  {d.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                  {d.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          <span className="text-gray-200 text-[10px] font-black uppercase tracking-widest">—</span>
                        )}
                      </td>
                      <td className="px-5 py-5 text-right">
                        {initialTab === "Employees" && subTab !== "ONBOARDING" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(app);
                              setEmployeeStatusForm({
                                status: app.employment_status || "active",
                                reason: app.separation_reason || "",
                                date: app.separation_date || "",
                              });
                              setEmployeeStatusModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-black text-[10px] font-black text-[#FDF22F] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
                          >
                            Manage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          )}

          {(() => {
            const pagination =
              initialTab === "Employees" &&
                (subTab === "STAFF" || subTab === "SEPARATED")
                ? employeesPagination
                : applicantsPagination;
            if (!pagination) return null;

            return (
              <div className="px-10 py-6 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                      SHOWING{" "}
                      <span className="text-black font-black">
                        {pagination.from || 0}
                      </span>{" "}
                      TO{" "}
                      <span className="text-black font-black">
                        {pagination.to || 0}
                      </span>{" "}
                      OF{" "}
                      <span className="text-black font-black">
                        {pagination.total}
                      </span>
                    </p>
                  </div>
                  <div className="h-4 w-[1px] bg-gray-200 mx-2" />
                  <div className="relative group">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="appearance-none bg-gray-50/50 text-[10px] font-black text-gray-500 hover:text-black uppercase tracking-widest pl-4 pr-10 py-2.5 rounded-xl border border-gray-100 outline-none focus:border-[#FDF22F] hover:border-[#FDF22F] transition-all cursor-pointer shadow-sm"
                    >
                      <option value={10}>10 / page</option>
                      <option value={15}>15 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {pagination.last_page > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => fetchData(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {(() => {
                      const pages = [];
                      const lastPage = pagination.last_page;

                      if (lastPage <= 7) {
                        for (let i = 1; i <= lastPage; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        if (currentPage > 4) pages.push("...");
                        const start = Math.max(2, currentPage - 2);
                        const end = Math.min(lastPage - 1, currentPage + 2);
                        for (let i = start; i <= end; i++) pages.push(i);
                        if (currentPage < lastPage - 3) pages.push("...");
                        pages.push(lastPage);
                      }

                      return pages.map((p, i) => (
                        <button
                          key={i}
                          disabled={p === "..."}
                          onClick={() => p !== "..." && fetchData(p as number)}
                          className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === p
                            ? "bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/20 active:scale-95"
                            : p === "..."
                              ? "bg-transparent text-gray-300 border-none cursor-default"
                              : "bg-transparent text-gray-400 hover:text-black hover:bg-gray-50"
                            }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => fetchData(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  )}

      {initialTab === "HiringPlan" && (
        <div className="flex flex-col">
          {/* Professional Filter Bar for Hiring Plan */}
          <div className="px-10 py-5 bg-gray-50/30 border-b border-gray-100 flex items-center gap-6 overflow-x-auto">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                    />
                  </svg>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Filters
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search requisitions..."
                      value={hiringPlanFilters.search}
                      onChange={(e) =>
                        setHiringPlanFilters((p) => ({
                          ...p,
                          search: e.target.value,
                        }))
                      }
                      className="bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all w-48 placeholder:text-gray-400 shadow-sm"
                    />
                  </div>

                  {/* Location Filter */}
                  <select
                    value={hiringPlanFilters.location || "All"}
                    onChange={(e) =>
                      setHiringPlanFilters((p) => ({
                        ...p,
                        location: e.target.value,
                      }))
                    }
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="All">All Locations</option>
                    {Array.from(
                      new Set(
                        (requisitions || [])
                          .map((r) => r.location)
                          .filter(Boolean),
                      ),
                    ).map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>

                  {/* Salary Filter */}
                  <select
                    value={hiringPlanFilters.salaryRange}
                    onChange={(e) =>
                      setHiringPlanFilters((p) => ({
                        ...p,
                        salaryRange: e.target.value,
                      }))
                    }
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="All">All Salaries</option>
                    <option value="0-15000">Under 15k ETB</option>
                    <option value="15000-30000">15k - 30k ETB</option>
                    <option value="30000-60000">30k - 60k ETB</option>
                    <option value="60000-100000">60k - 100k ETB</option>
                    <option value="100000+">100k+ ETB</option>
                  </select>

                  {/* Submitted On Filter */}
                  <select
                    value={hiringPlanFilters.submittedOn}
                    onChange={(e) =>
                      setHiringPlanFilters((p) => ({
                        ...p,
                        submittedOn: e.target.value,
                      }))
                    }
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="All">Any Submission</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                  </select>

                  {/* Portal Filter */}
                  <select
                    value={hiringPlanFilters.portal}
                    onChange={(e) =>
                      setHiringPlanFilters((p) => ({
                        ...p,
                        portal: e.target.value,
                      }))
                    }
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="All">All Portal Status</option>
                    <option value="Posted">Posted to Portal</option>
                    <option value="Not Posted">Internal Only</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={hiringPlanFilters.status}
                    onChange={(e) =>
                      setHiringPlanFilters((p) => ({
                        ...p,
                        status: e.target.value,
                      }))
                    }
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-[11px] font-bold outline-none focus:border-[#FDF22F] transition-all cursor-pointer min-w-[130px] shadow-sm"
                  >
                    <option value="All">All Statuses</option>
                    <option value="pending_md">Pending MD</option>
                    <option value="pending_hr">Pending HR</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <button
                    onClick={() =>
                      setHiringPlanFilters({
                        location: "All",
                        department: "All",
                        salaryRange: "All",
                        submittedOn: "All",
                        portal: "All",
                        status: "All",
                        search: "",
                      })
                    }
                    className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest ml-2 transition-colors flex items-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* KPI Mini-Summary */}
              {hiringPlanKpis && (
                <div className="flex items-center gap-4 border-l border-gray-100 pl-6 ml-6">
                  <div className="text-right">
                    <p className="text-[14px] font-black text-black leading-none">
                      {hiringPlanKpis.open_requests || 0}
                    </p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                      Open Reqs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-black text-emerald-500 leading-none">
                      {hiringPlanKpis.team_growth || 0}
                    </p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                      New Hires
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-gray-100">
              <tr>
                {[
                  "REQUISITION",
                  "HIRING MANAGER",
                  "LOCATION",
                  "SALARY",
                  "SUBMITTED ON",
                  "POSTED TO PORTAL",
                  "STATUS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requisitions === null ? null : requisitions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-8 py-20 text-center text-gray-400 italic text-sm"
                  >
                    No hiring plan items yet for{" "}
                    {user.tenant?.name || "this company"}.
                  </td>
                </tr>
              ) : (
                requisitions.map((req: any) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setDrawerReq(req)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-[14px] bg-[#FDF22F] flex flex-col items-center justify-center shadow-lg shadow-[#FDF22F]/20 border border-black/5 shrink-0 group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-5 h-5 bg-white/30 rounded-bl-full blur-[2px]" />
                          <span className="text-[7px] font-black text-black/40 uppercase tracking-[0.2em] leading-none mb-0.5">REQ</span>
                          <span className="text-[15px] font-black text-black leading-none tracking-tighter">{req.id}</span>
                        </div>
                        <div>
                          <p className="font-black text-[14px] text-[#000000] group-hover:text-[#FDF22F] transition-colors tracking-tight">
                            {req.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-bold tracking-widest uppercase text-[9px] border border-gray-200/50 shadow-sm">
                              {req.department}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[11px] text-gray-400 tracking-tight truncate max-w-[150px]">
                              {req.tenant?.name || user.tenant?.name || "Droga Pharma"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[13px] text-gray-600">
                      {req.requester?.name || "Hiring Manager"}
                    </td>
                    <td className="px-8 py-6 text-[13px] text-gray-600">
                      {req.location}
                    </td>
                    <td className="px-8 py-6 text-[13px] text-[#000000] font-black">
                      {req.budget ? req.budget.toLocaleString() : "15,000"} ETB
                      /mo
                    </td>
                    <td className="px-8 py-6">
                      {req.created_at ? (
                        (() => {
                          const d = new Date(req.created_at);
                          return (
                            <div>
                              <p className="text-[12px] font-bold text-[#000000]">
                                {d.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {d.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      {req.job_posting?.created_at ? (
                        (() => {
                          const d = new Date(
                            req.job_posting.published_at ||
                            req.job_posting.created_at,
                          );
                          const deadline = req.job_posting.deadline
                            ? new Date(req.job_posting.deadline)
                            : null;
                          return (
                            <div className="space-y-1">
                              <div>
                                <p className="text-[12px] font-bold text-[#000000]">
                                  {d.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                                <p className="text-[11px] text-emerald-600 font-bold">
                                  {d.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {deadline && (
                                <div className="pt-1 border-t border-gray-100">
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                    Deadline
                                  </p>
                                  <p className="text-[10px] font-black text-amber-600">
                                    {deadline.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <span className="px-2 py-1 bg-[#FDF22F]/10 text-black text-[10px] font-black uppercase tracking-widest rounded">
                          Not Posted
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${req.status === "approved"
                          ? "bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/10"
                          : req.status === "pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-500"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {initialTab === "Calendar" && (
        <div className="flex flex-col">
          <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#000000] flex items-center gap-3">
                <div className="w-2 h-8 bg-[#FDF22F] rounded-full" />
                INTERVIEW CALENDAR
              </h2>
              <p className="text-xs font-medium text-gray-400">
                Manage and view all upcoming scheduled interviews
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                Upcoming:{" "}
                <span className="text-[#000000]">{interviewsPagination?.total ?? interviewsList.length}</span>
              </p>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-gray-100">
              <tr>
                {[
                  "CANDIDATE",
                  "CONTACT",
                  "INTERVIEW DATE & TIME",
                  "TYPE",
                  "STATUS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(interviewsList || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-20 text-center text-gray-400 italic text-sm"
                  >
                    No upcoming scheduled interviews found.
                  </td>
                </tr>
              ) : (
                (interviewsList || []).map((interview: any) => (
                    <tr
                      key={interview.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (interview.applicant)
                          setDrawerApp(interview.applicant);
                      }}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-black">
                            {interview.applicant?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="font-black text-[13px] text-[#000000]">
                              {interview.applicant?.name || "Unknown"}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {interview.applicant?.job_posting?.title ||
                                "Open Role"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[12px] font-medium text-gray-600">
                          {interview.applicant?.email || "N/A"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {interview.applicant?.phone || "-"}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#000000] group-hover:text-white transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-[#000000] text-[13px]">
                              {new Date(
                                interview.scheduled_at,
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-[#000000] font-black text-[11px]">
                              {new Date(
                                interview.scheduled_at,
                              ).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[13px] text-gray-600 capitalize font-medium">
                        {interview.type}
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-[#FDF22F] text-[#000000] shadow-lg shadow-[#FDF22F]/30 ring-1 ring-[#FDF22F]/50">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Interview Pagination Controls */}
          {interviewsPagination && interviewsPagination.last_page > 1 && (
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Showing{" "}
                  <span className="text-[#000000]">
                    {interviewsPagination.from}
                  </span>{" "}
                  -{" "}
                  <span className="text-[#000000]">{interviewsPagination.to}</span>{" "}
                  of{" "}
                  <span className="text-[#000000]">
                    {interviewsPagination.total}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#000000] hover:border-[#000000] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {Array.from(
                  { length: Math.min(5, interviewsPagination.last_page) },
                  (_, i) => {
                    let startPage = Math.max(1, currentPage - 2);
                    if (startPage + 4 > interviewsPagination.last_page) {
                      startPage = Math.max(1, interviewsPagination.last_page - 4);
                    }
                    const pageNum = startPage + i;
                    if (pageNum > interviewsPagination.last_page) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchData(pageNum)}
                        className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all shadow-sm border ${currentPage === pageNum
                          ? "bg-[#FDF22F] text-black border-[#FDF22F]"
                          : "bg-white text-gray-400 border-gray-200 hover:border-[#FDF22F] hover:text-[#000000]"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() => fetchData(currentPage + 1)}
                  disabled={currentPage === interviewsPagination.last_page}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#000000] hover:border-[#000000] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {initialTab === "Reports" && (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
          {/* Mobile toggle bar (Reports specific) */}
          <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FDF22F] rounded-lg flex items-center justify-center font-black text-black text-sm">
                D
              </div>
              <p className="text-[13px] font-black text-black">
                Droga Pharma · TA Team
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-xl border border-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {activePanel && (
              <SidePanel
                title={PANEL_META[activePanel]?.title ?? 'Panel'}
                subtitle={PANEL_META[activePanel]?.subtitle ?? ''}
                onClose={() => setActivePanel(null)}
                loading={panelLoading}
              >
                {renderPanel()}
              </SidePanel>
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <div
            className={`${sidebarOpen ? "flex" : "hidden"} lg:flex w-full lg:w-60 bg-white border-r border-gray-100 flex-col shrink-0 overflow-y-auto`}
            style={{ maxHeight: "100vh", position: "sticky", top: 0 }}
          >
            <div className="hidden lg:block px-5 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FDF22F] rounded-xl flex items-center justify-center font-black text-black text-lg shadow-md">
                  D
                </div>
                <div>
                  <p className="text-[13px] font-black text-black leading-none">
                    Droga Pharma
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mt-0.5">
                    TA Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="px-3 py-5 flex-1 space-y-1">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">
                Main
              </p>

              {/* Dashboard - active */}
              <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#FDF22F] text-black shadow-md cursor-default">
                <BarChart2 size={15} />
                <span className="text-[13px] font-bold">Dashboard</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />
              </div>

              {/* Candidates → panel */}
              <button
                onClick={() => openPanel("candidates")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
              >
                <Users
                  size={15}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-[13px] font-bold">Candidates</span>
              </button>

              {/* Jobs → navigates */}
              <button
                onClick={() => router.push("/dashboard?tab=Jobs")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
              >
                <Briefcase
                  size={15}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-[13px] font-bold">Jobs</span>
              </button>

              {/* Hiring Plan → navigates */}
              <button
                onClick={() => router.push("/dashboard?tab=HiringPlan")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
              >
                <FileText
                  size={15}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-[13px] font-bold">Hiring Plan</span>
              </button>

              {/* Interviews → panel */}
              <button
                onClick={() => openPanel("interviews")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
              >
                <Activity
                  size={15}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-[13px] font-bold">Interviews</span>
              </button>

              {/* Reports (current) */}
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group">
                <PieChart
                  size={15}
                  className="text-gray-400 group-hover:text-black transition-colors"
                />
                <span className="text-[13px] font-bold">Reports</span>
              </button>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">
                  Analytics
                </p>

                {/* Employees → opens panel */}
                <button
                  onClick={() => openPanel("employees")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
                >
                  <Users
                    size={15}
                    className="text-gray-400 group-hover:text-black transition-colors"
                  />
                  <span className="text-[13px] font-bold">Employees</span>
                </button>

                {/* Turnover → opens panel */}
                <button
                  onClick={() => openPanel("turnover")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
                >
                  <TrendingDown
                    size={15}
                    className="text-gray-400 group-hover:text-black transition-colors"
                  />
                  <span className="text-[13px] font-bold">Turnover</span>
                </button>

                {/* Performance → opens panel */}
                <button
                  onClick={() => openPanel("performance")}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-black transition-all group"
                >
                  <TrendingUp
                    size={15}
                    className="text-gray-400 group-hover:text-black transition-colors"
                  />
                  <span className="text-[13px] font-bold">Performance</span>
                </button>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] px-3 mb-3">
                  System
                </p>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-black transition-all">
                  <span className="text-sm">⚙️</span>
                  <span className="text-[13px] font-bold">Settings</span>
                </button>
                <button
                  onClick={() => openPanel("help")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activePanel === "help" ? "bg-[#FDF22F] text-black shadow-sm" : "text-gray-400 hover:bg-gray-50 hover:text-black"}`}
                >
                  <span className="text-sm">❓</span>
                  <span className="text-[13px] font-bold">Help & Support</span>
                </button>
              </div>
            </div>
            <div className="px-3 py-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-[#FDF22F] font-black text-sm shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-black text-black truncate">
                    {user.name}
                  </p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                    TA Team
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-300 hover:text-black transition-colors font-black text-sm"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {statsLoading && !stats ? (
              /* Skeleton placeholder while data loads */
              <div className="p-10 space-y-6 animate-pulse">
                <div className="grid grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                        <div className="h-5 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="bg-white rounded-[32px] border border-gray-100 h-64" />
                  <div className="space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 h-28" />
                    <div className="bg-white rounded-[32px] border border-gray-100 h-32" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-10">
                {/* ── Top Greeting ── */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-4xl font-black text-[#000000] tracking-tight">
                      Welcome back, {user.name.split(' ')[0]}!
                    </h2>
                    <p className="text-[13px] font-bold text-gray-400 mt-2 flex items-center gap-2">
                       Everything is running smoothly today.
                    </p>
                  </div>
                  
                  {/* Live Pulsing Dot - Ported and Enlarged */}
                  <div className="flex items-center gap-4 bg-white border border-gray-100 shadow-sm px-6 py-3 rounded-2xl group hover:shadow-md transition-all cursor-default w-fit shadow-lg shadow-emerald-500/5">
                    <div className="relative flex items-center justify-center">
                      {/* Inner dot */}
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 z-10 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                      {/* Pulse rings */}
                      <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <div className="absolute inset-0 w-full h-full rounded-full bg-emerald-400/20 animate-pulse scale-[2.5]" />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-[12px] font-black text-black uppercase tracking-widest leading-none">LIVE</span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Real-time stats</span>
                    </div>
                  </div>
                </div>

              {/* ── Horizontal Filter Utility Bar ── */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3.5 flex items-center gap-3 flex-wrap">
                {/* Section label */}
                <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                    />
                  </svg>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Filters
                  </span>
                </div>

                {/* Timeframe */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">
                    Timeframe
                  </span>
                  <select
                    value={reportFilters.dateRange}
                    onChange={(e) => {
                      setReportFilters((prev) => ({
                        ...prev,
                        dateRange: e.target.value,
                      }));
                      fetchData(1);
                    }}
                    className="text-[11px] font-bold text-[#000000] bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#000000] hover:border-gray-200 transition-all appearance-none shadow-sm"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="All">All Time</option>
                  </select>
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-gray-100" />

                {/* Department */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">
                    Department
                  </span>
                  <select
                    value={reportFilters.department}
                    onChange={(e) => {
                      setReportFilters((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }));
                      fetchData(1);
                    }}
                    className="text-[11px] font-bold text-[#000000] bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#000000] hover:border-gray-200 transition-all appearance-none shadow-sm max-w-[160px]"
                  >
                    <option value="All">All Departments</option>
                    {[
                      ...new Set(
                        (jobs || [])
                          .map((j) => j.department || j.requisition?.department)
                          .filter(Boolean),
                      ),
                    ].map((dept) => (
                      <option key={String(dept)} value={String(dept)}>
                        {String(dept)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-gray-100" />

                {/* Specific Role */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:block">
                    Role
                  </span>
                  <select
                    value={reportFilters.jobId}
                    onChange={(e) => {
                      setReportFilters((prev) => ({
                        ...prev,
                        jobId: e.target.value,
                      }));
                      fetchData(1);
                    }}
                    className="text-[11px] font-bold text-[#000000] bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-[#000000] hover:border-gray-200 transition-all appearance-none shadow-sm max-w-[180px]"
                  >
                    <option value="All">All Open Roles</option>
                    {(jobs || []).map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Spacer — pushes buttons to the far right */}
                <div className="flex-1" />

                {/* Export button */}
                <button
                  onClick={handleExport}
                  title="Export Report as Excel"
                  className="flex items-center gap-2 px-4 py-2 h-9 bg-[#FDF22F] text-black text-[10px] font-black uppercase tracking-widest rounded-xl border border-[#FDF22F]/50 hover:bg-black hover:text-[#FDF22F] transition-all shadow-sm shrink-0"
                >
                  <Download size={13} />
                  Export
                </button>

                {/* Refresh icon button */}
                <button
                  onClick={() => fetchData(1)}
                  title="Refresh data"
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-sm ${statsLoading
                    ? "bg-[#000000]/5 border-[#000000]/20 text-[#000000] cursor-not-allowed"
                    : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-[#000000]/5 hover:border-[#000000]/30 hover:text-[#000000]"
                    }`}
                >
                  <svg
                    className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {/* KPI Row (Top): Executive Summary Layer */}
              <div className="grid grid-cols-4 gap-8">
                {[
                  {
                    label: "Total Employees",
                    value: stats?.metrics?.total_employees?.toLocaleString() || "0",
                    trend: `${stats?.total_employees_trend > 0 ? "+" : ""}${stats?.total_employees_trend || 0}% from last month`,
                    isPositive: true,
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    ),
                    color: "text-indigo-500",
                    bg: "bg-indigo-50/50",
                  },
                  {
                    label: "Active Applicants",
                    value: stats?.funnel?.applied?.toLocaleString() || "0",
                    trend: "-1.3% from last week",
                    isPositive: false,
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ),
                    color: "text-amber-500",
                    bg: "bg-amber-50/50",
                  },
                  {
                    label: "Retention Rate",
                    value: (stats?.metrics?.retention_rate || 98) + "%",
                    trend:
                      (stats?.metrics?.retention_rate || 98) >= 95
                        ? "+0.5% Healthy"
                        : "-1.2% Review Needed",
                    isPositive: (stats?.metrics?.retention_rate || 98) >= 95,
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12m0 8h5.082m-5.082-5H19a4 4 0 003.582-5H19"
                        />
                      </svg>
                    ),
                    color: "text-black",
                    bg: "bg-[#FDF22F]",
                  },
                  {
                    label: "Ongoing Job Openings",
                    value: stats?.metrics?.active_jobs || 0,
                    trend: `${stats?.total_active_jobs_trend > 0 ? "+" : ""}${stats?.total_active_jobs_trend || 0}% Growth`,
                    isPositive: true,
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    ),
                    color: "text-orange-500",
                    bg: "bg-orange-50/50",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-sm`}
                      >
                        {stat.icon}
                      </div>
                      <p className="text-[13px] font-black text-gray-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-[34px] font-black text-[#000000] tracking-tighter leading-none mb-3">
                        {stat.value}
                      </p>
                      <div
                        className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider ${stat.trend === "Positions" ? "text-gray-300" : stat.isPositive ? "text-emerald-500" : "text-red-400"}`}
                      >
                        {stat.trend !== "Positions" && (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {stat.isPositive ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3.5"
                                d="M5 15l7-7 7 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3.5"
                                d="M19 9l-7 7-7-7"
                              />
                            )}
                          </svg>
                        )}
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analytics Layer (Middle): Larger Chart Modules */}
              <div className="grid grid-cols-2 gap-8">
                {/* Employee Turnover — Duplicated from HR Manager Dashboard */}
                <motion.div
                  initial={{ opacity: 0, y: 30, rotateX: 5 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: false, amount: 0.15, margin: "-100px 0px" }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 30px 45px -15px rgba(0,0,0,0.15)",
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.215, 0.61, 0.355, 1],
                    delay: 0.1,
                  }}
                  className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-5 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                    <div>
                      <h3 className="text-[16px] sm:text-[18px] font-black text-black tracking-tight">
                        Employee Turnover
                      </h3>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mt-1">
                        Monthly Rate ·{" "}
                        {reportFilters.dateRange.length > 3
                          ? `Year ${reportFilters.dateRange}`
                          : "12 Month View"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FDF22F]/10 border border-[#FDF22F]/30 px-3 py-1.5 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-[#FDF22F] animate-pulse" />
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">
                        Live Trend
                      </span>
                    </div>
                  </div>
                  <div className="relative h-40 sm:h-52">
                    <AnimatePresence>
                      {hoveredTurnover && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-0 z-30 pointer-events-none"
                          style={{
                            left: `${computedTurnoverData.length > 1 ? (hoveredTurnover.index * 100) / (computedTurnoverData.length - 1) : 50}%`,
                            transform:
                              hoveredTurnover.index === 0
                                ? "translateX(0)"
                                : hoveredTurnover.index ===
                                    computedTurnoverData.length - 1
                                  ? "translateX(-100%)"
                                  : "translateX(-50%)",
                            marginTop: "-60px",
                          }}
                        >
                          <div className="bg-white/95 backdrop-blur-xl text-black px-5 py-4 rounded-[24px] shadow-2xl border border-gray-100 whitespace-nowrap min-w-[190px]">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                              {hoveredTurnover.data.full_label}
                            </p>
                            <div className="flex items-baseline gap-1 mb-3">
                              <span className="text-[26px] font-black text-black tabular-nums">
                                {hoveredTurnover.data.rate}
                              </span>
                              <span className="text-[14px] font-black text-[#FDF22F]">
                                %
                              </span>
                            </div>
                            <div className="flex gap-4 border-t border-gray-100 pt-2">
                              <div>
                                <p className="text-[8px] font-black text-emerald-500 uppercase">
                                  Resigned
                                </p>
                                <p className="text-[15px] font-black">
                                  {hoveredTurnover.data.resigned}
                                </p>
                              </div>
                              <div>
                                <p className="text-[8px] font-black text-rose-500 uppercase">
                                  Terminated
                                </p>
                                <p className="text-[15px] font-black">
                                  {hoveredTurnover.data.terminated}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {computedTurnoverData.length > 1 ? (
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 800 200"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="areaGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#FDF22F"
                              stopOpacity="0.25"
                            />
                            <stop
                              offset="100%"
                              stopColor="#FDF22F"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        {[50, 100, 150].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="800"
                            y2={y}
                            stroke="#F3F4F6"
                            strokeWidth="1"
                          />
                        ))}
                        <path d={svgArea} fill="url(#areaGrad)" />
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#FDF22F"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {svgPts.map((p, i) => (
                          <g
                            key={i}
                            onMouseEnter={() =>
                              setHoveredTurnover({
                                data: computedTurnoverData[i],
                                index: i,
                              })
                            }
                            onMouseLeave={() => setHoveredTurnover(null)}
                          >
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="22"
                              fill="transparent"
                              className="cursor-pointer"
                            />
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={hoveredTurnover?.index === i ? 7 : 4}
                              fill={
                                hoveredTurnover?.index === i
                                  ? "#000"
                                  : "#FDF22F"
                              }
                              stroke={
                                hoveredTurnover?.index === i
                                  ? "#FDF22F"
                                  : "#fff"
                              }
                              strokeWidth="2"
                              className="transition-all duration-200"
                            />
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-[12px] text-gray-400">
                          No turnover data for this period
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    {computedTurnoverData.map((d: any, i: number) => (
                      <span
                        key={i}
                        className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase"
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Hiring Funnel Overview — Pro SVG Bézier Funnel */}
                <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-[18px] font-black text-[#000000] tracking-tight">
                        Hiring Funnel Overview
                      </h3>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                        Candidate pipeline · {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FDF22F]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-black/60" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Flow
                      </span>
                    </div>
                  </div>

                  {/* KPI row */}
                  {(() => {
                    const stages = [
                      {
                        label: "Applied",
                        count: stats?.funnel?.applied || 0,
                        color: "#000000",
                      },
                      {
                        label: "Screening (Includes Written Exam)",
                        count: stats?.funnel?.screening || 0,
                        color: "#444444",
                      },
                      {
                        label: "Interviewing (Combines Technical + Final)",
                        count: stats?.funnel?.interviewing || 0,
                        color: "#666666",
                      },
                      {
                        label: "Offered",
                        count: stats?.funnel?.offered || 0,
                        color: "#888888",
                      },
                      {
                        label: "Hired",
                        count: stats?.funnel?.hired || 0,
                        color: "#FDF22F",
                      },
                    ];
                    const max = Math.max(...stages.map((s) => s.count), 1);

                    // SVG constants
                    const W = 400,
                      H = 130,
                      padX = 0;
                    const n = stages.length;
                    const segW = (W - padX * 2) / n;

                    // Compute y-coords per edge (top & bottom) for each segment boundary
                    // height of each stage proportional to its count relative to max
                    const halfHeights = stages.map((s) => {
                      const ratio = s.count / max;
                      const minH = 0.18; // keep thin stages visible
                      return ((minH + (1 - minH) * ratio) * H) / 2;
                    });
                    const cy = H / 2;

                    // x positions for each stage boundary (n+1 edges)
                    const xs = Array.from(
                      { length: n + 1 },
                      (_, i) => padX + i * segW,
                    );

                    // top / bottom y at each boundary (average of adjacent stages)
                    const topYs = xs.map((_, xi) => {
                      if (xi === 0) return cy - halfHeights[0];
                      if (xi === n) return cy - halfHeights[n - 1];
                      return cy - (halfHeights[xi - 1] + halfHeights[xi]) / 2;
                    });
                    const botYs = xs.map((_, xi) => {
                      if (xi === 0) return cy + halfHeights[0];
                      if (xi === n) return cy + halfHeights[n - 1];
                      return cy + (halfHeights[xi - 1] + halfHeights[xi]) / 2;
                    });

                    // Build a smooth path per segment using cubic Bézier
                    function segPath(i: number) {
                      const x0 = xs[i],
                        x1 = xs[i + 1];
                      const cpX = (x0 + x1) / 2;
                      // Top edge: left-to-right
                      const topEdge = `M ${x0} ${topYs[i]} C ${cpX} ${topYs[i]}, ${cpX} ${topYs[i + 1]}, ${x1} ${topYs[i + 1]}`;
                      // Bottom edge: right-to-left to close
                      const botEdge = `L ${x1} ${botYs[i + 1]} C ${cpX} ${botYs[i + 1]}, ${cpX} ${botYs[i]}, ${x0} ${botYs[i]} Z`;
                      return `${topEdge} ${botEdge}`;
                    }

                    // Full gradient outline path (top spine left→right, bot spine right→left)
                    const topSpine =
                      `M ${xs[0]} ${topYs[0]} ` +
                      xs
                        .slice(1)
                        .map((x, i) => {
                          const cpX = (xs[i] + x) / 2;
                          return `C ${cpX} ${topYs[i]}, ${cpX} ${topYs[i + 1]}, ${x} ${topYs[i + 1]}`;
                        })
                        .join(" ");
                    const botSpine = xs
                      .slice()
                      .reverse()
                      .map((x, ri) => {
                        const i = n - ri;
                        if (ri === 0) return `L ${x} ${botYs[i]}`;
                        const cpX = (xs[i] + xs[i - 1]) / 2;
                        return `C ${cpX} ${botYs[i]}, ${cpX} ${botYs[i - 1]}, ${xs[i - 1]} ${botYs[i - 1]}`;
                      })
                      .join(" ");
                    const fullPath = `${topSpine} ${botSpine} Z`;

                    return (
                      <>
                        {/* Stage KPI numbers */}
                        <div className="flex justify-between mb-5 px-1">
                          {stages.map((s, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-0.5"
                              style={{ flex: 1 }}
                            >
                              <p
                                className="text-[22px] font-black tracking-tighter"
                                style={{ color: s.color }}
                              >
                                {s.count.toLocaleString()}
                              </p>
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                {s.label}
                              </p>
                              {i > 0 && (
                                <p className="text-[8px] font-black text-gray-200 mt-0.5">
                                  {stages[i - 1].count > 0
                                    ? Math.round(
                                      (s.count / stages[i - 1].count) * 100,
                                    )
                                    : 0}
                                  % conv.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* SVG Bézier Funnel */}
                        <div className="relative w-full" style={{ height: H }}>
                          <svg
                            viewBox={`0 0 ${W} ${H}`}
                            className="w-full h-full"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              {/* Purple → teal gradient across full width */}
                              <linearGradient
                                id="funnelGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#000000"
                                  stopOpacity="0.85"
                                />
                                <stop
                                  offset="25%"
                                  stopColor="#222222"
                                  stopOpacity="0.80"
                                />
                                <stop
                                  offset="50%"
                                  stopColor="#444444"
                                  stopOpacity="0.75"
                                />
                                <stop
                                  offset="75%"
                                  stopColor="#666666"
                                  stopOpacity="0.85"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#FDF22F"
                                  stopOpacity="0.95"
                                />
                              </linearGradient>
                              {/* Lighter version for per-segment hover */}
                              {stages.map((s, i) => (
                                <linearGradient
                                  key={i}
                                  id={`segGrad${i}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="0%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={s.color}
                                    stopOpacity="0.95"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={
                                      stages[Math.min(i + 1, n - 1)].color
                                    }
                                    stopOpacity="0.95"
                                  />
                                </linearGradient>
                              ))}
                              {/* Gloss overlay */}
                              <linearGradient
                                id="funnelGloss"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="white"
                                  stopOpacity="0.20"
                                />
                                <stop
                                  offset="50%"
                                  stopColor="white"
                                  stopOpacity="0.04"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="white"
                                  stopOpacity="0.12"
                                />
                              </linearGradient>
                            </defs>

                            {/* 1. Main filled funnel shape with gradient */}
                            <path d={fullPath} fill="url(#funnelGrad)" />

                            {/* 2. Gloss layer on top */}
                            <path d={fullPath} fill="url(#funnelGloss)" />

                            {/* 3. Per-segment paths (slightly lighter on hover via opacity) */}
                            {stages.map((_, i) => (
                              <path
                                key={i}
                                d={segPath(i)}
                                fill="transparent"
                                stroke="white"
                                strokeOpacity="0.15"
                                strokeWidth="1.5"
                                className="transition-opacity cursor-pointer hover:stroke-opacity-40"
                              />
                            ))}

                            {/* 4. Glassmorphic vertical dividers at each boundary */}
                            {xs.slice(1, -1).map((x, i) => (
                              <line
                                key={i}
                                x1={x}
                                y1={topYs[i + 1]}
                                x2={x}
                                y2={botYs[i + 1]}
                                stroke="white"
                                strokeOpacity="0.25"
                                strokeWidth="1.5"
                                strokeDasharray="2 3"
                              />
                            ))}

                            {/* 5. Subtle flow particles */}
                            {[0.18, 0.45, 0.72].map((frac, i) => (
                              <circle
                                key={i}
                                cx={W * frac}
                                cy={cy + (i % 2 === 0 ? -8 : 8)}
                                r={i === 1 ? 3 : 2}
                                fill="white"
                                fillOpacity="0.3"
                                className={
                                  i === 0
                                    ? "animate-ping"
                                    : i === 1
                                      ? "animate-pulse"
                                      : "animate-bounce"
                                }
                              />
                            ))}
                          </svg>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {/* Detailed Table Layer (Bottom): Granular Candidate Info */}
              <div className="space-y-8">
                {/* Recent Applications Table - Full Width */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                    <h3 className="text-[17px] font-black text-[#000000]">
                      Recent Applications
                    </h3>
                    <div className="flex gap-4">
                      <button className="text-[10px] font-black uppercase text-gray-400 hover:text-[#000000] transition-colors flex items-center gap-1.5 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
                          />
                        </svg>
                        Filter
                      </button>
                      <button className="text-[10px] font-black uppercase text-gray-400 hover:text-[#000000] transition-colors flex items-center gap-1.5 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50/30">
                          <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-300 tracking-[0.15em]">
                            Candidate Profile
                          </th>
                          <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-300 tracking-[0.15em]">
                            Position Applied
                          </th>
                          <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-300 tracking-[0.15em]">
                            Date Applied
                          </th>
                          <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-300 tracking-[0.15em]">
                            Current Status
                          </th>
                          <th className="px-8 py-5 text-[10px] uppercase font-black text-gray-300 tracking-[0.15em]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50/50">
                        {(stats?.raw_data || []).slice(0, 8).map((app: any) => (
                          <tr
                            key={app.id}
                            className="hover:bg-gray-50/40 transition-colors group cursor-pointer"
                            onClick={() => setDrawerApp(app)}
                          >
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#FDF22F] border border-[#FDF22F]/20 flex items-center justify-center text-black font-black text-xs uppercase shadow-sm">
                                  {app.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-[14px] font-black text-[#000000] group-hover:text-[#000000] transition-colors">
                                    {app.name}
                                  </p>
                                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-tight">
                                    {app.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-[13px] font-black text-gray-600">
                              {app.job_title}
                            </td>
                            <td className="px-8 py-5 text-[13px] font-black text-gray-400 capitalize">
                              {new Date(app.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-8 py-5">
                              <span
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${app.status === "hired"
                                  ? "bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/10"
                                  : app.status === "rejected"
                                    ? "bg-red-50 text-red-600"
                                    : app.status === "interview"
                                      ? "bg-amber-50 text-amber-600"
                                      : app.status === "offer"
                                        ? "bg-black text-white"
                                        : "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${app.status === "hired" ? "bg-black" : app.status === "rejected" ? "bg-red-500" : "bg-current opacity-40"}`}
                                />
                                {app.status}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-[#FDF22F] hover:text-black">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!stats?.raw_data || stats.raw_data.length === 0) && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-8 py-20 text-center text-xs font-black text-gray-300 uppercase tracking-[0.2em]"
                            >
                              No recent applications found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Candidate Sources - Integrated as a secondary Bento row */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-[17px] font-black text-[#000000]">
                        Candidate Sources
                      </h3>
                      <p className="text-[11px] font-black text-gray-300 uppercase mt-1 tracking-widest">
                        Efficiency by channel
                      </p>
                    </div>
                    <button
                      onClick={() => setAddCandidateModal(true)}
                      className="bg-[#FDF22F] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl shadow-[#FDF22F]/20 flex items-center gap-2 border border-[#FDF22F]/50"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Manually
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    {stats?.sources?.slice(0, 6).map((src: any, i: number) => {
                      const total = stats?.funnel?.applied || 1;
                      const pct = Math.round((src.count / total) * 100);
                      return (
                        <div
                          key={i}
                          className="bg-gray-50/30 p-5 rounded-2xl border border-gray-100/50 group/item hover:bg-white hover:border-emerald-100 transition-all"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div
                              className={`w-8 h-8 rounded-lg ${i === 0 ? "bg-indigo-50 text-indigo-500" : i === 1 ? "bg-amber-50 text-amber-500" : "bg-white text-gray-300"} border border-gray-100 flex items-center justify-center font-black text-[10px]`}
                            >
                              {i + 1}
                            </div>
                            <p className="text-[14px] font-black text-[#000000] tracking-tighter">
                              {pct}%
                            </p>
                          </div>
                          <p className="text-[11px] font-black text-gray-400 mb-3 uppercase tracking-widest">
                            {src.source || "Direct"}
                          </p>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${i === 0 ? "bg-indigo-400" : i === 1 ? "bg-amber-400" : "bg-emerald-400"} rounded-full transition-all duration-1000`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Requisition Detail Side Drawer */}
      <AnimatePresence>
        {drawerReq && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerReq(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[120] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-[#FDF22F] tracking-widest uppercase mb-1">
                    REQ{drawerReq.id} Details
                  </p>
                  <h2 className="text-2xl font-black text-[#000000]">
                    {drawerReq.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {drawerReq.department} ·{" "}
                    {drawerReq.tenant?.name ||
                      user.tenant?.name ||
                      "Droga Pharma"}
                  </p>
                </div>
                <button
                  onClick={() => setDrawerReq(null)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Status
                    </p>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${drawerReq.status === "approved"
                        ? "bg-[#FDF22F] text-black"
                        : drawerReq.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-500"
                        }`}
                    >
                      {drawerReq.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Requested By
                    </p>
                    <p className="text-sm font-bold text-[#000000]">
                      {drawerReq.requester?.name || "Hiring Manager"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Location / Branch
                    </p>
                    <p className="text-sm font-bold text-[#000000]">
                      {drawerReq.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Priority
                    </p>
                    <p className="text-sm font-black uppercase text-black bg-[#FDF22F]/20 px-2 py-0.5 rounded inline-block">
                      {drawerReq.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">
                      Budget Salary
                    </p>
                    <p className="text-sm font-black text-[#000000]">
                      {drawerReq.budget
                        ? drawerReq.budget.toLocaleString()
                        : "15,000"}{" "}
                      ETB /mo
                    </p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Full Job Description (JD)
                    </h3>
                    {drawerReq.jd_path && !drawerReq.jd_content && (
                      <a
                        href={`${API_URL}/v1/requisitions/${drawerReq.id}/jd?token=${typeof window !== "undefined" ? localStorage.getItem("auth_token") : ""}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-black text-black hover:bg-black hover:text-white uppercase tracking-widest bg-[#FDF22F] px-4 py-2 rounded-xl transition-all shadow-lg shadow-[#FDF22F]/10"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Legacy JD Doc
                      </a>
                    )}
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-inner max-h-[400px] overflow-y-auto">
                    {drawerReq.jd_content ? (
                      <div
                        className="text-sm font-medium text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: drawerReq.jd_content,
                        }}
                      />
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No text-based JD content provided.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Description & Justification
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed bg-white p-6 rounded border border-gray-100 italic">
                      &quot;
                      {drawerReq.description ||
                        "No detailed description provided."}
                      &quot;
                    </div>
                  </div>
                </section>

                {drawerReq.status === "approved" && (
                  <div className="p-6 bg-[#FDF22F]/10 rounded-xl border border-[#FDF22F]/20 flex items-start gap-4">
                    <div className="bg-[#FDF22F] text-black p-2 rounded-lg shadow-sm">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-black uppercase tracking-wide">
                        Approved & Ready
                      </h4>
                      <p className="text-xs text-black/60 mt-1 leading-relaxed font-medium">
                        This requisition has been signed off by HR. You can now
                        publish it to the external careers portal.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requisition Action Bar */}
              <div className="p-8 border-t border-gray-100 bg-gray-50/30">
                {drawerReq.status === "approved" && (
                  <div className="space-y-4 mb-4">
                    <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FDF22F]/10 flex items-center justify-center text-black">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-[11px] font-black text-[#000000] uppercase tracking-widest">
                          Set Application Deadline
                        </p>
                      </div>
                      <input
                        type="date"
                        value={postJobDeadline}
                        onChange={(e) => setPostJobDeadline(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] outline-none text-sm font-black transition-all"
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <p className="text-[10px] text-gray-400 mt-2 italic font-medium">
                        After this date, the vacancy will automatically be
                        removed from the public portal.
                      </p>
                    </div>
                  </div>
                )}
                {drawerReq.status === "approved" ? (
                  <button
                    onClick={() => handlePostJob(drawerReq)}
                    disabled={actionLoading}
                    className="w-full py-5 bg-[#FDF22F] text-black rounded-xl text-[13px] font-black tracking-[0.2em] uppercase shadow-xl shadow-[#FDF22F]/20 hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Post Job to Public Portal
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-5 bg-gray-100 text-gray-300 rounded-lg text-[13px] font-black tracking-widest uppercase cursor-not-allowed"
                  >
                    Awaiting HR Approval
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manually Add Candidate Modal */}
      <AnimatePresence>
        {addCandidateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddCandidateModal(false)}
              className="absolute inset-0 bg-[#000000]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-gray-100 flex flex-col max-h-[90vh]"
            >
              <div className="bg-[#F9FAFB] p-8 border-b border-gray-100 relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <svg
                    className="w-16 h-16 text-[#000000]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-[#000000] flex items-center gap-3 relative z-10">
                  <div className="w-2 h-8 bg-[#FDF22F] rounded-full" />
                  MANUAL SOURCING
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-2 relative z-10">
                  Directly add an applicant to the pipeline. Their source will
                  be accurately tracked in reporting.
                </p>
              </div>
              <div className="p-8 overflow-y-auto">
                <form
                  id="add-candidate-form"
                  onSubmit={handleAddCandidate}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Candidate Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={candidateForm.name}
                        onChange={(e) =>
                          setCandidateForm({
                            ...candidateForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-sm font-bold text-[#000000] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                        placeholder="ex. John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        value={candidateForm.email}
                        onChange={(e) =>
                          setCandidateForm({
                            ...candidateForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-sm font-bold text-[#000000] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={candidateForm.phone}
                        onChange={(e) =>
                          setCandidateForm({
                            ...candidateForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-sm font-bold text-[#000000] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                        placeholder="+251 9..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Target Job / Open Role{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={candidateForm.job_posting_id}
                        onChange={(e) =>
                          setCandidateForm({
                            ...candidateForm,
                            job_posting_id: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-gray-200 text-sm font-bold text-[#000000] rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                      >
                        <option value="" disabled>
                          Select a target position...
                        </option>
                        {(jobs || [])
                          .filter((j) => j.status === "active")
                          .map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.title} ({j.department})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-[#FDF22F] uppercase tracking-widest ml-1">
                        Sourcing Channel <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "LinkedIn",
                          "Referral",
                          "Website",
                          "Job Fair",
                          "Direct Outsourcing",
                          "Other",
                        ].map((src) => (
                          <button
                            type="button"
                            key={src}
                            onClick={() =>
                              setCandidateForm({
                                ...candidateForm,
                                source: src,
                              })
                            }
                            className={`p-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all ${candidateForm.source === src
                              ? "bg-[#FDF22F]/10 border-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/10"
                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                              }`}
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="p-8 bg-white border-t border-gray-100 flex gap-4 relative">
                {candidateSuccess && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-black text-[#000000] uppercase tracking-widest">
                        Candidate Added Successfully!
                      </p>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAddCandidateModal(false)}
                  className="px-6 py-4 flex-1 bg-gray-50 text-gray-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-candidate-form"
                  disabled={
                    actionLoading ||
                    candidateSuccess ||
                    !candidateForm.name ||
                    !candidateForm.email ||
                    !candidateForm.job_posting_id
                  }
                  className="px-6 py-4 flex-[2] bg-[#FDF22F] text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50 transition-all flex justify-center items-center shadow-xl shadow-[#FDF22F]/20 border border-[#FDF22F]/30"
                >
                  {actionLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Confirm & Add to Pipeline"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Applicant Detail Side Drawer */}
      <AnimatePresence>
        {drawerApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerApp(null)}
              className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[160] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto pb-10 flex flex-col">
                {/* Premium Profile Header - Now Sticky & Inside Scrollable */}
                <div className="sticky top-0 z-[70] h-64 bg-[#000000] flex items-center px-10 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/30 to-transparent opacity-40" />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                  <button
                    onClick={() => setDrawerApp(null)}
                    className="absolute top-8 right-8 text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2.5 rounded-xl backdrop-blur-md z-[80]"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="relative flex items-center gap-8 w-full">
                    <div className="w-32 h-32 rounded-[36px] bg-white p-1 shadow-2xl overflow-hidden border-4 border-white/10 shrink-0">
                      {drawerApp.photo_path ? (
                        <img
                          src={getStorageUrl(drawerApp.photo_path)}
                          alt={drawerApp.name}
                          className="w-full h-full object-cover rounded-[30px]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#000000] to-[#222222] rounded-[30px] flex items-center justify-center text-white text-4xl font-black shadow-inner">
                          {drawerApp.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                        {drawerApp.name}
                      </h2>
                      <div className="inline-flex items-center gap-2 bg-[#FDF22F] px-3 py-1 rounded-lg shadow-lg shadow-[#FDF22F]/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        <p className="text-black font-black text-[10px] uppercase tracking-widest">
                          {drawerApp.job_posting?.title || "Open Role"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-10 space-y-10 flex-1">
                  {drawerApp.status !== "onboarding" && (
                    <>
                      {/* Enhanced Stat Grid */}
                      <section className="grid grid-cols-3 gap-6 -mt-8 relative z-[75]">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col justify-center transform hover:scale-[1.02] transition-transform">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            Experience
                          </p>
                          <p className="text-2xl font-black text-[#000000]">
                            {drawerApp.years_of_experience ??
                              drawerApp.experience ??
                              "N/A"}{" "}
                            <span className="text-xs text-gray-400 font-bold uppercase ml-1">
                              Years
                            </span>
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col justify-center transform hover:scale-[1.02] transition-transform">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            Match Score
                          </p>
                          <div className="flex items-center gap-2.5">
                            <p className="text-2xl font-black text-[#000000]">
                              {drawerApp.match_score || 88}%
                            </p>
                            <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                              <div
                                className="h-full bg-gradient-to-r from-black to-[#FDF22F]"
                                style={{ width: `${drawerApp.match_score || 88}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col justify-center transform hover:scale-[1.02] transition-transform">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            Age / Gender
                          </p>
                          <p className="text-lg font-black text-[#000000]">
                            {drawerApp.age || "N/A"}{" "}
                            <span className="text-gray-300 mx-1">•</span>{" "}
                            {drawerApp.gender || "N/A"}
                          </p>
                        </div>
                      </section>

                      {/* Detailed Info Cards */}
                      <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-4">
                          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                            Candidate Profile
                          </h3>
                          <div className="space-y-3">
                            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4 hover:bg-white transition-colors">
                              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#000000]">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                                  Email Address
                                </p>
                                <p className="text-sm font-bold text-[#000000] truncate">
                                  {drawerApp.email}
                                </p>
                              </div>
                            </div>
                            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4 hover:bg-white transition-colors">
                              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#000000]">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                                  Phone Number
                                </p>
                                <p className="text-sm font-bold text-[#000000] truncate">
                                  {drawerApp.phone || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                            Professional Links
                          </h3>
                          <div className="space-y-3">
                            {drawerApp.portfolio_link ? (
                              <a
                                href={drawerApp.portfolio_link}
                                target="_blank"
                                className="p-5 bg-[#000000]/5 rounded-2xl border border-[#000000]/10 flex items-center gap-4 hover:bg-[#000000]/10 transition-all group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#FDF22F] flex items-center justify-center text-black shadow-lg shadow-[#FDF22F]/20">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2.5"
                                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 019-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black text-[#000000] uppercase leading-none mb-1">
                                    Portfolio
                                  </p>
                                  <p className="text-sm font-bold text-[#000000] group-hover:underline flex items-center gap-1">
                                    Visit Portfolio{" "}
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </p>
                                </div>
                              </a>
                            ) : (
                              <div className="p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-[11px] font-bold uppercase tracking-widest italic h-[116px]">
                                No Portfolio Provided
                              </div>
                            )}
                          </div>
                        </section>
                      </div>

                      <section className="space-y-4">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                          Professional Background
                        </h3>
                        <div className="p-8 bg-gray-50/50 rounded-[32px] border border-gray-100 italic text-[#000000] leading-relaxed relative overflow-hidden group hover:bg-white hover:shadow-xl transition-all">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FDF22F]" />
                          <div className="absolute top-4 left-4 text-6xl text-gray-200/50 select-none group-hover:text-[#000000]/10 transition-colors">
                            “
                          </div>
                          <p className="relative z-10 pl-6 text-[15px] font-medium opacity-80">
                            {drawerApp.professional_background ||
                              "No professional summary provided."}
                          </p>
                        </div>
                      </section>
                      {/* Scoring & Assessment Results */}
                      {(drawerApp.written_exam_score ||
                        drawerApp.technical_interview_score) && (
                          <section className="space-y-4">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FDF22F]" />
                              Scoring & Assessment
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                              <div className="p-6 bg-[#FDF22F]/5 border border-[#FDF22F]/20 rounded-3xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                  Written Exam
                                </p>
                                <p className="text-3xl font-black text-black">
                                  {drawerApp.written_exam_score
                                    ? `${drawerApp.written_exam_score}%`
                                    : "N/A"}
                                </p>
                              </div>
                              <div className="p-6 bg-[#FDF22F]/5 border border-[#FDF22F]/20 rounded-3xl">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                  Technical Interview
                                </p>
                                <p className="text-3xl font-black text-black">
                                  {drawerApp.technical_interview_score
                                    ? `${drawerApp.technical_interview_score}%`
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            {drawerApp.interviewer_feedback && (
                              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                  Interviewer Feedback
                                </p>
                                <p className="text-sm font-medium text-gray-600 italic leading-relaxed">
                                  &quot;{drawerApp.interviewer_feedback}&quot;
                                </p>
                              </div>
                            )}
                          </section>
                        )}

                      {/* Supporting Documents */}
                      <section className="space-y-4">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                          Supporting Documents
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-[#000000]/20 hover:bg-gray-50/50 transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-inner">
                                <svg
                                  className="w-7 h-7"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#000000] uppercase tracking-tighter">
                                  Professional Resume
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                  PDF Document
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setPreviewUrl(
                                  `${API_URL}/v1/applicants/${drawerApp.id}/resume`,
                                )
                              }
                              className="px-8 py-3 bg-[#FDF22F] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#000000] hover:text-white transition-all shadow-sm"
                            >
                              Open Document
                            </button>
                          </div>

                          {drawerApp.exam_paper_path && (
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-[#FDF22F]/20 hover:bg-[#FDF22F]/5 transition-all shadow-sm">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                  <svg
                                    className="w-7 h-7"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#000000] uppercase tracking-tighter">
                                    Candidate Exam Paper
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    Proof of Assessment
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(
                                    `${API_URL.replace("/api", "/storage")}/${drawerApp.exam_paper_path}`,
                                    "_blank",
                                  )
                                }
                                className="px-8 py-3 bg-black text-[#FDF22F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FDF22F] hover:text-black transition-all shadow-sm"
                              >
                                Open Paper
                              </button>
                            </div>
                          )}

                          {drawerApp.attachments?.map((file: any, i: number) => (
                            <div
                              key={i}
                              className="p-6 bg-white rounded-3xl border border-gray-100 flex items-center justify-between group hover:border-[#F7F8FA] hover:bg-[#F7F8FA] transition-all shadow-sm"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-[#000000] group-hover:text-white transition-all shadow-inner">
                                  <svg
                                    className="w-7 h-7"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#000000] uppercase tracking-tighter truncate max-w-[200px]">
                                    {file.label || "Additional File"}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    {file.file_type?.toUpperCase() || "FILE"}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  setPreviewUrl(
                                    `${API_URL}/v1/attachments/${file.id}/view`,
                                  )
                                }
                                className="px-8 py-3 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#000000] hover:text-white hover:border-[#000000] transition-all shadow-sm"
                              >
                                Open File
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    </>
                  )}

                  {drawerApp.status === "onboarding" && (
                    <div className="space-y-10">
                      {/* Slim Professional Header */}
                      <header className="relative bg-[#FDF22F] rounded-3xl p-6 text-black shadow-sm border border-[#FDE047] group">
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#FDF22F] shadow-lg">
                               <Activity size={24} className="animate-pulse" />
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-0.5">
                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black/5 px-2 py-0.5 rounded-md">Onboarding Active</span>
                               </div>
                               <h2 className="text-2xl font-black tracking-tighter leading-none">{drawerApp.name}</h2>
                               <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                 {drawerApp.job_posting?.title || "New Hire"} • {drawerApp.id}
                               </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-black/30 uppercase tracking-widest mb-0.5">Progress</p>
                              <div className="flex items-baseline gap-1 justify-end">
                                 <span className="text-2xl font-black tabular-nums">
                                   {(() => {
                                     const tasks = [
                                       onboardingForm.contract_signed,
                                       onboardingForm.id_verified,
                                       onboardingForm.bank_account,
                                       onboardingForm.tax_id,
                                       onboardingForm.payroll_setup,
                                       onboardingForm.workstation_ready,
                                       onboardingForm.email_created,
                                       onboardingForm.company_email,
                                       onboardingForm.office_tour_done,
                                       onboardingForm.orientation_done
                                     ];
                                     const done = tasks.filter(Boolean).length;
                                     return Math.round((done / tasks.length) * 100);
                                   })()}
                                 </span>
                                 <span className="text-sm font-black text-black/20">%</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/20 border border-black/5">
                               <CheckCircle2 size={20} strokeWidth={3} />
                            </div>
                          </div>
                        </div>

                        {/* Ultra-slim Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-3xl overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ 
                               width: `${(() => {
                                 const tasks = [
                                   onboardingForm.contract_signed,
                                   onboardingForm.id_verified,
                                   onboardingForm.bank_account,
                                   onboardingForm.tax_id,
                                   onboardingForm.payroll_setup,
                                   onboardingForm.workstation_ready,
                                   onboardingForm.email_created,
                                   onboardingForm.company_email,
                                   onboardingForm.office_tour_done,
                                   onboardingForm.orientation_done
                                 ];
                                 const done = tasks.filter(Boolean).length;
                                 return (done / tasks.length) * 100;
                               })()}%` 
                             }}
                             className="h-full bg-black"
                           />
                        </div>
                      </header>

                      <div className="grid grid-cols-1 gap-10">
                        {/* Legal Section */}
                        <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                          <div className="flex items-center gap-5 mb-8">
                             <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                <FileText size={24} />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-black">Legal & Compliance</h3>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Stage 1: Documentation</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                             <div className={`p-6 rounded-[32px] transition-all duration-300 border ${onboardingForm.contract_signed ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                   <p className={`text-xs font-black uppercase tracking-widest ${onboardingForm.contract_signed ? 'text-indigo-600' : 'text-gray-400'}`}>Employment Contract</p>
                                   <input 
                                     type="checkbox" 
                                     checked={onboardingForm.contract_signed}
                                     onChange={(e) => setOnboardingForm(p => ({ ...p, contract_signed: e.target.checked }))}
                                     className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                                   />
                                </div>
                                <p className="text-[11px] font-bold text-gray-400 mb-4">Official DROGA Pharma contract signed by employee</p>
                                <button className="w-full py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-black hover:text-white transition-all">
                                   View / Upload Document
                                </button>
                             </div>

                             <div className={`p-6 rounded-[32px] transition-all duration-300 border ${onboardingForm.id_verified ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                   <p className={`text-xs font-black uppercase tracking-widest ${onboardingForm.id_verified ? 'text-indigo-600' : 'text-gray-400'}`}>KYC & Verification</p>
                                   <input 
                                     type="checkbox" 
                                     checked={onboardingForm.id_verified}
                                     onChange={(e) => setOnboardingForm(p => ({ ...p, id_verified: e.target.checked }))}
                                     className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                                   />
                                </div>
                                <p className="text-[11px] font-bold text-gray-400">Government ID, Educational Certificates & Photos verified</p>
                             </div>
                          </div>

                          <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Account Info</label>
                                    <input 
                                      type="text" 
                                      value={onboardingForm.bank_account}
                                      onChange={(e) => setOnboardingForm(p => ({ ...p, bank_account: e.target.value }))}
                                      placeholder="Commercial Bank of Ethiopia"
                                      className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-xs font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tax ID Number (TIN)</label>
                                    <input 
                                      type="text" 
                                      value={onboardingForm.tax_id}
                                      onChange={(e) => setOnboardingForm(p => ({ ...p, tax_id: e.target.value }))}
                                      placeholder="ET-10293485"
                                      className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-xs font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                 </div>
                              </div>
                              <div className={`p-5 rounded-[24px] border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${onboardingForm.payroll_setup ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-300'}`}
                                   onClick={() => setOnboardingForm(p => ({ ...p, payroll_setup: !p.payroll_setup }))}>
                                 <Check size={20} className={onboardingForm.payroll_setup ? 'text-[#FDF22F]' : 'text-gray-200'} />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Payroll Ready</span>
                              </div>
                          </div>
                        </section>

                        {/* Technical Section */}
                        <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                          <div className="flex items-center gap-5 mb-8">
                             <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                                <Activity size={24} />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-black">Technical Readiness</h3>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Stage 2: IT Provisioning</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className={`p-8 rounded-[32px] border transition-all ${onboardingForm.workstation_ready ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-transparent'}`}>
                                <div className="flex items-center justify-between mb-4">
                                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                      <Briefcase size={20} className="text-amber-500" />
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     checked={onboardingForm.workstation_ready}
                                     onChange={(e) => setOnboardingForm(p => ({ ...p, workstation_ready: e.target.checked }))}
                                     className="w-7 h-7 accent-amber-500 cursor-pointer"
                                   />
                                </div>
                                <h4 className="text-sm font-black text-black uppercase tracking-tight">Workstation Readiness</h4>
                                <p className="text-[11px] font-medium text-gray-400 mt-1">Laptop, Desktop, Desk & ID card prepared for first day.</p>
                             </div>

                             <div className={`p-8 rounded-[32px] border transition-all ${onboardingForm.email_created ? 'bg-amber-50 border-amber-100' : 'bg-gray-50 border-transparent'}`}>
                                <div className="flex items-center justify-between mb-5">
                                   <p className="text-xs font-black uppercase tracking-widest text-[#000000]">Corporate Identity</p>
                                   <input 
                                      type="checkbox" 
                                      checked={onboardingForm.email_created}
                                      onChange={(e) => setOnboardingForm(p => ({ ...p, email_created: e.target.checked }))}
                                      className="w-6 h-6 accent-black cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-4">
                                   <div className="relative">
                                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                      <input 
                                        type="text" 
                                        value={onboardingForm.company_email}
                                        onChange={(e) => setOnboardingForm(p => ({ ...p, company_email: e.target.value }))}
                                        placeholder="full.name@droga.com"
                                        className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-xs font-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                                      />
                                   </div>
                                   <p className="text-[10px] font-bold text-gray-400 ml-1">Company email account created and credentials ready.</p>
                                </div>
                             </div>
                          </div>
                        </section>

                        {/* Integration Section */}
                        <section className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
                          <div className="flex items-center gap-5 mb-8">
                             <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                <Users size={24} />
                             </div>
                             <div>
                                <h3 className="text-xl font-black text-black">Cultural Integration</h3>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Stage 3: Team Welcome</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className={`p-8 rounded-[35px] shadow-xl flex items-center justify-between group transition-all duration-500 overflow-hidden relative ${onboardingForm.office_tour_done ? 'bg-black text-[#FDF22F]' : 'bg-white text-black border border-gray-100'}`}>
                                {onboardingForm.office_tour_done && <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDF22F]/5 rounded-full -mr-8 -mt-8" />}
                                <div className="flex items-center gap-5">
                                   <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-colors ${onboardingForm.office_tour_done ? 'bg-[#FDF22F] text-black' : 'bg-gray-100 text-gray-400'}`}>
                                      <Activity size={24} />
                                   </div>
                                   <div>
                                      <h4 className="text-[15px] font-black uppercase tracking-tight">Office Immersion</h4>
                                      <p className={`text-[10px] font-bold ${onboardingForm.office_tour_done ? 'text-white/40' : 'text-gray-400'}`}>Tour done • Team introduced</p>
                                   </div>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={onboardingForm.office_tour_done}
                                  onChange={(e) => setOnboardingForm(p => ({ ...p, office_tour_done: e.target.checked }))}
                                  className="w-8 h-8 accent-[#FDF22F] cursor-pointer relative z-10"
                                />
                             </div>

                             <div className={`p-8 rounded-[35px] border transition-all ${onboardingForm.orientation_done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-transparent'}`}>
                                <div className="flex items-center justify-between mb-5">
                                   <div className="flex items-center gap-3">
                                      <Calendar size={18} className="text-emerald-500" />
                                      <p className="text-xs font-black uppercase tracking-widest text-[#000000]">Orientation Session</p>
                                   </div>
                                   <input 
                                      type="checkbox" 
                                      checked={onboardingForm.orientation_done}
                                      onChange={(e) => setOnboardingForm(p => ({ ...p, orientation_done: e.target.checked }))}
                                      className="w-7 h-7 accent-emerald-500 cursor-pointer"
                                    />
                                </div>
                                <input 
                                  type="date" 
                                  value={onboardingForm.orientation_date}
                                  onChange={(e) => setOnboardingForm(p => ({ ...p, orientation_date: e.target.value }))}
                                  className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xs font-black focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none"
                                />
                             </div>
                          </div>
                        </section>
                      </div>

                      {/* Final Actions */}
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={handleUpdateOnboarding}
                          disabled={actionLoading}
                          className="w-full py-6 bg-white border-4 border-black text-black rounded-[40px] font-black text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                          ) : (
                            "Save Progress Update"
                          )}
                        </button>

                        {/* FINAL MOVE TO STAFF BUTTON - WOW EFFECT */}
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePromoteToStaff}
                          disabled={actionLoading}
                          className="w-full py-8 bg-[#FDF22F] text-black rounded-[40px] font-black text-sm uppercase tracking-[0.5em] shadow-[0_20px_40px_-15px_rgba(253,242,47,0.4)] flex items-center justify-center gap-4 hover:shadow-[0_25px_50px_-12px_rgba(253,242,47,0.6)] transition-all relative overflow-hidden group/final"
                        >
                          <motion.div 
                            className="absolute inset-0 bg-white"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '1000%' }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ opacity: 0.1, rotate: '15deg', width: '20px' }}
                          />
                          <div className="w-8 h-8 rounded-xl bg-black text-[#FDF22F] flex items-center justify-center shrink-0">
                             <ArrowRight size={18} />
                          </div>
                          Finalize & Move to Staff Tab
                        </motion.button>
                        
                        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">
                          Warning: Moving to Staff will create a system user account for the employee.
                        </p>
                      </div>
                    </div>
                  )}


                  {/* Team Collaboration / Mentions */}
                  <section className="space-y-4">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#000000]" />
                      Team Collaboration
                    </h3>
                    <div className="bg-gray-50/50 rounded-3xl border border-gray-100 p-6 space-y-4">
                      <p className="text-xs text-gray-500 font-medium">
                        @Mention a manager to request review or leave interior
                        feedback on this candidate.
                      </p>

                      <div className="flex gap-4">
                        <select
                          value={mentionUser}
                          onChange={(e) => setMentionUser(e.target.value)}
                          className="w-1/3 bg-white border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] font-medium"
                        >
                          <option value="" disabled>
                            Select Manager
                          </option>
                          {departmentUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email})
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={mentionNote}
                          onChange={(e) => setMentionNote(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-white border border-gray-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000]"
                        />

                        <button
                          onClick={handleSendMention}
                          disabled={
                            mentionLoading ||
                            !mentionUser ||
                            !mentionNote.trim()
                          }
                          className="px-6 bg-[#FDF22F] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black hover:text-white disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-[#FDF22F]/10"
                        >
                          {mentionLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "SEND"
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {mentionSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700"
                          >
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">
                                Success
                              </p>
                              <p className="text-[11px] font-medium opacity-80">
                                Message sent successfully.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>
                </div>{" "}
                {/* End of content padding */}
              </div>{" "}
              {/* End of scrollable container */}
              {/* Action Bar */}
              <div className="p-8 border-t border-gray-100 bg-[#F9FAFB]/80 backdrop-blur-xl flex gap-5">
                {drawerApp.status !== "hired" &&
                  drawerApp.status !== "rejected" && (
                    <>
                      {/* NEW → Move to Written Exam OR Talent Pool */}
                      {drawerApp.status === "new" && (
                        <>
                          <button
                            onClick={() => openStageScheduleModal("written_exam")}
                            className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                          >
                            {actionLoading ? (
                              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
                            ) : (
                              "Move to Written Exam"
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleStatusUpdate(drawerApp.id, "talent_pool")}
                            className="flex-1 py-4 bg-white text-gray-500 border-[1.5px] border-gray-300 rounded-full font-bold text-[13px] hover:bg-black hover:text-[#FDF22F] hover:border-black transition-all"
                          >
                            {actionLoading ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                            ) : (
                              "To Talent Pool"
                            )}
                          </button>
                        </>
                      )}

                      {/* TALENT POOL → Move back to New */}
                      {drawerApp.status === "talent_pool" && (
                        <button
                          onClick={() => handleStatusUpdate(drawerApp.id, "new")}
                          className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-[#FDF22F]/30 border-t-[#FDF22F] rounded-full animate-spin mx-auto" />
                          ) : (
                            "Reactivate to New"
                          )}
                        </button>
                      )}

                      {/* WRITTEN EXAM → Tech Interview */}
                      {drawerApp.status === "written_exam" && (
                        <button
                          onClick={() => {
                            setScoringForm({
                              written_exam_score:
                                drawerApp.written_exam_score || "",
                              technical_interview_score:
                                drawerApp.technical_interview_score || "",
                              written_raw_score: drawerApp.written_raw_score || "",
                              written_out_of: drawerApp.written_out_of ? String(drawerApp.written_out_of) : "100",
                              tech_raw_score: drawerApp.technical_raw_score || "",
                              tech_out_of: drawerApp.technical_out_of ? String(drawerApp.technical_out_of) : "100",
                              interviewer_feedback:
                                drawerApp.interviewer_feedback || "",
                              exam_paper: null,
                            });
                            setScoringModal(true);
                          }}
                          className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-black hover:text-white transition-all"
                        >
                          Fill Exam Score
                        </button>
                      )}
                      {drawerApp.status === "written_exam" &&
                        drawerApp.written_exam_score && (
                          <button
                            onClick={() =>
                              openStageScheduleModal("technical_interview")
                            }
                            className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                          >
                            Move to Tech Interview
                          </button>
                        )}

                      {/* TECHNICAL INTERVIEW → Final Interview */}
                      {drawerApp.status === "technical_interview" && (
                        <button
                          onClick={() => {
                            setScoringForm({
                              written_exam_score:
                                drawerApp.written_exam_score || "",
                              technical_interview_score:
                                drawerApp.technical_interview_score || "",
                              written_raw_score: drawerApp.written_raw_score || "",
                              written_out_of: drawerApp.written_out_of ? String(drawerApp.written_out_of) : "100",
                              tech_raw_score: drawerApp.technical_raw_score || "",
                              tech_out_of: drawerApp.technical_out_of ? String(drawerApp.technical_out_of) : "100",
                              interviewer_feedback:
                                drawerApp.interviewer_feedback || "",
                              exam_paper: null,
                            });
                            setScoringModal(true);
                          }}
                          className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-black hover:text-white transition-all"
                        >
                          Fill Tech Results
                        </button>
                      )}
                      {drawerApp.status === "technical_interview" &&
                        drawerApp.technical_interview_score && (
                          <button
                            onClick={() =>
                              openStageScheduleModal("final_interview")
                            }
                            className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                          >
                            Move to Final Interview
                          </button>
                        )}

                      {/* FINAL INTERVIEW → Offer */}
                      {drawerApp.status === "final_interview" && (
                        <button
                          onClick={() => {
                            setScoringForm({
                              written_exam_score:
                                drawerApp.written_exam_score || "",
                              technical_interview_score:
                                drawerApp.technical_interview_score || "",
                              written_raw_score: drawerApp.written_raw_score || "",
                              written_out_of: drawerApp.written_out_of ? String(drawerApp.written_out_of) : "100",
                              tech_raw_score: drawerApp.technical_raw_score || "",
                              tech_out_of: drawerApp.technical_out_of ? String(drawerApp.technical_out_of) : "100",
                              interviewer_feedback:
                                drawerApp.interviewer_feedback || "",
                              exam_paper: null,
                            });
                            setScoringModal(true);
                          }}
                          className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-black hover:text-white transition-all"
                        >
                          Final Scoring
                        </button>
                      )}
                      {drawerApp.status === "final_interview" &&
                        drawerApp.technical_interview_score && (
                          <button
                            onClick={() => openStageScheduleModal("offer")}
                            className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                          >
                            Send Offer
                          </button>
                        )}

                      {/* OFFER → Hire Candidate */}
                      {drawerApp.status === "offer" && (
                        <button
                          onClick={() => openStageScheduleModal("hired")}
                          className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-[#FDF22F] hover:border-[#FDF22F] transition-all"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto" />
                          ) : (
                            "Confirm Hire"
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => openStageScheduleModal("rejected")}
                        className="flex-1 py-4 bg-white text-red-500 border-[1.5px] border-red-500 rounded-full font-bold text-[13px] hover:bg-red-50 transition-all"
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto" />
                        ) : (
                          "Reject"
                        )}
                      </button>
                    </>
                  )}
                {drawerApp.status === "hired" && (
                  <div className="flex flex-col gap-4 w-full bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                         Official Start Date
                       </label>
                       <input 
                         type="date" 
                         value={onboardingStartDate}
                         onChange={(e) => setOnboardingStartDate(e.target.value)}
                         className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-2 focus:ring-[#FDF22F] focus:border-[#FDF22F] transition-all outline-none"
                       />
                    </div>
                    <button
                      onClick={handleStartOnboarding}
                      className="w-full py-4 bg-white text-black border-[1.5px] border-black rounded-full font-bold text-[13px] hover:bg-black hover:text-[#FDF22F] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading ? (
                         <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>Start Onboarding</>
                      )}
                    </button>
                  </div>
                )}
                {drawerApp.status === "onboarding" && (
                   <button
                     className="flex-1 py-4 bg-white text-black border-[1.5px] border-black rounded-full text-center font-bold text-[13px] flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-all active:scale-95"
                   >
                     <span>Undergoing Onboarding</span>
                     {drawerApp.start_date && (
                       <p className="text-[10px] text-gray-500 font-medium">
                         STARTS: {new Date(drawerApp.start_date).toLocaleDateString()}
                       </p>
                     )}
                   </button>
                )}
                {drawerApp.status === "rejected" && (
                  <div className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest border border-red-100">
                    Application Closed (Rejected)
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Scoring & Results Modal */}
      <AnimatePresence>
        {scoringModal && drawerApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#000000]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-10 pt-10 pb-8 bg-[#FDF22F] flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="px-2 py-0.5 bg-black text-[#FDF22F] text-[9px] font-black uppercase tracking-tighter rounded">
                      Assessment
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-black tracking-tight leading-none">
                    CANDIDATE SCORING
                  </h2>
                  <p className="text-[11px] font-black text-black/50 uppercase tracking-widest leading-relaxed">
                    Results for <strong>{drawerApp.name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setScoringModal(false)}
                  className="relative z-10 w-12 h-12 rounded-2xl bg-black text-[#FDF22F] flex items-center justify-center hover:scale-110 transition-all shadow-xl shadow-black/20"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto bg-white">
                <div className={`grid ${(drawerApp.status === "final_interview" || drawerApp.status === "offer" || drawerApp.status === "hired") ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
                  {(drawerApp.status === "written_exam" || drawerApp.status === "final_interview" || drawerApp.status === "offer" || drawerApp.status === "hired") && (
                  <div
                    className={`space-y-4 p-7 rounded-[32px] transition-all duration-500 ${drawerApp.status === "written_exam" ? "bg-[#FDF22F]/10 border-2 border-[#FDF22F] shadow-lg shadow-[#FDF22F]/5" : "bg-gray-50 border-2 border-transparent"}`}
                  >
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Written Exam
                      </label>
                      {drawerApp.status === "written_exam" && (
                        <span className="text-[9px] font-black text-[#FDF22F] bg-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-black/20">
                          Current Stage
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest text-black/40 font-bold mb-1 flex items-center gap-1">Score <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          placeholder="00"
                          value={scoringForm.written_raw_score}
                          onChange={(e) => {
                             const raw = e.target.value;
                             const outOf = scoringForm.written_out_of || '100';
                             const ratio = parseFloat(outOf) > 0 ? (parseFloat(raw) / parseFloat(outOf)) * 100 : 0;
                             setScoringForm((p) => ({
                               ...p,
                               written_raw_score: raw,
                               written_exam_score: raw ? ratio.toFixed(2).replace(/\.00$/, '') : "",
                             }));
                          }}
                          className="w-full bg-white rounded-2xl border-none focus:ring-0 text-black font-black text-xl placeholder-black/5 px-1 py-3 shadow-inner text-center"
                        />
                      </div>
                      <div className="text-2xl font-black text-gray-300 pt-5">/</div>
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest text-black/40 font-bold mb-1 flex items-center gap-1">Out Of <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          placeholder="100"
                          value={scoringForm.written_out_of}
                          onChange={(e) => {
                             const outOf = e.target.value;
                             const raw = scoringForm.written_raw_score;
                             const ratio = parseFloat(outOf) > 0 ? (parseFloat(raw) / parseFloat(outOf)) * 100 : 0;
                             setScoringForm((p) => ({
                               ...p,
                               written_out_of: outOf,
                               written_exam_score: raw ? ratio.toFixed(2).replace(/\.00$/, '') : "",
                             }));
                          }}
                          className="w-full bg-white rounded-2xl border-none focus:ring-0 text-black font-black text-xl placeholder-black/5 px-1 py-3 shadow-inner text-center"
                        />
                      </div>
                    </div>
                    {scoringForm.written_raw_score && (
                        <div className="flex justify-end pt-1">
                          <span className="text-[12px] font-black text-black bg-[#FDF22F] px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg shadow-[#FDF22F]/20">
                            Result: {scoringForm.written_raw_score}/{scoringForm.written_out_of || "100"}
                          </span>
                        </div>
                    )}
                  </div>
                  )}

                  {(drawerApp.status === "technical_interview" || drawerApp.status === "final_interview" || drawerApp.status === "offer" || drawerApp.status === "hired") && (
                  <div
                    className={`space-y-4 p-7 rounded-[32px] transition-all duration-500 ${drawerApp.status === "technical_interview" ? "bg-[#FDF22F]/10 border-2 border-[#FDF22F] shadow-lg shadow-[#FDF22F]/5" : "bg-gray-50 border-2 border-transparent"}`}
                  >
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Tech Interview
                      </label>
                      {drawerApp.status === "technical_interview" && (
                        <span className="text-[9px] font-black text-[#FDF22F] bg-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-black/20">
                          Current Stage
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest text-black/40 font-bold mb-1 flex items-center gap-1">Score <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          placeholder="00"
                          value={scoringForm.tech_raw_score}
                          onChange={(e) => {
                             const raw = e.target.value;
                             const outOf = scoringForm.tech_out_of || '100';
                             const ratio = parseFloat(outOf) > 0 ? (parseFloat(raw) / parseFloat(outOf)) * 100 : 0;
                             setScoringForm((p) => ({
                               ...p,
                               tech_raw_score: raw,
                               technical_interview_score: raw ? ratio.toFixed(2).replace(/\.00$/, '') : "",
                             }));
                          }}
                          className="w-full bg-white rounded-2xl border-none focus:ring-0 text-black font-black text-xl placeholder-black/5 px-1 py-3 shadow-inner text-center"
                        />
                      </div>
                      <div className="text-2xl font-black text-gray-300 pt-5">/</div>
                      <div className="flex-1">
                        <label className="block text-[9px] uppercase tracking-widest text-black/40 font-bold mb-1 flex items-center gap-1">Out Of <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          placeholder="100"
                          value={scoringForm.tech_out_of}
                          onChange={(e) => {
                             const outOf = e.target.value;
                             const raw = scoringForm.tech_raw_score;
                             const ratio = parseFloat(outOf) > 0 ? (parseFloat(raw) / parseFloat(outOf)) * 100 : 0;
                             setScoringForm((p) => ({
                               ...p,
                               tech_out_of: outOf,
                               technical_interview_score: raw ? ratio.toFixed(2).replace(/\.00$/, '') : "",
                             }));
                          }}
                          className="w-full bg-white rounded-2xl border-none focus:ring-0 text-black font-black text-xl placeholder-black/5 px-1 py-3 shadow-inner text-center"
                        />
                      </div>
                    </div>
                    {scoringForm.tech_raw_score && (
                        <div className="flex justify-end pt-1">
                          <span className="text-[12px] font-black text-black bg-[#FDF22F] px-4 py-2 rounded-2xl uppercase tracking-widest shadow-lg shadow-[#FDF22F]/20">
                            Result: {scoringForm.tech_raw_score}/{scoringForm.tech_out_of || "100"}
                          </span>
                        </div>
                    )}
                  </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Interviewer Feedback & Assessment Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed technical assessment..."
                    value={scoringForm.interviewer_feedback}
                    onChange={(e) =>
                      setScoringForm((p) => ({
                        ...p,
                        interviewer_feedback: e.target.value,
                      }))
                    }
                    className="w-full px-7 py-6 rounded-[32px] border-2 border-gray-100 focus:border-black focus:outline-none text-black font-bold text-sm transition-all resize-none bg-gray-50/50 hover:bg-white focus:bg-white"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                    Secure Document Attachment
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) =>
                        setScoringForm((p) => ({
                          ...p,
                          exam_paper: e.target.files?.[0] || null,
                        }))
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <div
                      className={`p-8 rounded-[32px] border-2 border-dashed transition-all duration-300 flex items-center justify-between ${scoringForm.exam_paper ? "border-emerald-400 bg-emerald-50/20" : "border-gray-100 group-hover:border-[#FDF22F] bg-gray-50/30"}`}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all ${scoringForm.exam_paper ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-gray-300 shadow-sm border border-gray-50"}`}
                        >
                          <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-[13px] font-black uppercase tracking-wider ${scoringForm.exam_paper ? "text-emerald-700" : "text-black/60"}`}
                          >
                            {scoringForm.exam_paper
                              ? "Digital Proof Attached"
                              : "Attach Exam Paper"}
                          </p>
                          <p className="text-[11px] font-medium text-black/30 mt-0.5">
                            {scoringForm.exam_paper
                              ? scoringForm.exam_paper.name
                              : "Physical documents / scanned files"}
                          </p>
                        </div>
                      </div>
                      {!scoringForm.exam_paper && (
                        <div className="px-5 py-2.5 bg-black text-[#FDF22F] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-black/10 group-hover:-translate-y-0.5 transition-all">
                          Browse File
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 pt-2 shrink-0 flex gap-5 bg-white border-t border-gray-50/50">
                <button
                  onClick={() => handleUpdateScores()}
                  disabled={actionLoading}
                  className="flex-1 py-5 bg-black text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-100 disabled:cursor-wait"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    "💾 Save Only"
                  )}
                </button>

                {drawerApp.status === "written_exam" && (
                  <button
                    onClick={() => {
                      if (!scoringForm.written_exam_score) {
                        showToast(
                          "Please enter a Written Exam score first",
                          "error",
                        );
                        return;
                      }
                      handleUpdateScores("technical_interview");
                    }}
                    disabled={actionLoading}
                    className="flex-[2] py-5 bg-[#FDF22F] text-black rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#FDF22F]/40 hover:scale-[1.02] hover:bg-black hover:text-white transition-all disabled:opacity-100 disabled:cursor-wait"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-[3px] border-black/10 border-t-black rounded-full animate-spin" />
                        <span className="opacity-50">Processing...</span>
                      </div>
                    ) : (
                      "Save & Move to Tech Interview"
                    )}
                  </button>
                )}

                {drawerApp.status === "technical_interview" && (
                  <button
                    onClick={() => {
                      if (!scoringForm.technical_interview_score) {
                        showToast(
                          "Please enter a Technical Interview score first",
                          "error",
                        );
                        return;
                      }
                      handleUpdateScores("final_interview");
                    }}
                    disabled={actionLoading}
                    className="flex-[2] py-5 bg-[#FDF22F] text-black rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#FDF22F]/40 hover:scale-[1.02] hover:bg-black hover:text-white transition-all disabled:opacity-100 disabled:cursor-wait"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-[3px] border-black/10 border-t-black rounded-full animate-spin" />
                        <span className="opacity-50">Processing...</span>
                      </div>
                    ) : (
                      "Save & Move to Final Interview"
                    )}
                  </button>
                )}

                {drawerApp.status === "final_interview" && (
                  <button
                    onClick={() => openStageScheduleModal("offer")}
                    className="flex-[2] py-5 bg-black text-[#FDF22F] rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] hover:bg-[#FDF22F] hover:text-black transition-all"
                  >
                    ✉️ Proceed to Offer Stage
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Status Modal */}
      <AnimatePresence>
        {employeeStatusModal && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000000]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-8 pt-8 pb-6 bg-[#F9FAFB] border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[#000000] tracking-tight">
                    MANAGE STATUS
                  </h2>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Update employment for {selectedEmployee.name}
                  </p>
                </div>
                <button
                  onClick={() => setEmployeeStatusModal(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      New Status
                    </label>
                    <select
                      value={employeeStatusForm.status}
                      onChange={(e) =>
                        setEmployeeStatusForm({
                          ...employeeStatusForm,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#000000] focus:outline-none text-[#000000] font-bold text-sm transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="resigned">Resigned</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Date of Separation {employeeStatusForm.status !== "active" && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="date"
                      value={employeeStatusForm.date}
                      onChange={(e) =>
                        setEmployeeStatusForm({
                          ...employeeStatusForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#000000] focus:outline-none text-[#000000] font-bold text-sm transition-colors"
                      disabled={employeeStatusForm.status === "active"}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Reason (Internal Note) {employeeStatusForm.status !== "active" && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    rows={4}
                    value={employeeStatusForm.reason}
                    onChange={(e) =>
                      setEmployeeStatusForm({
                        ...employeeStatusForm,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Briefly describe the reason for separation..."
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-[#000000] focus:outline-none text-[#000000] font-bold text-sm transition-colors resize-none"
                    disabled={employeeStatusForm.status === "active"}
                  />
                </div>

                {employeeStatusForm.status !== "active" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-[12px] text-amber-600 font-medium flex gap-3">
                    <span className="text-base text-xl leading-none">⚠️</span>
                    <p>
                      Warning: Marking an employee as{" "}
                      {employeeStatusForm.status} will remove them from the
                      active list and it will immediately affect the{" "}
                      <strong>Employee Turnover Report</strong>.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 shrink-0 flex gap-4 pt-4 bg-white border-t border-gray-50">
                <button
                  onClick={() => setEmployeeStatusModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEmployeeStatus}
                  disabled={actionLoading}
                  className="flex-[2] py-4 bg-gradient-to-r from-[#000000] to-[#222222] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-[#000000]/30 hover:-translate-y-0.5 transition-all disabled:opacity-100 disabled:cursor-wait"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="opacity-50">Updating...</span>
                    </div>
                  ) : (
                    "Confirm Status Update"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Scheduling Modal */}
      <AnimatePresence>
        {globalScheduleModal && drawerApp && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 text-black pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGlobalScheduleModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
            >
              <div className="p-10 pb-6 flex justify-between items-start">
                <div className="space-y-1 text-black">
                  <h2 className="text-3xl font-black text-black tracking-tight uppercase">
                    SCHEDULE {scheduleContext.title}
                  </h2>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {scheduleContext.label} for {drawerApp.name}
                  </p>
                </div>
                <button
                  onClick={() => setGlobalScheduleModal(false)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-10 pb-10 space-y-8 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Event Date <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={globalScheduleForm.date}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-sm font-bold text-black"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Start Time <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="time"
                      value={globalScheduleForm.time}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          time: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-sm font-bold text-black"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Venue / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Training Room B, HQ"
                      value={globalScheduleForm.location}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-sm font-bold text-black"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Assigned Staff / Invigilator <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={globalScheduleForm.interviewer_id}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          interviewer_id: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-sm font-bold text-black appearance-none"
                    >
                      <option value="">Select Staff...</option>
                      {departmentUsers.map((u: { id: string; name: string; role_slug?: string }) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role_slug || "Staff"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Instructions / Message
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Special instructions or items to bring..."
                      value={globalScheduleForm.message}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all text-sm font-bold text-black resize-none"
                    />
                  </div>
                </div>

                {/* Conditional Fields for Offer */}
                {scheduleContext.targetStatus === "offer" && (
                  <div className="space-y-6 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-black bg-[#FDF22F] px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-2">
                      Offer Specifics
                    </label>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Offered Salary <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ETB 50,000"
                          value={globalScheduleForm.offered_salary}
                          onChange={(e) =>
                            setGlobalScheduleForm({
                              ...globalScheduleForm,
                              offered_salary: e.target.value,
                            })
                          }
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FDF22F] focus:bg-white transition-all text-sm font-bold text-black"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                          Proposed Start Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="date"
                          value={globalScheduleForm.start_date}
                          onChange={(e) =>
                            setGlobalScheduleForm({
                              ...globalScheduleForm,
                              start_date: e.target.value,
                            })
                          }
                          className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FDF22F] focus:bg-white transition-all text-sm font-bold text-black"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Offer Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Additional details..."
                        value={globalScheduleForm.offer_notes}
                        onChange={(e) =>
                          setGlobalScheduleForm({
                            ...globalScheduleForm,
                            offer_notes: e.target.value,
                          })
                        }
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#FDF22F] focus:bg-white transition-all text-sm font-bold text-black resize-none"
                      />
                    </div>

                    {/* ── Offer Letter PDF Attachment ── */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Attach Official Offer Letter <span className="text-gray-300 normal-case font-bold">(PDF, Word, or Scanned Image — will be emailed to candidate)</span>
                      </label>
                      {globalScheduleForm.offer_letter ? (
                        <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-800 truncate">{globalScheduleForm.offer_letter.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{(globalScheduleForm.offer_letter.size / 1024).toFixed(1)} KB · Document</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setGlobalScheduleForm({ ...globalScheduleForm, offer_letter: null })}
                            className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-4 px-5 py-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#FDF22F] hover:bg-[#FDF22F]/5 transition-all group">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#FDF22F] transition-all">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-700">Upload Offer Letter</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Click to browse · PDF, Word, Images · max 20 MB</p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setGlobalScheduleForm({ ...globalScheduleForm, offer_letter: e.target.files?.[0] ?? null })}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditional Fields for Rejection */}
                {scheduleContext.targetStatus === "rejected" && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <label className="text-[10px] font-black text-red-500 bg-red-50 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-2">
                      Rejection Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Feedback or internal rejection note..."
                      value={globalScheduleForm.rejection_note}
                      onChange={(e) =>
                        setGlobalScheduleForm({
                          ...globalScheduleForm,
                          rejection_note: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-red-500 focus:bg-white transition-all text-sm font-bold text-black resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-10 pt-4 bg-white border-t border-gray-50 flex gap-4 shrink-0">
                <button
                  onClick={() => setGlobalScheduleModal(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 hover:text-black transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleGlobalSchedule}
                  disabled={actionLoading}
                  className="flex-[2] py-5 bg-[#FDF22F] text-black rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-[#FDF22F]/40 hover:bg-black hover:text-white hover:-translate-y-1 transition-all disabled:opacity-100 disabled:cursor-wait"
                >
                  {actionLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-[3px] border-black/10 border-t-black rounded-full animate-spin" />
                      <span className="opacity-50 tracking-widest">Applying...</span>
                    </div>
                  ) : (
                    "Confirm & Notify"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative z-[310] p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-red-50/50">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[#000000] tracking-tight mb-2">
                Delete Job Posting?
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
                This action is permanent and cannot be undone. All data related
                to this posting will be removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteJob(deleteConfirmId)}
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/30 hover:bg-red-600 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    "Delete Now"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* Inline Document Preview Modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-[#000000]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF22F] flex items-center justify-center text-black">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#000000] uppercase tracking-tight">
                      Document Preview
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Powered by TA Team Vision
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={previewUrl}
                    download
                    className="px-6 py-2.5 bg-white border border-gray-200 text-[#000000] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </a>
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg shadow-black/20"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gray-200/20">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-none"
                  title="Resume Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ExportModal
        open={exportModal}
        onClose={() => setExportModal(false)}
        stats={stats}
        jobs={jobs || []}
        reportFilters={reportFilters}
        apiFetch={apiFetch}
      />
    </div>
  );
}
