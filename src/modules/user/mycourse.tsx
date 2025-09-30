import React from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import UserLayout from "./layout/layout";

type CourseStatus = "completed" | "inProgress" | "notStarted";
type FilterValue = "all" | CourseStatus;

type CourseProgress = {
  id: string;
  title: string;
  instructor: string;
  image: string;
  durationHours: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  rating: number;
  status: CourseStatus;
  progress: number;
  lastActivity: string;
};

const courses: CourseProgress[] = [
  {
    id: "react-dev",
    title: "Complete React Development Course",
    instructor: "John Smith",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    durationHours: 25,
    lessonsCompleted: 34,
    lessonsTotal: 45,
    rating: 4.8,
    status: "inProgress",
    progress: 75,
    lastActivity: "2 ngày trước",
  },
  {
    id: "js-master",
    title: "JavaScript Mastery",
    instructor: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    durationHours: 18,
    lessonsCompleted: 32,
    lessonsTotal: 32,
    rating: 4.6,
    status: "completed",
    progress: 100,
    lastActivity: "Hoàn thành 1 tuần trước",
  },
  {
    id: "uiux-fund",
    title: "UI/UX Design Fundamentals",
    instructor: "Mike Chen",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    durationHours: 15,
    lessonsCompleted: 8,
    lessonsTotal: 28,
    rating: 4.7,
    status: "inProgress",
    progress: 30,
    lastActivity: "5 ngày trước",
  },
  {
    id: "marketing",
    title: "Digital Marketing Strategy",
    instructor: "Emma Davis",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    durationHours: 22,
    lessonsCompleted: 0,
    lessonsTotal: 35,
    rating: 4.5,
    status: "notStarted",
    progress: 0,
    lastActivity: "Chưa bắt đầu",
  },
];

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

const MyCourse: React.FC = () => {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = React.useState("");

  const totalHours = React.useMemo(
    () => courses.reduce((sum, course) => sum + course.durationHours, 0),
    []
  );
  const completedCount = React.useMemo(
    () => courses.filter((course) => course.status === "completed").length,
    []
  );
  const inProgressCount = React.useMemo(
    () => courses.filter((course) => course.status === "inProgress").length,
    []
  );
  const notStartedCount = courses.length - completedCount - inProgressCount;
  const averageProgress = Math.round(
    courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
  );

  const visibleCourses = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesFilter =
        activeFilter === "all" ? true : course.status === activeFilter;
      const matchesSearch = normalizedSearch
        ? course.title.toLowerCase().includes(normalizedSearch) ||
          course.instructor.toLowerCase().includes(normalizedSearch)
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400">
                Dashboard
              </p>
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
                {courses.length}
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
                const actionVariant =
                  course.status === "completed"
                    ? "bg-[#5a2dff]"
                    : course.status === "inProgress"
                    ? "bg-[#5a2dff]"
                    : "bg-[#5a2dff]";
                return (
                  <article
                    key={course.id}
                    className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(15,23,42,0.12)] sm:flex-row"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:h-auto sm:w-48">
                      <img
                        src={course.image}
                        alt={course.title}
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
                              {course.title}
                            </h2>
                            <p className="text-sm text-gray-500">
                              {course.instructor}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-amber-500">
                            ★ {course.rating.toFixed(1)}
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
                          <button
                            type="button"
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
              {!visibleCourses.length && (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                  Không có khóa học nào khớp với bộ lọc hiện tại.
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

export default MyCourse;
