'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Job {
    id: number;
    title: string;
    department?: string;
    location: string;
    type: string;
    published_at?: string;
    deadline?: string;
    created_at?: string;
    description?: string;
    tenant?: { name: string };
}

function CareersContent() {
    const searchParams = useSearchParams();
    const applyId = searchParams.get('apply');
    const router = useRouter();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [appStep, setAppStep] = useState(0);
    const [isApplying, setIsApplying] = useState(false);
    const [isGoogleSimulating, setIsGoogleSimulating] = useState(false);
    const [simulatedEmail, setSimulatedEmail] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        age: '',
        gender: '',
        professional_background: '',
        years_of_experience: '',
        portfolio_link: '',
    });
    const [resume, setResume] = useState<File | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [registerPassword, setRegisterPassword] = useState('');
    const [registerConfirm, setRegisterConfirm] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerLoading, setRegisterLoading] = useState(false);

    // ── Reset all form state when modal closes ──────────────────────────────
    const handleCloseModal = () => {
        setIsApplying(false);
        setAppStep(0);
        setFormData({ email: '', name: '', phone: '', age: '', gender: '', professional_background: '', years_of_experience: '', portfolio_link: '' });
        setResume(null);
        setPhoto(null);
        setAttachments([]);
        setRegisterPassword('');
        setRegisterConfirm('');
        setRegisterError('');
        setSubmitting(false);
        router.replace('/careers', { scroll: false }); // clears ?apply=XX from URL
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiFetch('/v1/public/jobs');
                const jobList = Array.isArray(data) ? data : (data?.data || []);
                setJobs(jobList);

                if (applyId) {
                    const jobToApply = jobList.find((j: any) => j.id.toString() === applyId);
                    if (jobToApply) {
                        setSelectedJob(jobToApply);
                        setIsApplying(true);
                        setAppStep(0);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch public jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [applyId]);

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job);
        setIsApplying(true);
        setAppStep(0);
    };

    const handleIdentitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAppStep(2);
    };

    const handleSSO = (provider: string) => {
        if (provider === 'Google') {
            const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (clientID && (window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: clientID,
                    callback: (response: any) => {
                        try {
                            const base64Url = response.credential.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                            }).join(''));
                            const profile = JSON.parse(jsonPayload);
                            setFormData(prev => ({ ...prev, email: profile.email, name: profile.name || prev.name }));
                            setAppStep(2);
                        } catch (e) {
                            console.error("Failed to decode Google JWT", e);
                            alert("Google login failed. Please try again or use email.");
                        }
                    }
                });
                (window as any).google.accounts.id.prompt();
            } else {
                setIsGoogleSimulating(true);
            }
        } else {
            setAppStep(2);
        }
    };

    const handleMockAccountSelect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!simulatedEmail) return;
        setIsGoogleSimulating(false);
        setIsApplying(false);
        setTimeout(() => {
            setIsApplying(true);
            setFormData(prev => ({
                ...prev,
                email: simulatedEmail,
                name: simulatedEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
            }));
            setAppStep(2);
        }, 1200);
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setResume(file);
    };

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRegisterAccount = async () => {
        if (registerPassword !== registerConfirm) { setRegisterError('Passwords do not match.'); return; }
        if (registerPassword.length < 6) { setRegisterError('Password must be at least 6 characters.'); return; }
        setRegisterLoading(true);
        setRegisterError('');
        try {
            const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBaseUrl}/v1/applicant/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: registerPassword, password_confirmation: registerConfirm }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('applicant_token', data.token);
                setAppStep(4);
            } else {
                setRegisterError(data.message || 'Failed to create account.');
            }
        } catch {
            setRegisterError('Network error. Please try again.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleSubmitApplication = async () => {
        if (!selectedJob || !resume) return;
        setSubmitting(true);
        try {
            const body = new FormData();
            body.append('job_posting_id', selectedJob.id.toString());
            body.append('name', formData.name);
            body.append('email', formData.email);
            body.append('phone', formData.phone);
            body.append('age', formData.age);
            body.append('gender', formData.gender);
            body.append('professional_background', formData.professional_background);
            body.append('years_of_experience', formData.years_of_experience);
            body.append('portfolio_link', formData.portfolio_link);
            body.append('resume', resume);
            if (photo) body.append('photo', photo);
            attachments.forEach((file, i) => body.append(`attachments[${i}]`, file));

            const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBaseUrl}/v1/apply`, { method: 'POST', body });

            if (res.ok) {
                setAppStep(3);
            } else {
                const errorData = await res.json();
                alert(`Submission failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Application failed', err);
            alert('Application failed. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F6FA]">
            <Header />

            {/* Hero Section */}
            <header className="relative bg-white pt-24 pb-20 px-8 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-[#FDF22F]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-[1200px] mx-auto space-y-8 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF22F]/10 border border-[#FDF22F]/20 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#FDF22F] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#000000]/60">Career Opportunities</span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-6xl md:text-8xl font-black tracking-tighter text-black">
                        Join the Droga Pharma Team
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
                        We&apos;re looking for passionate individuals to help us innovate in the pharmaceutical industry. Discover your next career move below.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="flex flex-col items-center gap-6 pt-8">
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gray-200" />
                            <Link href="/my-applications" className="inline-flex items-center gap-2 bg-black text-[#FDF22F] px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-gray-900 transition-all hover:-translate-y-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Already Applied? Track Your Application →
                            </Link>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gray-200" />
                        </div>
                    </motion.div>
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Explore Jobs</span>
                    <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1 h-6 bg-gradient-to-b from-gray-200 to-transparent rounded-full" />
                </motion.div>
            </header>

            {/* Job List */}
            <main className="max-w-[1200px] mx-auto py-24 px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#000000]/20">Open Positions ({jobs.length})</span>
                    </div>
                    <p className="text-gray-400 font-medium text-sm max-w-xs text-right hidden md:block">Filter by department or location to find your perfect match in our innovation hub.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-32">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-[#FDF22F] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(253,242,47,0.5)]" />
                        </div>
                        <p className="text-gray-400 text-sm font-black uppercase tracking-widest animate-pulse">Scanning the Hub...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job, idx) => (
                            <motion.div key={job.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.6 }} className="group relative p-8 bg-white rounded-[40px] border border-gray-100 transition-all duration-500 hover:border-[#FDF22F]/50 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col justify-between overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF22F]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -mr-16 -mt-16" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-full bg-[#FDF22F] flex flex-col items-center justify-center shadow-lg shadow-[#FDF22F]/30 border border-black/5 shrink-0 transition-transform duration-500 group-hover:scale-110">
                                            <span className="text-[7px] font-black text-black/40 uppercase tracking-[0.2em] leading-none mb-0.5">REQ</span>
                                            <span className="text-[16px] font-black text-black leading-none tracking-tighter">{job.id}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">{job.type || "full-time"}</span>
                                            <span className="bg-gray-50 text-[9px] font-black text-gray-500 px-3 py-1.5 rounded-full border border-gray-100 uppercase tracking-widest shadow-sm">{job.department || "General"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-[#000000] tracking-tight group-hover:text-[#FDF22F] transition-colors duration-300">{job.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100/50">
                                                <span className="text-red-400 text-sm">📍</span>
                                                <span className="text-[11px] font-bold text-gray-500">{job.location}</span>
                                            </div>
                                            {job.tenant?.name && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100/50">
                                                    <span className="w-1.5 h-1.5 bg-[#FDF22F] rounded-full shadow-[0_0_8px_rgba(253,242,47,0.8)]" />
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">{job.tenant.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-[#FDF22F]/20 transition-all duration-300">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Published</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                <span className="text-[11px] font-bold text-gray-700">{(() => { const published = job.published_at || job.created_at; if (!published) return 'Recently'; const pDate = new Date(published); const now = new Date(); const d1 = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate()); const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)); if (diffDays <= 0) return 'Today'; if (diffDays === 1) return 'Yesterday'; return `${diffDays}d ago`; })()}</span>
                                            </div>
                                        </div>
                                        <div className="bg-black p-3 rounded-2xl border border-black group-hover:bg-[#FDF22F] group-hover:border-[#FDF22F] transition-all duration-300">
                                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5 group-hover:text-black/40">Deadline</p>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-3.5 h-3.5 text-[#FDF22F] group-hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <span className="text-[11px] font-black text-[#FDF22F] group-hover:text-black whitespace-nowrap">{(() => { if (!job.deadline) return 'Open'; const dDate = new Date(job.deadline); const now = new Date(); const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const d2 = new Date(dDate.getFullYear(), dDate.getMonth(), dDate.getDate()); const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)); if (diffDays < 0) return 'Closed'; if (diffDays === 0) return 'Today'; return `${diffDays}d left`; })()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleApplyClick(job)} className="relative w-full py-4 mt-8 rounded-[20px] bg-black text-[#FDF22F] font-black text-[12px] uppercase tracking-[0.1em] overflow-hidden group/btn transition-all duration-300 hover:shadow-xl hover:shadow-[#FDF22F]/20 active:scale-[0.98]">
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Apply for position
                                        <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Application Modal ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {isApplying && selectedJob && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        {/* Backdrop — pointer-events-none so it never blocks clicks. Use X button to close. */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md pointer-events-none"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative z-[220] flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex justify-between items-center bg-[#F5F6FA] shrink-0">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        {selectedJob.tenant?.name || 'Droga Pharma'}
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        {appStep === 0 ? 'Review Opportunity' : appStep >= 3 ? 'Application Complete' : 'Application Process'}
                                    </p>
                                    <h2 className="text-xl font-black text-[#000000]">{selectedJob.title}</h2>
                                </div>
                                {/* X button — always visible but changes behaviour on success steps */}
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8">

                                {/* ── STEP 0: Job Description ── */}
                                {appStep === 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                        <section className="bg-gray-50/50 rounded-[32px] p-10 border border-gray-100 shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                                <svg className="w-40 h-40 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                                            </div>
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                <span className="w-8 h-px bg-gray-200" />Detailed Job Description content<span className="w-8 h-px bg-gray-200" />
                                            </h3>
                                            {selectedJob.description ? (
                                                <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-headings:font-black prose-strong:font-black prose-p:mb-4" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                                            ) : (
                                                <div className="py-20 text-center"><p className="text-gray-400 italic">No detailed description provided for this role.</p></div>
                                            )}
                                        </section>
                                        <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-2 border-t border-gray-50 mt-10">
                                            <button onClick={() => setAppStep(1)} className="w-full py-5 bg-black text-[#FDF22F] rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-1">
                                                Apply for this position
                                            </button>
                                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">Estimated time: 3 Minutes</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── STEP 1: Identity ── */}
                                {appStep === 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-black text-[#000000]">Identity Check</h3>
                                            <p className="text-gray-500 font-medium">Please verify your identity to continue with the application.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <button onClick={() => handleSSO('Google')} className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/10 transition-all font-bold text-[#000000]">
                                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" />
                                                Continue with Google
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest bg-white px-4 text-gray-300">Or use email</div>
                                        </div>
                                        <form onSubmit={handleIdentitySubmit} className="space-y-4">
                                            <input type="email" required placeholder="Enter your email address" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all font-bold text-gray-600" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                            <button type="submit" className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-[0.98]">Next Step</button>
                                        </form>
                                    </motion.div>
                                )}

                                {/* ── STEP 2: Resume & Profile ── */}
                                {appStep === 2 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <section className="bg-[#000000]/5 rounded-3xl p-8 border border-[#000000]/10 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-[11px] font-black text-[#000000] uppercase tracking-widest">Resume Parsing</h3>
                                                {resume && <span className="text-[10px] font-black text-[#000000] bg-white px-2 py-1 rounded-full shadow-sm">AI Active ⚡</span>}
                                            </div>
                                            <label className="block p-10 border-2 border-dashed border-[#000000]/30 rounded-2xl text-center cursor-pointer hover:bg-white transition-all group">
                                                <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
                                                <div className="space-y-2">
                                                    <div className="w-12 h-12 bg-[#000000]/10 rounded-full flex items-center justify-center mx-auto text-[#000000] group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                    </div>
                                                    <p className="text-sm font-bold text-[#000000]">{resume ? resume.name : 'Upload Resume (PDF)'}</p>
                                                    <p className="text-xs text-gray-500">Auto-fill your details instantly</p>
                                                </div>
                                            </label>
                                        </section>
                                        <section className="space-y-6">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Profile Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Photo Upload</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                                            {photo ? <img src={URL.createObjectURL(photo)} alt="Profile" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                                                        </div>
                                                        <label className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold text-[#000000] cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                                                            {photo ? 'Change Photo' : 'Upload Photo'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name</label><input type="text" placeholder="e.g. John Doe" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email Address</label><input type="email" placeholder="e.g. john@example.com" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone Number</label><input type="tel" placeholder="e.g. +251 9..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Age</label><input type="number" placeholder="e.g. 25" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Portfolio Link</label><input type="url" placeholder="https://..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.portfolio_link} onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })} /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Gender</label><select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm appearance-none transition-all" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Professional Background</label><textarea rows={3} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" placeholder="Summarize your professional experience..." value={formData.professional_background} onChange={(e) => setFormData({ ...formData, professional_background: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Years of Experience</label><input type="number" placeholder="e.g. 5" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })} /></div>
                                            </div>
                                        </section>
                                        <section className="space-y-4">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Additional Attachments</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {attachments.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <span className="text-xs font-bold text-[#000000]">{f.name}</span>
                                                        <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                    </div>
                                                ))}
                                                <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Add Files (Cover Letter, Certificates...)</span>
                                                </label>
                                            </div>
                                        </section>
                                        <button onClick={handleSubmitApplication} disabled={submitting || !resume || !formData.name} className="w-full py-5 bg-[#FDF22F] text-black rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-[#FDF22F]/20 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50">
                                            {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                                        </button>
                                    </motion.div>
                                )}

                                {/* ── STEP 3: Success + Create Account ── */}
                                {appStep === 3 && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-20 h-20 bg-[#FDF22F] rounded-full flex items-center justify-center mx-auto text-black shadow-lg shadow-[#FDF22F]/30">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <h3 className="text-2xl font-black text-[#000000] tracking-tight">Application Submitted! 🎉</h3>
                                            <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto text-sm">
                                                Your application for <span className="text-black font-black">{selectedJob.title}</span> has been received.
                                                A confirmation email has been sent to <span className="text-black font-black">{formData.email}</span>.
                                            </p>
                                        </div>
                                        <div className="bg-black rounded-3xl p-8 space-y-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-[#FDF22F] rounded-xl flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm">Secure Your Application Portal</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">Using: {formData.email}</p>
                                                </div>
                                            </div>
                                            {registerError && <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-bold">{registerError}</div>}
                                            <input type="password" placeholder="Create a password (min. 6 chars)" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-[#FDF22F] font-bold text-sm placeholder:text-gray-600 transition-all" />
                                            <input type="password" placeholder="Confirm password" value={registerConfirm} onChange={e => setRegisterConfirm(e.target.value)} className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-[#FDF22F] font-bold text-sm placeholder:text-gray-600 transition-all" />
                                            <button onClick={handleRegisterAccount} disabled={registerLoading || !registerPassword || !registerConfirm} className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50">
                                                {registerLoading ? 'Creating account...' : 'Create Account & Track Status →'}
                                            </button>
                                        </div>
                                        <button onClick={handleCloseModal} className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                            Skip for now — Return to Careers
                                        </button>
                                    </motion.div>
                                )}

                                {/* ── STEP 4: All Done ── */}
                                {appStep === 4 && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 text-center space-y-6">
                                        <div className="w-24 h-24 bg-[#FDF22F] rounded-full flex items-center justify-center mx-auto text-black shadow-lg shadow-[#FDF22F]/30 text-4xl">🎉</div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-[#000000] tracking-tight">You&apos;re all set!</h3>
                                            <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">Your account has been created. Track your application status anytime from your personal dashboard.</p>
                                        </div>
                                        <a href="/my-applications" className="inline-flex items-center gap-2 px-10 py-5 bg-black text-[#FDF22F] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Go to My Applications
                                        </a>
                                        <button onClick={handleCloseModal} className="block mx-auto text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">Return to Job Listings</button>
                                    </motion.div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Google Simulation Modal */}
            <AnimatePresence>
                {isGoogleSimulating && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGoogleSimulating(false)} className="fixed inset-0 bg-white/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-[310] p-10 space-y-8">
                            <div className="text-center space-y-4">
                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-12 h-12 mx-auto" />
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#000000]">Sign in with Google</h3>
                                    <p className="text-xs text-gray-500 font-medium tracking-tight">to continue to {selectedJob?.tenant?.name || 'Hiring Hub'}</p>
                                </div>
                            </div>
                            <form onSubmit={handleMockAccountSelect} className="space-y-6">
                                <div className="space-y-2">
                                    <input autoFocus type="email" required placeholder="Email or phone" className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium text-sm transition-all" value={simulatedEmail} onChange={(e) => setSimulatedEmail(e.target.value)} />
                                    <p className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">Forgot email?</p>
                                </div>
                                <div className="text-[13px] text-gray-500 leading-relaxed font-medium">To continue, Google will share your name, email address, language preference, and profile picture with Droga.</div>
                                <div className="flex justify-between items-center pt-4">
                                    <button type="button" onClick={() => setIsGoogleSimulating(false)} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">Create account</button>
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">Next</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}

export default function CareersPage() {
    return (
        <Suspense fallback={<div>Loading Careers...</div>}>
            <CareersContent />
        </Suspense>
    );
}
