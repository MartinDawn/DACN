import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import { 
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  UsersIcon,
  TrashIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";                                                                                                                                                       

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  status: 'active' | 'blocked';
  joinDate: string;
  avatar: string;
  phone: string;
  coursesCount?: number;
}

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Nguyễn Văn Học',
    email: 'hocvien@example.com',
    role: 'student',
    status: 'active',
    joinDate: '2023-01-15',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+Hoc&background=random',
    phone: '0901234567',
    coursesCount: 5
  },
  {
    id: 'u2',
    name: 'Trần Thầy Giáo',
    email: 'giangvien@example.com',
    role: 'instructor',
    status: 'active',
    joinDate: '2023-02-20',
    avatar: 'https://ui-avatars.com/api/?name=Tran+Thay+Giao&background=random',
    phone: '0909876543',
    coursesCount: 3
  },
  {
    id: 'u3',
    name: 'Lê Văn Cấm',
    email: 'cam@example.com',
    role: 'student',
    status: 'blocked',
    joinDate: '2023-03-10',
    avatar: 'https://ui-avatars.com/api/?name=Le+Van+Cam&background=random',
    phone: '0912345678',
    coursesCount: 0
  },
   {
    id: 'u4',
    name: 'Phạm Cô Giáo',
    email: 'cogiao@example.com',
    role: 'instructor',
    status: 'active',
    joinDate: '2023-05-12',
    avatar: 'https://ui-avatars.com/api/?name=Pham+Co+Giao&background=random',
    phone: '0933333333',
    coursesCount: 10
  }
];

export default function AdminManageUser() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'student' | 'instructor'>('all');
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const action = currentStatus === 'active' ? 'chặn' : 'bỏ chặn';
        if(window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này?`)) {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
        }
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesTab = activeTab === 'all' || user.role === activeTab;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.phone.includes(searchTerm);
        return matchesTab && matchesSearch;
    });

    const stats = {
        all: users.length,
        student: users.filter(u => u.role === 'student').length,
        instructor: users.filter(u => u.role === 'instructor').length
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
                        onClick={() => setActiveTab('student')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            activeTab === 'student' 
                            ? 'bg-white text-[#5a2dff] shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <UsersIcon className="h-4 w-4" />
                        Học viên
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                             {stats.student}
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
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f7f9fc] border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Người dùng</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Vai trò</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Số điện thoại</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày gia nhập</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
                                    <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    user.role === 'instructor' 
                                                    ? 'bg-purple-100 text-purple-700' 
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                                            <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                                            <td className="px-6 py-4">
                                                 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    user.status === 'active' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {user.status === 'active' ? 'Hoạt động' : 'Đã chặn'}
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
                                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                                        className={`group relative inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                                                            user.status === 'active' 
                                                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                        title={user.status === 'active' ? "Chặn người dùng" : "Bỏ chặn"}
                                                    >
                                                        {user.status === 'active' ? <NoSymbolIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                        title="Xóa người dùng"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
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
            </div>

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
                                     <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full object-cover" />
                                </div>
                                <h3 className="mt-3 text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                             </div>

                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">ID</p>
                                        <p className="font-medium text-gray-900 truncate">{selectedUser.id}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vai trò</p>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            selectedUser.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {selectedUser.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                                        <p className="font-medium text-gray-900">{selectedUser.phone}</p>
                                    </div>
                                     <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ngày tham gia</p>
                                        <p className="font-medium text-gray-900">{selectedUser.joinDate}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3 col-span-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Trạng thái tài khoản</p>
                                        <div className="flex items-center gap-2">
                                             <span className={`relative flex h-2.5 w-2.5`}>
                                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${selectedUser.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {selectedUser.status === 'active' ? 'Đang hoạt động bình thường' : 'Tài khoản đã bị chặn'}
                                            </span>
                                        </div>
                                    </div>
                                     <div className="rounded-xl bg-gray-50 p-3 col-span-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Thống kê khóa học</p>
                                        <p className="font-medium text-gray-900">
                                            Đã tham gia {selectedUser.coursesCount || 0} khóa học
                                        </p>
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
