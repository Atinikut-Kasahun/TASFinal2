'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL, getStorageUrl } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    new: { label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-50', icon: '👁' },
    written_exam: { label: 'Written Exam', color: 'text-purple-600', bg: 'bg-purple-50', icon: '📝' },
    technical_interview: { label: 'Technical Interview', color: 'text-orange-600', bg: 'bg-orange-50', icon: '💻' },
    final_interview: { label: 'Final Interview', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '🎯' },
    offer: { label: 'Offer Extended', color: 'text-emerald-600', bg: 'bg-emerald-50', 'icon': '🏆' },
    hired: { label: 'Hired! 🎉', color: 'text-black', bg: 'bg-[#FDF22F]', icon: '✅' },
    rejected: { label: 'Not Selected', color: 'text-red-500', bg: 'bg-red-50', icon: '✕' },
};

function getStatus(status: string) {
    return STATUS_MAP[status] || { label: status, color: 'text-gray-500', bg: 'bg-gray-50', icon: '•' };
}

function timeAgo(date: string) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Applied today';
    if (diffDays === 1) return 'Applied yesterday';
    return `Applied ${diffDays} days ago`;
}

function postedAgo(date: string) {
    if (!date) return 'Posted today';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays <= 0) return 'Posted few hours ago';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
}

// ─── Auth Form Component ─────────────────────────────────────────────────────
function AuthForm({ mode, onSuccess }: { mode: 'login' | 'register'; onSuccess: (token: string, applicant: any) => void }) {
    const [form, setForm] = useState({ email: '', password: '', password_confirmation: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [resetStep, setResetStep] = useState<'email' | 'code'>('email');

    useEffect(() => {
        setError('');
        setSuccessMsg('');
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

            if (mode === 'login') {
                const res = await fetch(`${cleanBase}/v1/applicant/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email: form.email, password: form.password }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Authentication failed.');
                onSuccess(data.token, data.applicant);

            } else if (mode === 'register' && resetStep === 'email') {
                // Step 1: Request reset code
                const res = await fetch(`${cleanBase}/v1/applicant/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email: form.email }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to send reset link.');
                setSuccessMsg('A 6-digit code has been sent to your email.');
                setResetStep('code');

            } else if (mode === 'register' && resetStep === 'code') {
                // Step 2: Confirm reset
                const res = await fetch(`${cleanBase}/v1/applicant/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(form),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
                onSuccess(data.token, data.applicant);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 font-bold">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-600 font-bold">
                    {successMsg}
                </div>
            )}

            {/* Always show email */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled={mode === 'register' && resetStep === 'code'}
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all disabled:opacity-50"
                />
            </div>

            {/* Login fields OR Step 2 of Password Reset fields */}
            {(mode === 'login' || (mode === 'register' && resetStep === 'code')) && (
                <>
                    {mode === 'register' && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">6-Digit Code</label>
                            <input
                                type="text" required minLength={6} maxLength={6}
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                                placeholder="123456"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all text-center tracking-[0.3em] text-lg"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            {mode === 'register' ? 'New Password' : 'Password'}
                        </label>
                        <input
                            type="password" required minLength={6}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                            <input
                                type="password" required minLength={6}
                                value={form.password_confirmation}
                                onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20 font-bold text-gray-800 transition-all"
                            />
                        </div>
                    )}
                </>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black text-[#FDF22F] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10 mt-2"
            >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : (resetStep === 'email' ? 'Send Reset Code' : 'Save Password & Sign In')}
            </button>

                <button
                    type="button"
                    onClick={() => { setResetStep('email'); setError(''); setSuccessMsg(''); }}
                    className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-black mt-2"
                >
                    Didn&apos;t receive a code? Try again
                </button>
        </form>
    );
}

// ─── Application Card ────────────────────────────────────────────────────────
function ApplicationCard({ app }: { app: any }) {
    const st = getStatus(app.status);

    // Pipeline steps
    const stages = ['new', 'written_exam', 'technical_interview', 'final_interview', 'offer', 'hired'];
    const currentIdx = stages.indexOf(app.status);
    const isRejected = app.status === 'rejected';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#FDF22F]/40 transition-all duration-500 group"
        >
            <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FDF22F]/50 to-[#FDF22F]/10 border border-[#FDF22F]/20 flex items-center justify-center text-2xl shadow-sm">
                            💼
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-black leading-tight">
                                {app.job_posting?.title || 'Position Applied'}
                            </h3>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                {app.company} · {app.job_posting?.department || 'General'}
                            </p>
                        </div>
                    </div>
                    <span className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${st.bg} ${st.color}`}>
                        {st.icon} {st.label}
                    </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-gray-400 mb-6">
                    {app.job_posting?.location && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {app.job_posting.location}
                        </span>
                    )}
                    {app.job_posting?.type && (
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            {app.job_posting.type}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {app.created_at ? timeAgo(app.created_at) : ''}
                    </span>
                    {app.match_score && (
                        <span className="flex items-center gap-1.5 text-black font-black">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            {app.match_score}% Match
                        </span>
                    )}
                </div>

                {/* Pipeline Progress (not shown for rejected) */}
                {!isRejected && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-300">
                            {stages.map((s, i) => {
                                const isActive = i === currentIdx;
                                const isPast = i < currentIdx;
                                return (
                                    <span key={s} className={`${isActive ? 'text-black' : isPast ? 'text-[#FDF22F] drop-shadow-sm' : 'text-gray-200'} transition-colors`}>
                                        {STATUS_MAP[s]?.icon}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#FDF22F] rounded-full transition-all duration-1000"
                                style={{ width: `${((currentIdx + 1) / stages.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between gap-1">
                            {stages.map((s, i) => {
                                const stageInfo = STATUS_MAP[s];
                                const isActive = i === currentIdx;
                                const isPast = i < currentIdx;
                                return (
                                    <span
                                        key={s}
                                        className={`text-[8px] font-black uppercase tracking-widest truncate flex-1 text-center ${isActive ? 'text-black' : isPast ? 'text-gray-400' : 'text-gray-200'}`}
                                    >
                                        {stageInfo?.label?.replace(' 🎉', '')}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Rejected Message */}
                {isRejected && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-[12px] font-bold text-red-500">
                            Thank you for applying. After careful consideration, we have decided to move forward with other candidates.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default function MyApplicationsPage() {
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [token, setToken] = useState<string | null>(null);
    const [applicant, setApplicant] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<'applications' | 'profile' | 'settings' | 'jobs'>('profile');
    const [profileBannerVisible, setProfileBannerVisible] = useState(true);
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Notifications state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [notificationTab, setNotificationTab] = useState<'inbox' | 'message'>('inbox');
    const [msgApplicationId, setMsgApplicationId] = useState<string>('');
    const [msgText, setMsgText] = useState('');
    const [isMsgSending, setIsMsgSending] = useState(false);
    const [msgStatus, setMsgStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Jobs search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    // Navbar search input state
    const [navSearchInput, setNavSearchInput] = useState('');

    // Legal Modal State
    const [legalModal, setLegalModal] = useState<{ title: string, subtitle?: string, content: React.ReactNode } | null>(null);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Profile form state
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [profileForm, setProfileForm] = useState({
        first_name: '',
        last_name: '',
        headline: '',
        phone: '',
        age: '' as string | number,
        gender: '',
        years_of_experience: '' as string | number,
        professional_background: '',
        portfolio_link: '',
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [applicationForm, setApplicationForm] = useState<any>({
        answers: {},
        attachments: []
    });

    const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isPhotoSaving, setIsPhotoSaving] = useState(false);
    const [photoMessage, setPhotoMessage] = useState({ text: '', type: '' });

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('applicant_token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch profile when token is available
    const fetchProfile = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBase}/v1/applicant/me`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            });
            if (!res.ok) {
                localStorage.removeItem('applicant_token');
                setToken(null);
                return;
            }
            const data = await res.json();
            setApplicant(data.applicant);
            setApplications(data.applications || []);

            if (data.applications?.length > 0) {
                setMsgApplicationId(data.applications[0].id);
            }

            // Initialize profile form
            const splitName = data.applicant.name?.split(' ') || [];
            setProfileForm({
                first_name: splitName[0] || '',
                last_name: splitName.slice(1).join(' ') || '',
                headline: data.applicant.headline || '',
                phone: data.applicant.phone || '',
                age: data.applicant.age || '',
                gender: data.applicant.gender || '',
                years_of_experience: data.applicant.years_of_experience || '',
                professional_background: data.applicant.professional_background || '',
                portfolio_link: data.applicant.portfolio_link || '',
            });
        } catch {
            localStorage.removeItem('applicant_token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableJobs = async () => {
        try {
            // Using centralized apiFetch for consistency
            const data = await apiFetch('/v1/public/jobs?per_page=100');
            setAvailableJobs(data.data || data.jobs || []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchAvailableJobs();
        }
    }, [token]);

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBase}/v1/applicant/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [token]);

    const markAllNotificationsRead = async () => {
        if (!token) return;
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            await fetch(`${cleanBase}/v1/applicant/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const markNotificationRead = async (id: string) => {
        if (!token) return;
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            await fetch(`${cleanBase}/v1/applicant/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!token) return;
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            await fetch(`${cleanBase}/v1/applicant/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async () => {
        if (!token || !msgApplicationId || !msgText.trim()) return;
        setMsgStatus(null);
        setIsMsgSending(true);
        try {
            const formData = new FormData();
            formData.append('application_id', msgApplicationId);
            formData.append('message', msgText);

            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBase}/v1/applicant/send-message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            if (res.ok) {
                setMsgStatus({ type: 'success', message: 'Message sent! The TA team will review it shortly.' });
                setMsgText('');
                fetchNotifications(); // REFRESH PERSISTENT LIST
                setTimeout(() => {
                    setMsgStatus(null);
                }, 3000);
            } else {
                const data = await res.json();
                setMsgStatus({ type: 'error', message: data.message || "Failed to send message." });
            }
        } catch (error) {
            console.error(error);
            setMsgStatus({ type: 'error', message: "A technical error occurred. Please try again." });
        } finally {
            setIsMsgSending(false);
        }
    };

    const handleDownloadNotificationFile = async (notifId: string, fileName: string) => {
        if (!token) return;
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBase}/v1/applicant/notifications/${notifId}/attachment`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                alert("Could not download file.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredJobs = availableJobs.filter(job => {
        const query = searchQuery.toLowerCase().trim();
        const loc = searchLocation.toLowerCase().trim();
        
        // Search in Title, Department, and Tenant Name (Company)
        const titleMatch = !query || (job.title && job.title.toLowerCase().includes(query));
        const deptMatch = !query || (job.department && job.department.toLowerCase().includes(query));
        const companyMatch = !query || (job.company && job.company.toLowerCase().includes(query));
        const tenantMatch = !query || (job.tenant?.name && job.tenant.name.toLowerCase().includes(query));
        
        const keywordMatch = titleMatch || deptMatch || companyMatch || tenantMatch;

        const locationMatch = !loc || (job.location && job.location.toLowerCase().includes(loc));
        
        return keywordMatch && locationMatch;
    });

    const handleAuthSuccess = (newToken: string, newApplicant: any) => {
        localStorage.setItem('applicant_token', newToken);
        setToken(newToken);
        setApplicant(newApplicant);
        setProfileBannerVisible(true); // reset banner on new login session
        const splitName = newApplicant.name?.split(' ') || [];
        setProfileForm({
            first_name: splitName[0] || '',
            last_name: splitName.slice(1).join(' ') || '',
            headline: newApplicant.headline || '',
            phone: newApplicant.phone || '',
            age: newApplicant.age || '',
            gender: newApplicant.gender || '',
            years_of_experience: newApplicant.years_of_experience || '',
            professional_background: newApplicant.professional_background || '',
            portfolio_link: newApplicant.portfolio_link || '',
        });
    };

    const handleLogout = async () => {
        if (token) {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            await fetch(`${cleanBase}/v1/applicant/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            }).catch(() => { });
        }
        localStorage.removeItem('applicant_token');
        setToken(null);
        setApplicant(null);
        setApplications([]);
    };

    const handleSaveProfile = async () => {
        if (!token) return;
        setIsProfileSaving(true);
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

            // Use FormData for file upload
            const formData = new FormData();
            Object.entries(profileForm).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }

            const res = await fetch(`${cleanBase}/v1/applicant/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setApplicant(data.applicant);
                setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
                setTimeout(() => setProfileStatus(null), 5000);
            } else {
                const errData = await res.json();
                setProfileStatus({ type: 'error', message: errData.message || 'Failed to update profile.' });
            }
        } catch (err) {
            console.error(err);
            setProfileStatus({ type: 'error', message: 'An error occurred while saving.' });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handleChangePassword = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setPasswordMessage({ text: '', type: '' });
        if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation) {
            setPasswordMessage({ text: 'Please fill in all fields.', type: 'error' });
            return;
        }
        if (passwordForm.password !== passwordForm.password_confirmation) {
            setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }
        if (passwordForm.password.length < 6) {
            setPasswordMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setIsPasswordSaving(true);
        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const token = localStorage.getItem('applicant_token');
            const res = await fetch(`${cleanBase}/v1/applicant/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordForm)
            });
            const data = await res.json();
            if (!res.ok) {
                setPasswordMessage({ text: data.message || 'Failed to change password.', type: 'error' });
            } else {
                setPasswordMessage({ text: 'Password changed successfully! You can log in with your new password.', type: 'success' });
                setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
            }
        } catch (error) {
            setPasswordMessage({ text: 'An error occurred while changing your password.', type: 'error' });
        } finally {
            setIsPasswordSaving(false);
        }
    };

    const handleUpdatePhoto = async () => {
        if (!token || !photoFile) return;
        setIsPhotoSaving(true);
        setPhotoMessage({ text: '', type: '' });

        try {
            const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const formData = new FormData();
            formData.append('first_name', profileForm.first_name);
            formData.append('last_name', profileForm.last_name);
            formData.append('photo', photoFile);

            const res = await fetch(`${cleanBase}/v1/applicant/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setApplicant(data.applicant);
                setPhotoMessage({ text: 'Photo updated successfully!', type: 'success' });
                setPhotoFile(null);
                setTimeout(() => setPhotoMessage({ text: '', type: '' }), 5000);
            } else {
                const errData = await res.json();
                setPhotoMessage({ text: errData.message || 'Failed to update photo.', type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setPhotoMessage({ text: 'An error occurred while uploading your photo.', type: 'error' });
        } finally {
            setIsPhotoSaving(false);
        }
    };


    // ── Loading State ──
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-black border-t-[#FDF22F] rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // ── Not Logged In: Show Auth Page ──
    if (!token || !applicant) {
        return (
            <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-6 py-16">
                    <div className="w-full max-w-[480px] space-y-4">

                        {/* Main Auth Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[32px] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden"
                        >
                            {/* Auth Header */}
                            <div className="bg-[#FDF22F] px-10 pt-10 pb-8 rounded-t-[32px]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#FDF22F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-black/40 uppercase tracking-widest block">Applicant Portal</span>
                                        <span className="text-[10px] font-bold text-black/60">Track your application status in real time</span>
                                    </div>
                                </div>
                                <h1 className="text-2xl font-black text-black">
                                    Welcome back
                                </h1>
                                <p className="text-sm text-black/50 font-medium mt-1">
                                    Sign in with the email and password you created when you applied.
                                </p>
                            </div>


                            {/* Form */}
                            <div className="p-10">
                                <AuthForm mode={authMode} onSuccess={handleAuthSuccess} />
                                <p className="mt-5 text-center text-[11px] font-bold text-gray-400">
                                    Password not working? <Link
                                        href="/applicant/forgot-password"
                                        className="text-black font-black hover:underline"
                                    >Reset your password →</Link>
                                </p>

                                <div className="mt-6 pt-6 border-t border-gray-50">
                                    <Link href="/careers" className="block text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">
                                        ← Back to Job Listings
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* "New here? Apply first" CTA card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-black rounded-3xl p-6 flex items-center justify-between gap-4"
                        >
                            <div>
                                <p className="font-black text-white text-sm">First time here?</p>
                                <p className="text-gray-400 text-[11px] font-medium mt-0.5">
                                    Apply for a job first. Your account is created automatically during the apply process.
                                </p>
                            </div>
                            <Link
                                href="/careers"
                                className="shrink-0 px-5 py-3 bg-[#FDF22F] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap"
                            >
                                Apply Now →
                            </Link>
                        </motion.div>

                        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            Secured by Droga Talent Acquisition System
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ── Logged In: Show Portal ──
    const navItems = [
        { id: 'profile', label: 'Your profile' },
        { id: 'applications', label: 'Applications' },
        { id: 'jobs', label: 'Search Jobs' },
        { id: 'settings', label: 'Settings' },
    ];

    // Navbar search handler
    const handleNavSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (navSearchInput.trim()) {
            setSearchQuery(navSearchInput.trim());
            setSearchLocation('');
            setActiveSection('jobs');
        }
    };

    const initials = applicant.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
    const splitName = applicant.name?.split(' ') || [];
    const firstName = splitName[0] || '';
    const lastName = splitName.slice(1).join(' ') || '';

    return (
        <div className="min-h-screen bg-[#F9F9FB] flex flex-col font-sans">
            {/* Top Navbar */}
            <nav className="bg-[#FDF22F] relative z-50 shadow-sm border-b border-black/5">
                <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 flex items-center justify-center bg-black rounded-lg shadow-sm overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                            <span className="text-[#FDF22F] font-black text-2xl italic tracking-tighter select-none font-serif">D</span>
                        </div>
                        <div className="flex flex-col border-l border-black/10 pl-3">
                            <span className="text-black font-black text-[16px] leading-[0.9] tracking-[0.05em] mb-0.5 group-hover:text-black/70 transition-colors">HIRING HUB</span>
                            <span className="text-black/40 font-bold text-[8px] uppercase tracking-[0.15em] leading-none group-hover:text-black/60 transition-colors">DROGA GROUP</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <form onSubmit={handleNavSearch} className="hidden lg:flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={navSearchInput}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNavSearchInput(val);
                                        setSearchQuery(val);
                                        // Automatically jump to jobs tab if typing starts
                                        if (val.trim() && activeSection !== 'jobs') {
                                            setActiveSection('jobs');
                                        }
                                    }}
                                    className="pl-9 pr-4 py-2 bg-black/10 border border-black/10 rounded-full text-[13px] font-medium text-black placeholder-black/40 outline-none focus:bg-black/15 focus:border-black/20 transition-all w-48 focus:w-64"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-[#FDF22F] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-black/80 transition-all"
                            >
                                Search
                            </button>
                        </form>

                        <div className="flex items-center gap-2">
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-black hover:bg-black/5 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-[#FDF22F] text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#FDF22F] shadow-lg animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 15, scale: 0.98 }}
                                            className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-[420px] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden z-[100]"
                                        >
                                            <div className="px-8 py-7 border-b border-gray-100/50 flex items-center justify-between bg-white/50">
                                                <div>
                                                    <h3 className="text-[16px] font-black text-gray-900 tracking-tight">Activity Feed</h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">Hiring Portal Live</p>
                                                    </div>
                                                </div>
                                                {unreadCount > 0 && notificationTab === 'inbox' && (
                                                    <button
                                                        onClick={markAllNotificationsRead}
                                                        className="px-4 py-2 bg-black text-[#FDF22F] text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        Read all
                                                    </button>
                                                )}
                                            </div>

                                            {/* Modern Tabs */}
                                            <div className="flex px-4 bg-gray-50/50">
                                                <button
                                                    onClick={() => setNotificationTab('inbox')}
                                                    className={`relative flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${notificationTab === 'inbox' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Inbox
                                                    {notificationTab === 'inbox' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-4 right-4 h-0.5 bg-black rounded-full" />}
                                                    {unreadCount > 0 && <span className="absolute top-4 right-[30%] w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />}
                                                </button>
                                                <button
                                                    onClick={() => setNotificationTab('message')}
                                                    className={`relative flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${notificationTab === 'message' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Contact Team
                                                    {notificationTab === 'message' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-4 right-4 h-0.5 bg-black rounded-full" />}
                                                </button>
                                            </div>

                                            <div className="max-h-[520px] overflow-y-auto custom-scrollbar p-2">
                                                {notificationTab === 'inbox' ? (
                                                    <div className="space-y-1">
                                                        {notifications.length > 0 ? (
                                                            notifications.map((notif) => (
                                                                <motion.div
                                                                    key={notif.id}
                                                                    whileHover={{ y: -2, scale: 1.01 }}
                                                                    onClick={() => markNotificationRead(notif.id)}
                                                                    className={`group p-6 rounded-[24px] cursor-pointer transition-all border ${!notif.read_at ? 'bg-[#FDF22F]/5 border-[#FDF22F]/20' : 'bg-transparent border-transparent hover:bg-gray-50/80'} flex gap-5`}
                                                                >
                                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-3 ${notif.data.type === 'status_update' ? 'bg-black text-[#FDF22F]' : (notif.data.type === 'sent_message' ? 'bg-gray-100 text-gray-500' : 'bg-[#FDF22F] text-black')}`}>
                                                                        {notif.data.type === 'status_update' ? (
                                                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        ) : notif.data.type === 'sent_message' ? (
                                                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                                        ) : (
                                                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <p className="text-[15px] font-black text-gray-900 leading-tight group-hover:text-black transition-colors">{notif.data.title}</p>
                                                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-2 whitespace-nowrap">
                                                                                {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[13px] text-gray-500 font-bold leading-relaxed mb-4 leading-[1.6]">{notif.data.message}</p>

                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                            {(notif.data.written_exam_score !== null || notif.data.technical_interview_score !== null) && (
                                                                                <div className="flex items-center gap-2">
                                                                                    {notif.data.written_exam_score !== null && (
                                                                                        <div className="flex items-center px-2.5 py-1 bg-black text-[#FDF22F] text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-black/10">
                                                                                            <span className="opacity-50 mr-1.5 border-r border-[#FDF22F]/30 pr-1.5">WRITTEN</span> {notif.data.written_exam_score}%
                                                                                        </div>
                                                                                    )}
                                                                                    {notif.data.technical_interview_score !== null && (
                                                                                        <div className="flex items-center px-2.5 py-1 bg-[#FDF22F] text-black text-[9px] font-black rounded-full uppercase tracking-widest border border-black/5 shadow-lg shadow-[#FDF22F]/10">
                                                                                            <span className="opacity-50 mr-1.5 border-r border-black/10 pr-1.5">INTERVIEW</span> {notif.data.technical_interview_score}%
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {notif.data.interviewer_feedback && (
                                                                            <div className="mt-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30 relative overflow-hidden group/feedback">
                                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/feedback:opacity-30 transition-opacity">
                                                                                    <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017C11.4647 12 11.017 11.5523 11.017 11V6C11.017 5.44772 11.4647 5 12.017 5H19.017C21.2261 5 23.017 6.79086 23.017 9V15C23.017 17.2091 21.2261 19 19.017 19H17.017C15.3601 19 14.017 19.8954 14.017 21ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11C3.017 11.5523 2.56928 12 2.017 12H1.017C0.464722 12 0.017 11.5523 0.017 11V6C0.017 5.44772 0.464722 5 1.017 5H8.017C10.2261 5 12.017 6.79086 12.017 9V15C12.017 17.2091 10.2261 19 8.017 19H6.017C4.36014 19 3.017 19.8954 3.017 21Z" /></svg>
                                                                                </div>
                                                                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.15em] mb-1.5">Official Feedback</p>
                                                                                <p className="text-[13px] text-gray-700 font-bold italic z-10 relative leading-relaxed">"{notif.data.interviewer_feedback}"</p>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100/50">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    deleteNotification(notif.id);
                                                                                }}
                                                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all active:scale-90"
                                                                            >
                                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                                Remove
                                                                            </button>
                                                                            {notif.data.attachment_path && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDownloadNotificationFile(notif.id, notif.data.attachment_name || 'attachment');
                                                                                    }}
                                                                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0D625C] hover:text-black transition-all active:scale-90"
                                                                                >
                                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                                    Document
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <div className="px-10 py-24 text-center">
                                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                                </div>
                                                                <h4 className="text-[15px] font-black text-gray-400 uppercase tracking-widest">Inbox Empty</h4>
                                                                <p className="text-gray-300 text-[11px] font-bold mt-2">You're all caught up!</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-8">
                                                        <div className="mb-6">
                                                            <h4 className="text-[16px] font-black text-black">Send a message</h4>
                                                            <p className="text-[12px] text-gray-400 font-medium mt-1">Have a question or complaint? Our TA team is here to help.</p>
                                                        </div>

                                                        <div className="space-y-5">
                                                            {msgStatus && (
                                                                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${msgStatus.type === 'success' ? 'bg-[#FDF22F]/10 border-[#FDF22F]/30 text-black' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msgStatus.type === 'success' ? 'bg-black text-[#FDF22F]' : 'bg-red-500 text-white'}`}>
                                                                        {msgStatus.type === 'success' ? (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                        ) : (
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[12px] font-black uppercase tracking-tight">{msgStatus.message}</p>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TO: {applications.find(a => a.id === msgApplicationId)?.company} TA TEAM</label>
                                                                <div className="p-3 bg-black/5 rounded-xl border border-black/5 mb-3 flex flex-wrap gap-2">
                                                                    {applications.find(a => a.id === msgApplicationId)?.hiring_team?.map((member: any) => (
                                                                        <div key={member.email} className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-black/10 shadow-sm">
                                                                            <div className="w-5 h-5 bg-black text-[#FDF22F] rounded-full flex items-center justify-center text-[8px] font-black">
                                                                                {member.name.charAt(0)}
                                                                            </div>
                                                                            <span className="text-[10px] font-black text-gray-700">{member.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Message</label>
                                                                <textarea
                                                                    value={msgText}
                                                                    onChange={(e) => setMsgText(e.target.value)}
                                                                    placeholder="Type your message here..."
                                                                    rows={3}
                                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-black font-bold text-[13px] text-gray-700 transition-all resize-none"
                                                                ></textarea>
                                                            </div>
                                                            <button
                                                                onClick={handleSendMessage}
                                                                disabled={isMsgSending || !msgText.trim()}
                                                                className="w-full py-4 bg-black text-[#FDF22F] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {isMsgSending ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-[#FDF22F] border-t-transparent rounded-full animate-spin" />
                                                                        Sending...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Send Message
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                                    </>
                                                                )}
                                                            </button>

                                                            <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
                                                                A notification will be sent to the company's TA Team
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-black hover:bg-black/5 rounded-full md:hidden transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

                {/* Mobile Navigation Drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] md:hidden flex flex-col shadow-2xl"
                            >
                                <div className="p-6 bg-[#FDF22F] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-[#FDF22F] font-black overflow-hidden border-2 border-white shadow-sm">
                                            {applicant.photo_path ? (
                                                <img
                                                    src={getStorageUrl(applicant.photo_path)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : initials}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black text-black leading-tight uppercase truncate max-w-[140px]">{applicant.name}</p>
                                            <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">Active session</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center bg-black/10 rounded-full">
                                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                    {navItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id as any);
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeSection === item.id 
                                                ? 'bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/20' 
                                                : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    <div className="h-px bg-gray-100 my-4" />
                                    <button 
                                        onClick={() => {
                                            setShowHelpModal(true);
                                            setSidebarOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50"
                                    >
                                        Support Hub
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                                <div className="p-6 border-t border-gray-50">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">DROGA RECRUITMENT V2.1</p>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </nav >

            {/* Dark Banner Background overlaying main content */}
            {
                activeSection !== 'jobs' && (
                    <div className="bg-[#FDF22F] absolute top-[72px] left-0 right-0 h-40 z-0 border-b border-black/5 shadow-sm" />
                )
            }

            <main className={`flex-1 max-w-[1200px] mx-auto w-full px-4 md:px-6 relative z-10 ${activeSection === 'jobs' ? 'pt-6' : 'pt-4 md:pt-10'} pb-20`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Sidebar Card */}
                    {activeSection !== 'jobs' && (
                        <aside className="w-[260px] shrink-0 hidden md:block">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-8 pb-4 flex flex-col items-center">
                                    <div className="w-[72px] h-[72px] rounded-full bg-[#FDF22F] flex items-center justify-center text-black font-black text-xl mb-4 overflow-hidden border border-gray-100 shadow-sm relative">
                                        {applicant.photo_path ? (
                                            <img
                                                src={getStorageUrl(applicant.photo_path)}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    if (!e.currentTarget.parentElement?.querySelector('.fallback-initials')) {
                                                        const fallback = document.createElement('span');
                                                        fallback.className = 'fallback-initials';
                                                        fallback.textContent = initials;
                                                        e.currentTarget.parentNode?.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                        ) : initials}
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white" />
                                    </div>
                                    <h2 className="font-bold text-gray-800 text-[13px] uppercase tracking-wide text-center">
                                        {applicant.name}
                                    </h2>
                                </div>

                                <nav className="p-4 space-y-1">
                                    {navItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id as any)}
                                            className={`w-full text-left px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${activeSection === item.id
                                                ? 'bg-[#F2F4F7] text-gray-900 border-l-4 border-black pl-3'
                                                : 'text-gray-600 hover:bg-[#F2F4F7] border-l-4 border-transparent pl-3'}`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setShowHelpModal(true)}
                                        className="w-full text-left px-4 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-[#F2F4F7] border-l-4 border-transparent pl-3 transition-colors flex items-center justify-between group"
                                    >
                                        Need Help?
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </button>
                                    <div className="w-full h-px bg-gray-100 my-4" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-[#F2F4F7] border-l-4 border-transparent pl-3 transition-colors flex items-center justify-between group"
                                    >
                                        Log out
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </button>
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0 pt-3">
                        {/* Title inside black banner */}
                        {activeSection !== 'jobs' && (
                            <h1 className="text-[24px] md:text-[28px] font-normal text-black mb-6 md:mb-12">
                                {activeSection === 'applications' && 'Applications'}
                                {activeSection === 'profile' && 'Your profile'}
                                {activeSection === 'settings' && 'Settings'}
                            </h1>
                        )}

                        <AnimatePresence mode="wait">
                            {/* Applications Tab */}
                            {activeSection === 'applications' && (
                                <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                    <p className="text-sm text-gray-900 font-bold mb-4">{applications.length} jobs tracked</p>

                                    {applications.length === 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                                            <p className="text-gray-600 mb-4">You haven&apos;t applied to any jobs yet.</p>
                                            <Link href="/careers" className="inline-flex px-6 py-2 bg-black text-white rounded text-sm font-bold hover:bg-gray-800 transition-colors">
                                                Search jobs
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                            {/* De-duplicate: keep one entry per job_posting_id (latest by date) */}
                                            {(() => {
                                                const seen = new Map<string, any>();
                                                [...applications]
                                                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                  .forEach(app => {
                                                    const key = app.job_posting_id ?? app.job_posting?.id ?? app.id;
                                                    if (!seen.has(key)) seen.set(key, app);
                                                  });
                                                return [...seen.values()];
                                            })().map((app) => {
                                                const st = getStatus(app.status);
                                                return (
                                                    <div key={app.id} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 md:gap-6 hover:bg-[#F9F9FB] transition-colors">
                                                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                                                            <span className="text-[#FDF22F] font-black text-lg">D</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="text-[17px] font-medium text-[#0D625C] mb-1">
                                                                {app.job_posting?.title || 'Unknown Position'}
                                                            </h3>
                                                            <div className="text-[13px] text-gray-500 flex items-center gap-2 flex-wrap">
                                                                <span className="font-medium text-gray-700">at {app.company}</span>
                                                                <span>·</span>
                                                                <span>{app.job_posting?.type || 'Full-time'}</span>
                                                                <span>·</span>
                                                                <span>{app.job_posting?.location || 'Addis Ababa'}</span>
                                                                <span>·</span>
                                                                <span>{app.job_posting?.department || 'General'}</span>
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-3 text-[12px]">
                                                                <span className="text-gray-400">{timeAgo(app.created_at)}</span>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${st.bg} ${st.color}`}>
                                                                    {st.label.replace(' 🎉', '')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Profile Tab */}
                            {activeSection === 'profile' && (
                                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                                    {profileStatus && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border flex items-center gap-3 ${profileStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${profileStatus.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {profileStatus.type === 'success' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                                )}
                                            </div>
                                            <p className="text-[13px] font-black uppercase tracking-tight">{profileStatus.message}</p>
                                        </motion.div>
                                    )}

                                    {profileBannerVisible && (
                                    <div className="bg-[#EAF5F4] border border-[#B3E1E0] rounded-xl p-4 md:p-5 flex justify-between items-start gap-4">
                                        <div className="flex gap-3 md:gap-4">
                                            <div className="w-10 h-10 bg-[#B3E1E0] rounded-full flex items-center justify-center shrink-0 hidden sm:flex">
                                                <svg className="w-5 h-5 text-[#0D625C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] md:text-[15px] font-bold text-gray-900 mb-1">Verify your information</h4>
                                                <p className="text-[12px] md:text-[13px] text-gray-700 leading-relaxed">
                                                    Ensure your profile details are accurate. This helps hiring managers find the best match for open roles.
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => setProfileBannerVisible(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                    )}

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="text-lg font-normal text-gray-900">Personal information</h3>
                                            <button className="text-sm font-bold text-gray-500 flex items-center gap-1 hover:text-gray-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                Edit
                                            </button>
                                        </div>
                                        <div className="p-5 md:p-8 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        <span className="text-red-500 mr-1">*</span>First name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.first_name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        <span className="text-red-500 mr-1">*</span>Last name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileForm.last_name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                    <span className="text-red-500 mr-1">*</span>Email
                                                </label>
                                                <input type="email" value={applicant.email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded outline-none text-[14px] text-gray-500 bg-gray-50 border-dashed" />
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                    Headline <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.headline}
                                                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                                                    placeholder="e.g. Senior Software Engineer"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    placeholder="+251 9..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        Years of Experience
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={profileForm.years_of_experience}
                                                        onChange={(e) => setProfileForm({ ...profileForm, years_of_experience: e.target.value })}
                                                        placeholder="e.g. 5"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        Age
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={profileForm.age}
                                                        onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                                                        placeholder="e.g. 28"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        Gender
                                                    </label>
                                                    <select
                                                        value={profileForm.gender}
                                                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900 bg-white"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                        Portfolio Link
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={profileForm.portfolio_link}
                                                        onChange={(e) => setProfileForm({ ...profileForm, portfolio_link: e.target.value })}
                                                        placeholder="https://..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                                                    Professional Background
                                                </label>
                                                <textarea
                                                    value={profileForm.professional_background}
                                                    onChange={(e) => setProfileForm({ ...profileForm, professional_background: e.target.value })}
                                                    placeholder="Briefly describe your experience and skills..."
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-shadow text-[14px] text-gray-900 resize-none"
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                                <button
                                                    onClick={handleSaveProfile}
                                                    disabled={isProfileSaving}
                                                    className="px-8 py-2.5 bg-[#FDF22F] text-black rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-[#FDF22F] transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-yellow-500/10"
                                                >
                                                    {isProfileSaving ? 'Saving...' : 'Save changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resume Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-lg font-normal text-gray-900">Resume</h3>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            {applicant.resume_path && (
                                                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-gray-900">Current Resume</p>
                                                            <p className="text-[11px] text-gray-400">PDF version uploaded during application</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`${API_URL}/v1/applicants/${applicant.id}/resume`}
                                                        target="_blank"
                                                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-[12px] font-bold hover:bg-white hover:shadow-sm transition-all"
                                                    >
                                                        View Resume
                                                    </a>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-[13px] font-bold text-gray-700 mb-3">Update your resume</label>
                                                <div className="flex items-center justify-center w-full">
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                            <p className="text-[12px] text-gray-500">
                                                                <span className="font-bold">{resumeFile ? resumeFile.name : 'Click to upload'}</span> or drag and drop
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-1">PDF Only (MAX. 10MB)</p>
                                                        </div>
                                                        <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                                                    </label>
                                                </div>
                                            </div>

                                            {resumeFile && (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isProfileSaving}
                                                        className="px-6 py-2 bg-black text-white rounded font-bold text-[12px] hover:bg-gray-800 transition-all"
                                                    >
                                                        {isProfileSaving ? 'Uploading...' : 'Upload New Resume'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Jobs for you Tab */}
                            {activeSection === 'jobs' && (
                                <motion.div 
                                    key="jobs" 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    className="space-y-6"
                                    onViewportEnter={() => { if (availableJobs.length === 0) fetchAvailableJobs(); }}
                                >
                                    <button 
                                        onClick={() => {
                                            setActiveSection('profile');
                                            setSearchQuery('');
                                            setNavSearchInput('');
                                        }}
                                        className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                        Back to Profile Dashboard
                                    </button>

                                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1 relative">
                                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Job title or keyword"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') setSearchQuery(e.currentTarget.value); }}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded focus:border-[#0D625C] focus:ring-1 focus:ring-[#0D625C] outline-none text-[14px]"
                                                />
                                            </div>
                                            <div className="flex-1 relative">
                                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Location (e.g. Addis Ababa)"
                                                    value={searchLocation}
                                                    onChange={(e) => setSearchLocation(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') setSearchLocation(e.currentTarget.value); }}
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded focus:border-[#0D625C] focus:ring-1 focus:ring-[#0D625C] outline-none text-[14px]"
                                                />
                                            </div>
                                            <button
                                                onClick={() => { /* filteredJobs already reacts to state, this just triggers re-render */ setSearchQuery(q => q); }}
                                                className="px-8 py-2.5 bg-[#FDF22F] text-black rounded font-black text-[14px] uppercase tracking-wider hover:bg-black hover:text-[#FDF22F] transition-all whitespace-nowrap">
                                                Search jobs
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-[13px] font-medium text-gray-500 mb-4">{filteredJobs.length.toLocaleString()} jobs</p>

                                    {filteredJobs.length === 0 ? (
                                        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                                            <p className="text-gray-600 mb-6">No available jobs match your search.</p>
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSearchLocation('');
                                                    setNavSearchInput('');
                                                }}
                                                className="px-6 py-2 bg-black text-[#FDF22F] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                                            >
                                                View all jobs
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                            {filteredJobs.map((job) => (
                                                <div key={job.id} className="p-6 flex gap-6 hover:bg-[#F9F9FB] transition-colors relative group bg-white">
                                                    <div className="w-12 h-12 bg-black rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                                        <span className="text-[#FDF22F] font-black text-lg">D</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Link href={`/careers/${job.id}`} className="text-[17px] font-medium text-[#0D625C] mb-1 hover:underline block">
                                                            {job.title}
                                                        </Link>
                                                        <div className="text-[13px] text-gray-500 flex items-center gap-2 flex-wrap mb-2">
                                                            <span className="font-medium text-gray-700">at {job.tenant?.name || job.company || 'Droga Pharma'}</span>
                                                            <span>·</span>
                                                            <span>{job.type || 'Full-time'}</span>
                                                            <span>·</span>
                                                            <span>{job.location || 'Addis Ababa'}</span>
                                                            <span>·</span>
                                                            <span>{job.department || 'General'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[12px]">
                                                            <span className="text-gray-400">{postedAgo(job.created_at)}</span>
                                                            <span className="text-[#f7b944] font-bold flex items-center gap-1 tracking-wide">
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                                Featured
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Settings Tab */}
                            {activeSection === 'settings' && (
                                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-[15px] font-bold text-gray-900">Account</h3>
                                        </div>
                                        <div className="p-6">
                                            <label className="block text-[13px] font-bold text-gray-700 mb-2">Email</label>
                                            <div className="relative max-w-sm">
                                                <input type="text" value={applicant.email} readOnly disabled className="w-full px-3 py-2 border border-gray-300 border-dashed rounded bg-gray-50 text-[14px] text-gray-400 outline-none" />
                                                <svg className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-2 max-w-sm">
                                                You can&apos;t change your email because it is used to sign you in and to be contacted by employers.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Profile Photo Upload */}
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-[15px] font-bold text-gray-900">Profile Photo</h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <p className="text-[13px] text-gray-500 mb-2">Update your portal profile picture.</p>
                                            
                                            {photoMessage.text && (
                                                <div className={`p-4 rounded-xl border text-[13px] font-bold ${photoMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                                    {photoMessage.text}
                                                </div>
                                            )}

                                            <div className="max-w-sm space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-[#FDF22F] text-xl font-black shrink-0 overflow-hidden border-2 border-gray-100 shadow-sm">
                                                        {photoFile ? (
                                                            <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : applicant?.photo_path ? (
                                                            <img 
                                                                src={getStorageUrl(applicant.photo_path)} 
                                                                alt="Profile" 
                                                                className="w-full h-full object-cover" 
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    // Only replace internal text, don't destroy parent UI elements
                                                                    const fallback = document.createElement('span');
                                                                    fallback.textContent = (applicant?.name || "U")[0].toUpperCase();
                                                                    (e.target as HTMLImageElement).parentNode?.appendChild(fallback);
                                                                }}
                                                            />
                                                        ) : (
                                                            (applicant?.name || "U")[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    setPhotoFile(e.target.files[0]);
                                                                }
                                                            }}
                                                            className="block w-full text-[12px] text-gray-500
                                                                file:mr-4 file:py-2 file:px-4
                                                                file:rounded-full file:border-0
                                                                file:text-[12px] file:font-bold
                                                                file:bg-gray-100 file:text-gray-700
                                                                hover:file:bg-gray-200 cursor-pointer transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                {photoFile && (
                                                    <button 
                                                        onClick={handleUpdatePhoto}
                                                        disabled={isPhotoSaving}
                                                        className="w-full mt-4 px-4 py-2.5 bg-[#FDF22F] text-black text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-[#FDF22F] hover:-translate-y-0.5 shadow-sm transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isPhotoSaving ? 'Uploading...' : 'Save Photo'}
                                                        {!isPhotoSaving && (
                                                            <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security & Password Reset */}
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-[15px] font-bold text-gray-900">Security & Password</h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <p className="text-[13px] text-gray-500 mb-2">Update your portal access password.</p>
                                            
                                            {passwordMessage.text && (
                                                <div className={`p-4 rounded-xl border text-[13px] font-bold ${passwordMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                                    {passwordMessage.text}
                                                </div>
                                            )}

                                            <div className="max-w-sm space-y-4">
                                                <div>
                                                    <label className="block text-[12px] font-bold text-gray-700 mb-1">Current Password</label>
                                                    <input 
                                                        type="password" 
                                                        value={passwordForm.current_password}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none text-[14px]"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-gray-700 mb-1">New Password (min. 6 chars)</label>
                                                    <input 
                                                        type="password" 
                                                        value={passwordForm.password}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none text-[14px]"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[12px] font-bold text-gray-700 mb-1">Confirm New Password</label>
                                                    <input 
                                                        type="password" 
                                                        value={passwordForm.password_confirmation}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none text-[14px]"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                
                                                <button 
                                                    onClick={handleChangePassword}
                                                    disabled={isPasswordSaving}
                                                    className="w-full mt-4 px-4 py-3 bg-[#FDF22F] text-black text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-black hover:text-[#FDF22F] hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 shadow-sm transition-all flex items-center justify-center gap-2 group"
                                                >
                                                    {isPasswordSaving ? 'Updating...' : 'Update Password'}
                                                    {!isPasswordSaving && (
                                                        <svg className="w-4 h-4 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-[15px] font-bold text-gray-900">Personalization</h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <p className="text-[13px] font-bold text-gray-900 mb-3">Promote your profile</p>
                                                <label className="flex items-start gap-3 cursor-pointer">
                                                    <div className="relative flex items-center justify-center pt-0.5">
                                                        <input type="checkbox" defaultChecked className="peer w-4 h-4 border-gray-300 rounded text-black focus:ring-black accent-black cursor-pointer" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[13px] font-bold text-gray-900 block">Make your profile visible to recruiters</span>
                                                        <span className="text-[12px] text-gray-500 block">Allow employers to contact you about relevant jobs.</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-[15px] font-bold text-gray-900">Delete your account</h3>
                                        </div>
                                        <div className="p-6 flex items-center justify-between">
                                            <p className="text-[13px] text-gray-600 max-w-lg">
                                                Deleting your account will remove your access to the portal permanently.
                                            </p>
                                            <button className="px-4 py-2 border border-red-200 text-red-600 rounded text-[13px] font-bold hover:bg-red-50 transition-colors">
                                                Delete account
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Pro Footer */}
            <footer className="bg-[#FDF22F] text-black w-full border-t border-black/5">
                <div className="max-w-[1200px] mx-auto w-full px-6 pt-12 pb-6">
                    {/* Top Row - Logo */}
                    <div className="mb-12">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="w-11 h-11 flex items-center justify-center bg-black rounded-xl shadow-md overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                                <span className="text-[#FDF22F] font-black text-3xl italic tracking-tighter select-none font-serif">D</span>
                            </div>
                            <div className="flex flex-col border-l border-black/10 pl-3">
                                <span className="text-black font-black text-[18px] leading-[0.9] tracking-[0.05em] mb-0.5 uppercase group-hover:text-black/70 transition-colors">HIRING HUB</span>
                                <span className="text-black/40 font-bold text-[9px] uppercase tracking-[0.15em] leading-none group-hover:text-black/60 transition-colors">DROGA GROUP</span>
                            </div>
                        </Link>
                    </div>

                    {/* Divider & Bottom Links */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-black/10 text-[12px] text-black/40 font-medium">
                        <p>© Droga Talent Acquisition System {new Date().getFullYear()}</p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                            <button
                                onClick={() => setLegalModal({
                                    title: "Terms & Conditions",
                                    subtitle: "Usage and Platform Agreements",
                                    content: (
                                        <div className="space-y-8 text-gray-700 text-[15px] leading-[1.8] font-medium">
                                            <div>
                                                <h4 className="text-xl font-black text-black mb-3">Welcome to Droga Hiring Hub</h4>
                                                <p className="text-gray-500">By accessing or using the Droga Group Talent Acquisition platform, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.</p>
                                            </div>
                                            
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                                <h5 className="font-bold text-black text-base flex items-center gap-2 mb-2">
                                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                    Accuracy of Information
                                                </h5>
                                                <p className="text-gray-500 text-[14px]">You acknowledge that all information submitted during your application process, including resumes and professional background details, is highly accurate and truthful. We reserve the right to verify any claims.</p>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-bold text-black mb-2">Platform Misuse</h4>
                                                <p className="text-gray-500 mb-6">You must not misuse our platform by knowingly introducing viruses, trojans, or attempting unauthorized access to any part of our systems.</p>
                                                
                                                <div className="w-full h-px bg-gray-100 my-6"></div>
                                                
                                                <div className="flex bg-black text-white p-6 rounded-2xl items-center justify-between group cursor-pointer hover:bg-black/90 transition-all">
                                                    <div>
                                                        <h6 className="font-bold text-[14px]">Full Corporate Policies</h6>
                                                        <p className="text-gray-400 text-[12px] mt-1">Visit our main portal for extended T&Cs.</p>
                                                    </div>
                                                    <a href="https://drogapharma.com/" target="_blank" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-[#FDF22F] group-hover:text-black transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                className="hover:text-black transition-colors"
                            >Terms & Conditions</button>

                            <button
                                onClick={() => setLegalModal({
                                    title: "Digital Services Act",
                                    subtitle: "Transparency & Content Moderation",
                                    content: (
                                        <div className="space-y-8 text-gray-700 text-[15px] leading-[1.8] font-medium">
                                            <div>
                                                <h4 className="text-xl font-black text-black mb-3">Our Commitment to DSA</h4>
                                                <p className="text-gray-500">Droga Group operates this Hiring Hub in strict compliance with transparency and digital service regulations, ensuring a fair, clear, and highly secure environment for all applicants.</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </div>
                                                    <h5 className="font-bold text-black text-[14px] mb-1">Transparency</h5>
                                                    <p className="text-gray-500 text-[12px] leading-relaxed">No hidden metrics. We are fully transparent about how applications are evaluated.</p>
                                                </div>
                                                <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    </div>
                                                    <h5 className="font-bold text-black text-[14px] mb-1">Reporting</h5>
                                                    <p className="text-gray-500 text-[12px] leading-relaxed">You have the right to flag or report issues within the application framework securely.</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 p-6 rounded-2xl flex items-start gap-4">
                                                <div className="mt-1">
                                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                                </div>
                                                <div>
                                                    <p className="text-[13px] text-gray-600 mb-3">If you notice any systemic abuse or have fundamental concerns about digital service compliance, you can contact our core compliance team directly.</p>
                                                    <a href="https://drogapharma.com/" target="_blank" className="text-[13px] font-bold text-black hover:underline inline-flex items-center gap-1">
                                                        Visit Compliance Hub <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                className="hover:text-black transition-colors"
                            >DSA</button>

                            <button
                                onClick={() => setLegalModal({
                                    title: "Privacy Policy",
                                    subtitle: "How we protect and use your data",
                                    content: (
                                        <div className="space-y-8 text-gray-700 text-[15px] leading-[1.8] font-medium">
                                            <div>
                                                <h4 className="text-xl font-black text-black mb-3">Your Trust is Paramount</h4>
                                                <p className="text-gray-500">At Droga Group, we collect your personal data (such as your resume, contact details, and professional background) solely for the rigorous process of recruitment and evaluation.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-bold text-black text-[15px]">Data Minimization</h6>
                                                        <p className="text-gray-500 text-[13px] mt-1">We request and store only the data explicitly necessary for considering you for our career opportunities.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-bold text-black text-[15px]">No Third-Party Selling</h6>
                                                        <p className="text-gray-500 text-[13px] mt-1">Your data is locked in our secure HR system. We do not sell or lease candidate details to any external marketing entities.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    <div>
                                                        <h6 className="font-bold text-black text-[15px]">Right to Erasure</h6>
                                                        <p className="text-gray-500 text-[13px] mt-1">You may delete your account and all associated profile data permanently from the Settings tab at any time.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full h-px bg-gray-100 my-6"></div>

                                            <div className="text-center pb-4">
                                                <a href="https://drogapharma.com/" target="_blank" className="font-bold text-[14px] text-black hover:text-black/60 transition-colors inline-flex items-center gap-2">
                                                    Read our comprehensive Corporate Privacy Policy <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    )
                                })}
                                className="hover:text-black transition-colors"
                            >Privacy Policy</button>

                            <button
                                onClick={() => setLegalModal({
                                    title: "Cookie Settings",
                                    subtitle: "System preferences and tracking",
                                    content: (
                                        <div className="space-y-6 text-gray-700 text-[15px] leading-[1.8] font-medium">
                                            <div className="p-6 bg-[#FDF22F]/10 border border-[#FDF22F]/40 rounded-2xl flex items-start gap-4">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                                                    <span className="text-2xl">🍪</span>
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-black text-[16px] mb-1">We respect your browser</h5>
                                                    <p className="text-gray-600 text-[13px] leading-relaxed">This platform uses extremely minimal, essential cookies solely to maintain your login session and ensure the dashboard functions highly securely.</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-black mb-3">Your active cookie preferences:</h4>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                                        <div>
                                                            <p className="font-bold text-[14px] text-gray-900">Essential System Cookies</p>
                                                            <p className="text-[12px] text-gray-500">Required for login sessions & security</p>
                                                        </div>
                                                        <div className="bg-black text-[#FDF22F] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Always On</div>
                                                    </div>
                                                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl opacity-60">
                                                        <div>
                                                            <p className="font-bold text-[14px] text-gray-900">Marketing & Analytics</p>
                                                            <p className="text-[12px] text-gray-500">We do not track you for ads</p>
                                                        </div>
                                                        <div className="bg-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Disabled</div>
                                                    </div>
                                                </div>
                                                <p className="text-[12px] text-gray-400 mt-4 italic">As this is an internal applicant dashboard, we have disabled all non-essential tracking by default to ensure you a distraction-free experience.</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                className="hover:text-black transition-colors"
                            >Cookie Settings</button>

                            <button
                                onClick={() => setShowHelpModal(true)}
                                className="hover:text-black transition-colors flex items-center gap-1"
                            >
                                Need Help?
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>

            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHelpModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="bg-black p-10">
                                <div className="w-12 h-12 bg-[#FDF22F] rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-2xl font-black text-white">How can we help?</h3>
                                <p className="text-gray-400 text-[14px] mt-2 font-medium">Get in touch with the Droga Group Talent Team</p>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <a href="mailto:info@drogapharma.com" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-[#FDF22F]/10 hover:border-[#FDF22F] transition-all group">
                                        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center group-hover:bg-[#FDF22F]">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 01-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400">Email Support</p>
                                            <p className="text-[14px] font-bold text-gray-800">info@drogapharma.com</p>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                                            <p className="text-[14px] font-bold text-gray-800">+251 91 366 7537</p>
                                        </div>
                                    </div>

                                    <a href="http://www.drogapharma.com" target="_blank" className="flex items-center justify-center w-full py-4 bg-black text-[#FDF22F] rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-[#FDF22F] hover:text-black transition-all">
                                        Visit Help Center
                                    </a>
                                </div>

                                <button
                                    onClick={() => setShowHelpModal(false)}
                                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-black transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Legal Info Modal */}
                {legalModal && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLegalModal(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "100%", opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-[500px] h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
                        >
                            <div className="bg-black p-8 sm:p-12 pb-8">
                                <button onClick={() => setLegalModal(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                                <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-6 inline-flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#FDF22F]"></div>
                                    Droga Legal Hub
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 tracking-tight">{legalModal?.title}</h3>
                                {legalModal?.subtitle && (
                                    <p className="text-[#FDF22F] text-[15px] font-medium">{legalModal.subtitle}</p>
                                )}
                            </div>

                            <div className="p-8 sm:p-12 overflow-y-auto flex-1 custom-scrollbar">
                                {legalModal?.content}
                            </div>

                            <div className="p-6 sm:px-12 sm:py-8 bg-gray-50 border-t border-gray-100 mt-auto">
                                <button
                                    onClick={() => setLegalModal(null)}
                                    className="w-full text-center py-4 bg-black shadow-lg shadow-black/10 text-[14px] font-black uppercase tracking-widest text-[#FDF22F] rounded-xl hover:bg-gray-800 hover:-translate-y-0.5 active:scale-95 transition-all"
                                >
                                    I Understand
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
