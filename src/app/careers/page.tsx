"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, Suspense } from "react";
import { apiFetch, API_URL } from "@/lib/api";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobBoard from "@/components/JobBoard";
import { 
    MapPin, 
    Briefcase, 
    Heart, 
    ShieldCheck, 
    Target, 
    Star, 
    Hospital, 
    TrendingUp, 
    Microscope, 
    Globe, 
    Users, 
    Award,
    Calendar,
    Clock
} from "lucide-react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "950822984178-eqhgqdmrqamg3p7oh1cqif5anih68j17.apps.googleusercontent.com";

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

interface HeroStats {
    title: string;
    value: string;
    icon: string;
}

interface MockStats {
    members: string;
    cta_text: string;
    rating?: string;
    cta_badge?: string;
}

interface SiteSettings {
    site_hero_stats?: string | HeroStats;
    site_hero_mock_stats?: string | MockStats;
    site_team_diversity?: string | { label: string; value: number }[];
    site_culture_text?: string | { heading: string; bullets: { heading?: string; text: string; detail?: string }[] };
    site_job_departments?: string | string[];
}

const values = [
    { icon: <Heart className="w-6 h-6 text-[#FDF22F]" />, title: "Humanity", desc: "In every step of our service, we give special attention to quality products used in the diagnosis and treatment of human life." },
    { icon: <ShieldCheck className="w-6 h-6 text-[#FDF22F]" />, title: "Integrity", desc: "We keep our promise to protect the health of the people — honest to ourselves, our customers, and our society." },
    { icon: <Target className="w-6 h-6 text-[#FDF22F]" />, title: "Commitment", desc: "Committed to achieving our targets through on-time delivery of service and products that protect people's health." },
    { icon: <Star className="w-6 h-6 text-[#FDF22F]" />, title: "Customer Centric", desc: "Our success as a team is achieved in the fulfillment of customer demand. We respect every human being." },
];

const groupCompanies = [
    { name: "Droga Pharma PLC", focus: "Pharmaceuticals Import & Wholesale", url: "https://drogapharma.com" },
    { name: "Droga Pharmacy", focus: "Retail Pharmacy Chain", url: "https://drogapharmacy.com" },
    { name: "Droga Physiotherapy", focus: "Speciality Rehabilitation Center", url: "https://www.drogaphysiotherapy.com" },
    { name: "Trust Pharma Manufacturing", focus: "Pharmaceutical Manufacturing", url: "https://www.trustethiopharma.com" },
    { name: "EMA Con. & Trading", focus: "Construction & Trading", url: "https://www.emaethiopia.com" },
    { name: "Droga Consulting", focus: "Business Consulting Services", url: "https://drogaconsulting.com" },
];

function CareersContent() {
    const searchParams = useSearchParams();
    const applyId = searchParams.get("apply");
    const router = useRouter();

    const [settings, setSettings] = useState<SiteSettings>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [heroStats, setHeroStats] = useState<HeroStats>({ title: "Training Hours", value: "1,200+", icon: "BookOpen" });
    const [mockStats, setMockStats] = useState<MockStats>({ rating: "9.8", members: "500+", cta_text: "Join 200+ team members", cta_badge: "+12" });
    const [teamDiversity, setTeamDiversity] = useState<{ label: string; value: number }[]>([]);
    const [cultureText, setCultureText] = useState<{ heading: string; bullets: { heading?: string; text: string; detail?: string }[] }>({
        heading: "Community & Clinical Excellence",
        bullets: [
            { heading: "Nationwide Care", text: "Ethiopia's largest private retail pharmacy network spanning 6 regions." },
            { heading: "Integrated MTM", text: "Specialized Medication Therapy Management for chronic healthcare needs." },
            { heading: "Humanitarian Focus", text: "Investing in community health awareness and preventive services." }
        ]
    });

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [appStep, setAppStep] = useState(0);
    const [isApplying, setIsApplying] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [formData, setFormData] = useState({ email: "", name: "", phone: "", age: "", gender: "", professional_background: "", years_of_experience: "", portfolio_link: "" });
    const [resume, setResume] = useState<File | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirm, setRegisterConfirm] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [registerLoading, setRegisterLoading] = useState(false);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleCloseModal = () => {
        setIsApplying(false); setAppStep(0);
        setFormData({ email: "", name: "", phone: "", age: "", gender: "", professional_background: "", years_of_experience: "", portfolio_link: "" });
        setResume(null); setPhoto(null); setAttachments([]);
        setRegisterPassword(""); setRegisterConfirm(""); setRegisterError(""); setSubmitting(false);
        setOtpSent(false); setOtpCode(["", "", "", "", "", ""]); setOtpError(""); setOtpVerified(false); setResendCooldown(0);
        router.replace("/careers", { scroll: false });
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await apiFetch("/v1/public/jobs");
                const jobList = Array.isArray(data) ? data : data?.data || [];
                if (applyId) {
                    const jobToApply = jobList.find((j: Job) => j.id.toString() === applyId);
                    if (jobToApply) { setSelectedJob(jobToApply); setIsApplying(true); setAppStep(0); }
                }
            } catch (err) { console.error("Failed to fetch public jobs", err); }
        };
        const fetchSettings = async () => {
            try {
                const data = await apiFetch('/v1/public/settings') as SiteSettings;
                setSettings(data);
                if (data?.site_hero_stats) setHeroStats(typeof data.site_hero_stats === 'string' ? JSON.parse(data.site_hero_stats) : data.site_hero_stats);
                if (data?.site_hero_mock_stats) setMockStats(typeof data.site_hero_mock_stats === 'string' ? JSON.parse(data.site_hero_mock_stats) : data.site_hero_mock_stats);
                if (data?.site_team_diversity) setTeamDiversity(typeof data.site_team_diversity === 'string' ? JSON.parse(data.site_team_diversity) : data.site_team_diversity);
                if (data?.site_culture_text) setCultureText(typeof data.site_culture_text === 'string' ? JSON.parse(data.site_culture_text) : data.site_culture_text as any);
            } catch (err) { console.error("Failed to fetch site settings", err); }
        };
        fetchJobs();
        fetchSettings();
    }, [applyId]);

    // URL param ?apply=ID triggers the modal via useEffect

    const handleSendOtp = async () => {
        if (!formData.email) return;
        setOtpLoading(true); setOtpError("");
        try {
            const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${base}/v1/public/send-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: formData.email }) });
            const data = await res.json();
            if (res.ok) { setOtpSent(true); setResendCooldown(60); setTimeout(() => otpRefs.current[0]?.focus(), 100); }
            else setOtpError(data.message || "Failed to send OTP.");
        } catch { setOtpError("Network error. Please try again."); }
        finally { setOtpLoading(false); }
    };

    const handleVerifyOtp = async () => {
        const code = otpCode.join("");
        if (code.length !== 6) { setOtpError("Please enter all 6 digits."); return; }
        setOtpLoading(true); setOtpError("");
        try {
            const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${base}/v1/public/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: formData.email, otp: code }) });
            const data = await res.json();
            if (res.ok) { setOtpVerified(true); setTimeout(() => setAppStep(2), 800); }
            else setOtpError(data.message || "Invalid or expired code.");
        } catch { setOtpError("Network error. Please try again."); }
        finally { setOtpLoading(false); }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otpCode]; next[index] = value.slice(-1); setOtpCode(next); setOtpError("");
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
        if (value && index === 5 && next.every((d) => d !== "")) setTimeout(handleVerifyOtp, 50);
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpCode[index] && index > 0) otpRefs.current[index - 1]?.focus();
    };

    const handleSSO = (provider: string) => {
        if (provider === "Google") {
            if (!GOOGLE_CLIENT_ID) { alert("Google Client ID is not configured."); return; }
            if (!(window as any).google) { alert("Google sign-in is still loading."); return; }
            
            console.log("[Google SSO] Initializing with Client ID:", GOOGLE_CLIENT_ID);
            console.log("[Google SSO] Current Origin:", window.location.origin);
            
            try {
                (window as any).google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    use_fedcm_for_prompt: true,
                    callback: (response: { credential: string }) => {
                        console.log("[Google SSO] Callback received response");
                        try {
                            const base64Url = response.credential.split(".")[1];
                            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                            const profile = JSON.parse(decodeURIComponent(atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
                            
                            console.log("[Google SSO] Profile decoded:", profile.email);
                            
                            if (!profile.email) {
                                alert("Could not retrieve email from Google.");
                                return;
                            }
                            setFormData((prev) => ({ 
                                ...prev, 
                                email: profile.email, 
                                name: profile.name || prev.name 
                            }));
                            setOtpVerified(true);
                            setAppStep(2);
                        } catch (err) {
                            console.error("[Google SSO] Error decoding credential:", err);
                            alert("Google login failed during profile decoding.");
                        }
                    },
                });

                (window as any).google.accounts.id.prompt((notification: any) => {
                    console.log("[Google SSO] Prompt notification:", notification.getMomentType());
                    if (notification.isNotDisplayed()) {
                        console.warn("[Google SSO] Prompt not displayed:", notification.getNotDisplayedReason());
                        // Fallback logic if needed, but FedCM usually handles this
                    }
                    if (notification.isSkippedMoment()) {
                        console.warn("[Google SSO] Prompt skipped:", notification.getSkippedReason());
                    }
                    if (notification.isDismissedMoment()) {
                        console.warn("[Google SSO] Prompt dismissed:", notification.getDismissedReason());
                    }
                });
            } catch (err) {
                console.error("[Google SSO] Initialization error:", err);
                alert("Failed to initialize Google Sign-In.");
            }
        }
    };

    const handleIdentitySubmit = (e: React.FormEvent) => { e.preventDefault(); handleSendOtp(); };

    const handleRegisterAccount = async () => {
        if (registerPassword !== registerConfirm) { setRegisterError("Passwords do not match."); return; }
        if (registerPassword.length < 6) { setRegisterError("Password must be at least 6 characters."); return; }
        setRegisterLoading(true); setRegisterError("");
        try {
            const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${base}/v1/applicant/register`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ email: formData.email, password: registerPassword, password_confirmation: registerConfirm }) });
            const data = await res.json();
            if (res.ok) { localStorage.setItem("applicant_token", data.token); setAppStep(4); }
            else setRegisterError(data.message || "Failed to create account.");
        } catch { setRegisterError("Network error. Please try again."); }
        finally { setRegisterLoading(false); }
    };

    const handleSubmitApplication = async () => {
        if (!selectedJob || !resume) return;
        setSubmitting(true);
        try {
            const body = new FormData();
            body.append("job_posting_id", selectedJob.id.toString());
            body.append("name", formData.name); body.append("email", formData.email); body.append("phone", formData.phone);
            body.append("age", formData.age); body.append("gender", formData.gender);
            body.append("professional_background", formData.professional_background);
            body.append("years_of_experience", formData.years_of_experience);
            body.append("portfolio_link", formData.portfolio_link);
            body.append("resume", resume);
            if (photo) body.append("photo", photo);
            attachments.forEach((f, i) => body.append(`attachments[${i}]`, f));
            const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
            const res = await fetch(`${base}/v1/apply`, { method: "POST", body });
            if (res.ok) setAppStep(3);
            else { const e = await res.json(); alert(`Submission failed: ${e.message || "Unknown error"}`); }
        } catch { alert("Application failed. Please check your connection."); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF8]">
            <Header />

            {/* ── HERO ── */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-[#FDF22F]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #000000 0%, transparent 50%), radial-gradient(circle at 80% 20%, #000000 0%, transparent 40%)" }} />
                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/10 border border-black/20 text-black text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                            Careers at Droga Group
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-[0.95] mb-6">
                            Build a Career<br /><span className="text-black/60">That Matters.</span>
                        </h1>
                        <p className="text-black/60 text-lg md:text-xl font-medium leading-relaxed max-w-xl mb-10">
                            {mockStats.cta_text} serving Ethiopia&apos;s healthcare needs. We build ethical companies that provide quality products and services to humanity.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => window.scrollTo({ top: document.getElementById('jobs')?.offsetTop || 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 bg-black text-[#FDF22F] px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl">
                                View Open Roles
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                            <Link href="/my-applications" className="inline-flex items-center gap-2 bg-black/5 border border-black/10 text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black/10 transition-all">
                                Track Application →
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center gap-x-12 gap-y-8 mt-16 pt-12 border-t border-black/10">
                        <div className="flex flex-col">
                            <p className="text-3xl font-black text-black">{mockStats.members}</p>
                            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Team Members</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-3xl font-black text-black">{heroStats.value}</p>
                            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">{heroStats.title}</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-3xl font-black text-black">{groupCompanies.length}</p>
                            <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Group Companies</p>
                        </div>
                        {teamDiversity.length > 0 && (
                            <div className="flex flex-col max-w-sm">
                                <p className="text-black/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Scale & Reach: Global Presence</p>
                                <div className="flex flex-wrap gap-2">
                                    {teamDiversity.map((item, idx) => (
                                        <div key={idx} className="px-2.5 py-1 rounded-lg bg-black/5 border border-black/10 text-black/70 text-[9px] font-black uppercase tracking-wider">{item.label}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ── MISSION & VALUES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FDF22F] bg-black px-3 py-1 rounded-full">Our Purpose</span>
                            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight mt-6 mb-6 leading-tight">Serving the People,<br />Building the Nation.</h2>
                            <p className="text-gray-500 leading-relaxed text-base mb-6">Established in April 2015, Droga Pharma PLC was founded by healthcare professionals with a mission to ensure sustainable supply of quality medicines and medical devices across Ethiopia.</p>
                            <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-gray-100">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Our Vision</p>
                                <p className="text-black font-bold leading-relaxed">&quot;To be the leading group company in Ethiopia that creates health and wealth for human being.&quot;</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {values.map((v, i) => (
                                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl border border-gray-100 hover:border-[#FDF22F] hover:shadow-lg transition-all group">
                                    <span className="text-2xl mb-3 block">{v.icon}</span>
                                    <h3 className="font-black text-black text-sm mb-2">{v.title}</h3>
                                    <p className="text-gray-400 text-xs leading-relaxed">{v.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── GROUP COMPANIES ── */}
            <section className="py-24 px-6 bg-[#FDF22F]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 bg-black/5 px-3 py-1 rounded-full">The Droga Group</span>
                        <h2 className="text-4xl font-black text-black tracking-tight mt-4">Six Companies. One Mission.</h2>
                        <p className="text-black/60 font-medium mt-4 max-w-xl mx-auto">Joining Droga means becoming part of an ecosystem built to serve Ethiopian healthcare at every level.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupCompanies.map((company, i) => (
                            <motion.a key={company.name} href={company.url} target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="group p-6 bg-black/5 border border-black/10 rounded-2xl hover:bg-black hover:border-black transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-2xl font-black text-black group-hover:text-[#FDF22F] leading-none">{String(i + 1).padStart(2, "0")}</span>
                                    <svg className="w-4 h-4 text-black/20 group-hover:text-[#FDF22F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </div>
                                <h3 className="font-black text-black group-hover:text-white text-sm mb-1 transition-colors">{company.name}</h3>
                                <p className="text-black/40 group-hover:text-white/60 text-xs transition-colors">{company.focus}</p>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY JOIN US ── */}
            <section className="py-24 px-6 bg-[#FAFAF8]">
                <div className="max-w-6xl mx-auto text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Why Droga</span>
                    <h2 className="text-4xl font-black text-black tracking-tight mt-4 mb-16">More Than a Job.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Hospital className="w-8 h-8 text-[#FDF22F]" />, title: "Real Impact", desc: "Your work directly improves healthcare access for millions of Ethiopians every day." },
                            { icon: <TrendingUp className="w-8 h-8 text-[#FDF22F]" />, title: "Growth", desc: "Work across 6 companies in pharma, manufacturing, consulting, retail, and more." },
                            { icon: <Microscope className="w-8 h-8 text-[#FDF22F]" />, title: "Innovation", desc: "We run annual research grants and invest in R&D to push healthcare forward." },
                            { icon: <Globe className="w-8 h-8 text-[#FDF22F]" />, title: "Scale", desc: "Ethiopia's largest private retail pharmacy network with an expanding regional presence — serving over 3.4 million customers with professional healthcare at scale." },
                            { icon: <Users className="w-8 h-8 text-[#FDF22F]" />, title: "Community", desc: "A diverse team of talented, dedicated professionals across Ethiopia's leading health group." },
                            { icon: <Award className="w-8 h-8 text-[#FDF22F]" />, title: "Recognition", desc: "Certified by ISO and recognized by Ethiopia's Ministry of Health for excellence." },
                        ].map((item, i) => (
                            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                className="p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-[#FDF22F]/40 transition-all text-left">
                                <span className="text-3xl mb-4 block">{item.icon}</span>
                                <h3 className="font-black text-black mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PROFESSIONAL EXCELLENCE & COMMUNITY ── */}
            <section className="py-24 px-6 bg-[#FDF22F]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Our Professional Mission</span>
                            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight mt-4 mb-8">
                                {cultureText.heading}
                            </h2>
                            <p className="text-black/70 text-lg font-medium leading-relaxed mb-8">
                                At Droga Pharmacies, we provide integrated Medication Therapy Management (MTM) following international best practices. Our mission is to deliver safe, high-quality patient care in an atmosphere of professionalism and innovation.
                            </p>
                            <div className="space-y-6">
                                {cultureText.bullets.map((point: { heading?: string; text: string; detail?: string }, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-[#FDF22F]" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-black">{point.heading || point.text}</h4>
                                            <p className="text-black/50 text-sm font-medium">{point.text || point.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-black rounded-[40px] p-12 text-center relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-[#FDF22F] mb-4">Innovation in Healthcare</h3>
                                <p className="text-white/60 text-sm font-medium mb-10 leading-relaxed">
                                    We leverage our extensive nationwide network to make professional pharmacy care the most accessible healthcare service in Ethiopia, improving the wellbeing of our society.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <button onClick={() => window.scrollTo({ top: document.getElementById('jobs')?.offsetTop || 0, behavior: 'smooth' })} className="bg-[#FDF22F] text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-2xl">
                                        Browse Career Opportunities →
                                    </button>
                                    <Link href="/my-applications" className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest transition-colors mt-2">
                                        Track My Application
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDF22F]/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-[#FDF22F]/20 transition-all duration-700" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FDF22F]/5 blur-[100px] -ml-32 -mb-32 group-hover:bg-[#FDF22F]/10 transition-all duration-700" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── JOB BOARD ── */}
            <JobBoard 
                settings={settings}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
            />

            <Footer />

            {/* ── APPLICATION MODAL — all functionality preserved ── */}
            <AnimatePresence>
                {isApplying && selectedJob && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-none" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative z-[220] flex flex-col max-h-[90vh]">
                            <div className="p-8 pb-4 flex justify-between items-center bg-[#F5F6FA] shrink-0">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        {selectedJob.tenant?.name || "Droga Pharma"}<span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        {appStep === 0 ? "Review Opportunity" : appStep >= 3 ? "Application Complete" : "Application Process"}
                                    </p>
                                    <h2 className="text-xl font-black text-black">{selectedJob.title}</h2>
                                </div>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 space-y-8">
                                {appStep === 0 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                        <section className="bg-gray-50/50 rounded-[32px] p-10 border border-gray-100">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-3"><span className="w-8 h-px bg-gray-200" />Job Description<span className="w-8 h-px bg-gray-200" /></h3>
                                            {selectedJob.description ? <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedJob.description }} /> : <div className="py-20 text-center"><p className="text-gray-400 italic">No detailed description provided.</p></div>}
                                        </section>
                                        <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-2 border-t border-gray-50">
                                            <button onClick={() => setAppStep(1)} className="w-full py-5 bg-black text-[#FDF22F] rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-1">Apply for this position</button>
                                            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">Estimated time: 3 Minutes</p>
                                        </div>
                                    </motion.div>
                                )}
                                {appStep === 1 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-black text-black">Identity Check</h3>
                                            <p className="text-gray-500 font-medium">Verify your identity to continue.</p>
                                        </div>
                                        <button onClick={() => handleSSO("Google")} className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/10 transition-all font-bold text-black">
                                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />Continue with Google
                                        </button>
                                        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div><div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest bg-white px-4 text-gray-300">Or use email</div></div>
                                        {!otpSent && (
                                            <form onSubmit={handleIdentitySubmit} className="space-y-4">
                                                <input type="email" required placeholder="Enter your email address" className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-[#FDF22F]/20 focus:border-[#FDF22F] transition-all font-bold text-gray-600" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                                {otpError && <p className="text-red-500 text-xs font-bold px-1">{otpError}</p>}
                                                <button type="submit" disabled={otpLoading} className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-60">{otpLoading ? "Sending code..." : "Send Verification Code"}</button>
                                            </form>
                                        )}
                                        {otpSent && !otpVerified && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg></div>
                                                    <div><p className="text-sm font-black text-gray-800">Code sent!</p><p className="text-xs text-gray-500 font-medium">Check <span className="font-black text-gray-700">{formData.email}</span></p></div>
                                                </div>
                                                <div className="flex justify-center gap-3">
                                                    {otpCode.map((digit, i) => (
                                                        <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                                                            onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                            className={`w-12 h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all ${digit ? "border-[#FDF22F] bg-[#FDF22F]/10 text-black" : "border-gray-200 bg-gray-50 text-gray-400"} focus:border-[#FDF22F] focus:ring-4 focus:ring-[#FDF22F]/20`} />
                                                    ))}
                                                </div>
                                                {otpError && <p className="text-center text-red-500 text-xs font-bold">{otpError}</p>}
                                                <button onClick={handleVerifyOtp} disabled={otpLoading || otpCode.join("").length !== 6} className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-60">{otpLoading ? "Verifying..." : "Verify & Continue"}</button>
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <button onClick={() => { setOtpSent(false); setOtpCode(["", "", "", "", "", ""]); setOtpError(""); }} className="text-gray-400 hover:text-gray-600">← Change email</button>
                                                    <button onClick={handleSendOtp} disabled={resendCooldown > 0 || otpLoading} className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed">{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}</button>
                                                </div>
                                            </motion.div>
                                        )}
                                        {otpVerified && (
                                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center justify-center gap-3 py-6">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>
                                                <p className="font-black text-gray-800">Email verified! Redirecting...</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                                {appStep === 2 && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                                            <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            <p className="text-xs font-black text-green-700">Identity verified — <span className="font-bold text-green-600">{formData.email}</span></p>
                                        </div>
                                        <section className="bg-black/5 rounded-3xl p-8 border border-black/10 space-y-4">
                                            <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Resume (PDF) <span className="text-red-500">*</span></h3>
                                            <label className="block p-10 border-2 border-dashed border-black/30 rounded-2xl text-center cursor-pointer hover:bg-white transition-all group">
                                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setResume(e.target.files?.[0] || null)} />
                                                <div className="space-y-2">
                                                    <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                                                    <p className="text-sm font-bold text-black">{resume ? resume.name : "Upload Resume (PDF)"}</p>
                                                </div>
                                            </label>
                                        </section>
                                        <section className="space-y-6">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Profile Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Photo</label>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                                            {photo ? <img src={URL.createObjectURL(photo)} alt="Profile" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                                                        </div>
                                                        <label className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors">
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />{photo ? "Change Photo" : "Upload Photo"}
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. John Doe" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email <span className="text-red-500">*</span></label><div className="relative"><input type="email" readOnly className="w-full px-5 py-4 bg-green-50 border border-green-200 rounded-xl font-bold text-gray-500 text-sm cursor-not-allowed" value={formData.email} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full">✓ Verified</span></div></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone <span className="text-red-500">*</span></label><input type="tel" placeholder="+251 9..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Age <span className="text-red-500">*</span></label><input type="number" placeholder="25" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Portfolio Link</label><input type="url" placeholder="https://..." className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" value={formData.portfolio_link} onChange={(e) => setFormData({ ...formData, portfolio_link: e.target.value })} /></div>
                                                <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Gender <span className="text-red-500">*</span></label><select className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm appearance-none transition-all" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}><option value="">Select</option><option>Male</option><option>Female</option></select></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Professional Background <span className="text-red-500">*</span></label><textarea rows={3} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" placeholder="Summarize your experience..." value={formData.professional_background} onChange={(e) => setFormData({ ...formData, professional_background: e.target.value })} /></div>
                                                <div className="col-span-2"><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Years of Experience <span className="text-red-500">*</span></label><input type="number" placeholder="5" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-4 focus:ring-[#FDF22F]/10 focus:border-[#FDF22F] font-bold text-black text-sm transition-all" value={formData.years_of_experience} onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })} /></div>
                                            </div>
                                        </section>
                                        <section className="space-y-4">
                                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Additional Attachments</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {attachments.map((f, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"><span className="text-xs font-bold text-black">{f.name}</span><button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>))}
                                                <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Add Files (Cover Letter, Certificates...)</span>
                                                </label>
                                            </div>
                                        </section>
                                        <button onClick={handleSubmitApplication} disabled={submitting || !resume || !formData.name} className="w-full py-5 bg-[#FDF22F] text-black rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50">{submitting ? "Submitting Application..." : "Confirm & Apply"}</button>
                                    </motion.div>
                                )}
                                {appStep === 3 && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-20 h-20 bg-[#FDF22F] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#FDF22F]/30"><svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>
                                            <h3 className="text-2xl font-black text-black">Application Submitted! 🎉</h3>
                                            <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto">Your application for <span className="font-black text-black">{selectedJob.title}</span> was received. Confirmation sent to <span className="font-black text-black">{formData.email}</span>.</p>
                                        </div>
                                        <div className="bg-black rounded-3xl p-8 space-y-4">
                                            <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 bg-[#FDF22F] rounded-xl flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div><div><p className="font-black text-white text-sm">Secure Your Application Portal</p><p className="text-[10px] text-gray-400 font-bold">Using: {formData.email}</p></div></div>
                                            {registerError && <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-bold">{registerError}</div>}
                                            <input type="password" placeholder="Create a password (min. 6 chars)" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-[#FDF22F] font-bold text-sm placeholder:text-gray-600 transition-all" />
                                            <input type="password" placeholder="Confirm password" value={registerConfirm} onChange={(e) => setRegisterConfirm(e.target.value)} className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-[#FDF22F] font-bold text-sm placeholder:text-gray-600 transition-all" />
                                            <button onClick={handleRegisterAccount} disabled={registerLoading || !registerPassword || !registerConfirm} className="w-full py-4 bg-[#FDF22F] text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50">{registerLoading ? "Creating account..." : "Create Account & Track Status →"}</button>
                                        </div>
                                        <button onClick={handleCloseModal} className="w-full text-center text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">Skip for now — Return to Careers</button>
                                    </motion.div>
                                )}
                                {appStep === 4 && (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 text-center space-y-6">
                                        <div className="w-24 h-24 bg-[#FDF22F] rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg">🎉</div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-black">You&apos;re all set!</h3>
                                            <p className="text-gray-500 font-medium max-w-sm mx-auto">Your account has been created. Track your application status anytime.</p>
                                        </div>
                                        <a href="/my-applications" className="inline-flex items-center gap-2 px-10 py-5 bg-black text-[#FDF22F] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-[#FDF22F] hover:text-black transition-all transform hover:-translate-y-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            Go to My Applications
                                        </a>
                                        <button onClick={handleCloseModal} className="block mx-auto text-[11px] font-bold text-gray-400 hover:text-gray-600">Return to Careers</button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function CareersPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FDF22F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}>
            <CareersContent />
        </Suspense>
    );
}
