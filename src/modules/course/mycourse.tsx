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
} from "@heroicons/react/24/outline";
// 1. THÊM useNavigate
import { Link, useNavigate } from "react-router-dom";
import UserLayout from "../user/layout/layout"; 

import type { MyCourse } from './models/course.ts';
import { useCourses } from './hooks/useCourses'; 

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
  { label: "All Courses", value: "all" },
  { label: "In Progress", value: "inProgress" },
  { label: "Completed", value: "completed" },
  { label: "Not Started", value: "notStarted" },
];

const quickActions = [
  { title: "Browse More Courses", icon: BookOpenIcon, href: "/courses" },
  { title: "Set Learning Goals", icon: SparklesIcon, href: "#" },
  { title: "Download Certificates", icon: DocumentArrowDownIcon, href: "#" },
];

const achievements = [
  { title: "First Course Completed", date: "Jan 18, 2024" },
  { title: "5 Hours Learned", date: "Jan 15, 2024" },
  { title: "JavaScript Expert", date: "Jan 18, 2024" },
  { title: "Week Streak", date: "Jan 20, 2024" },
];

// --- COMPONENT ---

const MyCoursePage: React.FC = () => {
  // 2. KHỞI TẠO NAVIGATE
  const navigate = useNavigate();

  // State quản lý UI (filter và search)
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    myCourses, 
    isMyCoursesLoading, 
    myCoursesError, 
    getMyCourses 
  } = useCourses();

  // Gọi API một lần khi component được tải
  useEffect(() => {
    getMyCourses();
  }, [getMyCourses]); // [getMyCourses] an toàn vì đã được bọc trong useCallback ở hook

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
                    ? "Completed"
                    : course.status === "inProgress"
                    ? "In Progress"
                    : "Not Started";
                const actionLabel =
                  course.status === "completed"
                    ? "Review"
                    : course.status === "inProgress"
                    ? "Continue"
                    : "Start";
                const actionVariant = "bg-[#5a2dff]"; // Luôn là màu chính

                return (
                  <article
                    key={course.id}
                    className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(15,23,42,0.12)] sm:flex-row"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-48">
                      <img
                        src={course.imageUrl || "https://via.placeholder.com/900x600"}
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
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {course.name}
                            </h2>
                            <p className="text-sm text-gray-500">
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
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                          >
                            Tải tài liệu
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
                Overall Progress
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Average completion across all courses
              </p>
              <div className="mt-6 flex items-center gap-6">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[#efe7ff]">
                  <span className="text-2xl font-semibold text-[#5a2dff]">
                    {averageProgress}%
                  </span>
                </div>
                <div className="space-y-3 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-semibold text-gray-900">
                      {completedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <span className="font-semibold text-gray-900">
                      {inProgressCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Not Started</span>
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
                  Quick Actions
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
                  Recent Achievements
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
    </UserLayout>
  );
};

export default MyCoursePage;