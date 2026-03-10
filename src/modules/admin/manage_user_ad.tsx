import React, { useState, useEffect } from 'react';
import AdminLayout from './layout/layout';
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
    const [activeTab, setActiveTab] = useState<'all' | 'student' | 'instructor' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null);

    const { users, isLoading, error, refetch, banUser } = useUsers();
    const { requests, isLoading: isRequestsLoading, error: requestsError, refetch: refetchRequests, approveRequest } = useInstructorRequests();

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
        await approveRequest(approveConfirm.request.id, approveConfirm.isApproved);
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
                    <h2 className="text-xl font-bold text-gray-900">Quản lý người dùng</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#5a2dff] sm:w-72"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex space-x-2 rounded-xl bg-gray-100 p-1 w-fit">
                    {([
                        { key: 'all', label: 'Tất cả', icon: <UserGroupIcon className="h-4 w-4" />, count: stats.all, countClass: 'bg-gray-200 text-gray-600' },
                        { key: 'instructor', label: 'Giảng viên', icon: <AcademicCapIcon className="h-4 w-4" />, count: stats.instructor, countClass: 'bg-purple-100 text-purple-600' },
                        { key: 'pending', label: 'Duyệt giảng viên', icon: <ClockIcon className="h-4 w-4" />, count: stats.pending, countClass: 'bg-orange-100 text-orange-600' },
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

                {/* Error */}
                {(activeTab !== 'pending' ? error : requestsError) && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
                        <span>{activeTab !== 'pending' ? error : requestsError}</span>
                        <button onClick={activeTab !== 'pending' ? refetch : refetchRequests} className="ml-auto underline font-medium">
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Users Table */}
                {activeTab !== 'pending' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f9fc] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Người dùng</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Vai trò</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tên đăng nhập</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày gia nhập</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                                        <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
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
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                            <img src={user.avatarUrl} alt={user.fullName} loading="lazy" className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        user.role.toLowerCase() === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {user.role.toLowerCase() === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{user.userName}</td>
                                                <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        !user.isBanned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {!user.isBanned ? 'Hoạt động' : 'Đã chặn'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                                            title="Xem chi tiết"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                                                                !user.isBanned ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            }`}
                                                            title={!user.isBanned ? 'Chặn người dùng' : 'Bỏ chặn'}
                                                        >
                                                            {!user.isBanned ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-14 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-base font-medium text-gray-500">Không tìm thấy người dùng nào</p>
                                                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalUserPages > 1 && (
                            <Pagination current={currentPage} total={totalUserPages} onChange={setCurrentPage} />
                        )}
                    </div>
                )}

                {/* Instructor Requests Table */}
                {activeTab === 'pending' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f9fc] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Người yêu cầu</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Chuyên môn</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Kinh nghiệm</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày gửi</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                                        <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
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
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5a2dff] to-purple-400 text-sm font-bold text-white">
                                                            {initials(req.fullName)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{req.fullName}</p>
                                                            <p className="text-xs text-gray-500">{req.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="max-w-[160px] truncate text-gray-700" title={req.expertise}>{req.expertise || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="max-w-[160px] truncate text-gray-500 text-xs" title={req.experience}>{req.experience || '—'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                                        Chờ duyệt
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedRequest(req)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                                            title="Xem chi tiết"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveRequest(req, true)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
                                                            title="Duyệt"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveRequest(req, false)}
                                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                            title="Từ chối"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-14 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                        <ClockIcon className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                    <p className="text-base font-medium text-gray-500">Không có yêu cầu nào đang chờ duyệt</p>
                                                    <p className="text-sm text-gray-400 mt-1">Tất cả yêu cầu đã được xử lý</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalRequestPages > 1 && (
                            <Pagination current={currentPage} total={totalRequestPages} onChange={setCurrentPage} />
                        )}
                    </div>
                )}
            </div>

            {/* ── Ban/Unban Modal ── */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
                        <div className="p-7 flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ede9ff]">
                                {confirmAction.isBanning
                                    ? <ExclamationTriangleIcon className="h-8 w-8 text-[#5a2dff]" />
                                    : <CheckCircleIcon className="h-8 w-8 text-[#5a2dff]" />
                                }
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {confirmAction.isBanning ? 'Chặn người dùng?' : 'Bỏ chặn người dùng?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                {confirmAction.isBanning
                                    ? <>Bạn có chắc chắn muốn chặn <span className="font-semibold text-gray-700">"{confirmAction.user.fullName}"</span>? Người dùng sẽ không thể đăng nhập.</>
                                    : <>Bạn có chắc chắn muốn bỏ chặn <span className="font-semibold text-gray-700">"{confirmAction.user.fullName}"</span>?</>
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setConfirmAction(null)} disabled={isBanLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                                    Hủy bỏ
                                </button>
                                <button onClick={handleConfirmBan} disabled={isBanLoading}
                                    className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a20ef] disabled:opacity-50 shadow-md shadow-[#5a2dff]/30">
                                    {isBanLoading ? 'Đang xử lý...' : confirmAction.isBanning ? 'Chặn ngay' : 'Bỏ chặn ngay'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Approve/Reject Confirmation Modal ── */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
                        <div className="p-7 flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ede9ff]">
                                {approveConfirm.isApproved
                                    ? <CheckCircleIcon className="h-8 w-8 text-[#5a2dff]" />
                                    : <XMarkIcon className="h-8 w-8 text-[#5a2dff]" />
                                }
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {approveConfirm.isApproved ? 'Duyệt yêu cầu?' : 'Từ chối yêu cầu?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                {approveConfirm.isApproved
                                    ? <>Duyệt yêu cầu của <span className="font-semibold text-gray-700">"{approveConfirm.request.fullName}"</span>? Họ sẽ được cấp quyền giảng viên.</>
                                    : <>Từ chối yêu cầu của <span className="font-semibold text-gray-700">"{approveConfirm.request.fullName}"</span>?</>
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setApproveConfirm(null)} disabled={isApproveLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50">
                                    Hủy bỏ
                                </button>
                                <button onClick={handleConfirmApprove} disabled={isApproveLoading}
                                    className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a20ef] disabled:opacity-50 shadow-md shadow-[#5a2dff]/30">
                                    {isApproveLoading ? 'Đang xử lý...' : approveConfirm.isApproved ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Instructor Request Detail Popup ── */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                        {/* Header banner */}
                        <div className="relative bg-gradient-to-r from-[#5a2dff] to-purple-500 px-6 py-5">
                            <button onClick={() => setSelectedRequest(null)}
                                className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white ring-2 ring-white/40">
                                    {initials(selectedRequest.fullName)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{selectedRequest.fullName}</h3>
                                    <p className="text-sm text-white/80">{selectedRequest.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoBlock icon={<BriefcaseIcon className="h-4 w-4" />} label="Kinh nghiệm" value={selectedRequest.experience} />
                                <InfoBlock icon={<StarIcon className="h-4 w-4" />} label="Chuyên môn" value={selectedRequest.expertise} />
                                <InfoBlock icon={<DocumentTextIcon className="h-4 w-4" />} label="Chứng chỉ" value={selectedRequest.certificate} />
                                <InfoBlock icon={<ClockIcon className="h-4 w-4" />} label="Ngày gửi" value={formatDate(selectedRequest.createdAt)} />
                            </div>
                            <InfoBlock icon={<UserCircleIcon className="h-4 w-4" />} label="Giới thiệu" value={selectedRequest.introduction} multiline />
                            {selectedRequest.socialLinks && (
                                <InfoBlock icon={<LinkIcon className="h-4 w-4" />} label="Liên kết mạng xã hội" value={selectedRequest.socialLinks} />
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="border-t border-gray-100 px-6 py-4 flex gap-3 bg-gray-50">
                            <button onClick={() => setSelectedRequest(null)}
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                Đóng
                            </button>
                            <button
                                onClick={() => { setSelectedRequest(null); handleApproveRequest(selectedRequest, false); }}
                                className="flex-1 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100">
                                Từ chối
                            </button>
                            <button
                                onClick={() => { setSelectedRequest(null); handleApproveRequest(selectedRequest, true); }}
                                className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a20ef] shadow-md shadow-[#5a2dff]/30">
                                Duyệt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── User Detail Modal ── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
                        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-purple-600">
                            <button onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="flex flex-col items-center -mt-12 mb-6">
                                <div className="h-24 w-24 rounded-full border-[4px] border-white shadow-md bg-white overflow-hidden">
                                    <img src={selectedUser.avatarUrl} alt={selectedUser.fullName} loading="lazy" className="h-full w-full object-cover" />
                                </div>
                                <h3 className="mt-3 text-xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tên đăng nhập</p>
                                    <p className="font-medium text-gray-900 truncate">{selectedUser.userName}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vai trò</p>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                        selectedUser.role.toLowerCase() === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {selectedUser.role.toLowerCase() === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3 col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID</p>
                                    <p className="font-medium text-gray-900 text-xs truncate">{selectedUser.id}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ngày tham gia</p>
                                    <p className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Trạng thái</p>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!selectedUser.isBanned ? 'bg-green-400' : 'bg-red-400'}`} />
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${!selectedUser.isBanned ? 'bg-green-500' : 'bg-red-500'}`} />
                                        </span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {!selectedUser.isBanned ? 'Hoạt động' : 'Đã chặn'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button onClick={() => setSelectedUser(null)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                                    Đóng
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

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (page: number) => void }) {
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
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 bg-white">
            <p className="text-sm text-gray-500">
                Trang <span className="font-semibold text-gray-700">{current}</span> / {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(current - 1)}
                    disabled={current === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ‹
                </button>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                p === current
                                    ? 'border-[#5a2dff] bg-[#5a2dff] text-white shadow-sm shadow-[#5a2dff]/30'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}
                <button
                    onClick={() => onChange(current + 1)}
                    disabled={current === total}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
