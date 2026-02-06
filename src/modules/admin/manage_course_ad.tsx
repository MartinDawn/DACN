import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import type { Course } from './models/course.model'; // Thêm 'type' vào đây
import { useCourseRequests } from './hooks/useCourseRequests'; // Import hook
import { CourseService } from './services/course.service';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BookOpenIcon,
  ClockIcon,
  XMarkIcon // Thêm import icon X
} from "@heroicons/react/24/outline";

// Keep mock data only for Published courses until that API is connected
const mockPublishedCourses: Course[] = [
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
    id: '3',
    title: 'Digital Marketing Zero to Hero',
    instructor: 'Tran Van C',
    category: 'Marketing',
    price: 399000,
    status: 'published',
    submittedDate: '2023-11-20',
    image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    lessons: 28
  }
];

export default function AdminManageCourse() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Use the hook for fetching requests
    const { courses: apiPendingCourses, setCourses: setApiCourses, loading } = useCourseRequests(activeTab);
    const [displayCourses, setDisplayCourses] = useState<Course[]>([]);

    // Modal State
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Combine data sources
    useEffect(() => {
        if (activeTab === 'pending') {
            setDisplayCourses(apiPendingCourses);
        } else {
            setDisplayCourses(mockPublishedCourses);
        }
    }, [activeTab, apiPendingCourses]);

    // Open Modals
    const openApproveModal = (course: Course) => {
        setSelectedCourse(course);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (course: Course) => {
        setSelectedCourse(course);
        setRejectReason(''); // Reset reason
        setIsRejectModalOpen(true);
    };

    const openDeleteModal = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const closeModals = () => {
        setIsApproveModalOpen(false);
        setIsRejectModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedCourse(null);
    };

    const handleConfirmApprove = async () => {
        if (!selectedCourse) return;

        if (activeTab === 'pending' && selectedCourse.requestId) {
            try {
                await CourseService.approveRequest(selectedCourse.requestId);
                setApiCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
                // Có thể thêm thông báo toast tại đây
            } catch (error) {
                alert('Lỗi khi duyệt yêu cầu');
            }
        } else {
             setApiCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
        }
        closeModals();
    };

    const handleConfirmReject = async () => {
        if (!selectedCourse) return;
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        if (activeTab === 'pending' && selectedCourse.requestId) {
            try {
                await CourseService.rejectRequest(selectedCourse.requestId, rejectReason);
                setApiCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
            } catch (error) {
                alert('Lỗi khi từ chối yêu cầu');
            }
        } else {
             setApiCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
        }
        closeModals();
    };

    const handleConfirmDelete = () => {
        if (selectedCourse) {
            setDisplayCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
        }
        closeModals();
    };

    const filteredCourses = displayCourses.filter(course => 
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
                            {mockPublishedCourses.length}
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
                             {loading ? '...' : apiPendingCourses.length}
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
                                {loading && activeTab === 'pending' ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : filteredCourses.length > 0 ? (
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
                                                                onClick={() => openApproveModal(course)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
                                                                title="Duyệt khóa học"
                                                            >
                                                                <CheckCircleIcon className="h-5 w-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => openRejectModal(course)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                                title="Từ chối"
                                                            >
                                                                <XCircleIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>  
                                                            <button 
                                                                onClick={() => openDeleteModal(course)}
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

            {/* Modals */}
            {isApproveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity fade-in backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a2dff]/10 mx-auto">
                            <CheckCircleIcon className="h-8 w-8 text-[#5a2dff]" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900">Xác nhận duyệt</h3>
                        <p className="mt-2 text-center text-gray-500 leading-relaxed">
                            Bạn có chắc chắn muốn duyệt khóa học <br/> <span className="font-bold text-gray-900">{selectedCourse?.title}</span>?
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button 
                                onClick={closeModals} 
                                className="min-w-[100px] rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleConfirmApprove} 
                                className="min-w-[100px] rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4b24d6] focus:outline-none shadow-md shadow-[#5a2dff]/25 transition-all"
                            >
                                Duyệt ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity fade-in backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a2dff]/10 mx-auto">
                            <XMarkIcon className="h-8 w-8 text-[#5a2dff]" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900">Từ chối khóa học</h3>
                        <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
                            Vui lòng nhập lý do từ chối cho khóa học <br/> <span className="font-bold text-gray-900">{selectedCourse?.title}</span>
                        </p>
                        <div className="mt-5">
                            <label className="mb-2 block text-sm font-semibold text-gray-700">Lý do từ chối <span className="text-[#5a2dff]">*</span></label>
                            <textarea 
                                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff] outline-none transition-all shadow-sm placeholder:text-gray-400"
                                rows={4}
                                placeholder="Nhập lý do chi tiết..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                onClick={closeModals} 
                                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleConfirmReject} 
                                className="rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4b24d6] focus:outline-none shadow-md shadow-[#5a2dff]/25 transition-all"
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity fade-in backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mx-auto">
                            <TrashIcon className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900">Xóa khóa học?</h3>
                        <p className="mt-2 text-center text-gray-500 leading-relaxed">
                            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa khóa học <br/> <span className="font-bold text-gray-900">{selectedCourse?.title}</span>?
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button 
                                onClick={closeModals} 
                                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleConfirmDelete} 
                                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none shadow-md shadow-red-200 transition-all"
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
