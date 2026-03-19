// src/modules/course/mycourse.tsx

import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
// 1. THÊM useNavigate
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../user/layout/layout"; 

import type { MyCourse, CourseCommentsData } from './models/course.ts';
import { useCourses } from './hooks/useCourses';
import { courseService } from './services/course.service'; 

// --- TYPES ---

type CourseStatus = "completed" | "inProgress" | "notStarted";
type FilterValue = "all" | CourseStatus;

// Type này kết hợp dữ liệu gốc từ API (MyCourse) với dữ liệu tiến độ
type CourseProgress = MyCourse & {
  durationHours: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  status: CourseStatus;
  progress: number;
  lastActivity: string;
};

// --- CONSTANTS ---

const filters: { label: string; value: FilterValue }[] = [
  { label: "Tất cả khóa học", value: "all" },
  { label: "Đang học", value: "inProgress" },
  { label: "Đã hoàn thành", value: "completed" },
  { label: "Chưa bắt đầu", value: "notStarted" },
];

const quickActions = [
  { title: "Khám phá thêm khóa học", icon: BookOpenIcon, href: "/courses" },
  { title: "Đặt mục tiêu học tập", icon: SparklesIcon, href: "#" },
  { title: "Tải chứng chỉ", icon: DocumentArrowDownIcon, href: "#" },
];

const achievements = [
  { title: "Hoàn thành khóa học đầu tiên", date: "18 tháng 1, 2024" },
  { title: "Đã học 5 giờ", date: "15 tháng 1, 2024" },
  { title: "Chuyên gia JavaScript", date: "18 tháng 1, 2024" },
  { title: "Học liên tục một tuần", date: "20 tháng 1, 2024" },
];

// --- COMPONENT ---

const MyCoursePage: React.FC = () => {
  // 2. KHỞI TẠO NAVIGATE
  const navigate = useNavigate();

  // State quản lý UI (filter và search)
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // State cho modal nhận xét
  const [commentsModal, setCommentsModal] = useState<CourseProgress | null>(null);
  const [commentsData, setCommentsData] = useState<CourseCommentsData | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // State cho modal đánh giá
  const [ratingModal, setRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingContent, setRatingContent] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const {
    myCourses,
    isMyCoursesLoading,
    myCoursesError,
    getMyCourses,
    updateComment,
  } = useCourses();

  // Gọi API một lần khi component được tải
  useEffect(() => {
    getMyCourses();
  }, [getMyCourses]);

  // Đóng Popup khi nhấn ESC - Tắt lần lượt từ popup trên cùng
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Nếu rating modal đang mở, tắt nó trước (vì nó nằm trên cùng)
        if (ratingModal) {
          closeRatingModal();
        }
        // Nếu không có rating modal, mới tắt comments modal
        else if (commentsModal) {
          closeCommentsModal();
        }
      }
    };

    // Chỉ thêm listener khi có ít nhất một modal đang mở
    if (commentsModal || ratingModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [commentsModal, ratingModal]);

  // Biến đổi dữ liệu: Gắn dữ liệu hardcode (progress) vào dữ liệu thật (myCourses)
  const coursesWithProgress: CourseProgress[] = useMemo(() => {
    return myCourses.map(course => ({
      ...course, // Lấy id, name, imageUrl, instructorName, rating từ API

      // Dữ liệu tiến độ (hiện đang hardcode, sau này sẽ thay bằng dữ liệu thật)
      durationHours: 10, 
      lessonsCompleted: 5,
      lessonsTotal: 10,
      status: "inProgress" as CourseStatus, // Giả sử tất cả đang học
      progress: 50, // Giả sử 50%
      lastActivity: "Hôm qua", 
    }));
  }, [myCourses]); // Chỉ tính toán lại khi `myCourses` từ API thay đổi

  // Tính toán các số liệu thống kê dựa trên dữ liệu đã biến đổi
  const totalHours = useMemo(
    () => coursesWithProgress.reduce((sum: number, course) => sum + course.durationHours, 0),
    [coursesWithProgress]
  );
  const completedCount = useMemo(
    () => coursesWithProgress.filter((course) => course.status === "completed").length,
    [coursesWithProgress]
  );
  const inProgressCount = useMemo(
    () => coursesWithProgress.filter((course) => course.status === "inProgress").length,
    [coursesWithProgress]
  );
  const notStartedCount = coursesWithProgress.length - completedCount - inProgressCount;
  
  const averageProgress = Math.round(
    coursesWithProgress.reduce((sum: number, course) => sum + course.progress, 0) / (coursesWithProgress.length || 1)
  );

  const openCommentsModal = async (course: CourseProgress) => {
    setCommentsModal(course);
    setIsLoadingComments(true);
    setCommentsData(null);

    try {
      const response = await courseService.getCourseComments(course.id);

      if (response.success) {
        setCommentsData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const closeCommentsModal = () => {
    setCommentsModal(null);
    setCommentsData(null);
  };

  const openRatingModal = () => {
    // Nếu đã có myComment, điền sẵn dữ liệu
    if (commentsData?.myComment) {
      setRatingValue(commentsData.myComment.rate);
      setRatingContent(commentsData.myComment.content);
    } else {
      setRatingValue(5);
      setRatingContent("");
    }
    setRatingModal(true);
  };

  const closeRatingModal = () => {
    setRatingModal(false);
    setRatingValue(5);
    setRatingContent("");
  };

  const handleSubmitRating = async () => {
    if (!commentsModal) return;

    setIsSubmittingRating(true);
    try {
      let success = false;

      // Kiểm tra xem đã có comment chưa
      if (commentsData?.myComment) {
        // Đã có comment -> Gọi API update
        success = await updateComment(
          commentsData.myComment.commentId,
          {
            rate: ratingValue,
            content: ratingContent,
          },
          commentsModal.id
        );
      } else {
        // Chưa có comment -> Gọi API add
        const response = await courseService.addComment({
          courseId: commentsModal.id,
          rate: ratingValue,
          content: ratingContent,
        });
        success = response.success;
        if (!success) {
          alert(response.message || 'Không thể gửi đánh giá');
        }
      }

      if (success) {
        // Đóng modal đánh giá và tải lại comments
        closeRatingModal();
        const commentsResponse = await courseService.getCourseComments(commentsModal.id);
        if (commentsResponse.success) {
          setCommentsData(commentsResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Đã xảy ra lỗi khi gửi đánh giá');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Lọc danh sách khóa học hiển thị dựa trên filter và search term
  const visibleCourses = useMemo(() => {
    return coursesWithProgress.filter((course) => {
      const matchesFilter =
        activeFilter === "all" || course.status === activeFilter;
      const matchesSearch = course.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [coursesWithProgress, activeFilter, searchTerm]);

  // --- RENDER ---
  return (
    <UserLayout>
      <div className="space-y-8">
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
        
        {/* Section Header & Stats */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {/* <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
                Dashboard
              </p> */}
              <h1 className="text-3xl font-bold text-gray-900">
                Khóa học của tôi
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Theo dõi tiến độ và tiếp tục học tập
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-12 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Stat: Total Courses */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efe7ff] text-[#5a2dff]">
                  <BookOpenIcon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold uppercase text-indigo-400">
                  Tổng cộng
                </span>
              </div>
              <p className="mt-6 text-3xl font-semibold text-gray-900">
                {coursesWithProgress.length}
              </p>
              <p className="text-sm text-gray-500">Khóa học đã đăng ký</p>
            </div>
            {/* Stat: Completed */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <CheckCircleIcon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold uppercase text-emerald-400">
                  Đã hoàn thành
                </span>
              </div>
              <p className="mt-6 text-3xl font-semibold text-gray-900">
                {completedCount}
              </p>
              <p className="text-sm text-gray-500">Khóa học đã kết thúc</p>
            </div>
            {/* Stat: Total Hours */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
                  <ClockIcon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold uppercase text-sky-400">
                  Tổng thời gian
                </span>
              </div>
              <p className="mt-6 text-3xl font-semibold text-gray-900">
                {totalHours}h
              </p>
              <p className="text-sm text-gray-500">Thời gian học tích lũy</p>
            </div>
            {/* Stat: In Progress */}
            <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <SparklesIcon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold uppercase text-indigo-400">
                  Đang học
                </span>
              </div>
              <p className="mt-6 text-3xl font-semibold text-gray-900">
                {inProgressCount}
              </p>
              <p className="text-sm text-gray-500">Khóa học đang theo dõi</p>
            </div>
          </div>
        </section>

        {/* Section Main Content (List) & Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          {/* Main Content: Course List */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-500">
              {filters.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-full px-4 py-2 transition ${
                    activeFilter === tab.value
                      ? "bg-white text-[#5a2dff] shadow"
                      : "hover:text-[#5a2dff]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {/* Trạng thái Loading / Error */}
              {isMyCoursesLoading && (
                <div className="text-center p-8">Đang tải các khóa học của bạn...</div>
              )}
              {myCoursesError && (
                <div className="text-center p-8 text-red-500">{myCoursesError}</div>
              )}

              {/* Render danh sách khóa học */}
              {!isMyCoursesLoading && !myCoursesError && visibleCourses.map((course) => {
                // (Các biến logic bên trong map giữ nguyên)
                const lessonsLabel = `${course.lessonsCompleted}/${course.lessonsTotal} bài học`;
                const statusBadge =
                  course.status === "completed"
                    ? "bg-emerald-50 text-emerald-600"
                    : course.status === "inProgress"
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-gray-100 text-gray-500";
                const statusText =
                  course.status === "completed"
                    ? "Đã hoàn thành"
                    : course.status === "inProgress"
                    ? "Đang học"
                    : "Chưa bắt đầu";
                const actionLabel =
                  course.status === "completed"
                    ? "Xem lại"
                    : course.status === "inProgress"
                    ? "Tiếp tục"
                    : "Bắt đầu";
                const actionVariant = "bg-[#5a2dff]"; // Luôn là màu chính

                return (
                  <article
                    key={course.id}
                    className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(15,23,42,0.12)] sm:flex-row"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-48">
                      <img
                        src={course.imageUrl || "https://placehold.co/900x600"}
                        alt={course.name}
                        className="h-full w-full object-cover transition duration-300 sm:group-hover:scale-105"
                      />
                      <span
                        className={`absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
                      >
                        {statusText}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 truncate min-w-0 max-w-xs"
                                title={course.name}>
                              {course.name}
                            </h2>
                            <p className="text-sm text-gray-500 truncate min-w-0 max-w-xs"
                               title={course.instructorName}>
                              {course.instructorName}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-amber-500">
                            ★ {course.rating.toFixed(1)} {/* Dùng rating thật */}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                            <span>{lessonsLabel}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#5a2dff] transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400">
                            Lần học cuối: {course.lastActivity}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-gray-500">
                          Thời lượng:{" "}
                          <span className="font-semibold text-gray-900">
                            {course.durationHours} giờ
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          {/* 3. THÊM onClick VÀO NÚT NÀY */}
                          <button
                            type="button"
                            onClick={() => navigate(`/user/course-progress/${course.id}`)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition ${actionVariant} hover:bg-[#4a21eb]`}
                          >
                            {actionLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => openCommentsModal(course)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 hover:border-indigo-400"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            Nhận xét
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* Trạng thái Rỗng */}
              {!isMyCoursesLoading && !myCoursesError && !visibleCourses.length && (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy khóa học nào khớp với tìm kiếm."
                    : "Bạn chưa đăng ký khóa học nào trong mục này."
                  }
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">
                Tiến độ tổng quan
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Mức độ hoàn thành trung bình của tất cả khóa học
              </p>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#efe7ff]">
                  <span className="text-2xl font-semibold text-[#5a2dff]">
                    {averageProgress}%
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Đã hoàn thành</span>
                    <span className="font-semibold text-gray-900">
                      {completedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Đang học</span>
                    <span className="font-semibold text-gray-900">
                      {inProgressCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chưa bắt đầu</span>
                    <span className="font-semibold text-gray-900">
                      {notStartedCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thao tác nhanh
                </h3>
                <div className="mt-4 space-y-3">
                  {quickActions.map(({ title, icon: Icon, href }) => (
                    <a
                      key={title}
                      href={href}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#efe7ff]">
                          <Icon className="h-5 w-5 text-[#5a2dff]" />
                        </span>
                        {title}
                      </span>
                      <span className="text-lg text-gray-300">›</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
                <h3 className="text-lg font-semibold text-gray-900">
                  Thành tích gần đây
                </h3>
                <ul className="mt-4 space-y-4 text-sm text-gray-600">
                  {achievements.map((achievement) => (
                    <li key={achievement.title} className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-gray-900">
                        {achievement.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        {achievement.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Comments Modal */}
      {commentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-8 pb-6 border-b border-gray-100">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Nhận xét khóa học
                </h2>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{commentsModal.name}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isLoadingComments && commentsData && (
                  <button
                    type="button"
                    onClick={openRatingModal}
                    className="rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a21eb] flex items-center gap-2"
                  >
                    <StarIcon className="h-4 w-4" />
                    {commentsData.myComment ? 'Đánh giá lại' : 'Đánh giá'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCommentsModal}
                  className="flex-shrink-0 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isLoadingComments ? (
                <div className="text-center py-12 text-gray-500">
                  Đang tải nhận xét...
                </div>
              ) : commentsData ? (
                <div className="space-y-6">
                  {/* My Comment Section */}
                  {commentsData.myComment && (
                    <div className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {commentsData.myComment.avatarUrl ? (
                            <img
                              src={commentsData.myComment.avatarUrl}
                              alt={commentsData.myComment.userName}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                              <span className="text-indigo-700 font-semibold text-lg">
                                {commentsData.myComment.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{commentsData.myComment.userName} <span className="text-xs font-normal text-indigo-600">(Bạn)</span></p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < commentsData.myComment!.rate ? 'text-amber-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(commentsData.myComment.timestamp)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-gray-700">{commentsData.myComment.content}</p>

                          {/* Replies from instructor for my comment */}
                          {commentsData.myComment.replies && commentsData.myComment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-indigo-300">
                              {commentsData.myComment.replies.map((reply) => (
                                <div key={reply.commentId} className="rounded-xl bg-white p-4 shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs">GV</span>
                                      </div>
                                      <p className="text-sm font-semibold text-indigo-700">Phản hồi từ giảng viên</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {formatDate(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-sm text-gray-700">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Comments Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tất cả nhận xét ({commentsData.allComments.length})
                    </h3>
                    <div className="space-y-5">
                      {commentsData.allComments.map((comment) => (
                        <div key={comment.commentId} className="rounded-2xl border border-gray-100 bg-white p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {comment.avatarUrl ? (
                                <img
                                  src={comment.avatarUrl}
                                  alt={comment.userName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-700 font-semibold">
                                    {comment.userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{comment.userName}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <StarIcon
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < comment.rate ? 'text-amber-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              <p className="mt-3 text-sm text-gray-700">{comment.content}</p>

                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 space-y-3 pl-4 border-l-2 border-indigo-200">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.commentId} className="rounded-xl bg-indigo-50 p-4 shadow-sm">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                            <span className="text-white font-semibold text-xs">GV</span>
                                          </div>
                                          <p className="text-sm font-semibold text-indigo-700">Phản hồi từ giảng viên</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                          {formatDate(reply.timestamp)}
                                        </span>
                                      </div>
                                      <p className="mt-2 text-sm text-gray-700">{reply.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {commentsData.allComments.length === 0 && !commentsData.myComment && (
                    <div className="text-center py-12 text-gray-500">
                      Chưa có nhận xét nào cho khóa học này
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-red-500">
                  Không thể tải nhận xét. Vui lòng thử lại.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && commentsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {commentsData?.myComment ? 'Đánh giá lại khóa học' : 'Đánh giá khóa học'}
              </h3>
              <button
                type="button"
                onClick={closeRatingModal}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-600">{commentsModal.name}</p>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Đánh giá của bạn
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="transition hover:scale-110"
                    >
                      <StarIcon
                        className={`h-8 w-8 ${
                          star <= ratingValue ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700">
                    {ratingValue}/5
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="rating-content" className="block text-sm font-semibold text-gray-900">
                  Nhận xét của bạn
                </label>
                <textarea
                  id="rating-content"
                  value={ratingContent}
                  onChange={(e) => setRatingContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#5a2dff] focus:bg-white resize-none"
                  placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                type="button"
                onClick={closeRatingModal}
                disabled={isSubmittingRating}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating || !ratingContent.trim()}
                className="rounded-full bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a21eb] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRating ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default MyCoursePage;