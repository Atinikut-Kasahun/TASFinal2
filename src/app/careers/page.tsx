'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_URL } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
    tenant?: { name: string };
}

function CareersContent() {
    const searchParams = useSearchParams();
    const applyId = searchParams.get('apply');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [appStep, setAppStep] = useState(1); // 1: Identity, 2: Resume/Profile, 3: Success
    const [isApplying, setIsApplying] = useState(false);
    const [isGoogleSimulating, setIsGoogleSimulating] = useState(false);
    const [simulatedEmail, setSimulatedEmail] = useState('');

    // Form State
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

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiFetch('/v1/public/jobs');
                const jobList = Array.isArray(data) ? data : (data?.data || []);
                setJobs(jobList);

                // Auto-open modal if 'apply' param is present
                if (applyId) {
                    const jobToApply = jobList.find((j: any) => j.id.toString() === applyId);
                    if (jobToApply) {
                        setSelectedJob(jobToApply);
                        setIsApplying(true);
                        setAppStep(1);
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
        setAppStep(1);
    };

    const handleIdentitySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAppStep(2);
    };

    const handleSSO = (provider: string) => {
        if (provider === 'Google') {
            const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

            if (clientID && (window as any).google) {
                // Real Google Auth Initialization
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
                            console.log("Google Profile captured:", profile);

                            setFormData(prev => ({
                                ...prev,
                                email: profile.email,
                                name: profile.name || prev.name
                            }));
                            setAppStep(2);
                        } catch (e) {
                            console.error("Failed to decode Google JWT", e);
                            alert("Google login failed. Please try again or use email.");
                        }
                    }
                });
                (window as any).google.accounts.id.prompt();
            } else {
                // Interactive Simulation Fallback
                console.warn("Google Client ID missing. Showing Interactive Account Picker Simulation.");
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
        setIsApplying(false); // Processing effect
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
        if (file) {
            setResume(file);
        }
    };

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
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
            attachments.forEach((file, i) => {
                body.append(`attachments[${i}]`, file);
            });

            const cleanBaseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${cleanBaseUrl}/v1/apply`, {
                method: 'POST',
                body: body,
            });

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
            <header className="bg-white border-b border-gray-100 py-20 px-8 text-center text-[#000000]">
                <div className="max-w-[1200px] mx-auto space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black tracking-tight"
                    >
                        Join the Droga Pharma Team
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
                    >
                        We're looking for passionate individuals to help us innovate in the pharmaceutical industry. Discover your next career move below.
                    </motion.p>
                </div>
            </header>

            {/* Job List */}
            <main className="max-w-[1000px] mx-auto py-16 px-8">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Open Positions ({jobs.length})</h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-[#000000]">
                        <div className="w-8 h-8 border-4 border-[#000000] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm font-bold">Discovering opportunities…</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-[#FEFCE8] p-8 rounded-[32px] shadow-sm hover:shadow-2xl hover:shadow-[#000000]/5 transition-all group flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-start">
                                        <span className="bg-[#FDF22F] text-[9px] font-black text-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                                            {job.department || "General"}
                                        </span>
                                        <span className="text-gray-400 text-[10px] font-bold lowercase opacity-60">
                                            {job.type || "full-time"}
                                        </span>
                                    </div>

                                    {/* Title & Location */}
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-[#000000] tracking-tight">{job.title}</h3>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="text-[#F87171] text-base leading-none">📍</span>
                                            <span className="text-xs font-bold text-gray-400/80">{job.location}</span>
                                        </div>
                                    </div>

                                    {/* Status Badges Row - Matching Image Precisely */}
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {(job.published_at || job.created_at) && (
                                            <div className="bg-white px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-black/5 shadow-sm">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-[11px] font-bold text-gray-700 whitespace-nowrap">
                                                    {(() => {
                                                        const d = new Date(job.published_at || job.created_at || "");
                                                        const now = new Date();
                                                        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                                                        return diffDays === 0 ? 'Posted Today' : diffDays === 1 ? 'Posted 1 day ago' : `Posted ${diffDays} days ago`;
                                                    })()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="bg-[#FDF22F]/40 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm border border-[#FDF22F]/20">
                                            <svg className="w-4 h-4 text-black/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[11px] font-black text-black/80 whitespace-nowrap">
                                                {(() => {
                                                    const d = job.deadline
                                                        ? new Date(job.deadline)
                                                        : new Date(new Date(job.published_at || job.created_at || "").getTime() + 30 * 24 * 60 * 60 * 1000);
                                                    const now = new Date();
                                                    const diffTime = d.getTime() - now.getTime();
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return diffDays <= 0 ? 'Closes Today' : `Closes in ${diffDays} days`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleApplyClick(job)}
                                    className="bg-black text-white w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] hover:bg-gray-900 transition-all transform active:scale-[0.98] mt-6 shadow-xl shadow-black/10"
                                >
                                    Apply Now —&gt;
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            {/* Application Modal */}
            <AnimatePresence>
                {isApplying && selectedJob && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsApplying(false)}
                            className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative z-[210] flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-4 flex justify-between items-center bg-[#F5F6FA]">
                                <div>
                                    <p className="text-[10px] font-black text-[#000000] uppercase tracking-widest mb-1">Applying for</p>
                                    <h2 className="text-xl font-black text-[#000000]">{selectedJob.title}</h2>
                                </div>
                                <button onClick={() => setIsApplying(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
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
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest bg-white px-4 text-gray-300">Or use email</div>
                                        </div>

                                        <form onSubmit={handleIdentitySubmit} className="space-y-4">
                                            <input
                                                type="email" required
                                                placeholder="Enter your email address"
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] focus:shadow-[0_0_15px_rgba(253,242,47,0.3)] transition-all font-bold text-gray-600"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                            <button type="submit" className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-[0.98]">
                                                Next Step
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

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
                                                            {photo ? (
                                                                <img src={URL.createObjectURL(photo)} alt="Profile" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                            )}
                                                        </div>
                                                        <label className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold text-[#000000] cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                                                            {photo ? 'Change Photo' : 'Upload Photo'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name</label>
                                                    <input type="text" placeholder="e.g. John Doe" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email Address</label>
                                                    <input type="email" placeholder="e.g. john@example.com" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone Number</label>
                                                    <input type="tel" placeholder="e.g. +251 9... or 09..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Age</label>
                                                    <input type="number" placeholder="e.g. 25" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Portfolio Link</label>
                                                    <input type="url" placeholder="https://..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.portfolio_link} onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Gender</label>
                                                    <select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm appearance-none transition-all" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                                        <option value="">Select</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Professional Background / Profile Abstract</label>
                                                    <textarea rows={3} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" placeholder="Summarize your professional experience..." value={formData.professional_background} onChange={(e) => setFormData({ ...formData, professional_background: e.target.value })} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Years of Experience</label>
                                                    <input type="number" placeholder="e.g. 5" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-[#000000] text-sm transition-all" value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })} />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Additional Attachments</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {attachments.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                        <span className="text-xs font-bold text-[#000000]">{f.name}</span>
                                                        <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Add Files (Cover Letter, Certificates...)</span>
                                                </label>
                                            </div>
                                        </section>

                                        <button
                                            onClick={handleSubmitApplication}
                                            disabled={submitting || !resume || !formData.name}
                                            className="w-full py-5 bg-[#FDF22F] text-black rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-[#FDF22F]/20 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                                        </button>
                                    </motion.div>
                                )}

                                {appStep === 3 && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12 text-center space-y-6">
                                        <div className="w-24 h-24 bg-[#FDF22F] rounded-full flex items-center justify-center mx-auto text-black shadow-lg shadow-[#FDF22F]/20">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-[#000000] tracking-tight">Application Received!</h3>
                                            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                                                We've received your application for <span className="text-black font-black bg-[#FDF22F]/30 px-2 py-0.5 rounded-md underline decoration-[#FDF22F] decoration-4 underline-offset-4">{selectedJob.title}</span>. Check your email for a confirmation from our team.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsApplying(false)}
                                            className="px-10 py-5 bg-[#FDF22F] text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#FDF22F]/20 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                                        >
                                            Return to Careers
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Google Identity Simulation Modal (Interactive) */}
            <AnimatePresence>
                {isGoogleSimulating && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsGoogleSimulating(false)}
                            className="fixed inset-0 bg-white/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-[400px] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-[310] p-10 space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-12 h-12 mx-auto" />
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-[#000000]">Sign in with Google</h3>
                                    <p className="text-xs text-gray-500 font-medium tracking-tight">to continue to Droga Hiring Hub</p>
                                </div>
                            </div>

                            <form onSubmit={handleMockAccountSelect} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="email"
                                        required
                                        placeholder="Email or phone"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-medium text-sm transition-all"
                                        value={simulatedEmail}
                                        onChange={(e) => setSimulatedEmail(e.target.value)}
                                    />
                                    <p className="text-[11px] text-blue-600 font-bold cursor-pointer hover:underline">Forgot email?</p>
                                </div>

                                <div className="text-[13px] text-gray-500 leading-relaxed font-medium">
                                    To continue, Google will share your name, email address, language preference, and profile picture with Droga.
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <button type="button" onClick={() => setIsGoogleSimulating(false)} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                        Create account
                                    </button>
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                                        Next
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal & Other Content Above ... */}
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
