"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiFetch } from '@/lib/api';
import { Bell, Search, LogOut, User, Info, Save, Check, Shield, Plus, Trash2, UserPlus, AlertTriangle, Key, RefreshCw } from 'lucide-react';

export default function GlobalSettings() {
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState('');
    const [saved, setSaved] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '' });
    const [creating, setCreating] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordRes, setPasswordRes] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [resettingId, setResettingId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void; type: 'danger' | 'warning' }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        const u = JSON.parse(storedUser);
        setUser(u);
        setName(u.name || '');
        apiFetch('/v1/dashboard').then(setStats).catch(() => { });
    }, [router]);

    const handleLogout = async () => {
        try { await apiFetch('/v1/logout', { method: 'POST' }); } catch (_) { }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Update local display name
        const updated = { ...user, name };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const fetchAdmins = async () => {
        setLoadingAdmins(true);
        try {
            const res = await apiFetch('/v1/global-users?role_slug=admin');
            setAdmins(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'admins') {
            fetchAdmins();
        }
    }, [activeTab]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        try {
            const res = await apiFetch('/v1/global-users', {
                method: 'POST',
                body: JSON.stringify({
                    ...newAdmin,
                    role_slug: 'admin',
                    tenant_id: user.tenant_id
                })
            });
            setAdmins([res.user, ...admins]);
            setGeneratedPassword(res.generated_password);
            setNewAdmin({ name: '', email: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to create admin');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteAdmin = (id: number) => {
        setConfirmModal({
            open: true,
            title: 'Delete Admin Account',
            message: 'Are you sure? This will permanently remove this admin access and they will no longer be able to log in.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await apiFetch(`/v1/global-users/${id}`, { method: 'DELETE' });
                    setAdmins(admins.filter(a => a.id !== id));
                    setConfirmModal(prev => ({ ...prev, open: false }));
                } catch (err: any) {
                    alert(err.message || 'Failed to delete admin');
                }
            }
        });
    };

    const handleResetPassword = (id: number) => {
        setConfirmModal({
            open: true,
            title: 'Reset Admin Password',
            message: 'Are you sure? This will generate a new random password for this admin. You will need to copy and share it with them.',
            type: 'warning',
            onConfirm: async () => {
                setResettingId(id);
                setConfirmModal(prev => ({ ...prev, open: false }));
                try {
                    const res = await apiFetch(`/v1/global-users/${id}/reset-password`, { method: 'POST' });
                    setGeneratedPassword(res.generated_password);
                    setShowAddAdmin(true);
                } catch (err: any) {
                    alert(err.message || 'Failed to reset password');
                } finally {
                    setResettingId(null);
                }
            }
        });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangingPassword(true);
        setPasswordRes(null);
        try {
            await apiFetch('/v1/account/change-password', {
                method: 'POST',
                body: JSON.stringify(passwordData)
            });
            setPasswordRes({ msg: 'Password changed successfully!', type: 'success' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err: any) {
            setPasswordRes({ msg: err.message || 'Failed to change password', type: 'error' });
        } finally {
            setChangingPassword(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#000000]" />
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
        { id: 'admins', label: 'Admin Accounts', icon: <Shield size={15} /> },
        { id: 'system', label: 'System Info', icon: <Info size={15} /> },
    ];

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex">
            <AdminSidebar user={user} />

            <div className="flex-1 ml-56 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 h-14 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <h1 className="text-gray-800 font-bold text-sm">Settings</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-400 text-sm w-48">
                            <Search size={14} /><span className="text-xs">Search...</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 transition-colors"><Bell size={18} /></button>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                            <div className="w-8 h-8 rounded-full bg-[#000000]/20 border border-[#000000]/40 flex items-center justify-center text-[#000000] font-black text-xs">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex min-h-[calc(100vh-8rem)]">
                        {/* Vertical Tabs */}
                        <div className="w-52 border-r border-gray-100 p-4 flex flex-col gap-1 shrink-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2.5 ${activeTab === tab.id ? 'bg-[#000000]/10 text-[#000000]' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {tab.icon}{tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-10 max-w-2xl">

                            {/* ── PROFILE ── */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-base font-black text-gray-900 mb-1">My Profile</h2>
                                    <p className="text-gray-400 text-xs mb-8">Your Global Admin identity.</p>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#000000] to-[#000000] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{user.name}</p>
                                            <p className="text-xs text-[#000000] font-bold uppercase tracking-widest mt-0.5">Global Admin</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSaveProfile} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Display Name</label>
                                            <input
                                                type="text" required
                                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                            <input
                                                type="email" disabled
                                                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                                                value={user.email || ''}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed from here.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Company</label>
                                            <input
                                                type="text" disabled
                                                className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                                                value={user.tenant?.name || 'Global Admin (No Company)'}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-[#000000] text-white hover:bg-[#165a51]'}`}
                                        >
                                            {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                                        </button>
                                    </form>

                                    <hr className="my-10 border-gray-100" />

                                    <h2 className="text-base font-black text-gray-900 mb-1">Security</h2>
                                    <p className="text-gray-400 text-xs mb-8">Update your login credentials.</p>

                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Current Password</label>
                                                <input
                                                    type="password" required
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#000000]"
                                                    value={passwordData.current_password}
                                                    onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">New Password</label>
                                                <input
                                                    type="password" required
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#000000]"
                                                    value={passwordData.new_password}
                                                    onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Confirm New Password</label>
                                                <input
                                                    type="password" required
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#000000]"
                                                    value={passwordData.new_password_confirmation}
                                                    onChange={e => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        {passwordRes && (
                                            <p className={`text-[10px] font-bold ${passwordRes.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {passwordRes.msg}
                                            </p>
                                        )}
                                        <button
                                            disabled={changingPassword}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            {changingPassword ? 'Updating...' : <><Key size={15} /> Update Password</>}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* ── ADMIN ACCOUNTS ── */}
                            {activeTab === 'admins' && (
                                <div className="max-w-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <h2 className="text-base font-black text-gray-900">Admin Management</h2>
                                        <button
                                            onClick={() => { setShowAddAdmin(!showAddAdmin); setGeneratedPassword(''); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#000000] text-white rounded-lg text-xs font-bold hover:bg-[#165a51] transition-all"
                                        >
                                            {showAddAdmin ? 'Cancel' : <><Plus size={14} /> Add Admin</>}
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-8">Manage Global Admin accounts for redundancy.</p>

                                    {showAddAdmin ? (
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                                            {generatedPassword ? (
                                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Check size={20} />
                                                    </div>
                                                    <p className="text-emerald-800 font-bold text-sm mb-1">
                                                        {newAdmin.email ? 'Admin Created Successfully!' : 'Password Reset Successfully!'}
                                                    </p>
                                                    <p className="text-emerald-600 text-[10px] mb-4">Please copy this temporary password immediately:</p>
                                                    <div className="bg-white border border-emerald-200 px-4 py-3 rounded-lg font-mono text-lg font-black text-emerald-700 mb-4 select-all">
                                                        {generatedPassword}
                                                    </div>
                                                    <button
                                                        onClick={() => { setShowAddAdmin(false); setGeneratedPassword(''); }}
                                                        className="text-emerald-700 text-xs font-bold hover:underline"
                                                    >
                                                        Done, I've saved it
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleCreateAdmin} className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                                        <input
                                                            type="text" required
                                                            placeholder="e.g. John Doe"
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#000000]/20"
                                                            value={newAdmin.name}
                                                            onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                                        <input
                                                            type="email" required
                                                            placeholder="admin@company.com"
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#000000]/20"
                                                            value={newAdmin.email}
                                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                                        />
                                                    </div>
                                                    {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
                                                    <button
                                                        disabled={creating}
                                                        className="w-full bg-[#000000] text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        {creating ? 'Creating...' : <><UserPlus size={16} /> Create Global Admin</>}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {loadingAdmins ? (
                                                [1, 2].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)
                                            ) : (
                                                admins.map(admin => (
                                                    <div key={admin.id} className="group flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#000000] font-black text-sm">
                                                                {admin.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                                    {admin.name}
                                                                    {admin.id === user.id && <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 font-medium">{admin.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => handleResetPassword(admin.id)}
                                                                disabled={resettingId === admin.id}
                                                                title="Reset Password"
                                                                className="p-2 text-gray-300 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-all"
                                                            >
                                                                {resettingId === admin.id ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <RefreshCw size={14} />}
                                                            </button>
                                                            {admin.id !== user.id && (
                                                                <button
                                                                    onClick={() => handleDeleteAdmin(admin.id)}
                                                                    title="Delete Account"
                                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
                                                <div className="w-10 h-10 shrink-0 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                                    <AlertTriangle size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Redundancy Warning</p>
                                                    <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
                                                        Professional systems should always have at least <strong>two</strong> active Global Admins. This prevents total lockout if one primary account is compromised or lost.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── SYSTEM INFO ── */}
                            {activeTab === 'system' && (
                                <div>
                                    <h2 className="text-base font-black text-gray-900 mb-1">System Information</h2>
                                    <p className="text-gray-400 text-xs mb-8">Read-only overview of the platform state.</p>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Platform', value: 'TAS — Talent Acquisition System' },
                                            { label: 'Architecture', value: 'Multi-Tenant SaaS' },
                                            { label: 'Database', value: 'SQLite (Local Dev)' },
                                            { label: 'Total Companies', value: stats?.total_tenants ?? '—' },
                                            { label: 'Total Candidates', value: stats?.total_candidates ?? '—' },
                                            { label: 'Active Jobs', value: stats?.total_active_jobs ?? '—' },
                                            { label: 'Your Role', value: user.roles?.[0]?.name || 'Admin' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50">
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                                <span className="text-sm font-bold text-gray-800">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 p-4 bg-[#000000]/5 rounded-2xl border border-[#000000]/10">
                                        <p className="text-xs font-black text-[#000000] uppercase tracking-widest mb-1">Company & User Management</p>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            To add/remove companies and users, open the <strong>Global Admin Dashboard</strong> and click any company row to open the management panel.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {/* Premium Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                            className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md z-[200]"
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-[210] p-4 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-gray-100"
                            >
                                <div className="p-10 text-center">
                                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                        {confirmModal.type === 'danger' ? <Trash2 size={32} /> : <AlertTriangle size={32} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-[#000000] mb-3">{confirmModal.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">
                                        {confirmModal.message}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={confirmModal.onConfirm}
                                            className={`w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all shadow-lg ${confirmModal.type === 'danger'
                                                ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600'
                                                : 'bg-[#000000] text-white shadow-[#000000]/20 hover:bg-[#165a51]'
                                                }`}
                                        >
                                            Confirm Action
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                                            className="w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                                        >
                                            Nevermind, Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
