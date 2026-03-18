"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Briefcase, UserPlus, Calendar, Building2,
    ArrowUpRight, Bell, Search, TrendingUp, LogOut,
    Trash2, X, AlertTriangle, ChevronRight, UserMinus,
    Edit2, Check, Copy, Key, FileText, Mail, Send, CheckCircle2
} from 'lucide-react';

interface Stats {
    total_tenants: number;
    total_active_jobs: number;
    total_active_jobs_trend?: number;
    total_active_jobs_label?: string;
    total_candidates: number;
    total_candidates_trend?: number;
    total_candidates_label?: string;
    total_employees: number;
    new_applications_today: number;
    new_applications_today_trend?: number;
    new_applications_today_label?: string;
    active_events: number;
    active_events_trend?: number;
    active_events_label?: string;
    tenants_breakdown: any[];
    recent_global_applicants: any[];
}

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white flex items-center gap-2 animate-fade-in ${type === 'success' ? 'bg-[#000000] border border-brandYellow/20' : 'bg-red-500'}`}>
            {type === 'success' ? <CheckCircle2 size={18} className="text-brandYellow" /> : '❌'} {msg}
        </div>
    );
}

/* ─── Confirm Dialog ─────────────────────────────────────── */
function ConfirmDialog({
    title, detail, warning, onConfirm, onCancel, loading, error,
    confirmLabel = 'Delete',
    confirmLoadingLabel = 'Deleting…',
    confirmColorClass = 'bg-red-500 hover:bg-red-600 text-white',
    icon = <AlertTriangle size={28} className="text-red-500" />
}: {
    title: string; detail: string; warning?: string;
    onConfirm: () => void; onCancel: () => void; loading: boolean; error: string;
    confirmLabel?: string;
    confirmLoadingLabel?: string;
    confirmColorClass?: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden"
            >
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {icon}
                    </div>
                    <h3 className="font-black text-gray-900 text-xl mb-2 tracking-tight">{title}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed font-medium">&quot;{detail}&quot;</p>
                    {warning && (
                        <div className="text-[11px] font-bold text-amber-700 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 mb-4 text-left leading-relaxed">
                            {warning}
                        </div>
                    )}
                    {error && (
                        <div className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-left">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 mt-2">
                        <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all text-[13px]">
                            Cancel
                        </button>
                        <button onClick={onConfirm} disabled={loading} className={`flex-1 py-4 font-black uppercase tracking-widest rounded-2xl transition-all text-[13px] disabled:opacity-50 shadow-xl ${confirmColorClass}`}>
                            {loading ? confirmLoadingLabel : confirmLabel}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ─── Credential Card ─────────────────────────────────────── */
function CredentialCard({
    credentials, onClose, title = "User Created", subtitle = "Safe keep these credentials."
}: {
    credentials: { email: string; pass: string; name: string };
    onClose: () => void;
    title?: string;
    subtitle?: string;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = `Hi ${credentials.name},\n\nYour TAS account has been created/updated.\nEmail: ${credentials.email}\nPassword: ${credentials.pass}\n\nPlease change your password after logging in.`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-fade-in relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>

                <div className="w-20 h-20 bg-brandYellow/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brandYellow/20 rotate-12 transition-transform hover:rotate-0">
                    <Key size={36} className="text-brandYellow" />
                </div>
                <h3 className="font-black text-gray-900 text-2xl mb-2 tracking-tight">{title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">{subtitle}</p>

                <div className="bg-[#0A0A0A] rounded-2xl p-6 text-left space-y-4 relative group shadow-2xl border border-white/5">
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 bg-white/10 border border-white/10 rounded-xl text-brandYellow hover:bg-brandYellow hover:text-black transition-all shadow-lg opacity-0 group-hover:opacity-100"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>

                    <div>
                        <p className="text-[10px] font-black text-brandYellow/50 uppercase tracking-[0.2em] mb-1.5">Email Access</p>
                        <p className="font-bold text-white text-sm font-mono break-all">
                            {(credentials.email || '').split('@').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && <span className="text-brandYellow font-black px-0.5">@</span>}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brandYellow/50 uppercase tracking-[0.2em] mb-1.5">Temporary Password</p>
                        <p className="font-black text-brandYellow text-xl font-mono tracking-wider">{credentials.pass}</p>
                    </div>
                </div>

                <button onClick={onClose} className="w-full mt-8 py-4 bg-brandYellow text-[#000000] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brandYellow/10">
                    Secure & Done
                </button>
            </div>
        </div>
    );
}

/* ─── Add User Modal ──────────────────────────────────────── */
function AddUserModal({ tenant, tenants, onClose, onAdded }: {
    tenant: any; tenants: any[]; onClose: () => void; onAdded: (u: any) => void;
}) {
    const [form, setForm] = useState({ name: '', email: '', role_slug: 'ta_manager', tenant_id: String(tenant.id) });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            const res = await apiFetch('/v1/global-users', { method: 'POST', body: JSON.stringify(form) });
            if (res?.user && res?.generated_password) {
                onAdded(res.user);
                setCreatedCredentials({
                    name: res.user.name,
                    email: res.user.email,
                    pass: res.generated_password
                });
            }
        } catch (err: any) { setError(err.message || 'Failed to create user.'); }
        finally { setSubmitting(false); }
    };

    if (createdCredentials) {
        return <CredentialCard credentials={createdCredentials} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#0A0A0A] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brandYellow/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                    <div className="relative z-10">
                        <p className="text-brandYellow text-[10px] font-black uppercase tracking-[0.2em] mb-1">Onboarding System</p>
                        <h3 className="font-black text-white text-xl tracking-tight">Add User to {tenant.name}</h3>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition p-2 hover:bg-white/5 rounded-full relative z-10"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">{error}</div>}
                    {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Abebe Kebede' },
                        { label: 'Email Address', key: 'email', type: 'email', placeholder: 'abebe@example.com' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                            <input required type={f.type} placeholder={f.placeholder}
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brandYellow focus:border-transparent outline-none transition-all font-medium"
                                value={(form as any)[f.key]}
                                onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Access Role</label>
                        <select className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-brandYellow focus:border-transparent outline-none transition-all font-bold text-gray-700"
                            value={form.role_slug} onChange={e => setForm({ ...form, role_slug: e.target.value })}>
                            <option value="admin">Global Admin</option>
                            <option value="hr_manager">HR Manager</option>
                            <option value="hiring_manager">General Manager (GM)</option>
                            <option value="managing_director">Managing Director (MD)</option>
                            <option value="ta_manager">Talent Acquisition</option>
                        </select>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 py-2 rounded-lg">Auto-generated password will be provided</p>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 rounded-2xl transition">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-4 bg-brandYellow text-[#000000] text-sm font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brandYellow/10 border border-brandYellow/50">
                            {submitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Add Company Modal ────────────────────────────────────── */
function AddCompanyModal({ onClose, onAdded }: {
    onClose: () => void; onAdded: (t: any) => void;
}) {
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError('');
        try {
            const res = await apiFetch('/v1/tenants', { method: 'POST', body: JSON.stringify({ name }) });
            if (res?.tenant) onAdded(res.tenant);
        } catch (err: any) { setError(err.message || 'Failed to create company.'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-fade-in relative">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>

                <div className="w-20 h-20 bg-brandYellow/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brandYellow/20 rotate-6 transition-transform hover:rotate-0">
                    <Building2 size={40} className="text-brandYellow" />
                </div>
                <h3 className="font-black text-gray-900 text-2xl mb-2 tracking-tight">New Sister Company</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed">Spawn a new enterprise workspace.</p>

                <form onSubmit={handleSubmit} className="text-left space-y-5">
                    {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">{error}</div>}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Enterprise Name</label>
                        <input required type="text" autoFocus
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-brandYellow focus:border-transparent outline-none transition-all font-bold placeholder:font-normal"
                            value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Droga Logistics" />
                    </div>

                    <button type="submit" disabled={submitting || !name.trim()} className="w-full py-4 bg-[#0A0A0A] text-brandYellow font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 border border-white/5 disabled:opacity-50 mt-4">
                        {submitting ? 'Generating Namespace...' : 'Initialize Workspace'}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─── Company Detail Side Panel ──────────────────────────── */
function CompanyPanel({
    tenant, allUsers, onClose, onDeleteCompany, onDeleteUser, onUserAdded, onUserUpdated, onTenantUpdated, tenants, usersLoading
}: {
    tenant: any; allUsers: any[]; onClose: () => void;
    onDeleteCompany: (t: any) => void; onDeleteUser: (u: any) => void;
    onUserAdded: (u: any) => void;
    onUserUpdated: (u: any) => void;
    onTenantUpdated: (t: any) => void;
    tenants: any[];
    usersLoading?: boolean;
}) {
    const companyUsers = allUsers.filter((u: any) => String(u.tenant_id) === String(tenant.id));
    const [showAddUser, setShowAddUser] = useState(false);

    // Rename state
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(tenant.name);
    const [renaming, setRenaming] = useState(false);

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (renameValue.trim() === tenant.name || !renameValue.trim()) {
            setIsRenaming(false); return;
        }
        setRenaming(true);
        try {
            const res = await apiFetch(`/v1/tenants/${tenant.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: renameValue.trim() })
            });
            onTenantUpdated(res.tenant);
            setIsRenaming(false);
        } catch (err: any) { alert(err.message || 'Failed to rename company'); }
        finally { setRenaming(false); }
    };

    // Role edit state
    const handleRoleChange = async (userId: string, newRoleSlug: string) => {
        try {
            const res = await apiFetch(`/v1/global-users/${userId}/role`, {
                method: 'PATCH', body: JSON.stringify({ role_slug: newRoleSlug })
            });
            onUserUpdated(res.user);
        } catch (err: any) { alert(err.message || 'Failed to update role'); }
    };

    // Password reset state
    const [resetCredentials, setResetCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);
    const [resetTarget, setResetTarget] = useState<any | null>(null);
    const [resetting, setResetting] = useState(false);
    const [resetError, setResetError] = useState('');

    const executeResetPassword = async () => {
        if (!resetTarget) return;
        setResetting(true); setResetError('');
        try {
            const res = await apiFetch(`/v1/global-users/${resetTarget.id}/reset-password`, { method: 'POST' });
            if (res?.generated_password) {
                setResetCredentials({
                    name: resetTarget.name,
                    email: resetTarget.email,
                    pass: res.generated_password
                });
                setResetTarget(null);
            }
        } catch (err: any) { setResetError(err.message || 'Failed to reset password'); }
        finally { setResetting(false); }
    }

    return (
        <>
            {resetCredentials && (
                <CredentialCard
                    credentials={resetCredentials}
                    onClose={() => setResetCredentials(null)}
                    title="Password Reset"
                    subtitle="A new password has been generated randomly."
                />
            )}

            {resetTarget && (
                <ConfirmDialog
                    title="Reset Password"
                    detail={`Generate a new secure password for ${resetTarget.name}?`}
                    warning="The user will be logged out and must use the new credentials immediately. This action cannot be undone."
                    onConfirm={executeResetPassword}
                    onCancel={() => setResetTarget(null)}
                    loading={resetting}
                    error={resetError}
                    confirmLabel="Reset Access"
                    confirmLoadingLabel="Resetting..."
                    confirmColorClass="bg-[#FDF22F] text-[#000000] border-2 border-[#000000] hover:bg-black hover:text-[#FDF22F] hover:border-black transition-all shadow-xl shadow-brandYellow/20"
                    icon={<Key size={32} className="text-[#000000]" />}
                />
            )}

            {/* Overlay */}
            <div className="fixed inset-0 bg-[#000000]/20 z-[60]" onClick={onClose} />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
                {/* Header */}
                <div className="bg-[#0A0A0A] px-6 py-10 shrink-0 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brandYellow/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="flex items-start justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-brandYellow flex items-center justify-center text-[#000000] font-black text-2xl shadow-xl shadow-brandYellow/20">
                                {tenant.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-brandYellow text-[10px] font-black uppercase tracking-[0.2em] mb-1">Sister Company</p>

                                {isRenaming ? (
                                    <form onSubmit={handleRenameSubmit} className="flex items-center gap-2 mt-0.5">
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            disabled={renaming}
                                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/50"
                                        />
                                        <button type="submit" disabled={renaming} className="text-[#000000] bg-white rounded p-1"><Check size={14} /></button>
                                        <button type="button" onClick={() => { setIsRenaming(false); setRenameValue(tenant.name); }} className="text-white/50 hover:text-white p-1"><X size={14} /></button>
                                    </form>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-white font-black text-lg leading-tight">{tenant.name}</h2>
                                        <button onClick={() => setIsRenaming(true)} className="text-white/30 hover:text-white transition p-1"><Edit2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition p-1"><X size={20} /></button>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
                        {[
                            { label: 'Active Jobs', value: tenant.active_jobs_count ?? '—' },
                            { label: 'Requisitions', value: tenant.job_requisitions_count ?? '—' },
                            { label: 'Users', value: companyUsers.length },
                        ].map(s => (
                            <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 transition-colors hover:bg-white/10 group/stat">
                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1 group-hover/stat:text-brandYellow transition-colors">{s.label}</p>
                                <p className="text-white font-black text-2xl tabular-nums tracking-tighter">{s.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                        <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                            <Users size={15} className="text-brandYellow" />
                            Team Members ({companyUsers.length})
                        </h3>
                        <button
                            onClick={() => setShowAddUser(true)}
                            className="flex items-center gap-1.5 text-[11px] font-black text-[#000000] bg-brandYellow hover:bg-black hover:text-brandYellow px-4 py-2 rounded-xl transition shadow-lg shadow-brandYellow/10"
                        >
                            <UserPlus size={13} strokeWidth={3} /> Add User
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {usersLoading ? (
                            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000000]" /></div>
                        ) : companyUsers.length === 0 ? (
                            <div className="p-10 text-center text-gray-400 text-sm italic">
                                No users yet. Add the first team member!
                            </div>
                        ) : companyUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition group">
                                <div className="w-10 h-10 rounded-full bg-brandYellow flex items-center justify-center text-[#000000] font-black text-sm shrink-0 border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate group-hover:text-brandYellow transition-colors leading-tight">{u.name}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-gray-400 truncate mt-0.5">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <select
                                        className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-lg border-none focus:ring-1 focus:ring-[#000000] cursor-pointer hover:bg-gray-200"
                                        value={u.roles?.[0]?.slug || 'ta_manager'}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    >
                                        <option value="admin">Global Admin</option>
                                        <option value="hr_manager">HR Manager</option>
                                        <option value="hiring_manager">General Manager (GM)</option>
                                        <option value="managing_director">Managing Director (MD)</option>
                                        <option value="ta_manager">Talent Acq.</option>
                                    </select>
                                    <div className="opacity-40 group-hover:opacity-100 flex items-center transition-opacity border-l border-gray-200 pl-1 ml-1">
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setResetTarget(u); }}
                                            className="p-1.5 text-gray-500 hover:text-black hover:bg-brandYellow rounded-lg transition-all"
                                            title="Reset Password"
                                        >
                                            <Key size={15} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteUser(u); }}
                                            className="p-1.5 text-gray-400 hover:text-black hover:bg-[#FDF22F] rounded-lg transition-all"
                                            title="Remove user"
                                        >
                                            <UserMinus size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer: Delete Company */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button
                        onClick={() => onDeleteCompany(tenant)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-widest text-[#000000] bg-[#FDF22F] border border-[#FDF22F] rounded-2xl hover:bg-black hover:text-[#FDF22F] transition-all shadow-lg shadow-[#FDF22F]/10 hover:shadow-black/20"
                    >
                        <Trash2 size={15} strokeWidth={3} /> Delete This Company
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">Remove all users before deleting the company.</p>
                </div>
            </div>

            {showAddUser && (
                <AddUserModal tenant={tenant} tenants={tenants} onClose={() => setShowAddUser(false)} onAdded={onUserAdded} />
            )}
        </>
    );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ title, value, icon, trend, trendLabel }: { title: string; value: number | string; icon: React.ReactNode; trend?: number; trendLabel?: string }) {
    const isPositive = (trend ?? 0) >= 0;
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brandYellow/5 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <span className="p-2 bg-gray-50 rounded-xl group-hover:bg-brandYellow group-hover:text-[#000000] transition-colors">{icon}</span>{title}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-300 group-hover:text-brandYellow group-hover:border-brandYellow/30 transition-all">
                    <ArrowUpRight size={14} />
                </div>
            </div>
            <p className="text-4xl font-black text-gray-900 tabular-nums tracking-tight">{value}</p>
            {trend !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {isPositive ? '+' : ''}{trend}%
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{trendLabel || 'vs last month'}</span>
                </div>
            )}
        </div>
    );
}

/* ─── Main Dashboard Wrapper ───────────────────────────────── */
function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) { router.push('/login'); return; }
        setUser(JSON.parse(storedUser));
    }, [router]);

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#000000]" />
        </div>
    );

    const isAdmin = user?.roles?.some((r: any) => r.slug === 'admin');

    if (isAdmin) {
        return <GlobalDashboard user={user} />;
    }

    return <CompanyDashboard user={user} />;
}

/* ─── Search Category ────────────────────────────────────── */
function SearchCategory({ title, results, icon, onClick }: { title: string; results: any[]; icon: React.ReactNode; onClick: (item: any) => void }) {
    if (results.length === 0) return null;
    return (
        <div className="mb-2 last:mb-0 border-b border-gray-50 last:border-none pb-2 last:pb-0">
            <h4 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brandYellow bg-[#0A0A0A] rounded-lg mb-2 flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="space-y-1">
                {results.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onClick(item)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-brandYellow/10 transition-all group flex items-center justify-between border border-transparent hover:border-brandYellow/20"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-700 group-hover:text-black transition-colors">{item.name || item.title}</span>
                            {item.email && <span className="text-[10px] text-gray-400 font-bold tracking-tight">{item.email}</span>}
                        </div>
                        <ChevronRight size={12} className="text-gray-300 group-hover:text-brandYellow transform group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─── Notification Dropdown ────────────────────────────── */
function NotificationDropdown({
    notifications, unreadCount, markAsRead, markAllAsRead,
    showCompose, setShowCompose, users, composeTo, setComposeTo,
    composeMsg, setComposeMsg, sendDirect, composeSending, composeSent,
    replyState, toggleReply, sendReply, setReplyState
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]"
        >
            {/* Dropdown header */}
            <div className="px-4 py-4 border-b border-gray-100 bg-[#0A0A0A] space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brandYellow/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-[10px] font-black text-brandYellow tracking-[0.2em] uppercase">Intelligence Center</h3>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-[9px] font-black text-white/50 hover:text-brandYellow uppercase tracking-widest transition-colors">
                                Clear All
                            </button>
                        )}
                        <button
                            onClick={() => setShowCompose(!showCompose)}
                            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${showCompose ? 'bg-brandYellow text-black shadow-lg shadow-brandYellow/20' : 'bg-white/10 text-white hover:bg-brandYellow hover:text-black border border-white/10'}`}
                        >
                            <Mail size={12} strokeWidth={3} />
                            Compose
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
                                    className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brandYellow focus:ring-4 focus:ring-brandYellow/10 font-bold text-white transition-all"
                                >
                                    <option value="" disabled className="text-black">To: Select colleague...</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.id} className="text-black">{u.name} ({u.tenant?.name || 'Group Admin'})</option>
                                    ))}
                                </select>
                                <textarea
                                    value={composeMsg}
                                    onChange={e => setComposeMsg(e.target.value)}
                                    placeholder="Write your message..."
                                    rows={3}
                                    className="w-full text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-brandYellow focus:ring-4 focus:ring-brandYellow/10 font-medium text-white placeholder:text-white/20 transition-all"
                                />
                                <div className="flex items-center justify-between">
                                    {composeSent ? (
                                        <span className="text-[10px] font-black text-brandYellow flex items-center gap-1">
                                            <CheckCircle2 size={12} />
                                            Dispatched!
                                        </span>
                                    ) : <span />}
                                    <button
                                        onClick={sendDirect}
                                        disabled={composeSending || !composeTo || !composeMsg.trim()}
                                        className="px-5 py-2 bg-brandYellow text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-brandYellow/10"
                                    >
                                        {composeSending ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Send size={12} strokeWidth={3} /> Send</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={20} className="text-gray-300" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif: any) => {
                        const rs = replyState[notif.id];
                        const canReply = !!(notif.data?.sender_id);
                        return (
                            <div key={notif.id} className={`rounded-xl mb-1 last:mb-0 transition-colors ${notif.read_at ? 'bg-white' : 'bg-[#000000]/5'}`}>
                                <div
                                    onClick={() => !notif.read_at && markAsRead(notif.id)}
                                    className="p-3.5 flex gap-3 cursor-pointer hover:bg-gray-50 rounded-xl group"
                                >
                                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                        {notif.data.type === 'direct_message' ? <Mail size={14} className="text-[#000000]" /> : <Bell size={14} className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className={`text-xs leading-tight truncate ${notif.read_at ? 'font-bold text-gray-700' : 'font-black text-[#000000]'}`}>
                                                {notif.data.title}
                                            </p>
                                            {!notif.read_at && <div className="w-1.5 h-1.5 rounded-full bg-[#000000] shrink-0" />}
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                                            {notif.data.message}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(notif.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {canReply && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleReply(notif.id); }}
                                                    className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${rs?.open ? 'text-[#000000]' : 'text-gray-400 hover:text-[#000000]'}`}
                                                >
                                                    {rs?.open ? 'Cancel' : 'Reply'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {rs?.open && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden px-3.5 pb-3.5"
                                        >
                                            <div className="bg-gray-50 rounded-xl p-2 space-y-2">
                                                <textarea
                                                    value={rs.text || ''}
                                                    onChange={(e) => setReplyState((prev: any) => ({ ...prev, [notif.id]: { ...prev[notif.id], text: e.target.value } }))}
                                                    placeholder={`Reply...`}
                                                    rows={2}
                                                    className="w-full text-xs bg-white border border-gray-100 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#000000]/10"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); sendReply(notif.id); }}
                                                        disabled={rs.sending || !rs.text?.trim()}
                                                        className="px-4 py-1.5 bg-[#000000] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#222222] disabled:opacity-50 transition-all flex items-center gap-1.5"
                                                    >
                                                        {rs.sending ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={10} /> Send</>}
                                                    </button>
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
    );
}

/* ─── Global Admin Dashboard ─────────────────────────────── */
function GlobalDashboard({ user }: { user: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [tenants, setTenants] = useState<any[]>([]);

    // Panel state
    const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
    const [showAddCompany, setShowAddCompany] = useState(false);

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'company' | 'user'; item: any } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ companies: any[], candidates: any[], jobs: any[], users: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                try {
                    const data = await apiFetch(`/v1/admin/search?q=${encodeURIComponent(searchQuery)}`);
                    setSearchResults(data);
                } catch (err) {
                    console.error('Search failed:', err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(null);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Toast
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    // Messaging & Notifications
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);
    const [replyState, setReplyState] = useState<Record<string, { open: boolean; text: string; sending: boolean; sent: boolean }>>({});

    // Compose
    const [messageableUsers, setMessageableUsers] = useState<any[]>([]);
    const [showCompose, setShowCompose] = useState(false);
    const [composeTo, setComposeTo] = useState('');
    const [composeMsg, setComposeMsg] = useState('');
    const [composeSending, setComposeSending] = useState(false);
    const [composeSent, setComposeSent] = useState(false);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchNotifications = async () => {
        try {
            const data = await apiFetch('/v1/notifications');
            if (data) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiFetch(`/v1/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            await apiFetch('/v1/notifications/mark-all-read', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const sendReply = async (notifId: string) => {
        const text = replyState[notifId]?.text?.trim();
        if (!text) return;
        setReplyState(prev => ({ ...prev, [notifId]: { ...prev[notifId], sending: true } }));
        try {
            await apiFetch(`/v1/notifications/${notifId}/reply`, {
                method: 'POST',
                body: JSON.stringify({ message: text }),
            });
            setReplyState(prev => ({ ...prev, [notifId]: { open: false, text: '', sending: false, sent: true } }));
            setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            showToast('Reply sent successfully');
        } catch (e) {
            console.error(e);
            setReplyState(prev => ({ ...prev, [notifId]: { ...prev[notifId], sending: false } }));
        }
    };

    const sendDirect = async () => {
        if (!composeTo || !composeMsg.trim()) return;
        setComposeSending(true);
        setComposeSent(false);
        try {
            await apiFetch('/v1/admin/messages/send', {
                method: 'POST',
                body: JSON.stringify({ to_user_id: composeTo, message: composeMsg }),
            });
            setComposeMsg('');
            setComposeTo('');
            setComposeSent(true);
            showToast('Message sent successfully');
            setTimeout(() => { setComposeSent(false); setShowCompose(false); }, 2000);
        } catch (e) {
            console.error(e);
        } finally {
            setComposeSending(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        apiFetch('/v1/admin/users').then(data => setMessageableUsers(data || [])).catch(() => { });
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [dashData, tenantsData] = await Promise.all([
                apiFetch('/v1/dashboard'),
                apiFetch('/v1/tenants'),
            ]);
            setStats(dashData);
            const rawTenants = Array.isArray(tenantsData) ? tenantsData : [];
            setTenants(rawTenants);

            // Auto-open panel if ?company= slug is present in URL
            const companySlug = searchParams.get('company');
            if (companySlug && rawTenants.length > 0) {
                // Approximate slug matching if slug isn't strictly on the model yet
                const match = rawTenants.find(t =>
                    t.slug === companySlug ||
                    t.name.toLowerCase().replace(/\s+/g, '-') === companySlug
                );
                if (match) setSelectedTenant(match);
            }

        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [searchParams]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const fetchTenantUsers = useCallback(async (tenantId: string) => {
        setUsersLoading(true);
        try {
            const data = await apiFetch(`/v1/global-users?tenant_id=${tenantId}&per_page=100`);
            setAllUsers(data?.data || []);
        } catch (err) { console.error('Failed to fetch tenant users', err); }
        finally { setUsersLoading(false); }
    }, []);

    useEffect(() => {
        if (selectedTenant) {
            fetchTenantUsers(selectedTenant.id);
        } else {
            setAllUsers([]);
        }
    }, [selectedTenant, fetchTenantUsers]);

    // Sync tenants into stats breakdown on update
    const tenantsBreakdown = tenants.map(t => ({
        ...t,
        ...(stats?.tenants_breakdown?.find((b: any) => b.id === t.id) || {}),
    }));


    const onLogout = async () => {
        try { await apiFetch('/v1/logout', { method: 'POST' }); } catch (_) { }
        localStorage.removeItem('auth_token'); localStorage.removeItem('user');
        window.location.href = '/';
    };

    /* Delete */
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true); setDeleteError('');
        try {
            const url = deleteTarget.type === 'company'
                ? `/v1/tenants/${deleteTarget.item.id}`
                : `/v1/global-users/${deleteTarget.item.id}`;
            await apiFetch(url, { method: 'DELETE' });
            if (deleteTarget.type === 'company') {
                setTenants(prev => prev.filter(t => t.id !== deleteTarget.item.id));
                setSelectedTenant(null);
                showToast(`"${deleteTarget.item.name}" deleted.`);
            } else {
                setAllUsers(prev => prev.filter(u => u.id !== deleteTarget.item.id));
                showToast(`User "${deleteTarget.item.name}" removed.`);
            }
            setDeleteTarget(null);
        } catch (err: any) {
            setDeleteError(err.message || 'Delete failed. Try again.');
        } finally { setDeleting(false); }
    };

    /* User added from panel */
    const handleUserAdded = (u: any) => {
        setAllUsers(prev => [...prev, u]);
        // bump user count on tenant
        setTenants(prev => prev.map(t => String(t.id) === String(u.tenant_id) ? { ...t, users_count: (t.users_count || 0) + 1 } : t));
    };

    /* User role updated */
    const handleUserUpdated = (updatedUser: any) => {
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        showToast(`Role updated for ${updatedUser.name}`);
    };

    /* Company added */
    const handleCompanyAdded = (t: any) => {
        setTenants(prev => [...prev, { ...t, active_jobs_count: 0, job_requisitions_count: 0, users_count: 0 }]);
        setShowAddCompany(false);
        showToast(`Company "${t.name}" added successfully.`);
    };

    /* Tenant renamed */
    const handleTenantUpdated = (updatedTenant: any) => {
        setTenants(prev => prev.map(t => t.id === updatedTenant.id
            ? { ...t, name: updatedTenant.name }
            : t
        ));
        setSelectedTenant((prev: any) => prev && prev.id === updatedTenant.id ? { ...prev, name: updatedTenant.name } : prev);
        showToast(`Company renamed to ${updatedTenant.name}`);
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname, searchParams]);

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex">
            <AdminSidebar
                user={user}
                tenants={tenants}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-[#000000] transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-gray-800 font-bold text-sm">Welcome back, <span className="text-[#000000]">{user.name}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative group hidden md:block">
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-400 text-sm w-48 lg:w-64 focus-within:ring-2 focus-within:ring-[#000000]/20 focus-within:border-[#000000] transition-all">
                                <Search size={14} className={isSearching ? 'animate-pulse text-[#000000]' : ''} />
                                <input
                                    type="text"
                                    placeholder="Search companies, candidates, jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder:text-gray-400"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="hover:text-gray-600">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults && (searchQuery.length > 1) && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                                        {Object.entries(searchResults).every(([_, list]) => list.length === 0) ? (
                                            <div className="p-8 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search size={20} className="text-gray-300" />
                                                </div>
                                                <p className="text-xs font-bold text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
                                            </div>
                                        ) : (
                                            <>
                                                <SearchCategory title="Companies" results={searchResults.companies} icon={<Building2 size={12} />} onClick={(item) => {
                                                    setSelectedTenant(item);
                                                    router.push('/admin/dashboard?tab=Jobs');
                                                    setSearchQuery('');
                                                }} />
                                                <SearchCategory title="Candidates" results={searchResults.candidates} icon={<Users size={12} />} onClick={(item) => {
                                                    router.push('/admin/dashboard?tab=Candidates');
                                                    setSearchQuery('');
                                                }} />
                                                <SearchCategory title="Jobs" results={searchResults.jobs} icon={<Briefcase size={12} />} onClick={(item) => {
                                                    router.push('/admin/dashboard?tab=Jobs');
                                                    setSearchQuery('');
                                                }} />
                                                <SearchCategory title="Team Members" results={searchResults.users} icon={<UserPlus size={12} />} onClick={(item) => {
                                                    router.push('/admin/dashboard?tab=Users');
                                                    setSearchQuery('');
                                                }} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showNotifs ? 'bg-brandYellow text-[#000000] shadow-lg shadow-brandYellow/10' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifs && (
                                    <NotificationDropdown
                                        notifications={notifications}
                                        unreadCount={unreadCount}
                                        markAsRead={markAsRead}
                                        markAllAsRead={markAllAsRead}
                                        showCompose={showCompose}
                                        setShowCompose={setShowCompose}
                                        users={messageableUsers}
                                        composeTo={composeTo}
                                        setComposeTo={setComposeTo}
                                        composeMsg={composeMsg}
                                        setComposeMsg={setComposeMsg}
                                        sendDirect={sendDirect}
                                        composeSending={composeSending}
                                        composeSent={composeSent}
                                        replyState={replyState}
                                        toggleReply={(id: string) => setReplyState((prev: any) => ({ ...prev, [id]: { open: !prev[id]?.open, text: prev[id]?.text || '', sending: false, sent: false } }))}
                                        sendReply={sendReply}
                                        setReplyState={setReplyState}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                            <div className="w-8 h-8 rounded-full bg-brandYellow border-2 border-white shadow-sm flex items-center justify-center text-[#000000] font-black text-xs">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    {(() => {
                        const tab = searchParams.get('tab');
                        if (tab === 'Users') return <GlobalUsersView />;
                        if (tab === 'Jobs') return <GlobalJobsView tenants={tenants} />;
                        if (tab === 'Candidates') return <GlobalApplicantsView tenants={tenants} />;
                        if (tab === 'HiringPlan') return <GlobalRequisitionsView tenants={tenants} user={user} />;
                        if (tab === 'Calendar') return <GlobalInterviewsView tenants={tenants} />;
                        if (tab === 'Events') return <GlobalEventsView tenants={tenants} />;
                        if (tab === 'Reports') return <GlobalReportsView />;

                        return (
                            <>
                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                                    <StatCard title="Active Jobs" value={loading ? '—' : (stats?.total_active_jobs ?? 0)} icon={<Briefcase size={14} />} trend={stats?.total_active_jobs_trend} trendLabel={stats?.total_active_jobs_label} />
                                    <StatCard title="Total Candidates" value={loading ? '—' : (stats?.total_candidates ?? 0)} icon={<Users size={14} />} trend={stats?.total_candidates_trend} trendLabel={stats?.total_candidates_label} />
                                    <StatCard title="New Today" value={loading ? '—' : (stats?.new_applications_today ?? 0)} icon={<UserPlus size={14} />} trend={stats?.new_applications_today_trend} trendLabel={stats?.new_applications_today_label} />
                                    <StatCard title="Active Events" value={loading ? '—' : (stats?.active_events ?? 0)} icon={<Calendar size={14} />} trend={stats?.active_events_trend} trendLabel={stats?.active_events_label} />
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                                    {/* Sister Company Table — spans 2 cols */}
                                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <div>
                                                <h2 className="font-bold text-gray-900 text-sm">Sister Company Performance</h2>
                                                <p className="text-xs text-gray-400 mt-0.5">{tenantsBreakdown.length} companies · click any row to manage</p>
                                            </div>
                                            <button
                                                onClick={() => setShowAddCompany(true)}
                                                className="flex items-center gap-1.5 text-[11px] font-black text-[#000000] bg-brandYellow hover:bg-brandYellow/90 px-4 py-2 rounded-xl transition shadow-lg shadow-brandYellow/10"
                                            >
                                                <Building2 size={13} /> Add Company
                                            </button>
                                        </div>

                                        {loading ? (
                                            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000000]" /></div>
                                        ) : (
                                            <div className="overflow-x-auto custom-scrollbar">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-50">
                                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Company</th>
                                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Active Jobs</th>
                                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Hired</th>
                                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Rate</th>
                                                            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Users</th>
                                                            <th className="px-5 py-3 w-24" />
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {tenantsBreakdown.map(tenant => {
                                                            const pct = tenant.job_postings_count > 0
                                                                ? Math.round((tenant.active_jobs_count / tenant.job_postings_count) * 100) : 0;
                                                            return (
                                                                <tr
                                                                    key={tenant.id}
                                                                    onClick={() => setSelectedTenant(tenant)}
                                                                    className={`transition-colors cursor-pointer group ${selectedTenant?.id === tenant.id ? 'bg-brandYellow/5 border-l-2 border-l-brandYellow' : 'hover:bg-gray-50/70'}`}
                                                                >
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-lg bg-[#1E2A35]/10 flex items-center justify-center text-[#1E2A35] font-black text-xs">
                                                                                {tenant.name.charAt(0)}
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-semibold text-gray-800 text-sm leading-none">{tenant.name}</span>
                                                                                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter font-black">Company</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                                                                                <div className="bg-brandYellow h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                                                            </div>
                                                                            <span className="text-xs text-gray-500 tabular-nums font-bold">{tenant.active_jobs_count}/{tenant.job_postings_count}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-black text-gray-900 tabular-nums">{tenant.hired_count}</span>
                                                                            <span className="text-[10px] text-gray-400 font-bold">Total</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-sm font-black text-gray-900 tabular-nums">{tenant.conversion_rate}%</span>
                                                                            {tenant.conversion_rate > 0 && <TrendingUp size={12} className="text-brandYellow" />}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-5 py-3.5 text-sm font-bold text-gray-600 tabular-nums">{tenant.users_count}</td>
                                                                    <td className="px-5 py-3.5">
                                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-brandYellow bg-black px-2 py-1 rounded-lg flex items-center gap-0.5">
                                                                                Manage <ChevronRight size={12} />
                                                                            </span>
                                                                            <button
                                                                                onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'company', item: tenant }); }}
                                                                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                                title="Delete company"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        {tenantsBreakdown.length === 0 && (
                                                            <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-400 italic">No companies found.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Applicants */}
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                            <h2 className="font-bold text-gray-900 text-sm">Recent Applicants</h2>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => router.push('/admin/dashboard?tab=Candidates')}
                                                    className="text-[10px] font-black text-brandYellow uppercase tracking-widest cursor-pointer hover:underline bg-black px-2 py-1 rounded-lg"
                                                >
                                                    See all →
                                                </button>
                                            </div>
                                        </div>
                                        {loading ? (
                                            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000000]" /></div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {stats?.recent_global_applicants?.map((applicant) => (
                                                    <div key={applicant.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-brandYellow flex items-center justify-center text-[#000000] font-black text-xs shrink-0 border-2 border-white shadow-sm">
                                                            {applicant.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 truncate leading-tight">{applicant.name}</p>
                                                            <p className="text-[10px] text-gray-400 truncate mt-0.5 uppercase tracking-tighter font-black">{applicant.job_posting?.title}</p>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-brandYellow bg-black px-2.5 py-1 rounded-full shrink-0">
                                                            {applicant.tenant?.name?.split(' ')[1] ?? applicant.tenant?.name}
                                                        </span>
                                                    </div>
                                                ))}
                                                {!stats?.recent_global_applicants?.length && (
                                                    <div className="p-10 text-center text-xs text-gray-400 italic">No recent applicants</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Metrics Bar */}
                                <div className="bg-[#0A0A0A] rounded-3xl p-8 flex flex-wrap gap-12 items-center border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brandYellow/5 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity group-hover:opacity-100 opacity-60" />
                                    {[
                                        { label: 'Total Companies', value: stats?.total_tenants ?? '—' },
                                        { label: 'Total Employees', value: stats?.total_employees ?? '—' },
                                        { label: 'Active Pipeline', value: stats?.total_candidates ?? '—' },
                                        { label: 'Group Events', value: stats?.active_events ?? '—' },
                                    ].map((m, i) => (
                                        <React.Fragment key={m.label}>
                                            {i > 0 && <div className="w-px h-12 bg-white/10 hidden sm:block" />}
                                            <div className="relative z-10 w-full sm:w-auto">
                                                <p className="text-brandYellow text-[10px] font-black uppercase tracking-[0.2em] mb-2">{m.label}</p>
                                                <p className="text-white font-black text-4xl tabular-nums tracking-tighter">{m.value}</p>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    <div className="ml-auto flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest relative z-10">
                                        <div className="w-2 h-2 rounded-full bg-brandYellow animate-pulse" />
                                        Live Status: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </main>
            </div>

            {/* Company Detail Panel */}
            {selectedTenant && (
                <CompanyPanel
                    tenant={selectedTenant}
                    allUsers={allUsers}
                    tenants={tenants}
                    onClose={() => {
                        setSelectedTenant(null);
                        if (searchParams.has('company')) {
                            router.replace('/admin/dashboard');
                        }
                    }}
                    onDeleteCompany={item => setDeleteTarget({ type: 'company', item })}
                    onDeleteUser={item => setDeleteTarget({ type: 'user', item })}
                    onUserAdded={handleUserAdded}
                    onUserUpdated={handleUserUpdated}
                    onTenantUpdated={handleTenantUpdated}
                    usersLoading={usersLoading}
                />
            )}

            {showAddCompany && (
                <AddCompanyModal
                    onClose={() => setShowAddCompany(false)}
                    onAdded={handleCompanyAdded}
                />
            )}

            {/* Confirm Delete Dialog */}
            {deleteTarget && (
                <ConfirmDialog
                    title={`Delete ${deleteTarget.type === 'company' ? 'Company' : 'User'}?`}
                    detail={deleteTarget.item.name}
                    warning={deleteTarget.type === 'company' ? '⚠️ Companies with active users cannot be deleted. Remove all users first.' : 'The user will no longer be able to access the system.'}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
                    loading={deleting}
                    error={deleteError}
                    confirmLabel="Confirm Delete"
                    confirmLoadingLabel="Deleting..."
                    confirmColorClass="bg-black text-[#FDF22F] border border-[#FDF22F]/30 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xl shadow-[#FDF22F]/5"
                    icon={<Trash2 size={28} className="text-[#FDF22F]" />}
                />
            )}

            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} />}
        </div>
    );
}

/* ─── Company Admin Dashboard ────────────────────────────── */
function CompanyDashboard({ user }: { user: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/v1/dashboard');
            setStats(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const onLogout = async () => {
        try { await apiFetch('/v1/logout', { method: 'POST' }); } catch (_) { }
        localStorage.removeItem('auth_token'); localStorage.removeItem('user');
        window.location.href = '/';
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname, searchParams]);

    return (
        <div className="min-h-screen bg-[#F5F6FA] flex">
            <AdminSidebar
                user={user}
                tenants={[]}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
                {/* Brand Header */}
                <header className="bg-[#0A0A0A] border-b border-white/5 h-20 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-brandYellow transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>

                        {/* Company Branding */}
                        <div className="flex items-center gap-3 border-r border-white/10 pr-6 mr-2">
                            <div className="w-10 h-10 rounded-xl bg-brandYellow flex items-center justify-center text-[#000000] font-black text-xl shadow-lg shadow-brandYellow/20">
                                D
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-white font-black text-lg tracking-tight leading-none uppercase">Droga Pharma</h1>
                                <p className="text-brandYellow text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">TA Teams Dashboard</p>
                            </div>
                        </div>

                        {/* Horizontal Nav */}
                        <nav className="hidden xl:flex items-center gap-1">
                            {[
                                { label: 'Jobs', tab: 'Jobs' },
                                { label: 'Candidates', tab: 'Candidates' },
                                { label: 'Employees', tab: 'Users' },
                                { label: 'Hiring Plan', tab: 'HiringPlan' },
                                { label: 'Reports', tab: 'Reports' }
                            ].map((item) => {
                                const active = (searchParams.get('tab') === item.tab) || (!searchParams.get('tab') && item.tab === 'Dashboard');
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => router.push(`/admin/dashboard?tab=${item.tab}`)}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${active
                                            ? 'bg-brandYellow text-[#000000] shadow-lg shadow-brandYellow/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-500 text-sm focus-within:border-brandYellow/50 transition-all w-64">
                            <Search size={14} className="text-brandYellow" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-600 w-full font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-brandYellow hover:bg-brandYellow/10 transition-all relative border border-white/5">
                                <Mail size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-brandYellow rounded-full border-2 border-[#0A0A0A]"></span>
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-brandYellow hover:bg-brandYellow/10 transition-all relative border border-white/5">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-brandYellow rounded-full border-2 border-[#0A0A0A]"></span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
                            <div className="w-9 h-9 rounded-full bg-brandYellow flex items-center justify-center text-[#000000] font-black text-xs border-2 border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors">
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 space-y-8 overflow-y-auto">
                    {(() => {
                        const tab = searchParams.get('tab');
                        if (tab === 'Users') return <CompanyUsersView />;
                        if (tab === 'Jobs') return <CompanyJobsView user={user} />;
                        if (tab === 'Candidates') return <CompanyApplicantsView user={user} />;
                        if (tab === 'HiringPlan') return <GlobalRequisitionsView tenants={[]} user={user} />;
                        if (tab === 'Reports') return <GlobalReportsView />;

                        return (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard title="Active Jobs" value={loading ? '—' : (stats?.total_active_jobs ?? 0)} icon={<Briefcase size={14} />} trend={stats?.total_active_jobs_trend} trendLabel={stats?.total_active_jobs_label} />
                                    <StatCard title="Total Candidates" value={loading ? '—' : (stats?.total_candidates ?? 0)} icon={<Users size={14} />} trend={stats?.total_candidates_trend} trendLabel={stats?.total_candidates_label} />
                                    <StatCard title="New Today" value={loading ? '—' : (stats?.new_applications_today ?? 0)} icon={<UserPlus size={14} />} trend={stats?.new_applications_today_trend} trendLabel={stats?.new_applications_today_label} />
                                    <StatCard title="Active Events" value={loading ? '—' : (stats?.active_events ?? 0)} icon={<Calendar size={14} />} trend={stats?.active_events_trend} trendLabel={stats?.active_events_label} />
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-100">
                                            <h2 className="font-bold text-gray-900 text-sm">Recent Applicants ({user.tenant?.name})</h2>
                                        </div>
                                        {loading ? (
                                            <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" /></div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {stats?.recent_applicants?.map((applicant: any) => (
                                                    <div key={applicant.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                                                        <div className="w-10 h-10 rounded-full bg-brandYellow flex items-center justify-center text-[#000000] font-black text-sm shrink-0 shadow-sm border-2 border-white">
                                                            {applicant.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 group-hover:text-brandYellow transition-colors">{applicant.name}</p>
                                                            <p className="text-[10px] text-gray-400 truncate mt-0.5 uppercase tracking-tighter font-black">{applicant.job_posting?.title || 'Unknown Position'}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 tabular-nums">
                                                            {new Date(applicant.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                ))}
                                                {!stats?.recent_applicants?.length && (
                                                    <div className="p-10 text-center text-sm text-gray-400 italic">No applicants yet.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h2 className="font-bold text-gray-900 text-sm mb-4">Pending Requisitions</h2>
                                        <div className="flex items-center justify-between p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                                            <div className="flex items-center gap-3 text-orange-600">
                                                <FileText size={18} />
                                                <span className="font-semibold text-sm">Awaiting Approval</span>
                                            </div>
                                            <span className="text-lg font-black text-orange-700">{loading ? '—' : (stats?.pending_requisitions ?? 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </main>
            </div>
        </div>
    );
}

/* ─── Pagination Component ────────────────────────────── */
function Pagination({ meta, onPageChange, onPerPageChange }: any) {
    if (!meta || meta.last_page <= 1 && meta.total <= 10) return null;

    const { current_page, last_page, from, to, total, per_page } = meta;

    return (
        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Showing <span className="text-gray-700">{from || 0}</span> to <span className="text-gray-700">{to || 0}</span> of <span className="text-gray-700">{total}</span>
                </p>
                <select
                    value={per_page}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-black text-gray-600 focus:outline-none focus:ring-2 focus:ring-brandYellow/30"
                >
                    {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v} / page</option>)}
                </select>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-brandYellow/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight size={14} className="rotate-180" />
                </button>

                {(() => {
                    const half = 2;
                    let start = Math.max(1, current_page - half);
                    let end = Math.min(last_page, current_page + half);
                    // Ensure we always show up to 5 pages
                    if (end - start < 4) {
                        if (start === 1) end = Math.min(last_page, start + 4);
                        else start = Math.max(1, end - 4);
                    }
                    const pages: number[] = [];
                    for (let p = start; p <= end; p++) pages.push(p);
                    return pages.map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${current_page === pageNum ? 'bg-brandYellow text-[#000000] shadow-lg shadow-brandYellow/20' : 'text-gray-500 hover:text-brandYellow hover:bg-black/5'}`}
                        >
                            {pageNum}
                        </button>
                    ));
                })()}

                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-brandYellow/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

/* ─── Sub-Views ──────────────────────────────────────────── */

function GlobalUsersView() {
    const [users, setUsers] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/v1/global-users?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`);
            setUsers(data?.data || []);
            setMeta(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900">System Users</h2>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#000000]/20 w-64 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Company</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandYellow mx-auto shadow-sm" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-xs text-gray-400 italic">No users found.</td></tr>
                            ) : (
                                users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-brandYellow flex items-center justify-center text-[#000000] font-black text-xs uppercase shadow-sm border-2 border-white group-hover:shadow-md transition-all">{u.name.charAt(0)}</div>
                                                <span className="font-bold text-gray-800 text-sm group-hover:text-brandYellow transition-colors">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[9px] font-black text-gray-500 uppercase tracking-wider">
                                                {u.roles?.[0]?.name || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.tenant ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {u.tenant?.name || 'Group Admin'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />}
            </div>
        </div>
    );
}

function CompanyUsersView() {
    const [users, setUsers] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/v1/team-users?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`);
            setUsers(data?.data || []);
            setMeta(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Team Members</h2>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search team..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-3 text-left">Member</th>
                                <th className="px-6 py-3 text-right">Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={2} className="p-10 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto" /></td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={2} className="p-10 text-center text-xs text-gray-400 italic">No members found.</td></tr>
                            ) : (
                                users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-sm">{u.name.charAt(0)}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 text-sm">{u.name}</span>
                                                    <span className="text-[10px] text-gray-400">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[9px] font-black text-blue-500 uppercase tracking-wider">
                                                {u.roles?.[0]?.name || 'Member'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />}
            </div>
        </div>
    );
}

function CompanyJobsView({ user }: { user: any }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/v1/jobs?page=${page}&per_page=${perPage}`).then(data => {
            setJobs(data?.data || []);
            setMeta(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [page, perPage]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Active Job Postings</h2>
            </div>
            {loading ? (
                <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandYellow mx-auto shadow-sm" /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Position</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Department</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {jobs.map((j: any) => (
                                <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{j.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{j.department || j.requisition?.department || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{j.location || '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-[10px] font-black text-green-600 uppercase tracking-wider border border-green-100">
                                            {j.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination
                        meta={meta}
                        onPageChange={setPage}
                        onPerPageChange={setPerPage}
                    />
                </div>
            )}
        </div>
    );
}

function CompanyApplicantsView({ user }: { user: any }) {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
                search: search,
                status: status
            });
            const data = await apiFetch(`/v1/applicants?${params.toString()}`);
            setApplicants(data?.data || []);
            setMeta(data);
        } catch (err) {
            console.error('Failed to fetch applicants:', err);
        } finally {
            setLoading(false);
        }
    }, [page, perPage, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplicants();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchApplicants]);

    const statusColors: Record<string, string> = {
        'new': 'bg-gray-100 text-gray-500',
        'under_review': 'bg-blue-100 text-blue-700',
        'shortlisted': 'bg-amber-100 text-amber-700',
        'interview': 'bg-purple-100 text-purple-700',
        'offer': 'bg-emerald-100 text-emerald-700',
        'hired': 'bg-green-100 text-green-700',
        'rejected': 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-black text-gray-900 text-sm">Talent Pipeline</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.tenant?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 transition-all"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); setPage(1); }}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">All Statuses</option>
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                {['Candidate', 'Position', 'Applied Date', 'Pipeline Status'].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandYellow mx-auto shadow-sm" /></td></tr>
                            ) : applicants.length === 0 ? (
                                <tr><td colSpan={4} className="p-12 text-center text-xs text-gray-400 italic">No candidates found matching your criteria.</td></tr>
                            ) : (
                                applicants.map((a: any) => (
                                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brandYellow border-2 border-white shadow-sm flex items-center justify-center text-[#000000] font-black text-xs uppercase">
                                                    {a.name?.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm leading-none mb-1">{a.name}</span>
                                                    <span className="text-[11px] text-gray-400">{a.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{a.job_posting?.title || '—'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{a.job_posting?.department || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-800">{new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${statusColors[a.status] || 'bg-gray-50 text-gray-400'}`}>
                                                {a.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />}
            </div>
        </div>
    );
}

/* ─── Global Jobs View ───────────────────────────────────── */
function GlobalJobsView({ tenants }: { tenants: any[] }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterTenant, setFilterTenant] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        const params = new URLSearchParams();
        if (filterTenant) params.set('tenant_id', filterTenant);
        if (filterStatus) params.set('status', filterStatus);
        params.set('page', page.toString());
        params.set('per_page', perPage.toString());

        setLoading(true);
        apiFetch(`/v1/admin/jobs?${params.toString()}`).then(data => {
            setJobs(data?.data || []);
            setMeta(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [filterTenant, filterStatus, page, perPage]);

    const statusColor: Record<string, string> = {
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        closed: 'bg-gray-100 text-gray-500 border-gray-200',
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-black text-gray-900 flex-1">{tenants.length > 0 ? 'Live Job Openings — All Companies' : 'Live Job Openings'}</h2>
                {tenants.length > 0 && (
                    <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow/50 font-bold text-gray-700 bg-white shadow-sm" value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
                        <option value="">All Companies</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                )}
                <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow/50 font-bold text-gray-700 bg-white shadow-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                </select>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandYellow" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Position', 'Company', 'Department', 'Location', 'Status', 'Applicants'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {jobs.length === 0 && (
                                    <tr><td colSpan={6} className="p-10 text-center text-sm text-gray-400 italic">No job postings found.</td></tr>
                                )}
                                {jobs.map((j: any) => (
                                    <tr key={j.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-semibold text-gray-800 text-sm">{j.title}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded bg-brandYellow text-[#000000] font-black text-[10px] flex items-center justify-center shadow-sm">{j.tenant?.name?.charAt(0)}</span>
                                                <span className="text-sm text-gray-600">{j.tenant?.name}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">{j.department || j.requisition?.department || '—'}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500">{j.location || '—'}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor[j.status] || statusColor.closed}`}>
                                                {j.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-gray-700 tabular-nums">{j.applicants_count ?? 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination
                            meta={meta}
                            onPageChange={setPage}
                            onPerPageChange={setPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Global Requisitions View ────────────────────────────── */
function GlobalRequisitionsView({ tenants, user }: { tenants: any[]; user?: any }) {
    const [reqs, setReqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTenant, setFilterTenant] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [actionLoading, setActionLoading] = useState<number | false>(false);
    const [showAmendModal, setShowAmendModal] = useState<any>(null);
    const [amendmentComment, setAmendmentComment] = useState('');

    const fetchReqs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterTenant) params.set('tenant_id', filterTenant);
            if (filterStatus) params.set('status', filterStatus);
            const data = await apiFetch(`/v1/requisitions?${params.toString()}`);
            setReqs(data?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filterTenant, filterStatus]);

    useEffect(() => {
        fetchReqs();
    }, [fetchReqs]);

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await apiFetch(`/v1/requisitions/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'approved' }),
            });
            fetchReqs();
        } catch (e: any) {
            alert(e.message || "Failed to approve requisition");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAmend = async () => {
        if (!showAmendModal || !amendmentComment.trim()) return;
        setActionLoading(showAmendModal.id);
        try {
            await apiFetch(`/v1/requisitions/${showAmendModal.id}/amend`, {
                method: 'POST',
                body: JSON.stringify({ comment: amendmentComment }),
            });
            setShowAmendModal(null);
            setAmendmentComment('');
            fetchReqs();
        } catch (e: any) {
            alert(e.message || "Failed to send for amendment");
        } finally {
            setActionLoading(false);
        }
    };

    const isMD = user?.roles?.some((r: any) => r.slug === 'managing_director');
    const isHR = user?.roles?.some((r: any) => r.slug === 'hr_manager');
    const isAdmin = user?.roles?.some((r: any) => r.slug === 'admin');

    const statusColor: Record<string, string> = {
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        pending_md: 'bg-amber-50 text-amber-600 border-amber-100',
        pending_hr: 'bg-blue-50 text-blue-600 border-blue-100',
        amendment_required: 'bg-purple-50 text-purple-600 border-purple-100',
        rejected: 'bg-red-50 text-red-500 border-red-100',
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-black text-gray-900 flex-1">{tenants.length > 0 ? 'Hiring Plan — All Companies' : 'Hiring Plan'}</h2>
                {tenants.length > 0 && (
                    <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow/50 font-bold text-gray-700 bg-white shadow-sm" value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
                        <option value="">All Companies</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                )}
                <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow/50 font-bold text-gray-700 bg-white shadow-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending_md">Pending MD Approval</option>
                    <option value="pending_hr">Pending HR Approval</option>
                    <option value="amendment_required">Amendment Needed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-black">
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandYellow" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Requisition', 'Company', 'Department', 'Requester', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reqs.length === 0 && (
                                    <tr><td colSpan={6} className="p-10 text-center text-sm text-gray-400 italic">No requisitions found.</td></tr>
                                )}
                                {reqs.map((req: any) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800 text-sm">{req.title}</span>
                                                <span className="text-[10px] text-gray-400">REQ{String(req.id).padStart(4, '0')}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-600 font-medium">{req.tenant?.name || '—'}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">{req.department}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">{req.requester?.name || '—'}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border text-center ${statusColor[req.status] || 'border-gray-200'}`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                                {req.status === 'amendment_required' && req.amendment_comment && (
                                                    <p className="text-[10px] text-purple-500 italic max-w-[150px] truncate" title={req.amendment_comment}>&quot;{req.amendment_comment}&quot;</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                {/* MD Actions */}
                                                {(isAdmin || isMD) && req.status === 'pending_md' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req.id)}
                                                            disabled={actionLoading === req.id}
                                                            className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition shadow-sm"
                                                        >
                                                            {actionLoading === req.id ? '...' : <Check size={12} />} Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setShowAmendModal(req)}
                                                            className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-100 transition shadow-sm"
                                                        >
                                                            Amend
                                                        </button>
                                                    </>
                                                )}

                                                {/* HR Actions */}
                                                {(isAdmin || isHR) && req.status === 'pending_hr' && (
                                                    <button
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={actionLoading === req.id}
                                                        className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition shadow-sm"
                                                    >
                                                        {actionLoading === req.id ? '...' : <CheckCircle2 size={12} />} Final Approve
                                                    </button>
                                                )}

                                                {req.status === 'approved' && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase"><CheckCircle2 size={12} /> Ready to Post</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Amendment Modal */}
            {showAmendModal && (
                <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
                            <div>
                                <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest mb-1">Feedback Loop</p>
                                <h3 className="font-black text-gray-900 text-xl tracking-tight">Request Amendments</h3>
                            </div>
                            <button onClick={() => setShowAmendModal(null)} className="text-gray-400 hover:text-gray-700 transition p-2 hover:bg-white rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <p className="text-xs text-gray-500 font-medium mb-4 leading-relaxed">
                                Provide feedback to the <strong>General Manager</strong> regarding this requisition for &quot;{showAmendModal.title}&quot;. This will unlock the requisition for editing.
                            </p>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mandatory Feedback 💬</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all h-32 resize-none placeholder:text-gray-300 font-medium"
                                placeholder="e.g. Please adjust the salary range, or the role should be onsite..."
                                value={amendmentComment}
                                onChange={e => setAmendmentComment(e.target.value)}
                            />
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setShowAmendModal(null)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAmend}
                                    disabled={!amendmentComment.trim() || actionLoading === showAmendModal.id}
                                    className="flex-1 py-4 bg-[#0A0A0A] text-brandYellow text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brandYellow/10 border border-white/5 disabled:opacity-50"
                                >
                                    {actionLoading === showAmendModal.id ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Global Applicants View ─────────────────────────────── */
function GlobalApplicantsView({ tenants }: { tenants: any[] }) {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filterTenant, setFilterTenant] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [resetTarget, setResetTarget] = useState<any | null>(null);
    const [resetting, setResetting] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetCredentials, setResetCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
                tenant_id: filterTenant,
                status: filterStatus,
                search: search
            });
            const data = await apiFetch(`/v1/applicants?${params.toString()}`);
            setApplicants(data?.data || []);
            setMeta(data);
        } catch (err) {
            showToast('Failed to load applicants.', 'error');
        } finally {
            setLoading(false);
        }
    }, [page, perPage, filterTenant, filterStatus, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplicants();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchApplicants]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            await apiFetch(`/v1/admin/applicants/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            showToast('Status updated successfully.');
        } catch { showToast('Failed to update status.', 'error'); }
        finally { setUpdatingId(null); }
    };

    const executeDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true); setDeleteError('');
        try {
            await apiFetch(`/v1/admin/applicants/${deleteTarget.id}`, { method: 'DELETE' });
            setApplicants(prev => prev.filter(a => a.id !== deleteTarget.id));
            showToast('Applicant deleted successfully.');
            setDeleteTarget(null);
        } catch (err: any) {
            setDeleteError(err.message || 'Failed to delete applicant.');
        } finally { setDeleting(false); }
    };

    const executeResetPassword = async () => {
        if (!resetTarget) return;
        setResetting(true); setResetError('');
        try {
            const res = await apiFetch(`/v1/admin/applicants/${resetTarget.id}/reset-password`, { method: 'POST' });
            if (res?.generated_password) {
                setResetCredentials({
                    name: resetTarget.name,
                    email: resetTarget.email,
                    pass: res.generated_password
                });
                setResetTarget(null);
            }
        } catch (err: any) {
            setResetError(err.message || 'Failed to reset password.');
        } finally { setResetting(false); }
    };

    const statusColors: Record<string, string> = {
        'under_review': 'bg-blue-50 text-blue-600 border-blue-100',
        'shortlisted': 'bg-amber-50 text-amber-600 border-amber-100',
        'interview': 'bg-purple-50 text-purple-600 border-purple-100',
        'hired': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'rejected': 'bg-red-50 text-red-500 border-red-100',
        'new': 'bg-gray-50 text-gray-500 border-gray-100',
    };

    return (
        <div className="space-y-4">
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <h2 className="font-black text-gray-900 text-lg">Applicants Pipeline</h2>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Global Talent Management</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#000000]/20 w-64 transition-all"
                        />
                    </div>
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#000000]/20"
                        value={filterTenant}
                        onChange={e => { setFilterTenant(e.target.value); setPage(1); }}
                    >
                        <option value="">All Companies</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select
                        className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-[#000000]/20"
                        value={filterStatus}
                        onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                {['Candidate', 'Position', 'Company', 'Applied Date', 'Status Action', ''].map(h => (
                                    <th key={h} className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-16 text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brandYellow mx-auto shadow-sm" /></td></tr>
                            ) : applicants.length === 0 ? (
                                <tr><td colSpan={5} className="p-16 text-center text-sm text-gray-400 italic">No applicants found matching your criteria.</td></tr>
                            ) : (
                                applicants.map((a: any) => (
                                    <tr key={a.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brandYellow border-2 border-white shadow-sm flex items-center justify-center text-[#000000] font-black text-xs uppercase group-hover:shadow-md transition-all">
                                                    {a.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-none mb-1">{a.name}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{a.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-[180px]">
                                                <p className="text-sm font-semibold text-gray-700 truncate">{a.job_posting?.title || '—'}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">{a.job_posting?.department || 'General'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                            <span className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-brandYellow shadow-[0_0_5px_rgba(253,242,47,0.5)]" />
                                                {a.tenant?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-800">{new Date(a.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {updatingId === a.id && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#000000]" />}
                                                <select
                                                    value={a.status}
                                                    onChange={e => handleStatusChange(a.id, e.target.value)}
                                                    disabled={updatingId === a.id}
                                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-transparent focus:ring-2 focus:ring-brandYellow/50 cursor-pointer transition-all ${statusColors[a.status] || 'bg-gray-100 text-gray-500'}`}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="under_review">Under Review</option>
                                                    <option value="shortlisted">Shortlisted</option>
                                                    <option value="interview">Interview</option>
                                                    <option value="offer">Offer Sent</option>
                                                    <option value="hired">Hired ✅</option>
                                                    <option value="rejected">Rejected ❌</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setResetTarget(a)}
                                                    className="p-2 text-gray-400 hover:text-black hover:bg-brandYellow rounded-xl transition-all"
                                                    title="Reset Portal Password"
                                                >
                                                    <Key size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(a)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Applicant"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />}
            </div>

            {resetCredentials && (
                <CredentialCard
                    credentials={resetCredentials}
                    onClose={() => setResetCredentials(null)}
                    title="Applicant Password Reset"
                    subtitle="Account portal credentials have been refreshed."
                />
            )}

            {resetTarget && (
                <ConfirmDialog
                    title="Reset Applicant Password"
                    detail={`Generate a new secure portal password for ${resetTarget.name}?`}
                    warning="The applicant will need these new credentials to access their status portal."
                    onConfirm={executeResetPassword}
                    onCancel={() => setResetTarget(null)}
                    loading={resetting}
                    error={resetError}
                    confirmLabel="Reset Password"
                    confirmLoadingLabel="Resetting..."
                    confirmColorClass="bg-brandYellow text-black border border-brandYellow/50 hover:bg-black hover:text-brandYellow transition-all"
                    icon={<Key size={32} className="text-brandYellow" />}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Applicant Record"
                    detail={`Are you sure you want to remove ${deleteTarget.name}?`}
                    warning="This will permanently delete their application, interview history, and documents. This action cannot be reversed."
                    onConfirm={executeDelete}
                    onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
                    loading={deleting}
                    error={deleteError}
                    confirmLabel="Confirm Delete"
                    confirmLoadingLabel="Deleting..."
                    confirmColorClass="bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-500/10"
                    icon={<Trash2 size={28} className="text-red-500" />}
                />
            )}
        </div>
    );
}

/* ─── Global Interviews View ─────────────────────────────── */
function GlobalInterviewsView({ tenants }: { tenants: any[] }) {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterTenant, setFilterTenant] = useState('');

    const fetchInterviews = (tenantId = '') => {
        setLoading(true);
        const params = tenantId ? `?tenant_id=${tenantId}` : '';
        apiFetch(`/v1/admin/interviews${params}`).then(data => {
            setInterviews(Array.isArray(data) ? data : []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchInterviews(filterTenant); }, [filterTenant]);

    const statusColors: Record<string, string> = {
        scheduled: 'bg-blue-50 text-blue-600 border-blue-100',
        completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        cancelled: 'bg-red-50 text-red-500 border-red-100',
    };

    const typeIcons: Record<string, string> = { phone: '📞', video: '🎥', 'in-person': '🤝' };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-black text-gray-900 flex-1">Interview Schedule — All Companies</h2>
                <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandYellow/50 font-bold text-gray-700 bg-white shadow-sm" value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
                    <option value="">All Companies</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brandYellow" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Candidate', 'Position', 'Company', 'Interviewer', 'Date & Time', 'Type', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {interviews.length === 0 && (
                                    <tr><td colSpan={7} className="p-10 text-center text-sm text-gray-400 italic">No interviews scheduled yet.</td></tr>
                                )}
                                {interviews.map((iv: any) => (
                                    <tr key={iv.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-gray-800 text-sm">{iv.applicant?.name}</p>
                                            <p className="text-[11px] text-gray-400">{iv.applicant?.email}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-600">{iv.applicant?.job_posting?.title || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{iv.tenant?.name || '—'}</td>
                                        <td className="px-4 py-3.5 text-sm text-gray-600">{iv.interviewer?.name || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-sm font-semibold text-gray-800">{new Date(iv.scheduled_at).toLocaleDateString()}</p>
                                            <p className="text-[11px] text-gray-400">{new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm">{typeIcons[iv.type] || '—'} {iv.type}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[iv.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {iv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}


/* ─── Global Reports View ────────────────────────────────── */
function GlobalReportsView() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/v1/admin/reports').then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const maxDays = data?.tenants?.reduce((m: number, t: any) => Math.max(m, t.avg_days_to_hire || 0), 1) || 1;
    const maxHired = data?.tenants?.reduce((m: number, t: any) => Math.max(m, t.hired_count || 0), 1) || 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-black text-gray-900">Reports & Analytics</h2>
            </div>

            {/* Global Funnel */}
            {data?.global_funnel && (
                <div className="bg-[#0A0A0A] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brandYellow/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brandYellow/10 transition-colors" />
                    <p className="text-brandYellow text-[10px] font-black uppercase tracking-[0.2em] mb-6 relative z-10">Global Hiring Funnel</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            { label: 'Applied', value: data.global_funnel.total_applied, color: 'text-white' },
                            { label: 'Shortlisted', value: data.global_funnel.total_shortlisted, color: 'text-brandYellow' },
                            { label: 'Interview', value: data.global_funnel.total_interview, color: 'text-purple-400' },
                            { label: 'Hired', value: data.global_funnel.total_hired, color: 'text-emerald-400' },
                            { label: 'Rejected', value: data.global_funnel.total_rejected, color: 'text-red-400' },
                        ].map((s, i) => (
                            <React.Fragment key={s.label}>
                                {i > 0 && <div className="hidden sm:block w-px bg-white/10 self-stretch mx-2" />}
                                <div className="text-center relative z-10">
                                    <p className={`text-4xl font-black tabular-nums transition-transform group-hover:scale-110 duration-500 ${s.color}`}>{s.value ?? 0}</p>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">{s.label}</p>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* Time-to-Hire Leaderboard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">⏱ Time-to-Hire per Company</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Lower is better — shows average days from application to hire</p>
                </div>
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000000]" /></div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {(!data?.tenants || data.tenants.length === 0) && (
                            <div className="p-10 text-center text-sm text-gray-400 italic">No report data available yet.</div>
                        )}
                        {data?.tenants?.map((t: any, i: number) => (
                            <div key={t.id} className="px-6 py-5 flex items-center gap-5 hover:bg-gray-50/50 transition-colors group">
                                <span className="text-[11px] font-black text-gray-300 w-5 group-hover:text-brandYellow transition-colors">#{i + 1}</span>
                                <div className="w-10 h-10 rounded-xl bg-brandYellow flex items-center justify-center text-[#000000] font-black text-sm shrink-0 shadow-sm">{t.name?.charAt(0)}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm group-hover:text-brandYellow transition-colors">{t.name}</p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                                            <div className="h-2 rounded-full bg-brandYellow shadow-[0_0_10px_rgba(253,242,47,0.3)]" style={{ width: `${Math.min(100, ((t.hired_count || 0) / maxHired) * 100)}%` }} />
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tabular-nums shrink-0">{t.hired_count || 0} hired</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 px-4 border-l border-gray-100">
                                    <p className="font-black text-gray-900 text-xl tabular-nums tracking-tighter">{t.avg_days_to_hire != null ? `${t.avg_days_to_hire}d` : '—'}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Avg Time</p>
                                </div>
                                <div className="text-right shrink-0 w-24">
                                    <p className="font-black text-brandYellow bg-black px-2 py-1 rounded-lg inline-block text-[11px] tabular-nums">{t.conversion_rate}%</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Hire Rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Global Events View ─────────────────────────────────── */
function GlobalEventsView({ tenants }: { tenants: any[] }) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/v1/global-events');
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div className="space-y-4">
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-black text-gray-900 text-lg">Company Events & Comms</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage events and broadcast notifications to sister companies.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-brandYellow text-[#000000] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-brandYellow/10 hover:scale-[1.02] active:scale-95"
                >
                    <Calendar size={16} strokeWidth={3} /> Create Event
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#000000]" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/60">
                                    {['Event', 'Target Company', 'Date', 'Location', 'Status'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {events.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-sm text-gray-400 italic">No events found. Start by creating one!</td></tr>
                                ) : events.map(event => (
                                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><Calendar size={18} /></div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{event.title}</p>
                                                    <p className="text-[11px] text-gray-400 line-clamp-1">{event.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-[#000000]/10 text-[#000000] font-black text-[10px] flex items-center justify-center">{event.tenant?.name?.charAt(0)}</div>
                                                <span className="text-sm text-gray-600 font-medium">{event.tenant?.name || 'Global'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{new Date(event.event_date).toLocaleDateString()}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{event.location || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${event.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                event.status === 'ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreate && <CreateEventModal tenants={tenants} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchEvents(); showToast('Event created and notifications sent!'); }} />}
        </div>
    );
}

/* ─── Create Event Modal ─────────────────────────────────── */
function CreateEventModal({ tenants, onClose, onCreated }: { tenants: any[]; onClose: () => void; onCreated: () => void }) {
    const [form, setForm] = useState({ tenant_id: '', title: '', description: '', event_date: '', location: '', status: 'upcoming' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true); setError('');

        try {
            await apiFetch('/v1/global-events', {
                method: 'POST',
                body: JSON.stringify(form)
            });
            onCreated();
        } catch (err: any) { setError(err.message || 'Failed to create event.'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-[#000000]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div>
                        <p className="text-[10px] font-black text-[#000000] uppercase tracking-widest">Global Comms</p>
                        <h3 className="font-black text-gray-900 text-xl">Create New Event</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition p-2 hover:bg-white rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">{error}</div>}

                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Target Company</label>
                            <select required className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none transition-all"
                                value={form.tenant_id} onChange={e => setForm({ ...form, tenant_id: e.target.value })}>
                                <option value="">Select a company...</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Event Title</label>
                            <input required type="text" placeholder="e.g. Annual Tech Summit 2026"
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none transition-all"
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Description & Purpose</label>
                        <textarea rows={3} placeholder="Describe the event and why it's important..."
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none transition-all resize-none"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Event Date & Time</label>
                            <input required type="datetime-local"
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none transition-all"
                                value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Location</label>
                            <input type="text" placeholder="e.g. Hilton Addis / Virtual"
                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#000000] focus:border-transparent outline-none transition-all"
                                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 rounded-2xl transition-all">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-4 bg-brandYellow text-[#000000] text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brandYellow/10 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all">
                            {submitting ? 'Creating...' : 'Broadcast Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Page Wrapper for Suspense ──────────────────────────── */
export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#000000]" /></div>}>
            <Dashboard />
        </Suspense>
    );
}

