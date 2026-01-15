import React from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import UserLayout from "./layout/layout";

import type { MyCourse as MyCourseModel } from './models/course';

type CourseStatus = "completed" | "inProgress" | "notStarted";
type FilterValue = "all" | CourseStatus;

type CourseProgress = MyCourseModel & {
  durationHours: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  status: CourseStatus;
  progress: number;
  lastActivity: string;
};

// ... các hằng số khác giữ nguyên ...
const filters: { label: string; value: FilterValue }[] = [
  { label: "All Courses", value: "all" },
  { label: "In Progress", value: "inProgress" },
  { label: "Completed", value: "completed" },
  { label: "Not Started", value: "notStarted" },
];

const quickActions = [
  { title: "Browse More Courses", icon: BookOpenIcon, to: "/courses" },
  { title: "Set Learning Goals", icon: SparklesIcon, to: "#" },
  { title: "Download Certificates", icon: DocumentArrowDownIcon, to: "#" },
];

const achievements = [
  { title: "First Course Completed", date: "Jan 18, 2024", Icon: AcademicCapIcon, accent: "text-[#5a2dff]" },
  { title: "5 Hours Learned", date: "Jan 15, 2024", Icon: ClockIcon, accent: "text-sky-500" },
  { title: "JavaScript Expert", date: "Jan 18, 2024", Icon: RocketLaunchIcon, accent: "text-amber-500" },
  { title: "Week Streak", date: "Jan 20, 2024", Icon: FireIcon, accent: "text-orange-500" },
];

// new helpers
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/900x600?text=EduViet";

const toNumber = (value: unknown): number =>
  typeof value === "number" && !Number.isNaN(value) ? value : 0;

const normalizeLastActivity = (value: unknown): string => {
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("vi-VN");
    }
  }
  return "Đang học";
};

const mapCourseProgress = (course: MyCourseModel): CourseProgress => {
  const raw = course as Record<string, unknown>;
  const lessonsTotal = toNumber(raw.lessonsTotal ?? raw.totalLessons ?? raw.lessonCount);
  const lessonsCompleted = toNumber(
    raw.lessonsCompleted ??
      raw.completedLessons ??
      raw.lessonCompletedCount ??
      raw.completedLessonCount
  );
  const rawProgress =
    toNumber(raw.progress ?? raw.process) ||
    (lessonsTotal ? (lessonsCompleted / lessonsTotal) * 100 : 0);
  const progress = Math.max(0, Math.min(100, Math.round(rawProgress)));
  const status: CourseStatus =
    progress >= 100 ? "completed" : progress > 0 ? "inProgress" : "notStarted";
  const durationMinutes = toNumber(raw.durationMinutes ?? raw.totalDurationMinutes);
  const durationHours =
    toNumber(raw.durationHours ?? raw.totalDurationHours) ||
    (durationMinutes ? Math.ceil(durationMinutes / 60) : toNumber(raw.duration));
  const lastActivity = normalizeLastActivity(
    raw.lastActivity ?? raw.lastAccessedAt ?? raw.updatedAt ?? raw.createdAt
  );
  const imageUrl =
    course.imageUrl ??
    (raw.thumbnailUrl as string | undefined) ??
    (raw.coverImage as string | undefined) ??
    PLACEHOLDER_IMAGE;

  return {
    ...course,
    imageUrl,
    durationHours,
    lessonsCompleted,
    lessonsTotal,
    status,
    progress,
    lastActivity,
  };
};

const mockCourseSource: Array<MyCourseModel & Record<string, unknown>> = [
  {
    id: "react-dev-2024",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    name: "Complete React Developer Course 2024",
    instructorName: "Nguyễn Văn A",
    rating: 4.8,
    price: 449000,
    lessonsCompleted: 30,
    lessonsTotal: 42,
    progress: 72,
    durationHours: 42,
    lastActivity: "2024-01-18",
  },
  {
    id: "python-beginner",
    imageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
    name: "Python cho Người Mới Bắt Đầu",
    instructorName: "Trần Thị B",
    rating: 4.9,
    price: 449000,
    lessonsCompleted: 120,
    lessonsTotal: 120,
    progress: 100,
    durationHours: 35,
    lastActivity: "2024-01-12",
  },
  {
    id: "digital-marketing-2024",
    imageUrl: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    name: "Digital Marketing Mastery 2024",
    instructorName: "Lê Văn C",
    rating: 4.7,
    price: 699000,
    lessonsCompleted: 0,
    lessonsTotal: 95,
    progress: 0,
    durationHours: 28,
    lastActivity: "Đang học",
  },
];

const MyCourse: React.FC = () => {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const myCourses = React.useMemo(
    () => mockCourseSource.map(mapCourseProgress),
    []
  );

  // ... các hàm tính toán `useMemo` khác giữ nguyên ...
  const totalHours = React.useMemo(
    () =>
      Math.round(
        myCourses.reduce(
          (sum: number, course) => sum + (course.durationHours || 0),
          0
        )
      ),
    [myCourses]
  );
  const completedCount = React.useMemo(
    () => myCourses.filter((course) => course.status === "completed").length,
    [myCourses]
  );
  const inProgressCount = React.useMemo(
    () => myCourses.filter((course) => course.status === "inProgress").length,
    [myCourses]
  );
  const notStartedCount = myCourses.length - completedCount - inProgressCount;
  const averageProgress = Math.round(
    myCourses.reduce((sum: number, course) => sum + course.progress, 0) / (myCourses.length || 1)
  );

  // THAY ĐỔI 2: Tạm thời vô hiệu hóa bộ lọc và tìm kiếm
  const visibleCourses = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return myCourses.filter((course) => {
      const matchesFilter =
        activeFilter === "all" ? true : course.status === activeFilter;
      if (!normalizedSearch) {
        return matchesFilter;
      }
      const name = (course.name ?? "").toLowerCase();
      const instructor = (course.instructorName ?? "").toLowerCase();
      return (
        matchesFilter &&
        (name.includes(normalizedSearch) || instructor.includes(normalizedSearch))
      );
    });
  }, [activeFilter, searchTerm, myCourses]);

  // Phần Giao diện (JSX) bên dưới không cần thay đổi
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
                {myCourses.length}
              </p>
              <p className="text-sm text-gray-500">Khóa học đã đăng ký</p>
            </div>

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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
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
              {visibleCourses.map((course) => {
                  const lessonsLabel = course.lessonsTotal
                    ? `${course.lessonsCompleted}/${course.lessonsTotal} bài học`
                    : "Chưa có dữ liệu bài học";
                  const isCompleted = course.status === "completed";
                  const isInProgress = course.status === "inProgress";
                  const progressTone = isCompleted ? "bg-emerald-500" : "bg-[#5a2dff]";
                  const primaryLabel = isCompleted ? "Review" : isInProgress ? "Continue" : "Start";
                  const ratingSource = (course as Record<string, unknown>).averageRating ?? course.rating ?? 0;
                  const ratingValue =
                    typeof ratingSource === "number"
                      ? ratingSource
                      : Number.parseFloat(String(ratingSource)) || 0;
                  const durationLabel = course.durationHours
                    ? `${course.durationHours} giờ`
                    : "Đang cập nhật";
                  return (
                    <article
                      key={course.id}
                      className="group flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(15,23,42,0.12)] sm:flex-row"
                    >
                      <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-48">
                        <img
                          src={course.imageUrl || PLACEHOLDER_IMAGE}
                          alt={course.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span
                          className={`absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-600"
                              : isInProgress
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Not Started"}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h2 className="text-lg font-semibold text-gray-900">{course.name}</h2>
                              <p className="text-sm text-gray-500">{course.instructorName}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
                              <StarIcon className="h-5 w-5" />
                              {ratingValue.toFixed(1)}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                              <span>Progress</span>
                              <span className="text-gray-900">{course.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full ${progressTone} transition-all`}
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <BookOpenIcon className="h-4 w-4" />
                                {lessonsLabel}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {durationLabel}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <SparklesIcon className="h-4 w-4" />
                                Lần học cuối: {course.lastActivity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/user/course-progress/${course.id}`}
                              className="rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]">
                              {primaryLabel}
                            </Link>
                            {isCompleted ? (
                              <button
                                type="button"
                                className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                              >
                                Chứng chỉ
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                                >
                                  <BookmarkIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                                >
                                  <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              {!visibleCourses.length && (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                  Bạn chưa đăng ký khóa học nào.
                </div>
              )}
            </div>
          </section>
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
                {quickActions.map(({ title, icon: Icon, to }) => (
                  <Link
                    key={title}
                    to={to}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#efe7ff]">
                        <Icon className="h-5 w-5 text-[#5a2dff]" />
                      </span>
                      {title}
                    </span>
                    <span className="text-lg text-gray-300 transition group-hover:text-[#5a2dff]">›</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Achievements
              </h3>
              <ul className="mt-4 space-y-4 text-sm text-gray-600">
                {achievements.map(({ title, date, Icon, accent }) => (
                  <li key={title} className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f2ff] ${accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400">{date}</p>
                    </div>
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

export default MyCourse;