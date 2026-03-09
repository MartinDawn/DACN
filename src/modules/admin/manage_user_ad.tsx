import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UsersIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { useUsers, useInstructorRequests } from './hooks/useUsers';
import type { UserResponse, InstructorRequest } from './models/user.model';

export default function AdminManageUser() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'student' | 'instructor' | 'pending'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

    const { users, isLoading, error, refetch, banUser } = useUsers();
    const { requests, isLoading: isRequestsLoading, error: requestsError, refetch: refetchRequests, approveRequest } = useInstructorRequests();

    const [confirmAction, setConfirmAction] = useState<{ user: UserResponse; isBanning: boolean } | null>(null);
    const [isBanLoading, setIsBanLoading] = useState(false);

    const [approveConfirm, setApproveConfirm] = useState<{ request: InstructorRequest; isApproved: boolean } | null>(null);
    const [isApproveLoading, setIsApproveLoading] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (confirmAction && !isBanLoading) setConfirmAction(null);
            if (approveConfirm && !isApproveLoading) setApproveConfirm(null);
            if (selectedUser) setSelectedUser(null);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [confirmAction, isBanLoading, selectedUser, approveConfirm, isApproveLoading]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

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
        await approveRequest(approveConfirm.request.requestId, approveConfirm.isApproved);
        setIsApproveLoading(false);
        setApproveConfirm(null);
    };

    const filteredUsers = users.filter(user => {
        const userRole = user.role.toLowerCase();
        const matchesTab = activeTab === 'all' || userRole === activeTab;
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const filteredRequests = requests.filter(req =>
        req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        all: users.length,
        student: users.filter(u => u.role.toLowerCase() === 'student').length,
        instructor: users.filter(u => u.role.toLowerCase() === 'instructor').length,
        pending: requests.length
    };

    return (
        <AdminLayout>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Quản lý người dùng</h2>
                    <div className="relative">
                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                         <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#5a2dff] sm:w-80"
                         />
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex space-x-2 rounded-xl bg-gray-100 p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            activeTab === 'all'
                            ? 'bg-white text-[#5a2dff] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <UserGroupIcon className="h-4 w-4" />
                        Tất cả
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                            {stats.all}
                        </span>
                    </button>
                     <button
                        onClick={() => setActiveTab('instructor')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            activeTab === 'instructor'
                            ? 'bg-white text-[#5a2dff] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <AcademicCapIcon className="h-4 w-4" />
                        Giảng viên
                        <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">
                             {stats.instructor}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            activeTab === 'pending'
                            ? 'bg-white text-[#5a2dff] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ClockIcon className="h-4 w-4" />
                        Duyệt giảng viên
                        {stats.pending > 0 && (
                            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                                {stats.pending}
                            </span>
                        )}
                    </button>
                </div>

                {/* Error State */}
                {(error || requestsError) && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error || requestsError}
                        <button
                            onClick={activeTab === 'pending' ? refetchRequests : refetch}
                            className="ml-2 underline font-medium"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* User Table */}
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
                                                    <td key={j} className="px-6 py-4">
                                                        <div className="h-3 w-20 rounded bg-gray-200" />
                                                    </td>
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
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                            <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        user.role.toLowerCase() === 'instructor'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {user.role.toLowerCase() === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{user.userName}</td>
                                                <td className="px-6 py-4 text-gray-600">{formatDate(user.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        !user.isBanned
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {!user.isBanned ? 'Hoạt động' : 'Đã chặn'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedUser(user)}
                                                            className="group relative inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                                            title="Xem chi tiết"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`group relative inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                                                                !user.isBanned
                                                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            }`}
                                                            title={!user.isBanned ? "Chặn người dùng" : "Bỏ chặn"}
                                                        >
                                                            {!user.isBanned ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-300"/>
                                                    </div>
                                                    <p className="text-base font-medium">Không tìm thấy người dùng nào</p>
                                                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tên đăng nhập</th>
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
                                                    <td key={j} className="px-6 py-4">
                                                        <div className="h-3 w-20 rounded bg-gray-200" />
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <div className="h-8 w-16 rounded-lg bg-gray-200" />
                                                        <div className="h-8 w-16 rounded-lg bg-gray-200" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredRequests.length > 0 ? (
                                        filteredRequests.map((req) => (
                                            <tr key={req.requestId} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                            <img src={req.avatarUrl} alt={req.fullName} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{req.fullName}</p>
                                                            <p className="text-xs text-gray-500">{req.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{req.userName}</td>
                                                <td className="px-6 py-4 text-gray-600">{formatDate(req.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                                        Chờ duyệt
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-end">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApproveRequest(req, true)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
                                                            title="Duyệt"
                                                        >
                                                            <CheckCircleIcon className="h-4 w-4" />
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveRequest(req, false)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                                                            title="Từ chối"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                        <ClockIcon className="h-8 w-8 text-gray-300"/>
                                                    </div>
                                                    <p className="text-base font-medium">Không có yêu cầu nào đang chờ duyệt</p>
                                                    <p className="text-sm text-gray-400 mt-1">Tất cả yêu cầu đã được xử lý</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Ban/Unban Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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
                                    ? <>Bạn có chắc chắn muốn chặn <span className="font-semibold text-gray-700">"{confirmAction.user.fullName}"</span>? Người dùng sẽ không thể đăng nhập vào hệ thống.</>
                                    : <>Bạn có chắc chắn muốn bỏ chặn <span className="font-semibold text-gray-700">"{confirmAction.user.fullName}"</span>? Người dùng sẽ có thể đăng nhập trở lại.</>
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    disabled={isBanLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmBan}
                                    disabled={isBanLoading}
                                    className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a20ef] active:bg-[#3a10df] disabled:opacity-50 shadow-md shadow-[#5a2dff]/30"
                                >
                                    {isBanLoading
                                        ? 'Đang xử lý...'
                                        : confirmAction.isBanning ? 'Chặn ngay' : 'Bỏ chặn ngay'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve/Reject Instructor Request Modal */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-7 flex flex-col items-center text-center">
                            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${approveConfirm.isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
                                {approveConfirm.isApproved
                                    ? <CheckCircleIcon className="h-8 w-8 text-green-600" />
                                    : <XMarkIcon className="h-8 w-8 text-red-600" />
                                }
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {approveConfirm.isApproved ? 'Duyệt yêu cầu giảng viên?' : 'Từ chối yêu cầu?'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                                {approveConfirm.isApproved
                                    ? <>Bạn có chắc chắn muốn duyệt yêu cầu của <span className="font-semibold text-gray-700">"{approveConfirm.request.fullName}"</span>? Người dùng sẽ được cấp quyền giảng viên.</>
                                    : <>Bạn có chắc chắn muốn từ chối yêu cầu của <span className="font-semibold text-gray-700">"{approveConfirm.request.fullName}"</span>?</>
                                }
                            </p>
                            <div className="w-full border-t border-gray-100 mb-5" />
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setApproveConfirm(null)}
                                    disabled={isApproveLoading}
                                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleConfirmApprove}
                                    disabled={isApproveLoading}
                                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 shadow-md ${
                                        approveConfirm.isApproved
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                    }`}
                                >
                                    {isApproveLoading
                                        ? 'Đang xử lý...'
                                        : approveConfirm.isApproved ? 'Xác nhận duyệt' : 'Xác nhận từ chối'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="relative h-24 bg-gradient-to-r from-blue-600 to-purple-600">
                             <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition backdrop-blur-md"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 pb-6 relative">
                             <div className="flex flex-col items-center -mt-12 mb-6">
                                <div className="h-24 w-24 rounded-full border-[4px] border-white shadow-md bg-white overflow-hidden">
                                     <img src={selectedUser.avatarUrl} alt={selectedUser.fullName} className="h-full w-full object-cover" />
                                </div>
                                <h3 className="mt-3 text-xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                             </div>

                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="rounded-xl bg-gray-50 p-3 col-span-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Trạng thái tài khoản</p>
                                        <div className="flex items-center gap-2">
                                             <span className="relative flex h-2.5 w-2.5">
                                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!selectedUser.isBanned ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${!selectedUser.isBanned ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {!selectedUser.isBanned ? 'Đang hoạt động bình thường' : 'Tài khoản đã bị chặn'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="mt-8 flex gap-3">
                                 <button
                                     onClick={() => setSelectedUser(null)}
                                     className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                                 >
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
