import React, { useState, useEffect } from 'react';
import AdminLayout from './layout/layout';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BriefcaseIcon,
  StarIcon,
  DocumentTextIcon,
  LinkIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline";
import { useUsers, useInstructorRequests } from './hooks/useUsers';
import type { UserResponse, InstructorRequest } from './models/user.model';

const ITEMS_PER_PAGE = 10;

export default function AdminManageUser() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'all' | 'student' | 'instructor' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null);

    const { users, isLoading, banUser } = useUsers();
    const { requests, isLoading: isRequestsLoading, approveRequest } = useInstructorRequests();

    const [currentPage, setCurrentPage] = useState(1);

    const [confirmAction, setConfirmAction] = useState<{ user: UserResponse; isBanning: boolean } | null>(null);
    const [isBanLoading, setIsBanLoading] = useState(false);

    const [approveConfirm, setApproveConfirm] = useState<{ request: InstructorRequest; isApproved: boolean } | null>(null);
    const [isApproveLoading, setIsApproveLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (approveConfirm && !isApproveLoading) { setApproveConfirm(null); return; }
            if (confirmAction && !isBanLoading) { setConfirmAction(null); return; }
            if (selectedRequest) { setSelectedRequest(null); return; }
            if (selectedUser) { setSelectedUser(null); return; }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [confirmAction, isBanLoading, selectedUser, approveConfirm, isApproveLoading, selectedRequest]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

    const handleToggleStatus = (user: UserResponse) => {
        setConfirmAction({ user, isBanning: !user.isBanned });
    };

    const handleConfirmBan = async () => {
        if (!confirmAction) return;
        setIsBanLoading(true);
        await banUser(confirmAction.user.id, confirmAction.isBanning);
        setIsBanLoading(false);
        setConfirmAction(null);
    };

    const handleApproveRequest = (request: InstructorRequest, isApproved: boolean) => {
        setApproveConfirm({ request, isApproved });
    };

    const handleConfirmApprove = async () => {
        if (!approveConfirm) return;
        setIsApproveLoading(true);
        const { isApproved } = approveConfirm;
        const title = 'Yêu cầu trở thành giảng viên';
        const message = isApproved
            ? 'Yêu cầu trở thành giảng viên của bạn đã được chấp thuận. Chào mừng bạn trở thành giảng viên!'
            : 'Yêu cầu trở thành giảng viên của bạn đã bị từ chối.';
        await approveRequest(approveConfirm.request.requestId || approveConfirm.request.id, isApproved, title, message);
        setIsApproveLoading(false);
        setApproveConfirm(null);
        setSelectedRequest(null);
    };

    const filteredUsers = users.filter(user => {
        const userRole = user.role.toLowerCase();
        const matchesTab = activeTab === 'all' || userRole === activeTab;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
            user.fullName.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q) ||
            user.userName.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
    });

    const filteredRequests = requests.filter(req => {
        const q = searchTerm.toLowerCase();
        return (
            req.fullName.toLowerCase().includes(q) ||
            req.email.toLowerCase().includes(q) ||
            req.expertise.toLowerCase().includes(q)
        );
    });

    const stats = {
        all: users.length,
        instructor: users.filter(u => u.role.toLowerCase() === 'instructor').length,
        pending: requests.length
    };

    useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

    const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const totalRequestPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const initials = (name: string) =>
        name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

    return (
        <AdminLayout>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{t('admin.manageUsers.title')}</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('admin.manageUsers.searchUsers')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#5a2dff] sm:w-72"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex space-x-2 rounded-xl bg-gray-100 p-1 w-fit">
                    {([
                        { key: 'all', label: t('admin.manageUsers.tabs.all'), icon: <UserGroupIcon className="h-4 w-4" />, count: stats.all, countClass: 'bg-gray-200 text-gray-600' },
                        { key: 'instructor', label: t('admin.manageUsers.tabs.instructor'), icon: <AcademicCapIcon className="h-4 w-4" />, count: stats.instructor, countClass: 'bg-purple-100 text-purple-600' },
                        { key: 'pending', label: t('admin.manageUsers.tabs.pending'), icon: <ClockIcon className="h-4 w-4" />, count: stats.pending, countClass: 'bg-orange-100 text-orange-600' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.key ? 'bg-white text-[#5a2dff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {(tab.key !== 'pending' || tab.count > 0) && (
                                <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${tab.countClass}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Users Table */}
                {activeTab !== 'pending' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gradient-to-r from-[#f7f9fc] to-[#faf8ff] border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.user')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.role')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.username')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.joinDate')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.status')}</th>
                                        <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                                                        <div className="space-y-1.5">
                                                            <div className="h-3 w-32 rounded bg-gray-200" />
                                                            <div className="h-2.5 w-24 rounded bg-gray-100" />
                                                        </div>
                                                    </div>
                                                </td>
                                                {Array.from({ length: 4 }).map((_, j) => (
                                                    <td key={j} className="px-6 py-4"><div className="h-3 w-20 rounded bg-gray-200" /></td>
                                                ))}
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <div className="h-8 w-8 rounded-lg bg-gray-200" />
                                                        <div className="h-8 w-8 rounded-lg bg-gray-200" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredUsers.length > 0 ? (
                                        paginatedUsers.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent group-hover:ring-[#5a2dff]/20 transition-all duration-200">
                                                            <img src={user.avatarUrl} alt={user.fullName} loading="lazy" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 group-hover:text-[#5a2dff] transition-colors">{user.fullName}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                                                        user.role.toLowerCase() === 'instructor' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 ring-1 ring-purple-200' : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                    }`}>
                                                        {user.role.toLowerCase() === 'instructor' ? t('admin.manageUsers.roles.instructor') : t('admin.manageUsers.roles.student')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 font-medium">{user.userName}</td>
                                                <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(user.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                                                        !user.isBanned ? 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 ring-1 ring-green-200' : 'bg-gradient-to-r from-red-100 to-rose-50 text-red-700 ring-1 ring-red-200'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${!user.isBanned ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {!user.isBanned ? t('admin.manageUsers.status.active') : t('admin.manageUsers.status.banned')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:scale-110"
                                                            title={t('admin.manageUsers.actions.viewDetails')}
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200 hover:scale-110 ${
                                                                !user.isBanned ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            }`}
                                                            title={!user.isBanned ? t('admin.manageUsers.actions.banUser') : t('admin.manageUsers.actions.unbanUser')}
                                                        >
                                                            {!user.isBanned ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="relative mb-4">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-[#5a2dff]/10 to-purple-500/10 blur-2xl rounded-full" />
                                                        <div className="relative rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-inner">
                                                            <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
                                                        </div>
                                                    </div>
                                                    <p className="text-base font-semibold text-gray-600 mb-1">{t('admin.manageUsers.empty.noUsers')}</p>
                                                    <p className="text-sm text-gray-400">{t('admin.manageUsers.empty.changeSearch')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination current={currentPage} total={totalUserPages} totalItems={filteredUsers.length} itemLabel={t('admin.manageUsers.pagination.users')} onChange={setCurrentPage} />
                    </div>
                )}

                {/* Instructor Requests Table */}
                {activeTab === 'pending' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gradient-to-r from-[#f7f9fc] to-[#faf8ff] border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.requestLabels.applicant')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.requestLabels.expertise')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.requestLabels.experience')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.requestLabels.submitDate')}</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.requestLabels.status')}</th>
                                        <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-600">{t('admin.manageUsers.tableHeaders.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {isRequestsLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                                                        <div className="space-y-1.5">
                                                            <div className="h-3 w-32 rounded bg-gray-200" />
                                                            <div className="h-2.5 w-24 rounded bg-gray-100" />
                                                        </div>
                                                    </div>
                                                </td>
                                                {Array.from({ length: 3 }).map((_, j) => (
                                                    <td key={j} className="px-6 py-4"><div className="h-3 w-20 rounded bg-gray-200" /></td>
                                                ))}
                                                <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-gray-200" /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <div className="h-8 w-16 rounded-lg bg-gray-200" />
                                                        <div className="h-8 w-16 rounded-lg bg-gray-200" />
                                                        <div className="h-8 w-16 rounded-lg bg-gray-200" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredRequests.length > 0 ? (
                                        paginatedRequests.map((req) => (
                                            <tr key={req.id} className="group hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-amber-50/30 transition-all duration-200">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5a2dff] to-purple-500 text-sm font-bold text-white shadow-md shadow-[#5a2dff]/20 ring-2 ring-transparent group-hover:ring-[#5a2dff]/20 transition-all duration-200">
                                                            {initials(req.fullName)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 group-hover:text-[#5a2dff] transition-colors">{req.fullName}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{req.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="max-w-[160px] truncate text-gray-700 font-medium" title={req.expertise}>{req.expertise || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="max-w-[160px] truncate text-gray-600 text-sm" title={req.experience}>{req.experience || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">{formatDate(req.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-50 px-3 py-1 text-xs font-medium text-orange-700 shadow-sm ring-1 ring-orange-200">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                        {t('admin.manageUsers.status.pending')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setSelectedRequest(req)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:scale-110"
                                                            title={t('admin.manageUsers.actions.viewDetails')}
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveRequest(req, true)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-600 transition-all duration-200 hover:bg-green-100 hover:scale-110"
                                                            title={t('admin.manageUsers.actions.approve')}
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveRequest(req, false)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-all duration-200 hover:bg-red-100 hover:scale-110"
                                                            title={t('admin.manageUsers.actions.reject')}
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="relative mb-4">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 blur-2xl rounded-full" />
                                                        <div className="relative rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-inner">
                                                            <ClockIcon className="h-10 w-10 text-gray-300" />
                                                        </div>
                                                    </div>
                                                    <p className="text-base font-semibold text-gray-600 mb-1">{t('admin.manageUsers.empty.noPendingRequests')}</p>
                                                    <p className="text-sm text-gray-400">{t('admin.manageUsers.empty.allProcessed')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination current={currentPage} total={totalRequestPages} totalItems={filteredRequests.length} itemLabel={t('admin.manageUsers.pagination.requests')} onChange={setCurrentPage} />
                    </div>
                )}
            </div>

            {/* ── Ban/Unban Modal ── */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-7 flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 ring-4 ring-purple-100/50">
                                <ExclamationTriangleIcon className="h-9 w-9 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {confirmAction.isBanning ? t('admin.manageUsers.modals.banUser') : t('admin.manageUsers.modals.unbanUser')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                {confirmAction.isBanning
                                    ? t('admin.manageUsers.modals.banConfirm', { name: confirmAction.user.fullName })
                                    : t('admin.manageUsers.modals.unbanConfirm', { name: confirmAction.user.fullName })
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirmAction(null)} disabled={isBanLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 disabled:opacity-50">
                                    {t('admin.manageUsers.modals.cancel')}
                                </button>
                                <button onClick={handleConfirmBan} disabled={isBanLoading}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#4a20ef] hover:to-[#6b3def] shadow-lg shadow-purple-500/30 focus:ring-2 focus:ring-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isBanLoading ? t('admin.manageUsers.modals.processing') : confirmAction.isBanning ? t('admin.manageUsers.modals.banNow') : t('admin.manageUsers.modals.unbanNow')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Approve/Reject Confirmation Modal ── */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-7 flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 ring-4 ring-purple-100/50">
                                <ExclamationTriangleIcon className="h-9 w-9 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {approveConfirm.isApproved ? t('admin.manageUsers.modals.approveRequest') : t('admin.manageUsers.modals.rejectRequest')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                {approveConfirm.isApproved
                                    ? t('admin.manageUsers.modals.approveConfirm', { name: approveConfirm.request.fullName })
                                    : t('admin.manageUsers.modals.rejectConfirm', { name: approveConfirm.request.fullName })
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setApproveConfirm(null)} disabled={isApproveLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 disabled:opacity-50">
                                    {t('admin.manageUsers.modals.cancel')}
                                </button>
                                <button onClick={handleConfirmApprove} disabled={isApproveLoading}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#4a20ef] hover:to-[#6b3def] shadow-lg shadow-purple-500/30 focus:ring-2 focus:ring-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isApproveLoading ? t('admin.manageUsers.modals.processing') : approveConfirm.isApproved ? t('admin.manageUsers.modals.confirmApprove') : t('admin.manageUsers.modals.confirmReject')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Instructor Request Detail Popup ── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header banner */}
                        <div className="relative bg-gradient-to-r from-[#5a2dff] to-purple-600 px-6 py-6 shadow-lg">
                            <button onClick={() => setSelectedRequest(null)}
                                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-all hover:scale-110">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white ring-4 ring-white/30 shadow-xl">
                                    {initials(selectedRequest.fullName)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedRequest.fullName}</h3>
                                    <p className="text-sm text-white/90">{selectedRequest.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoBlock icon={<BriefcaseIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.experience')} value={selectedRequest.experience} />
                                <InfoBlock icon={<StarIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.expertise')} value={selectedRequest.expertise} />
                                <InfoBlock icon={<DocumentTextIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.certificate')} value={selectedRequest.certificate} />
                                <InfoBlock icon={<ClockIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.submitDate')} value={formatDate(selectedRequest.createdAt)} />
                            </div>
                            <InfoBlock icon={<UserCircleIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.introduction')} value={selectedRequest.introduction} multiline />
                            {selectedRequest.socialLinks && (
                                <InfoBlock icon={<LinkIcon className="h-4 w-4" />} label={t('admin.manageUsers.requestDetails.socialLinks')} value={selectedRequest.socialLinks} />
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="border-t border-gray-200 px-6 py-5 flex gap-3 bg-gradient-to-br from-gray-50 to-white">
                            <button onClick={() => setSelectedRequest(null)}
                                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-300">
                                {t('admin.manageUsers.actions.close')}
                            </button>
                            <button
                                onClick={() => { setSelectedRequest(null); handleApproveRequest(selectedRequest, false); }}
                                className="flex-1 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:from-red-100 hover:to-rose-100 border-2 border-red-200 hover:border-red-300 focus:ring-2 focus:ring-red-400">
                                {t('admin.manageUsers.actions.reject')}
                            </button>
                            <button
                                onClick={() => { setSelectedRequest(null); handleApproveRequest(selectedRequest, true); }}
                                className="flex-1 rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#4a20ef] hover:to-[#6b3def] shadow-lg shadow-[#5a2dff]/30 focus:ring-2 focus:ring-[#5a2dff]">
                                {t('admin.manageUsers.actions.approve')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── User Detail Modal ── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="relative h-28 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                            <button onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-all hover:scale-110">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col items-center -mt-14 mb-6">
                                <div className="h-28 w-28 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden ring-4 ring-gray-100">
                                    <img src={selectedUser.avatarUrl} alt={selectedUser.fullName} loading="lazy" className="h-full w-full object-cover" />
                                </div>
                                <h3 className="mt-4 text-2xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedUser.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.manageUsers.userDetails.username')}</p>
                                    <p className="font-semibold text-gray-900 truncate">{selectedUser.userName}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.manageUsers.userDetails.role')}</p>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                        selectedUser.role.toLowerCase() === 'instructor' ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 ring-1 ring-purple-200' : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 ring-1 ring-blue-200'
                                    }`}>
                                        {selectedUser.role.toLowerCase() === 'instructor' ? t('admin.manageUsers.roles.instructor') : t('admin.manageUsers.roles.student')}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 col-span-2 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.manageUsers.userDetails.userId')}</p>
                                    <p className="font-medium text-gray-900 text-xs truncate font-mono">{selectedUser.id}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.manageUsers.userDetails.joinDate')}</p>
                                    <p className="font-semibold text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                                </div>
                                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('admin.manageUsers.userDetails.status')}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!selectedUser.isBanned ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className={`relative inline-flex rounded-full h-3 w-3 ${!selectedUser.isBanned ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {!selectedUser.isBanned ? t('admin.manageUsers.status.active') : t('admin.manageUsers.status.banned')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button onClick={() => setSelectedUser(null)}
                                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-gray-300">
                                    {t('admin.manageUsers.actions.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function InfoBlock({ icon, label, value, multiline }: { icon: React.ReactNode; label: string; value: string; multiline?: boolean }) {
    return (
        <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="text-gray-400">{icon}</span>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            </div>
            <p className={`text-sm font-medium text-gray-800 ${multiline ? 'whitespace-pre-wrap' : 'truncate'}`}>
                {value || '—'}
            </p>
        </div>
    );
}

function Pagination({ current, total, totalItems, itemLabel = 'mục', onChange }: { current: number; total: number; totalItems?: number; itemLabel?: string; onChange: (page: number) => void }) {
    const pages: (number | '...')[] = [];
    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        pages.push(1);
        if (current > 3) pages.push('...');
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
        if (current < total - 2) pages.push('...');
        pages.push(total);
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50/50 to-white px-6 py-4">
            <p className="text-sm text-gray-600">
                Trang <span className="font-bold text-gray-900">{current}</span> <span className="text-gray-400">/</span> <span className="font-semibold text-gray-700">{total}</span>
                {totalItems !== undefined && (
                    <>&nbsp;<span className="text-gray-400">·</span>&nbsp; Tổng <span className="font-bold text-gray-900">{totalItems}</span> <span className="text-gray-600">{itemLabel}</span></>
                )}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onChange(current - 1)}
                    disabled={current === 1}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                >
                    ‹
                </button>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm font-medium">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`min-w-[40px] rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all ${
                                p === current
                                    ? 'border-[#5a2dff] bg-gradient-to-br from-[#5a2dff] to-[#7c4dff] text-white shadow-lg shadow-[#5a2dff]/30 scale-105'
                                    : 'border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onChange(current + 1)}
                    disabled={current === total}
                    className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
