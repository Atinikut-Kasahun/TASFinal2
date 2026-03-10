'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch, API_URL, apiFetchBlob } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    name: string;
    roles?: any[];
    tenant?: {
        name: string;
    };
}

export default function Navbar({ user, onLogout }: { user: User; onLogout: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTabParam = searchParams.get('tab') || 'Jobs'; // Default to Jobs if no tab is provided

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
            default: // TA Team
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

    useEffect(() => {
        const checkInterviewsToday = async () => {
            if (roleSlug === 'ta_manager') return; // Only managers see this in nav
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
        if (!token) {
            console.error('No auth token found');
            return;
        }
        // Build the direct view URL with token as query param.
        // The browser opens this URL directly — no JS fetch needed,
        // so Authorization headers are not required.
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api')
            .replace(/\/+$/, '');
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
            if (item.file) {
                formData.append('file', item.file);
            }

            await apiFetch(`/v1/notifications/${notifId}/reply`, {
                method: 'POST',
                body: formData,
            });
            setReplyState(prev => ({ ...prev, [notifId]: { open: false, text: '', file: null, sending: false, sent: true } }));
            // Also mark original as read locally
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            console.error(e);
            setReplyState(prev => ({ ...prev, [notifId]: { ...prev[notifId], sending: false } }));
        }
    };

    // Compose new message
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
            if (composeFile) {
                formData.append('file', composeFile);
            }

            await apiFetch('/v1/messages/send', {
                method: 'POST',
                body: formData,
            });
            setComposeMsg('');
            setComposeTo('');
            setComposeFile(null);
            setComposeSent(true);
            setTimeout(() => { setComposeSent(false); setShowCompose(false); }, 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setComposeSending(false);
        }
    };

    return (
        <nav className="bg-[#FDF22F] h-16 px-8 flex items-center justify-between shadow-lg sticky top-0 z-[100] border-b border-black/5">
            <div className="flex items-center gap-12">
                {/* Logo */}
                <Link href={roleSlug === 'admin' ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2 group">
                    <div className="bg-black text-[#FDF22F] w-8 h-8 rounded flex items-center justify-center font-black text-xl shadow-lg shadow-black/10">
                        {(roleSlug === 'admin' ? 'D' : user.tenant?.name?.charAt(0)) || 'D'}
                    </div>
                    <span className="text-black font-black text-xl tracking-tighter group-hover:text-black/70 transition-colors">
                        {(roleSlug === 'admin' ? 'DROGA' : user.tenant?.name) || 'DROGA'}
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex gap-2">
                    {navItems.map((item) => {
                        // Extract the tab value from the href (e.g. "Jobs" from "?tab=Jobs")
                        const tabValue = item.href.split('?tab=')[1];
                        const isActive = tabValue ? activeTabParam === tabValue : pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`text-[11px] font-black tracking-widest transition-all px-4 py-2 rounded-lg relative ${isActive
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

            <div className="flex items-center gap-6">
                {/* Interview Calendar Icon (Only for Managers) */}
                {(roleSlug === 'hiring_manager' || roleSlug === 'hr_manager') && (
                    <div className="relative group">
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

                        {/* Tooltip */}
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
                                animate={{ width: 220, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                                type="text"
                                value={searchQuery}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsSearchOpen(false); // Close bar to indicate "Go"
                                    }
                                }}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    const url = new URL(window.location.href);
                                    if (val) url.searchParams.set('search', val);
                                    else url.searchParams.delete('search');
                                    window.history.replaceState({}, '', url);
                                }}
                                placeholder="Search candidates, jobs..."
                                className="absolute right-8 bg-black/5 text-black placeholder-black/30 text-[11px] font-black tracking-widest px-4 py-2 rounded-lg border border-black/10 focus:outline-none focus:border-black z-[110]"
                                autoFocus
                            />
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => {
                            const opening = !isSearchOpen;
                            setIsSearchOpen(opening);
                            if (!opening) {
                                // Clear search when closing
                                setSearchQuery('');
                                const url = new URL(window.location.href);
                                url.searchParams.delete('search');
                                window.history.replaceState({}, '', url);
                            }
                        }}
                        className={`transition-colors relative z-[120] ${isSearchOpen ? 'text-black' : 'text-black/40 hover:text-black'}`}
                    >
                        {isSearchOpen ? (
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-black mr-1 hidden md:inline group-hover:text-black">GO ➔</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Notifications Dropdown */}
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
                                <svg className="w-2 h-2 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M5 5h14l-4 4v7l-3 3-3-3v-7L5 5z" />
                                </svg>
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
                                className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[120]"
                            >
                                {/* Dropdown header */}
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-[#000000] tracking-widest uppercase">Notifications</h3>
                                        <div className="flex items-center gap-3">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="px-3 py-1.5 bg-[#FDF22F]/10 border border-[#FDF22F]/30 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#FDF22F] hover:shadow-lg hover:shadow-[#FDF22F]/20 transition-all flex items-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                    Mark all read
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

                                    {/* Compose panel */}
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
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-xs italic">
                                            No new notifications
                                        </div>
                                    ) : (
                                        notifications.map(notif => {
                                            const rs = replyState[notif.id];
                                            const canReply = !!(notif.data?.sender_id || notif.data?.applicant_id);
                                            return (
                                                <div key={notif.id} className={`border-b border-gray-50 transition-colors relative group/item ${notif.read_at ? 'bg-white' : 'bg-red-50/50'}`}>
                                                    {!notif.read_at && (
                                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-full" />
                                                    )}
                                                    {notif.is_pinned && (
                                                        <div className="absolute right-1 top-0 w-2 h-2 bg-[#FDF22F] rounded-bl-full shadow-sm" />
                                                    )}
                                                    {/* Message row */}
                                                    <div
                                                        onClick={() => !notif.read_at && markAsRead(notif.id)}
                                                        className="p-4 flex gap-3 cursor-pointer hover:bg-gray-50/60"
                                                    >
                                                        <div className="mt-0.5 text-base">
                                                            {notif.data.type === 'requisition_alert' ? '📝' :
                                                                notif.data.type === 'candidate_mention' ? '💬' :
                                                                    notif.data.type === 'applicant_message' ? '📧' :
                                                                        notif.data.type === 'direct_reply' ? '↩️' :
                                                                            notif.data.type === 'interview_reminder' ? '⏰' :
                                                                                notif.data.type === 'system_status' ? '🔔' : '📌'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs leading-tight ${notif.read_at ? 'font-medium text-gray-700' : 'font-bold text-[#000000]'}`}>
                                                                {notif.data.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                                                                {notif.data.message}
                                                            </p>
                                                            {notif.data.attachment_path && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownloadAttachment(notif.id, notif.data.attachment_name || 'Document');
                                                                    }}
                                                                    className="mt-2 flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[9px] font-black uppercase tracking-tight text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                    {notif.data.attachment_name || 'Download Attachment'}
                                                                </button>
                                                            )}

                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    {new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                                    className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    Del
                                                                </button>
                                                                <button
                                                                    onClick={(e) => togglePin(notif.id, e)}
                                                                    className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${notif.is_pinned ? 'text-[#FDF22F]' : 'text-gray-400 hover:text-[#FDF22F]'}`}
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill={notif.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 5h14l-4 4v7l-3 3-3-3v-7L5 5z" />
                                                                    </svg>
                                                                    {notif.is_pinned ? 'Unpin' : 'Pin'}
                                                                </button>
                                                                {canReply && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleReply(notif.id); }}
                                                                        className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${rs?.open ? 'text-black' : 'text-gray-400 hover:text-[#FDF22F]'}`}
                                                                    >
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                                                        {rs?.open ? 'Cancel' : 'Reply'}
                                                                    </button>
                                                                )}
                                                                {rs?.sent && (
                                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                                                        Sent
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!notif.read_at && <div className="w-2 h-2 rounded-full bg-[#FDF22F] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(253,242,47,0.5)]" />}
                                                    </div>

                                                    {/* Inline reply form */}
                                                    <AnimatePresence>
                                                        {rs?.open && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="px-4 pb-4 bg-gray-50/70 border-t border-gray-100 flex flex-col gap-2 pt-3">
                                                                    <div className="flex gap-2">
                                                                        <textarea
                                                                            value={rs.text || ''}
                                                                            onChange={(e) => setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], text: e.target.value } }))}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(notif.id); } }}
                                                                            placeholder={`Reply to ${notif.data.sender_name || notif.data.applicant_name || 'sender'}...`}
                                                                            rows={2}
                                                                            className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#FDF22F] focus:ring-1 focus:ring-[#FDF22F]"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); sendReply(notif.id); }}
                                                                            disabled={rs.sending || !rs.text?.trim()}
                                                                            className="self-end px-3 py-2 bg-[#FDF22F] text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white disabled:opacity-50 transition-all shadow-md shadow-[#FDF22F]/10"
                                                                        >
                                                                            {rs.sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '↩ Send'}
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="file"
                                                                            id={`reply-file-${notif.id}`}
                                                                            className="hidden"
                                                                            onChange={e => setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], file: e.target.files?.[0] || null } }))}
                                                                        />
                                                                        <label
                                                                            htmlFor={`reply-file-${notif.id}`}
                                                                            className={`flex-1 text-[8px] font-black uppercase tracking-widest px-2 py-1.5 border border-dashed rounded flex justify-between items-center transition-all ${rs.file ? 'border-black bg-black text-[#FDF22F]' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
                                                                            onClick={e => e.stopPropagation()}
                                                                        >
                                                                            <span>{rs.file ? rs.file.name : 'Add Document'}</span>
                                                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                                        </label>
                                                                        {rs.file && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setReplyState(prev => ({ ...prev, [notif.id]: { ...prev[notif.id], file: null } })); }}
                                                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                            </button>
                                                                        )}
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
                        <div className="h-6 w-px bg-black/10 mx-1" />

                        {/* User Info */}
                        <div className="flex items-center gap-3 group relative cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[11px] font-black text-[#FDF22F] border border-black/10 group-hover:border-black/30 transition-all">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[10px] font-black text-black leading-none">{user.name}</p>
                            </div>

                            {/* Logout Tooltip/Dropdown Placeholder */}
                            <button
                                onClick={onLogout}
                                className="opacity-0 group-hover:opacity-100 absolute -bottom-10 right-0 bg-black text-[#FDF22F] px-4 py-2 rounded shadow-xl text-[10px] font-black tracking-widest border border-black/10 hover:bg-red-500 transition-all z-[110]"
                            >
                                LOGOUT
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
