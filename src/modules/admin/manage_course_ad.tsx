import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import type { Course } from './models/course.model';
import { useCourseRequests } from './hooks/useCourseRequests';
import { CourseService } from './services/course.service';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ClockIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

const ITEMS_PER_PAGE = 10;

function LazyImage({ src, alt }: { src: string; alt: string }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => setLoaded(true), []);
    const handleError = useCallback(() => { setError(true); setLoaded(true); }, []);

    return (
        <div className="relative h-full w-full">
            {!loaded && (
                <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-200" />
            )}
            {error ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-gray-300" />
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
        </div>
    );
}

export default function AdminManageCourse() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        courses,
        setCourses,
        loading,
        pagination,
        currentPage,
        goToPage,
        refresh
    } = useCourseRequests(activeTab);

    // Modal State
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingPage, setPendingPage] = useState(1);
    const [publishedPage, setPublishedPage] = useState(1);

    // Open Modals
    const openApproveModal = (course: Course) => {
        setSelectedCourse(course);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (course: Course) => {
        setSelectedCourse(course);
        setRejectReason('');
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
        setIsProcessing(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModals();
        };
        if (isApproveModalOpen || isRejectModalOpen || isDeleteModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isApproveModalOpen, isRejectModalOpen, isDeleteModalOpen]);

    const handleConfirmApprove = async () => {
        if (!selectedCourse || isProcessing) return;

        if (!selectedCourse.requestId) {
            alert('Không tìm thấy ID yêu cầu. Vui lòng thử lại.');
            return;
        }

        setIsProcessing(true);
        try {
            await CourseService.approveRequest(selectedCourse.requestId);
            setPendingCount(prev => Math.max(0, prev - 1));
            refresh();
            closeModals();
        } catch (error) {
            alert('Lỗi khi duyệt yêu cầu. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedCourse || isProcessing) return;
        if (!rejectReason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        if (!selectedCourse.requestId) {
            alert('Không tìm thấy ID yêu cầu. Vui lòng thử lại.');
            return;
        }

        setIsProcessing(true);
        try {
            await CourseService.rejectRequest(selectedCourse.requestId, rejectReason);
            setPendingCount(prev => Math.max(0, prev - 1));
            refresh();
            closeModals();
        } catch (error) {
            alert('Lỗi khi từ chối yêu cầu. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmDelete = () => {
        if (selectedCourse) {
            setCourses(prev => prev.filter(c => c.id !== selectedCourse.id));
        }
        closeModals();
    };

    const filteredCourses = courses.filter(course =>
        (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPublishedPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
    const totalPendingPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
    const displayCourses = activeTab === 'pending'
        ? filteredCourses.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE)
        : filteredCourses.slice((publishedPage - 1) * ITEMS_PER_PAGE, publishedPage * ITEMS_PER_PAGE);

    useEffect(() => { setPendingPage(1); setPublishedPage(1); }, [activeTab, searchTerm]);

    const [publishedCount, setPublishedCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending count on mount so the badge shows correctly before switching tabs
    useEffect(() => {
        CourseService.getPendingRequests().then(data => {
            setPendingCount(data.length);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!loading) {
            if (activeTab === 'published') {
                setPublishedCount(pagination.totalCount || courses.length);
            } else {
                setPendingCount(courses.length);
            }
        }
    }, [activeTab, loading, pagination.totalCount, courses.length]);

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

                {/* Tabs */}
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
                        Tất cả khóa học
                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {loading && activeTab === 'published' ? '...' : publishedCount}
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
                        Duyệt khóa học
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                            {loading && activeTab === 'pending' ? '...' : pendingCount}
                        </span>
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f7f9fc] border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[33%]">Khóa học</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[18%]">Giảng viên</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[12%]">Giá</th>
                                    {activeTab === 'published' && (
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[12%]">Đánh giá</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[12%]">Ngày tạo</th>
                                    <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 w-[13%]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={activeTab === 'published' ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : filteredCourses.length > 0 ? (
                                    displayCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <LazyImage src={course.image} alt={course.title} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]" title={course.title}>{course.title}</p>
                                                        {activeTab === 'published' && course.totalStudents !== undefined && (
                                                            <p className="text-xs text-gray-500">{course.totalStudents} học viên</p>
                                                        )}
                                                        {activeTab === 'pending' && (
                                                            <p className="text-xs text-gray-500">{course.lessons} bài học</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">{course.instructor}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {course.price > 0
                                                    ? `${course.price.toLocaleString('vi-VN')}đ`
                                                    : <span className="text-green-600 font-medium">Miễn phí</span>
                                                }
                                            </td>
                                            {activeTab === 'published' && (
                                                <td className="px-6 py-4">
                                                    {course.averageRating && course.averageRating > 0 ? (
                                                        <div className="flex items-center gap-1">
                                                            <StarIcon className="h-4 w-4 text-yellow-400" />
                                                            <span className="font-semibold text-gray-900">{course.averageRating.toFixed(1)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Chưa có</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-gray-600">{course.submittedDate}</td>
                                            <td className="px-6 py-4 text-end">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/user/course-progress/${course.id}`)}
                                                        className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                                                        title="Xem chi tiết"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
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
                                                        <button
                                                            onClick={() => openDeleteModal(course)}
                                                            className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                                                            title="Xóa khóa học"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'published' ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-50 p-4 mb-3">
                                                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-300"/>
                                                </div>
                                                <p className="text-base font-medium">Không có yêu cầu nào đang chờ duyệt</p>
                                                <p className="text-sm text-gray-400 mt-1">Tất cả đã được xử lý</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {activeTab === 'published' && !loading && (
                        <Pagination current={publishedPage} total={totalPublishedPages} totalItems={filteredCourses.length} onChange={setPublishedPage} />
                    )}
                    {activeTab === 'pending' && !loading && (
                        <Pagination current={pendingPage} total={totalPendingPages} totalItems={filteredCourses.length} onChange={setPendingPage} />
                    )}
                </div>
            </div>

            {/* Modals */}
            {isApproveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ede8ff] mx-auto">
                            <CheckCircleIcon className="h-8 w-8 text-[#5a2dff]" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900">Xác nhận duyệt</h3>
                        <p className="mt-2 text-center text-gray-500 leading-relaxed">
                            Bạn có chắc chắn muốn duyệt khóa học <br/> <span className="font-bold text-gray-900">{selectedCourse?.title}</span>?
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button
                                onClick={closeModals}
                                disabled={isProcessing}
                                className="min-w-[100px] rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmApprove}
                                disabled={isProcessing}
                                className="min-w-[100px] rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a22e8] focus:outline-none shadow-md shadow-[#c4b5fd] transition-all disabled:opacity-70"
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Duyệt ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ede8ff] mx-auto">
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
                                disabled={isProcessing}
                                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={isProcessing}
                                className="rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a22e8] focus:outline-none shadow-md shadow-[#c4b5fd] transition-all disabled:opacity-70"
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ede8ff] mx-auto">
                            <TrashIcon className="h-8 w-8 text-[#5a2dff]" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900">Xóa khóa học?</h3>
                        <p className="mt-2 text-center text-gray-500 leading-relaxed">
                            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa khóa học <br/> <span className="font-bold text-gray-900">{selectedCourse?.title}</span>?
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button
                                onClick={closeModals}
                                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a22e8] focus:outline-none shadow-md shadow-[#c4b5fd] transition-all"
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

function Pagination({ current, total, totalItems, onChange }: {
    current: number;
    total: number;
    totalItems?: number;
    onChange: (page: number) => void;
}) {
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
                {totalItems !== undefined && (
                    <>&nbsp;·&nbsp; Tổng <span className="font-semibold text-gray-700">{totalItems}</span> khóa học</>
                )}
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
                                current === p
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
