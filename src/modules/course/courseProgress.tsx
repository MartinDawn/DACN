// src/modules/user/courseProgress.tsx

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UserLayout from './layout/layout'; // Đảm bảo đường dẫn layout đúng
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon, // Giữ lại icon
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/20/solid';

// 1. IMPORT HOOK
import { useCourses } from './hooks/useCourses'; // Đảm bảo đường dẫn hook đúng

// --- TYPES & CONSTANTS (ĐÃ SỬA) ---

// 2. LOẠI BỎ 'assignment' VÌ API KHÔNG CUNG CẤP
export type LessonType = 'video' | 'quiz' | 'doc';
type LessonFilterValue = 'all' | LessonType;

export interface LessonItem {
  id: string;
  title: string;
  type: LessonType; // <-- Type đã được sửa
  duration: string;
  isPreview?: boolean;
  isCompleted?: boolean;
}
// ... (Các interface khác giữ nguyên) ...
export interface CourseSection {
  id: string;
  title: string;
  summary: string;
  totalDuration: string;
  items: LessonItem[];
}
export interface CourseHelpLink {
  id: string;
  label: string;
  description: string;
}
export interface CourseOverview {
  duration: string;
  level: string;
  language: string;
  access: string;
}
export interface CourseInstructorInfo {
  name: string;
  title: string;
  initials: string;
  students: number;
  courses: number; // Model CourseDetail không có, sẽ mock
  rating: number;
}
export interface CourseProgressData {
  id: string;
  title: string;
  instructor: string;
  updatedAt: string;
  stats: {
    completion: number;
    lessonsCompleted: number;
    totalLessons: number;
    timeSpent: string;
    totalTime: string;
    averageScore: number;
  };
  sections: CourseSection[];
  overview: CourseOverview;
  instructorInfo: CourseInstructorInfo;
  helpLinks: CourseHelpLink[];
}


// 3. LOẠI BỎ 'assignment' KHỎI CÁC CONST
export const lessonTypeLabel: Record<LessonType, string> = {
  video: 'Video',
  quiz: 'Quiz',
  doc: 'Tài liệu',
};
export const lessonTypeStyles: Record<LessonType, string> = {
  video: 'bg-indigo-100 text-indigo-600',
  quiz: 'bg-amber-100 text-amber-600',
  doc: 'bg-sky-100 text-sky-600',
};
export const lessonTypeIcons: Record<LessonType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  video: PlayCircleIcon,
  quiz: QuestionMarkCircleIcon,
  doc: DocumentTextIcon,
};
export const lessonIconWrappers: Record<LessonType, string> = {
  video: 'bg-indigo-50 text-indigo-500',
  quiz: 'bg-amber-50 text-amber-500',
  doc: 'bg-sky-50 text-sky-500',
};
export const lessonTypeDescriptions: Record<LessonType, string> = {
  video: 'Bài giảng video với ví dụ trực quan và hướng dẫn chi tiết.',
  quiz: 'Quiz ngắn giúp bạn củng cố kiến thức vừa học.',
  doc: 'Tài liệu tham khảo và checklist hỗ trợ học tập.',
};

export const normalizeToFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
export const DEFAULT_DOCUMENT_DOWNLOAD_PATH = '/resources/sample-react-handout.txt';
export const lessonStatusStyles = {
  completed: 'border-emerald-500 bg-emerald-50 text-emerald-500',
  locked: 'border-slate-200 bg-white text-slate-300',
};

// 4. LOẠI BỎ 'assignment' KHỎI BỘ LỌC
export const lessonFilterTabs: Array<{ label: string; value: LessonFilterValue }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Video', value: 'video' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Tài liệu', value: 'doc' },
];

// --- COMPONENT CHÍNH ---

const CourseProgressPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // 5. GỌI HOOK ĐỂ LẤY TẤT CẢ DỮ LIỆU CẦN THIẾT
  const { 
    courseContent, 
    isContentLoading, 
    contentError, 
    getCourseContent,
    courseDetail,     // <-- LẤY DỮ LIỆU MỚI
    isDetailLoading,  // <-- LẤY STATE MỚI
    detailError,      // <-- LẤY STATE MỚI
    getCourseDetail   // <-- LẤY HÀM MỚI
  } = useCourses();

  // 6. GỌI CẢ 2 API KHI COMPONENT MOUNT
  useEffect(() => {
    if (courseId) {
      getCourseContent(courseId);
      getCourseDetail(courseId); // <-- GỌI API THỨ 2
    } else {
      navigate('/user/mycourses');
    }
  }, [courseId, getCourseContent, getCourseDetail, navigate]);

  // 7. "BẮC CẦU" (TRANSFORM) DỮ LIỆU TỪ 2 API
  const course = useMemo((): CourseProgressData | null => {
    // Đợi cho đến khi CẢ HAI API đều trả về dữ liệu
    if (!courseContent || !courseDetail) return null;

    // --- Phần 1: Xử lý `courseContent` (Danh sách bài học) ---
    const transformedSections: CourseSection[] = courseContent.lectures
      .sort((a, b) => a.name.localeCompare(b.name)) // Sắp xếp chương
      .map(lecture => {
      const items: LessonItem[] = []; // Type đã sửa

      lecture.videoNames.forEach((name, index) => {
        items.push({ id: `${lecture.id}-video-${index}`, title: name, type: 'video', duration: 'N/A', isCompleted: false, isPreview: false });
      });
      lecture.documentNames.forEach((name, index) => {
        items.push({ id: `${lecture.id}-doc-${index}`, title: name, type: 'doc', duration: 'Tài liệu', isCompleted: false, isPreview: false });
      });
      lecture.quizNames.forEach((name, index) => {
        items.push({ id: `${lecture.id}-quiz-${index}`, title: name, type: 'quiz', duration: 'N/A', isCompleted: false, isPreview: false });
      });
      
      return {
        id: lecture.id,
        title: lecture.name,
        summary: lecture.description,
        totalDuration: 'N/A', // courseContent không cấp
        items: items,
      };
    });

    const totalLessons = transformedSections.reduce((acc, s) => acc + s.items.length, 0);

    // --- Phần 2: Xử lý `courseDetail` (Thông tin chung) ---
    const getInitials = (name: string) => {
       return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return {
      // Dữ liệu từ `courseContent`
      id: courseContent.id,
      title: courseContent.name, // Lấy tên từ content (hoặc courseDetail.name)
      sections: transformedSections,

      // --- DỮ LIỆU THẬT TỪ `courseDetail` ---
      instructor: courseDetail.instructorName,
      updatedAt: `Cập nhật: N/A`, // Model `CourseDetail` không có, ta mock
      
      overview: {
        duration: `${courseDetail.totalHours} giờ`,
        level: 'Mọi cấp độ', // Mock, `CourseDetail` không có
        language: 'Tiếng Việt', // Mock
        access: 'Trọn đời', // Mock
      },
      instructorInfo: {
        name: courseDetail.instructorName,
        title: 'Giảng viên', // Mock, `CourseDetail` không có
        initials: getInitials(courseDetail.instructorName), // Tự suy luận
        students: courseDetail.totalStudents,
        courses: 0, // Mock, `CourseDetail` không có
        rating: courseDetail.rating,
      },

      // --- DỮ LIỆU VẪN PHẢI MOCK (Tiến độ) ---
      stats: {
        completion: 0, 
        lessonsCompleted: 0, 
        totalLessons: totalLessons, // Thật
        timeSpent: '0h',
        totalTime: `${courseDetail.totalHours} giờ`, // Thật
        averageScore: 0,
      },

      // --- DỮ LIỆU MOCK (UI) ---
      helpLinks: [
         { id: 'qa', label: 'Hỏi đáp', description: 'Đặt câu hỏi cho giảng viên' },
         { id: 'resources', label: 'Tải tài liệu', description: 'Xem tài nguyên đính kèm' },
      ],
    };
  }, [courseContent, courseDetail]); // Tính toán lại khi 1 trong 2 API xong

  // 8. QUẢN LÝ STATE CỦA UI (Giữ nguyên)
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<LessonFilterValue>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (course) {
      setSearchTerm('');
      setActiveFilter('all');
      setExpandedItems({});
      setExpandedSections(
        course.sections.reduce((acc, section, index) => {
          acc[section.id] = index === 0;
          return acc;
        }, {} as Record<string, boolean>)
      );
    }
  }, [course]);

  // 9. GIỮ NGUYÊN CÁC HÀM LOGIC (Giữ nguyên)
  const toggleSection = (sectionId: string) =>
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  const toggleItem = (itemId: string) =>
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const openLesson = useCallback(
    (lessonId: string) => {
      if (course) {
        navigate(`/user/course-progress/${course.id}/lesson/${lessonId}`);
      }
    },
    [navigate, course]
  );
  const downloadDocument = useCallback((item: LessonItem) => {
    if (item.type !== 'doc' || typeof document === 'undefined') return;
    const anchor = document.createElement('a');
    anchor.href = DEFAULT_DOCUMENT_DOWNLOAD_PATH;
    anchor.rel = 'noopener';
    anchor.download = `${normalizeToFileName(item.title)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, []);

  // 10. XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR (Gộp cả hai)
  const isLoading = isContentLoading || isDetailLoading;
  const apiError = contentError || detailError;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">Đang tải dữ liệu khóa học...</p>
        </div>
      </UserLayout>
    );
  }

  if (apiError) {
    return (
      <UserLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-red-600">{apiError}</p>
          <Link
            to="/user/mycourses"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Quay lại
          </Link>
        </div>
      </UserLayout>
    );
  }

  if (!course) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">Không tìm thấy dữ liệu khóa học.</p>
        </div>
      </UserLayout>
    );
  }

  // 11. TÍNH TOÁN METRICS (Giữ nguyên, dùng `stats` từ `course`)
   const metrics = [
    {
      label: 'Hoàn thành',
      value: `${course.stats.completion}%`,
      hint: `${course.stats.lessonsCompleted}/${course.stats.totalLessons} nội dung`,
      icon: CheckCircleIcon,
      accent: 'bg-indigo-50 text-indigo-500',
    },
    {
      label: 'Bài học',
      value: `${course.stats.lessonsCompleted}/${course.stats.totalLessons}`,
      hint: 'Đã hoàn thành/Tổng nội dung',
      icon: BookOpenIcon,
      accent: 'bg-violet-50 text-violet-500',
    },
    {
      label: 'Thời gian học',
      value: course.stats.timeSpent, // Vẫn là mock (0h)
      hint: `Trong tổng ${course.stats.totalTime}`, // Lấy từ courseDetail
      icon: ClockIcon,
      accent: 'bg-sky-50 text-sky-500',
    },
    {
      label: 'Điểm trung bình',
      value: `${course.stats.averageScore}%`, // Vẫn là mock (0%)
      hint: 'Quiz & bài tập',
      icon: AcademicCapIcon,
      accent: 'bg-amber-50 text-amber-500',
    },
   ];

  // 12. TOÀN BỘ PHẦN JSX (RETURN) GIỮ NGUYÊN
  // Dữ liệu thật (từ `courseDetail`) sẽ tự động được điền vào
  return (
    <UserLayout>
      <div className="space-y-8 px-4 py-8 lg:px-10">
        <Link
          to="/user/mycourses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 transition hover:text-indigo-600"
        >
          <span className="text-base">←</span>
          Quay lại khóa học của tôi
        </Link>

        {/* Header (Dữ liệu thật) */}
        <section className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
                Khóa học của tôi › Chi tiết khóa học
              </p>
              <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                  <StarSolidIcon className="h-4 w-4" />
                  {course.instructorInfo.rating.toFixed(1)}
                </span>
                <span>• {course.instructorInfo.students.toLocaleString('vi-VN')} học viên</span>
                <span>• {course.updatedAt}</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{course.instructor}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
              {course.stats.completion}% hoàn thành
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-600">
              <span>
                Tiến trình khóa học: {course.stats.lessonsCompleted}/{course.stats.totalLessons} nội dung
              </span>
              <span>{course.stats.completion}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-500"
                style={{ width: `${course.stats.completion}%` }}
              />
            </div>
          </div>
        </section>

        {/* Metrics (Dữ liệu đã được trám) */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, hint, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5"
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-xs font-semibold uppercase text-slate-400">
                {label}
              </span>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{hint}</p>
            </div>
          ))}
        </section>

        {/* Filter/Search (ĐÃ SỬA) */}
        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm bài học, quiz, tài liệu..."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* `lessonFilterTabs` giờ đã không còn 'assignment' */}
              {lessonFilterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === tab.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content & Sidebar */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
          {/* Danh sách bài học */}
          <section className="space-y-6">
            {course.sections.map((section, index) => {
              const totalItems = section.items.length;
              const visibleItems = section.items.filter((item) => {
                const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
                const matchesSearch =
                  !normalizedSearch || item.title.toLowerCase().includes(normalizedSearch);
                return matchesFilter && matchesSearch;
              });
              const isSectionExpanded = expandedSections[section.id];
              return (
                <article
                  key={section.id}
                  className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-900/5"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">
                        {index + 1}. {section.title}
                      </h3>
                      <p className="text-sm text-slate-500">{section.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{totalItems} nội dung</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {section.totalDuration}
                      </span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition">
                        <ChevronDownIcon
                          className={`h-5 w-5 transition ${isSectionExpanded ? 'rotate-180' : ''}`}
                        />
                      </span>
                    </div>
                  </button>
                  {isSectionExpanded && (
                    <div className="border-t border-slate-100 px-6 py-5">
                      {visibleItems.length ? (
                        <ul className="space-y-3">
                          {visibleItems.map((item) => {
                            // 13. LỖI ĐÃ ĐƯỢC FIX
                            // `item.type` giờ là ('video' | 'quiz' | 'doc')
                            // và các const cũng chỉ chứa 3 key đó.
                            const LessonIcon = lessonTypeIcons[item.type];
                            const StatusIcon = item.isCompleted ? CheckCircleIcon : PlayCircleIcon;
                            const statusTone = item.isCompleted
                              ? lessonStatusStyles.completed
                              : lessonStatusStyles.locked;
                            const isItemExpanded = Boolean(expandedItems[item.id]);
                            return (
                              <li
                                key={item.id}
                                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-white"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex flex-1 items-center gap-4">
                                    <span
                                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${statusTone}`}
                                    >
                                      <StatusIcon className="h-5 w-5" />
                                    </span>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                      <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${lessonTypeStyles[item.type]}`}
                                      >
                                        {lessonTypeLabel[item.type]}
                                      </span>
                                      <span className="font-medium text-slate-900">
                                        {item.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                      <ClockIcon className="h-4 w-4" />
                                      {item.duration}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => openLesson(item.id)}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:text-indigo-600"
                                    >
                                      <PlayIcon className="h-4 w-4" />
                                    </button>
                                    {item.type === 'doc' && (
                                      <button
                                        type="button"
                                        onClick={() => downloadDocument(item)}
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:text-indigo-600"
                                      >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => toggleItem(item.id)}
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                                    >
                                      Thêm thông tin
                                      <ChevronDownIcon
                                        className={`h-4 w-4 transition ${isItemExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </button>
                                  </div>
                                </div>
                                {isItemExpanded && (
                                  <div className="mt-4 rounded-2xl bg-indigo-50/70 p-4 text-xs text-indigo-700">
                                    <p className="flex items-center gap-2 font-semibold">
                                      <span
                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl ${lessonIconWrappers[item.type]}`}
                                      >
                                        <LessonIcon className="h-4 w-4" />
                                      </span>
                                      Nội dung {lessonTypeLabel[item.type]}
                                    </p>
                                    <p className="mt-2 leading-relaxed text-indigo-600">
                                      {lessonTypeDescriptions[item.type]}
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-indigo-600 shadow-sm">
                                        <ClockIcon className="h-4 w-4" />
                                        {item.duration}
                                      </span>
                                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-indigo-600 shadow-sm">
                                        <LessonIcon className="h-4 w-4" />
                                        {lessonTypeLabel[item.type]}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="rounded-2xl bg-slate-50 p-6 text-sm font-semibold text-slate-500">
                          Không có nội dung phù hợp với bộ lọc hiện tại.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {/* Sidebar (Dữ liệu thật) */}
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Giảng viên</h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-semibold text-white">
                  {course.instructorInfo.initials}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{course.instructorInfo.name}</p>
                  <p className="text-sm text-slate-500">{course.instructorInfo.title}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>Học viên: {course.instructorInfo.students.toLocaleString('vi-VN')}</li>
                <li>Khóa học: {course.instructorInfo.courses}</li>
                <li>Đánh giá: {course.instructorInfo.rating.toFixed(1)}</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin khóa học</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Phần: {course.sections.length}</li>
                <li>Bài học: {course.stats.totalLessons}</li>
                <li>Thời lượng: {course.overview.duration}</li>
                <li>Cấp độ: {course.overview.level}</li>
                <li>Ngôn ngữ: {course.overview.language}</li>
                <li>Truy cập: {course.overview.access}</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Trợ giúp</h2>
              <ul className="mt-4 space-y-3">
                {course.helpLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      className="w-full rounded-2xl border border-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span className="block">{link.label}</span>
                      <small className="block text-xs font-normal text-slate-400">
                        {link.description}
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
};

export default CourseProgressPage;