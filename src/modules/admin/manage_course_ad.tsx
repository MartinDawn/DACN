import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BookOpenIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

// Mock Data Structure
interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  status: 'published' | 'pending';
  submittedDate: string;
  image: string;
  lessons: number;
}

// Mock Data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Developer Course 2024',
    instructor: 'Nguyen Van A',
    category: 'Web Development',
    price: 599000,
    status: 'published',
    submittedDate: '2023-12-01',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    lessons: 45
  },
  {
    id: '2',
    title: 'Advanced Python Masterclass',
    instructor: 'Le Thi B',
    category: 'Data Science',
    price: 799000,
    status: 'pending',
    submittedDate: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    lessons: 32
  },
  {
    id: '3',
    title: 'Digital Marketing Zero to Hero',
    instructor: 'Tran Van C',
    category: 'Marketing',
    price: 399000,
    status: 'published',
    submittedDate: '2023-11-20',
    image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    lessons: 28
  },
  {
    id: '4',
    title: 'Machine Learning A-Z',
    instructor: 'Pham Thi D',
    category: 'AI & Machine Learning',
    price: 899000,
    status: 'pending',
    submittedDate: '2024-01-18',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    lessons: 50
  }
];

export default function AdminManageCourse() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
    const [courses, setCourses] = useState<Course[]>(mockCourses);
    const [searchTerm, setSearchTerm] = useState('');

    const handleApprove = (id: string) => {
        if(window.confirm('Bạn có chắc chắn muốn duyệt khóa học này?')) {
            setCourses(prev => prev.map(c => c.id === id ? { ...c, status: 'published' } : c));
        }
    };

    const handleReject = (id: string) => {
        if(window.confirm('Bạn có chắc chắn muốn từ chối khóa học này?')) {
             setCourses(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.')) {
            setCourses(prev => prev.filter(c => c.id !== id));
        }
    };

    const filteredCourses = courses.filter(course => 
        course.status === activeTab && 
        (course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Quản lý khóa học</h2>
                    <div className="relative">
                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="Tìm kiếm khóa học/giảng viên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#5a2dff] sm:w-80"
                         />
                    </div>
                </div>

                {/* Tabs - 2 chức năng chính */}
                <div className="mb-6 flex space-x-2 rounded-xl bg-gray-100 p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            activeTab === 'published' 
                            ? 'bg-white text-[#5a2dff] shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <BookOpenIcon className="h-4 w-4" />
                        Đã Public
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {courses.filter(c => c.status === 'published').length}
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
                        Chờ duyệt
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                             {courses.filter(c => c.status === 'pending').length}
                        </span>
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f7f9fc] border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Khóa học</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Giảng viên</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Danh mục</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Giá</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Kiểm tra</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ngày gửi</th>
                                    <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-500">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]" title={course.title}>{course.title}</p>
                                                        <p className="text-xs text-gray-500">{course.lessons} bài học</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{course.instructor}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                    {course.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {course.price.toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <button
                                                    onClick={() => navigate(`/courses/${course.id}`)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff] hover:shadow-sm"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{course.submittedDate}</td>
                                            <td className="px-6 py-4 text-end">
                                                <div className="flex items-center justify-end gap-2">
                                                    {activeTab === 'pending' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(course.id)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
                                                                title="Duyệt khóa học"
                                                            >
                                                                <CheckCircleIcon className="h-5 w-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(course.id)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                                title="Từ chối"
                                                            >
                                                                <XCircleIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>  
                                                            <button 
                                                                onClick={() => handleDelete(course.id)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                                title="Xóa khóa học"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-300"/>
                                                </div>
                                                <p className="text-base font-medium">Không tìm thấy khóa học nào</p>
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
        </AdminLayout>
    );
}
