'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch, API_URL, apiFetchBlob } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    name: string;
    email?: string;
    roles?: any[];
    tenant?: {
        name: string;
    };
}

export default function Navbar({ user, onLogout }: { user: User; onLogout: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTabParam = searchParams.get('tab') || 'Jobs';

    const roleSlug = (() => {
        const roles = user.roles;
        if (!roles || roles.length === 0) return 'ta_manager';
        const first = roles[0];
        return (typeof first === 'string' ? first : first?.slug || first?.name || 'ta_manager').toLowerCase();
    })();

    const navItems = (() => {
        switch (roleSlug) {
            case 'hiring_manager':
                return [
                    { label: 'JOBS', href: '/dashboard?tab=Jobs' },
                    { label: 'HIRING PLAN', href: '/dashboard?tab=HiringPlan' },
                ];
            case 'admin':
                return [
                    { label: 'COMMAND CENTER', href: '/admin/dashboard' },
                    { label: 'CONTENT', href: '/admin/contents' },
                    { label: 'JOBS (ALL)', href: '/dashboard?tab=Jobs' },
                    { label: 'HIRING PLAN', href: '/dashboard?tab=HiringPlan' },
                ];
            case 'hr_manager':
                return [
                    { label: 'JOBS', href: '/dashboard?tab=Jobs' },
                    { label: 'HIRING PLAN', href: '/dashboard?tab=HiringPlan' },
                    { label: 'REPORTS', href: '/dashboard?tab=Reports' },
                ];
            case 'managing_director':
                return [
                    { label: 'HOME', href: '/dashboard?tab=Home' },
                    { label: 'JOBS', href: '/dashboard?tab=Jobs' },
                    { label: 'HIRING PLAN', href: '/dashboard?tab=HiringPlan' },
                    { label: 'REPORTS', href: '/dashboard?tab=Reports' },
                ];
            default:
                return [
                    { label: 'JOBS', href: '/dashboard?tab=Jobs' },
                    { label: 'CANDIDATES', href: '/dashboard?tab=Candidates' },
                    { label: 'EMPLOYEES', href: '/dashboard?tab=Employees' },
                    { label: 'HIRING PLAN', href: '/dashboard?tab=HiringPlan' },
                    { label: 'REPORTS', href: '/dashboard?tab=Reports' },
                ];
        }
    })();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasInterviewsToday, setHasInterviewsToday] = useState(false);
    const [showCalendarTooltip, setShowCalendarTooltip] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // Mobile nav drawer
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [passSuccess, setPassSuccess] = useState(false);
    const [passError, setPassError] = useState('');

    useEffect(() => {
        const checkInterviewsToday = async () => {
            if (roleSlug === 'ta_manager') return;
            try {
                const interviews = await apiFetch('/v1/interviews?status=scheduled');
                if (interviews && Array.isArray(interviews)) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const found = interviews.some((i: any) => i.scheduled_at && i.scheduled_at.startsWith(todayStr));
                    setHasInterviewsToday(found);
                }
            } catch (e) {
                console.error('Failed to check interviews', e);
            }
        };
        checkInterviewsToday();
    }, [roleSlug]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await apiFetch('/v1/notifications');
                if (data) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread_count || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };
        fetchNotifications();
    }, []);

    const pinnedCount = notifications.filter(n => n.is_pinned).length;

    const markAsRead = async (id: string) => {
        try {
            await apiFetch(`/v1/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiFetch('/v1/notifications/mark-all-read', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) {
            console.error(e);
        }
    };

    const [replyState, setReplyState] = useState<Record<string, { open: boolean; text: string; file: File | null; sending: boolean; sent: boolean }>>({});

    const toggleReply = (id: string) => {
        setReplyState(prev => ({
            ...prev,
            [id]: { open: !prev[id]?.open, text: prev[id]?.text || '', file: null, sending: false, sent: false }
        }));
    };

    const togglePin = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await apiFetch(`/v1/notifications/${id}/pin`, { method: 'POST' });
            if (res.success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_pinned: res.is_pinned } : n));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await apiFetch(`/v1/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id)?.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDownloadAttachment = (id: string, fileName: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) { console.error('No auth token found'); return; }
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api').replace(/\/+$/, '');
        const viewUrl = `${baseUrl}/v1/notifications/${id}/view?token=${encodeURIComponent(token)}`;
        window.open(viewUrl, '_blank');
    };

    const sendReply = async (notifId: string) => {
        const item = replyState[notifId];
        const text = item?.text?.trim();
        if (!text) return;
        setReplyState(prev => ({ ...prev, [notifId]: { ...prev[notifId], sending: true } }));
        try {
            const formData = new FormData();
            formData.append('message', text);
            if (item.file) formData.append('file', item.file);
            await apiFetch(`/v1/notifications/${notifId}/reply`, { method: 'POST', body: formData });
            setReplyState(prev => ({ ...prev, [notifId]: { open: false, text: '', file: null, sending: false, sent: true } }));
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
            setReplyState(prev => ({ ...prev, [notifId]: { ...prev[notifId], sending: false } }));
        }
    };

    const [users, setUsers] = useState<any[]>([]);
    const [showCompose, setShowCompose] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeMsg, setComposeMsg] = useState('');
    const [composeFile, setComposeFile] = useState<File | null>(null);
    const [composeSending, setComposeSending] = useState(false);
    const [composeSent, setComposeSent] = useState(false);

    useEffect(() => {
        apiFetch('/v1/users').then(data => setUsers(data || [])).catch(() => { });
    }, []);

    const sendDirect = async () => {
        if (!composeTo || !composeMsg.trim()) return;
        setComposeSending(true);
        setComposeSent(false);
        try {
            const formData = new FormData();
            formData.append('to_user_id', composeTo);
            formData.append('message', composeMsg);
            if (composeFile) formData.append('file', composeFile);
            await apiFetch('/v1/messages/send', { method: 'POST', body: formData });
            setComposeMsg(''); setComposeTo(''); setComposeFile(null);
            setComposeSent(true);
            setTimeout(() => { setComposeSent(false); setShowCompose(false); }, 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setComposeSending(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError(''); setPassSuccess(false);
        if (passForm.next !== passForm.confirm) { setPassError('New passwords do not match'); return; }
        setPassLoading(true);
        try {
            await apiFetch('/v1/account/change-password', {
                method: 'POST',
                body: JSON.stringify({ current_password: passForm.current, new_password: passForm.next, new_password_confirmation: passForm.confirm })
            });
            setPassSuccess(true);
            setPassForm({ current: '', next: '', confirm: '' });
            setTimeout(() => { setShowSettingsModal(false); setPassSuccess(false); }, 2000);
        } catch (err: any) {
            setPassError(err.message || 'Failed to change password');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <>
            <nav className="bg-[#FDF22F] h-14 md:h-16 px-3 sm:px-4 md:px-8 flex items-center justify-between shadow-lg sticky top-0 z-[100] border-b border-black/5">
                {/* Left: Logo + Nav Links */}
                <div className="flex items-center gap-3 md:gap-12 min-w-0">
                    {/* Logo */}
                    <Link href={roleSlug === 'admin' ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 group shrink-0">
                        <div className="bg-black text-[#FDF22F] w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-black/10">
                            {(roleSlug === 'admin' ? 'D' : user.tenant?.name?.charAt(0)) || 'D'}
                        </div>
                        <span className="text-black font-black text-lg md:text-xl tracking-tighter group-hover:text-black/70 transition-colors">
                            {(roleSlug === 'admin' ? 'DROGA' : user.tenant?.name) || 'DROGA'}
                        </span>
                    </Link>

                    {/* Nav Links — hidden on mobile, shown md+ */}
                    <div className="hidden md:flex gap-2 overflow-x-auto">
                        {navItems.map((item) => {
                            const tabValue = item.href.split('?tab=')[1];
                            const isActive = tabValue ? activeTabParam === tabValue : pathname === item.href;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`text-[11px] font-black tracking-widest transition-all px-3 lg:px-4 py-2 rounded-lg relative whitespace-nowrap ${isActive
                                        ? 'text-[#FDF22F] bg-black shadow-lg shadow-black/20'
                                        : 'text-black/60 hover:text-black hover:bg-black/5'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                    {/* Interview Calendar Icon */}
                    {(roleSlug === 'hiring_manager' || roleSlug === 'hr_manager') && (
                        <div className="relative group hidden sm:block">
                            <Link
                                href="/dashboard?tab=Calendar"
                                onMouseEnter={() => setShowCalendarTooltip(true)}
                                onMouseLeave={() => setShowCalendarTooltip(false)}
                                className={`relative transition-colors ${activeTabParam === 'Calendar' ? 'text-black' : 'text-black/40 hover:text-black'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {hasInterviewsToday && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#FDF22F] animate-pulse" />
                                )}
                            </Link>
                            <AnimatePresence>
                                {showCalendarTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded whitespace-nowrap z-[130]"
                                    >
                                        Interview Calendar
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Search icon */}
                    <div className="relative flex items-center">
                        <AnimatePresence>
                            {isSearchOpen && (
                                <motion.input
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 160, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                    type="text"
                                    value={searchQuery}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setIsSearchOpen(false); }}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchQuery(val);
                                        const url = new URL(window.location.href);
                                        if (val) url.searchParams.set('search', val);
                                        else url.searchParams.delete('search');
                                        window.history.replaceState({}, '', url);
                                    }}
                                    placeholder="Search..."
                                    className="absolute right-8 bg-black/5 text-black placeholder-black/30 text-[11px] font-black tracking-widest px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:border-black z-[110] w-40 sm:w-52"
                                    autoFocus
                                />
                            )}
                        </AnimatePresence>
                        <button
                            onClick={() => {
                                const opening = !isSearchOpen;
                                setIsSearchOpen(opening);
                                if (!opening) {
                                    setSearchQuery('');
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('search');
                                    window.history.replaceState({}, '', url);
                                }
                            }}
                            className={`transition-colors relative z-[120] ${isSearchOpen ? 'text-black' : 'text-black/40 hover:text-black'}`}
                        >
                            {isSearchOpen ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifs(!showNotifs)}
                            className={`relative transition-colors ${showNotifs ? 'text-black' : 'text-black/40 hover:text-black'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#FDF22F] shadow-lg shadow-red-500/20 z-10">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                            {pinnedCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute -bottom-1 -left-1 bg-[#FDF22F] text-[8px] font-black text-black px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center border-2 border-black shadow-lg shadow-black/20 z-10"
                                >
                                    <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5h14l-4 4v7l-3 3-3-3v-7L5 5z" /></svg>
                                    {pinnedCount}
                                </motion.span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifs && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-4 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[120]"
                                >
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black text-[#000000] tracking-widest uppercase">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="px-2 py-1.5 bg-[#FDF22F]/10 border border-[#FDF22F]/30 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#FDF22F] hover:shadow-lg hover:shadow-[#FDF22F]/20 transition-all flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                        All read
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setShowCompose(!showCompose); setComposeSent(false); }}
                                                    className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg transition-all ${showCompose ? 'bg-[#FDF22F] text-black shadow-lg shadow-[#FDF22F]/20' : 'bg-[#FDF22F] text-black hover:bg-black hover:text-white'}`}
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                    New
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showCompose && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-2 space-y-2">
                                                        <select
                                                            value={composeTo}
                                                            onChange={e => setComposeTo(e.target.value)}
                                                            className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F] font-medium"
                                                        >
                                                            <option value="" disabled>To: Select colleague...</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>
                                                        <textarea
                                                            value={composeMsg}
                                                            onChange={e => setComposeMsg(e.target.value)}
                                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDirect(); } }}
                                                            placeholder="Write your message... (Enter to send)"
                                                            rows={2}
                                                            className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <input type="file" id="compose-file" className="hidden" onChange={e => setComposeFile(e.target.files?.[0] || null)} />
                                                            <label htmlFor="compose-file" className={`flex-1 text-[9px] font-black uppercase tracking-widest px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${composeFile ? 'border-black bg-black text-[#FDF22F]' : 'border-gray-100 text-gray-400 hover:border-black hover:text-black'}`}>
                                                                {composeFile ? composeFile.name : '📎 Attach Document'}
                                                            </label>
                                                            {composeFile && (
                                                                <button onClick={() => setComposeFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            {composeSent && (
                                                                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                    Message sent!
                                                                </span>
                                                            )}
                                                            {!composeSent && <span />}
                                                            <button
                                                                onClick={sendDirect}
                                                                disabled={composeSending || !composeTo || !composeMsg.trim()}
                                                                className="px-4 py-1.5 bg-[#FDF22F] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-[#FDF22F]/10"
                                                            >
                                                                {composeSending
                                                                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    : <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> Send</>
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="max-h-72 md:max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 text-xs italic">No new notifications</div>
                                        ) : (
                                            notifications.map(notif => {
                                                const rs = replyState[notif.id];
                                                const canReply = !!(notif.data?.sender_id || notif.data?.applicant_id);
                                                return (
                                                    <div key={notif.id} className={`border-b border-gray-50 transition-colors relative group/item ${notif.read_at ? 'bg-white' : 'bg-red-50/50'}`}>
                                                        {!notif.read_at && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-full" />}
                                                        {notif.is_pinned && <div className="absolute right-1 top-0 w-2 h-2 bg-[#FDF22F] rounded-bl-full shadow-sm" />}
                                                        <div onClick={() => !notif.read_at && markAsRead(notif.id)} className="p-3 md:p-4 flex gap-3 cursor-pointer hover:bg-gray-50/60">
                                                            <div className="mt-0.5 text-base">
                                                                {notif.data.type === 'requisition_alert' ? '📝' : notif.data.type === 'candidate_mention' ? '💬' : notif.data.type === 'applicant_message' ? '📧' : notif.data.type === 'direct_reply' ? '↩️' : notif.data.type === 'interview_reminder' ? '⏰' : notif.data.type === 'system_status' ? '🔔' : '📌'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs leading-tight ${notif.read_at ? 'font-medium text-gray-700' : 'font-bold text-[#000000]'}`}>{notif.data.title}</p>
                                                                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{notif.data.message}</p>
                                                                {notif.data.attachment_path && (
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDownloadAttachment(notif.id, notif.data.attachment_name || 'Document'); }} className="mt-2 flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[9px] font-black uppercase tracking-tight text-gray-500 hover:bg-gray-100 hover:text-black transition-all">
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                        {notif.data.attachment_name || 'Download Attachment'}
                                                                    </button>
                                                                )}
                                                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5">
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                        Del
                                                                    </button>
                                                                    <button onClick={(e) => togglePin(notif.id, e)} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${notif.is_pinned ? 'text-[#FDF22F]' : 'text-gray-400 hover:text-[#FDF22F]'}`}>
                                                                        <svg className="w-2.5 h-2.5" fill={notif.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 5h14l-4 4v7l-3 3-3-3v-7L5 5z" /></svg>
                                                                        {notif.is_pinned ? 'Unpin' : 'Pin'}
                                                                    </button>
                                                                    {canReply && (
                                                                        <button onClick={(e) => { e.stopPropagation(); toggleReply(notif.id); }} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${rs?.open ? 'text-black' : 'text-gray-400 hover:text-[#FDF22F]'}`}>
                                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                                            {rs?.open ? 'Cancel' : 'Reply'}
                                                                        </button>
                                                                    )}
                                                                    {rs?.sent && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1"><svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>Sent</span>}
                                                                </div>
                                                            </div>
                                                            {!notif.read_at && <div className="w-2 h-2 rounded-full bg-[#FDF22F] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(253,242,47,0.5)]" />}
                                                        </div>
                                                        <AnimatePresence>
                                                            {rs?.open && (
                                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                                                    <div className="px-3 md:px-4 pb-4 bg-gray-50/70 border-t border-gray-100 flex flex-col gap-2 pt-3">
                                                                        <div className="flex gap-2">
                                                                            <textarea value={rs.text || ''} onChange={(e) => setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], text: e.target.value } }))} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(notif.id); } }} placeholder={`Reply to ${notif.data.sender_name || notif.data.applicant_name || 'sender'}...`} rows={2} className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]" onClick={(e) => e.stopPropagation()} />
                                                                            <button onClick={(e) => { e.stopPropagation(); sendReply(notif.id); }} disabled={rs.sending || !rs.text?.trim()} className="self-end px-3 py-2 bg-[#FDF22F] text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white disabled:opacity-50 transition-all shadow-md shadow-[#FDF22F]/10">
                                                                                {rs.sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '↩ Send'}
                                                                            </button>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input type="file" id={`reply-file-${notif.id}`} className="hidden" onChange={e => setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], file: e.target.files?.[0] || null } }))} />
                                                                            <label htmlFor={`reply-file-${notif.id}`} className={`flex-1 text-[8px] font-black uppercase tracking-widest px-2 py-1.5 border border-dashed rounded flex justify-between items-center transition-all ${rs.file ? 'border-black bg-black text-[#FDF22F]' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`} onClick={e => e.stopPropagation()}>
                                                                                <span>{rs.file ? rs.file.name : 'Add Document'}</span>
                                                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                                            </label>
                                                                            {rs.file && <button onClick={(e) => { e.stopPropagation(); setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], file: null } })); }} className="p-1 text-red-500 hover:bg-red-50 rounded"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>}
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {roleSlug !== 'managing_director' && (
                        <>
                            <div className="h-6 w-px bg-black/10 mx-1 hidden sm:block" />
                            {/* User Profile — hidden on mobile, shown sm+ */}
                            <div className="relative hidden sm:block">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className={`flex items-center gap-2 md:gap-3 px-2 py-1 rounded-xl transition-all ${showProfile ? 'bg-black/5' : 'hover:bg-black/5'}`}
                                >
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-[#FDF22F] shadow-lg shadow-black/10">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-[10px] font-black text-black leading-none uppercase tracking-tighter">{user.name}</p>
                                        <p className="text-[9px] font-bold text-black/40 mt-0.5 tracking-tight">{user.email || 'Admin Support'}</p>
                                    </div>
                                    <svg className={`w-3 h-3 text-black/40 transition-transform duration-200 hidden md:block ${showProfile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <>
                                            <div className="fixed inset-0 z-[105]" onClick={() => setShowProfile(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.1, ease: 'easeOut' }}
                                                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]"
                                            >
                                                <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#FDF22F] flex items-center justify-center text-[12px] font-black text-black border-2 border-white shadow-sm">
                                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-black truncate uppercase tracking-tight">{user.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 truncate">{user.email || 'staff@drogagroup.com'}</p>
                                                    </div>
                                                </div>
                                                <div className="py-1">
                                                    <button onClick={() => { setShowProfileModal(true); setShowProfile(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group">
                                                        <span className="text-[11px] font-bold text-gray-600 group-hover:text-black">Your profile</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    </button>
                                                    <button onClick={() => { setShowSettingsModal(true); setShowProfile(false); }} className="w-full px-4 py-2.5 flex items-center text-left hover:bg-gray-50 transition-colors group">
                                                        <span className="text-[11px] font-bold text-gray-600 group-hover:text-black">Settings</span>
                                                    </button>
                                                </div>
                                                <div className="h-px bg-gray-50" />
                                                <div className="py-1">
                                                    <button onClick={() => { setShowHelpModal(true); setShowProfile(false); }} className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group">
                                                        <span className="text-[11px] font-bold text-gray-600 group-hover:text-black">Need Help?</span>
                                                        <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                    </button>
                                                    <button onClick={onLogout} className="w-full px-4 py-2.5 flex items-center text-left hover:bg-red-50 transition-colors group">
                                                        <span className="text-[11px] font-bold text-gray-600 group-hover:text-red-600">Log out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}

                    {/* Mobile hamburger — only on small screens */}
                    <button
                        onClick={() => setMobileNavOpen(true)}
                        className="md:hidden w-8 h-8 flex items-center justify-center bg-black/5 rounded-lg"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile Nav Drawer */}
            <AnimatePresence>
                {mobileNavOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileNavOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150] md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-72 bg-[#FDF22F] z-[160] md:hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-black/10">
                                <div>
                                    <p className="font-black text-black text-lg tracking-tighter">{user.name}</p>
                                    <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest">{roleSlug.replace('_', ' ')}</p>
                                </div>
                                <button onClick={() => setMobileNavOpen(false)} className="w-9 h-9 bg-black/10 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                {navItems.map((item) => {
                                    const tabValue = item.href.split('?tab=')[1];
                                    const isActive = tabValue ? activeTabParam === tabValue : pathname === item.href;
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setMobileNavOpen(false)}
                                            className={`block text-sm font-black tracking-widest px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-black text-[#FDF22F]' : 'text-black/70 hover:bg-black/10'}`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                {(roleSlug === 'hiring_manager' || roleSlug === 'hr_manager') && (
                                    <Link href="/dashboard?tab=Calendar" onClick={() => setMobileNavOpen(false)} className={`block text-sm font-black tracking-widest px-4 py-3 rounded-xl transition-all ${activeTabParam === 'Calendar' ? 'bg-black text-[#FDF22F]' : 'text-black/70 hover:bg-black/10'}`}>
                                        CALENDAR {hasInterviewsToday && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" />}
                                    </Link>
                                )}
                            </div>

                            <div className="p-4 border-t border-black/10 space-y-2">
                                <button onClick={() => { setMobileNavOpen(false); setShowProfileModal(true); }} className="w-full text-left text-sm font-black text-black/70 hover:text-black px-4 py-2.5 rounded-xl hover:bg-black/10 transition-all">Your Profile</button>
                                <button onClick={() => { setMobileNavOpen(false); setShowSettingsModal(true); }} className="w-full text-left text-sm font-black text-black/70 hover:text-black px-4 py-2.5 rounded-xl hover:bg-black/10 transition-all">Settings</button>
                                <button onClick={() => { setMobileNavOpen(false); setShowHelpModal(true); }} className="w-full text-left text-sm font-black text-black/70 hover:text-black px-4 py-2.5 rounded-xl hover:bg-black/10 transition-all">Help & Support</button>
                                <button onClick={onLogout} className="w-full text-left text-sm font-black text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all">Log Out</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                            <div className="bg-[#FDF22F] h-28 md:h-32 relative">
                                <button onClick={() => setShowProfileModal(false)} className="absolute top-5 right-5 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <div className="absolute -bottom-12 left-6 md:left-8 w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-black flex items-center justify-center border-8 border-white shadow-xl">
                                    <span className="text-xl md:text-2xl font-black text-[#FDF22F]">{user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}</span>
                                </div>
                            </div>
                            <div className="pt-14 md:pt-16 pb-8 md:pb-10 px-6 md:px-8">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">{user.name}</h2>
                                    <p className="text-xs md:text-sm font-bold text-gray-400">STAFF MEMBER · {user.tenant?.name || 'Droga Group'}</p>
                                </div>
                                <div className="mt-6 md:mt-8 grid grid-cols-1 gap-5 md:gap-6">
                                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Email Address</p><p className="text-sm font-bold text-black">{user.email || 'staff@drogagroup.com'}</p></div>
                                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Account Role</p><div className="inline-flex px-3 py-1 bg-black text-[#FDF22F] text-[10px] font-black rounded-lg uppercase tracking-widest">{roleSlug.replace('_', ' ')}</div></div>
                                    <div className="space-y-1"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Organization</p><p className="text-sm font-bold text-black">{user.tenant?.name || 'N/A'}</p></div>
                                </div>
                                <button onClick={() => setShowProfileModal(false)} className="mt-8 md:mt-10 w-full py-3.5 md:py-4 bg-[#FDF22F] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-black hover:text-white transition-all shadow-xl shadow-[#FDF22F]/20">Close Profile</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettingsModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettingsModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                            <div className="px-6 md:px-8 pt-8 md:pt-10 pb-4 flex items-center justify-between border-b border-gray-50">
                                <div><h2 className="text-lg md:text-xl font-black text-black uppercase tracking-tight">Account Settings</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Security & Password</p></div>
                                <button onClick={() => setShowSettingsModal(false)} className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={handlePasswordChange} className="p-6 md:p-8 space-y-5 md:space-y-6">
                                {passError && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-wide">{passError}</motion.div>}
                                {passSuccess && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-bold uppercase tracking-wide flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>Password updated successfully!</motion.div>}
                                <div className="space-y-4">
                                    {[['Current Password', 'current'], ['New Password', 'next'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                                            <input type="password" required minLength={key === 'next' ? 8 : undefined} value={passForm[key as keyof typeof passForm]} onChange={e => setPassForm({ ...passForm, [key]: e.target.value })} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FDF22F] focus:bg-white rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm font-bold transition-all outline-none" placeholder="••••••••" />
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" disabled={passLoading} className="w-full py-3.5 md:py-4 bg-black text-[#FDF22F] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:shadow-black/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                    {passLoading ? <div className="w-4 h-4 border-2 border-[#FDF22F]/30 border-t-[#FDF22F] rounded-full animate-spin" /> : 'Save New Password'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Help Modal */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHelpModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
                            <div className="px-6 md:px-8 pt-8 md:pt-10 pb-5 md:pb-6 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div><h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">Help & Support</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Get assistance and documentation</p></div>
                                    <button onClick={() => setShowHelpModal(false)} className="w-9 h-9 md:w-10 md:h-10 bg-white flex items-center justify-center rounded-2xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 space-y-5 md:space-y-6">
                                <div className="grid grid-cols-1 gap-3 md:gap-4">
                                    <a href="https://drogapharma.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 md:p-5 bg-white border border-gray-100 rounded-3xl hover:border-[#FDF22F] hover:shadow-xl hover:shadow-[#FDF22F]/5 transition-all group">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black flex items-center justify-center text-[#FDF22F] shrink-0 group-hover:scale-110 transition-transform"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                                        <div><h3 className="text-sm font-black text-black uppercase tracking-tight">Company Website</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visit drogapharma.com</p></div>
                                        <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </a>
                                    <a href="mailto:support@drogapharma.com" className="flex items-center gap-4 p-4 md:p-5 bg-white border border-gray-100 rounded-3xl hover:border-[#FDF22F] hover:shadow-xl hover:shadow-[#FDF22F]/5 transition-all group">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black flex items-center justify-center text-[#FDF22F] shrink-0 group-hover:scale-110 transition-transform"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                                        <div><h3 className="text-sm font-black text-black uppercase tracking-tight">Email Support</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact our HR/IT team</p></div>
                                        <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </a>
                                </div>
                                <div className="pt-3 md:pt-4 text-center"><p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">For urgent system issues, please contact your <br />department administrator.</p></div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
