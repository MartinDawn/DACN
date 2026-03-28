import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import type { Course } from './models/course.model';
import { useCourseRequests } from './hooks/useCourseRequests';
import { CourseService } from './services/course.service';
import { useTranslation } from 'react-i18next';
import {
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    ClockIcon,
    XMarkIcon,
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        courses,
        setCourses,
        loading,
        pagination,
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
            alert(t('admin.errors.noId'));
            return;
        }

        setIsProcessing(true);
        try {
            await CourseService.approveRequest(selectedCourse.requestId);
            setPendingCount(prev => Math.max(0, prev - 1));
            refresh();
            closeModals();
        } catch (error) {
            alert(t('admin.errors.approve'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedCourse || isProcessing) return;
        if (!rejectReason.trim()) {
            alert(t('admin.errors.reasonRequired'));
            return;
        }

        if (!selectedCourse.requestId) {
            alert(t('admin.errors.noId'));
            return;
        }

        setIsProcessing(true);
        try {
            await CourseService.rejectRequest(selectedCourse.requestId, rejectReason);
            setPendingCount(prev => Math.max(0, prev - 1));
            refresh();
            closeModals();
        } catch (error) {
            alert(t('admin.errors.reject'));
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
                    <h2 className="text-xl font-bold text-gray-900">{t('admin.manageCourses.title')}</h2>
                    <div className="relative">
                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                         <input
                            type="text"
                            placeholder={t('admin.manageCourses.searchCourses')}
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
                        {t('admin.manageCourses.tabs.allCourses')}
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
                        {t('admin.manageCourses.tabs.pending')}
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                            {loading && activeTab === 'pending' ? '...' : pendingCount}
                        </span>
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gradient-to-r from-[#f7f9fc] to-[#faf8ff] border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 w-[33%]">{t('admin.manageCourses.tableHeaders.course')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 w-[18%]">{t('admin.manageCourses.tableHeaders.instructor')}</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 w-[12%]">{t('admin.manageCourses.tableHeaders.price')}</th>
                                    {activeTab === 'published' && (
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 w-[12%]">{t('admin.manageCourses.tableHeaders.rating')}</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 w-[12%]">{t('admin.manageCourses.tableHeaders.submitDate')}</th>
                                    <th className="px-6 py-4 text-end text-xs font-semibold uppercase tracking-wider text-gray-600 w-[13%]">{t('admin.manageCourses.tableHeaders.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={activeTab === 'published' ? 6 : 5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#5a2dff]"></div>
                                                <p className="mt-4 text-sm font-medium text-gray-500">{t('admin.manageCourses.loading')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCourses.length > 0 ? (
                                    displayCourses.map((course) => (
                                        <tr key={course.id} className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-2 ring-transparent group-hover:ring-[#5a2dff]/20 transition-all duration-200">
                                                        <LazyImage src={course.image} alt={course.title} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 line-clamp-1 max-w-[220px] group-hover:text-[#5a2dff] transition-colors" title={course.title}>{course.title}</p>
                                                        {activeTab === 'published' && course.totalStudents !== undefined && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{course.totalStudents} {t('admin.manageCourses.status.students')}</p>
                                                        )}
                                                        {activeTab === 'pending' && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{course.lessons} {t('admin.manageCourses.status.lessons')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">{course.instructor}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {course.price > 0
                                                    ? `${course.price.toLocaleString('vi-VN')}đ`
                                                    : <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-600 font-medium">{t('admin.manageCourses.status.free')}</span>
                                                }
                                            </td>
                                            {activeTab === 'published' && (
                                                <td className="px-6 py-4">
                                                    {course.averageRating && course.averageRating > 0 ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-bold text-gray-900">{course.averageRating.toFixed(1)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">{t('admin.manageCourses.status.noRating')}</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-gray-600 text-sm">{course.submittedDate}</td>
                                            <td className="px-6 py-4 text-end">
                                                <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/course-progress/${course.id}`)}
                                                        className="inline-flex items-center justify-center rounded-lg bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:bg-blue-100 hover:scale-110"
                                                        title={t('admin.manageCourses.actions.viewDetails')}
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                    {activeTab === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => openApproveModal(course)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-green-50 p-2 text-green-600 transition-all duration-200 hover:bg-green-100 hover:scale-110"
                                                                title={t('admin.manageCourses.actions.approve')}
                                                            >
                                                                <CheckCircleIcon className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(course)}
                                                                className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-all duration-200 hover:bg-red-100 hover:scale-110"
                                                                title={t('admin.manageCourses.actions.reject')}
                                                            >
                                                                <XCircleIcon className="h-5 w-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => openDeleteModal(course)}
                                                            className="group relative inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-all duration-200 hover:bg-red-100 hover:scale-110"
                                                            title={t('admin.manageCourses.actions.delete')}
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
                                        <td colSpan={activeTab === 'published' ? 6 : 5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative mb-4">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-[#5a2dff]/10 to-purple-500/10 blur-2xl rounded-full" />
                                                    <div className="relative rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-5 shadow-inner">
                                                        <MagnifyingGlassIcon className="h-10 w-10 text-gray-300"/>
                                                    </div>
                                                </div>
                                                <p className="text-base font-semibold text-gray-600 mb-1">{t('admin.manageCourses.empty.noPending')}</p>
                                                <p className="text-sm text-gray-400">{t('admin.manageCourses.empty.allProcessed')}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 mx-auto ring-4 ring-purple-100/50">
                            <CheckCircleIcon className="h-9 w-9 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{t('admin.manageCourses.modals.confirmApproval')}</h3>
                        <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
                            {t('admin.manageCourses.modals.approveConfirm', { title: selectedCourse?.title })}
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button
                                onClick={closeModals}
                                disabled={isProcessing}
                                className="min-w-[110px] rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all disabled:opacity-50"
                            >
                                {t('admin.manageCourses.modals.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmApprove}
                                disabled={isProcessing}
                                className="min-w-[110px] rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-5 py-2.5 text-sm font-semibold text-white hover:from-[#4a20ef] hover:to-[#6b3def] focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? t('admin.manageCourses.modals.processing') : t('admin.manageCourses.modals.approveNow')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 mx-auto ring-4 ring-purple-100/50">
                            <XMarkIcon className="h-9 w-9 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{t('admin.manageCourses.modals.rejectCourse')}</h3>
                        <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed mb-5">
                            {t('admin.manageCourses.modals.rejectReason', { title: selectedCourse?.title })}
                        </p>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">{t('admin.manageCourses.modals.reasonRequired')} <span className="text-purple-500">*</span></label>
                            <textarea
                                className="w-full rounded-xl border-2 border-gray-200 p-3.5 text-sm focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/20 outline-none transition-all shadow-sm placeholder:text-gray-400"
                                rows={4}
                                placeholder={t('admin.manageCourses.modals.reasonPlaceholder')}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeModals}
                                disabled={isProcessing}
                                className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all disabled:opacity-50"
                            >
                                {t('admin.manageCourses.modals.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={isProcessing}
                                className="rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-5 py-2.5 text-sm font-semibold text-white hover:from-[#4a20ef] hover:to-[#6b3def] focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? t('admin.manageCourses.modals.processing') : t('admin.manageCourses.modals.confirmReject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 mx-auto ring-4 ring-purple-100/50">
                            <TrashIcon className="h-9 w-9 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{t('admin.manageCourses.modals.deleteCourse')}</h3>
                        <p className="mt-2 text-center text-sm text-gray-500 leading-relaxed">
                            {t('admin.manageCourses.modals.deleteConfirm', { title: selectedCourse?.title })}
                        </p>
                        <div className="mt-8 flex justify-center gap-3">
                            <button
                                onClick={closeModals}
                                className="rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                            >
                                {t('admin.manageCourses.modals.cancel')}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#7c4dff] px-5 py-2.5 text-sm font-semibold text-white hover:from-[#4a20ef] hover:to-[#6b3def] focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/30 transition-all"
                            >
                                {t('admin.manageCourses.modals.deleteForever')}
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
    const { t } = useTranslation();
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
                {t('admin.manageCourses.pagination.page')} <span className="font-bold text-gray-900">{current}</span> <span className="text-gray-400">/</span> <span className="font-semibold text-gray-700">{total}</span>
                {totalItems !== undefined && (
                    <>&nbsp;<span className="text-gray-400">·</span>&nbsp; {t('admin.manageCourses.pagination.total')} <span className="font-bold text-gray-900">{totalItems}</span> <span className="text-gray-600">{t('admin.manageCourses.pagination.courses')}</span></>
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
                                current === p
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
