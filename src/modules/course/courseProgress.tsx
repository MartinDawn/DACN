// src/modules/course/courseProgress.tsx

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UserLayout from './layout/layout'; // Đảm bảo đường dẫn layout đúng
import {
  GraduationCap,
  Download,
  Book,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Search,
  PlayCircle,
  Play,
  HelpCircle,
  ArrowLeft,
  Star,
} from 'lucide-react';

// 1. IMPORT HOOK
import { useCourses } from './hooks/useCourses'; // Đảm bảo đường dẫn hook đúng
import { useLecture } from './hooks/useLecture';
import type { ApiLecture } from './models/course';

// --- TYPES & CONSTANTS (ĐÃ SỬA) ---

// 2. LOẠI BỎ 'assignment' VÌ API KHÔNG CUNG CẤP
export type LessonType = 'video' | 'quiz' | 'doc';
type LessonFilterValue = 'all' | LessonType;

export interface LessonItem {
  id: string;
  title: string;
  type: LessonType; // <-- Type đã được sửa
  duration: string;
  url?: string;
  videoId?: string;   // ID thực của video để gọi /api/Lecture/get-video/{videoId}
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
export const lessonTypeStyles: Record<LessonType, string> = {
  video: 'bg-indigo-100 text-indigo-600',
  quiz: 'bg-amber-100 text-amber-600',
  doc: 'bg-sky-100 text-sky-600',
};
export const lessonTypeIcons: Record<LessonType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  video: PlayCircle,
  quiz: HelpCircle,
  doc: FileText,
};
export const lessonIconWrappers: Record<LessonType, string> = {
  video: 'bg-indigo-50 text-indigo-500',
  quiz: 'bg-amber-50 text-amber-500',
  doc: 'bg-sky-50 text-sky-500',
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

// --- COMPONENT CHÍNH ---

const CourseProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const getLessonTypeLabel = (type: LessonType) => {
    return t(`lessonTypes.${type}`);
  };

  const getFilterTabs = () => [
    { label: t('courseProgress.all'), value: 'all' as LessonFilterValue },
    { label: t('lessonTypes.video'), value: 'video' as LessonFilterValue },
    { label: t('lessonTypes.quiz'), value: 'quiz' as LessonFilterValue },
    { label: t('lessonTypes.doc'), value: 'doc' as LessonFilterValue },
  ];

  const getLessonTypeDescription = (type: LessonType) => {
    return t(`lessonTypes.${type}Description`);
  };

  // --- HELPER: Chuyển đổi một lecture từ API thành danh sách LessonItem ---
  // Hỗ trợ 3 cấu trúc API có thể trả về:
  // 1. videoNames/documentNames/quizNames (string[])
  // 2. videos/documents/quizzes (object[] hoặc string[])
  // 3. lessons (array gộp chung với field 'type')
  const extractItemsFromLecture = (lecture: ApiLecture): LessonItem[] => {
    const items: LessonItem[] = [];

    const getName = (entry: { title?: string; name?: string } | string): string =>
      typeof entry === 'string' ? entry : (entry.title ?? entry.name ?? t('lessonContent.noTitle'));

    const getId = (entry: { id?: string } | string, fallback: string): string =>
      typeof entry === 'string' ? fallback : (entry.id ?? fallback);

    const LESSON_TYPE_MAP: Record<string | number, LessonType> = {
      0: 'video', video: 'video', Video: 'video',
      1: 'doc', doc: 'doc', document: 'doc', Document: 'doc',
      2: 'quiz', quiz: 'quiz', Quiz: 'quiz',
    };

    // --- Cấu trúc 3: lessons gộp chung ---
    if (Array.isArray(lecture.lessons) && lecture.lessons.length > 0) {
      lecture.lessons.forEach((lesson, index) => {
        const rawType = lesson.type ?? 'video';
        const type: LessonType = LESSON_TYPE_MAP[rawType] ?? 'video';
        const duration =
          lesson.duration != null
            ? typeof lesson.duration === 'number'
              ? `${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`
              : String(lesson.duration)
            : '';
        items.push({
          id: lesson.id ?? `${lecture.id}-lesson-${index}`,
          title: getName(lesson),
          type,
          duration,
          url: lesson.url ?? lesson.videoUrl,
          videoId: type === 'video' ? (lesson.videoId ?? lesson.id ?? undefined) : undefined,
          isCompleted: false,
          isPreview: false,
        });
      });
      return items;
    }

    // --- Cấu trúc 2: videos/documents/quizzes (object[] hoặc string[]) ---
    if (
      (lecture.videos && lecture.videos.length > 0) ||
      (lecture.documents && lecture.documents.length > 0) ||
      (lecture.quizzes && lecture.quizzes.length > 0)
    ) {
      (lecture.videos ?? []).forEach((v, i) => {
        items.push({ id: getId(v as { id?: string }, `${lecture.id}-video-${i}`), title: getName(v as string | { title?: string; name?: string }), type: 'video', duration: '', url: (v as { url?: string; videoUrl?: string }).url ?? (v as { url?: string; videoUrl?: string }).videoUrl, isCompleted: false, isPreview: false });
      });
      (lecture.documents ?? []).forEach((d, i) => {
        items.push({ id: getId(d as { id?: string }, `${lecture.id}-doc-${i}`), title: getName(d as string | { title?: string; name?: string }), type: 'doc', duration: '', isCompleted: false, isPreview: false });
      });
      (lecture.quizzes ?? []).forEach((q, i) => {
        items.push({ id: getId(q as { id?: string }, `${lecture.id}-quiz-${i}`), title: getName(q as string | { title?: string; name?: string }), type: 'quiz', duration: '', isCompleted: false, isPreview: false });
      });
      return items;
    }

    // --- Cấu trúc 1: videoNames/documentNames/quizNames (string[]) ---
    (lecture.videoNames ?? []).forEach((name, index) => {
      items.push({ id: `${lecture.id}-video-${index}`, title: name, type: 'video', duration: '', url: lecture.videoUrls?.[index], isCompleted: false, isPreview: false });
    });
    (lecture.documentNames ?? []).forEach((name, index) => {
      items.push({ id: `${lecture.id}-doc-${index}`, title: name, type: 'doc', duration: '', isCompleted: false, isPreview: false });
    });
    (lecture.quizNames ?? []).forEach((name, index) => {
      items.push({ id: `${lecture.id}-quiz-${index}`, title: name, type: 'quiz', duration: '', isCompleted: false, isPreview: false });
    });

    return items;
  };

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
      const items: LessonItem[] = extractItemsFromLecture(lecture);

      return {
        id: lecture.id,
        title: lecture.name,
        summary: lecture.description ?? '',
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
      updatedAt: t('courseProgress.updated', { date: 'N/A' }), // Model `CourseDetail` không có, ta mock

      overview: {
        duration: t('courseProgress.totalHours', { hours: courseDetail.totalHours }),
        level: t('courseProgress.allLevels'), // Mock, `CourseDetail` không có
        language: t('courseProgress.vietnamese'), // Mock
        access: t('courseProgress.lifetime'), // Mock
      },
      instructorInfo: {
        name: courseDetail.instructorName,
        title: t('courseProgress.instructor'), // Mock, `CourseDetail` không có
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
        totalTime: t('courseProgress.totalHours', { hours: courseDetail.totalHours }), // Thật
        averageScore: 0,
      },

      // --- DỮ LIỆU MOCK (UI) ---
      helpLinks: [
         { id: 'qa', label: t('courseProgress.askQuestion'), description: t('courseProgress.askQuestionDesc') },
         { id: 'resources', label: t('courseProgress.downloadResources'), description: t('courseProgress.resourcesDescription') },
      ],
    };
  }, [courseContent, courseDetail, t]); // Tính toán lại khi 1 trong 2 API xong

  // useLecture hook để fetch document URL từ API
  const {
    documentUrl,
    isDocumentLoading,
    getDocumentUrl,
    clearDocument,
  } = useLecture();

  // 8. QUẢN LÝ STATE CỦA UI (Giữ nguyên)
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<LessonFilterValue>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [downloadingItem, setDownloadingItem] = useState<LessonItem | null>(null);

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
  const handleDownloadDocument = useCallback((item: LessonItem) => {
    if (item.type !== 'doc') return;
    clearDocument();
    setDownloadingItem(item);
    getDocumentUrl(item.id);
  }, [getDocumentUrl, clearDocument]);

  // Trigger download sau khi documentUrl được fetch về
  useEffect(() => {
    if (downloadingItem && documentUrl && typeof document !== 'undefined') {
      const anchor = document.createElement('a');
      anchor.href = documentUrl;
      anchor.rel = 'noopener';
      anchor.target = '_blank';
      anchor.download = normalizeToFileName(downloadingItem.title);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setDownloadingItem(null);
    }
  }, [documentUrl, downloadingItem]);

  // 10. XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR (Gộp cả hai)
  const isLoading = isContentLoading || isDetailLoading;
  const apiError = contentError || detailError;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">{t('courseProgress.loadingData')}</p>
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
            {t('common.back')}
          </Link>
        </div>
      </UserLayout>
    );
  }

  if (!course) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">{t('courseProgress.dataNotFound')}</p>
        </div>
      </UserLayout>
    );
  }

  // 11. TÍNH TOÁN METRICS (Giữ nguyên, dùng `stats` từ `course`)
   const metrics = [
    {
      label: t('courseProgress.completion'),
      value: `${course.stats.completion}%`,
      hint: `${course.stats.lessonsCompleted}/${course.stats.totalLessons} ${t('courseProgress.content')}`,
      icon: CheckCircle,
      accent: 'bg-emerald-50 text-emerald-600',
      bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    },
    {
      label: t('courseProgress.lessons'),
      value: `${course.stats.lessonsCompleted}/${course.stats.totalLessons}`,
      hint: t('courseProgress.completedTotal'),
      icon: Book,
      accent: 'bg-violet-50 text-violet-600',
      bgGradient: 'bg-gradient-to-br from-violet-50 to-violet-100',
    },
    {
      label: t('courseProgress.timeSpent'),
      value: course.stats.timeSpent,
      hint: `${t('courseProgress.inTotal')} ${course.stats.totalTime}`,
      icon: Clock,
      accent: 'bg-blue-50 text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
    },
    {
      label: t('courseProgress.averageScore'),
      value: `${course.stats.averageScore}%`,
      hint: t('courseProgress.quizAssignments'),
      icon: GraduationCap,
      accent: 'bg-amber-50 text-amber-600',
      bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100',
    },
   ];

  // 12. TOÀN BỘ PHẦN JSX (RETURN) GIỮ NGUYÊN
  // Dữ liệu thật (từ `courseDetail`) sẽ tự động được điền vào
  return (
    <UserLayout>
      <div className="space-y-8 px-4 py-8 lg:px-10">
        <Link
          to="/user/mycourses"
          className="group inline-flex items-center gap-3 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('courseProgress.backToMyCourses')}
        </Link>

        {/* Header (Dữ liệu thật) */}
        <section className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-slate-900">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  {course.instructorInfo.rating.toFixed(1)}
                </span>
                <span>• {course.instructorInfo.students.toLocaleString('vi-VN')} {t('courseProgress.students').toLowerCase()}</span>
              </div>
              <p className="text-sm font-medium text-slate-500">{course.instructor}</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
              {course.stats.completion}% {t('courseProgress.completed')}
            </span>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-600">
              <span>
                {t('courseProgress.courseProgress')}: {course.stats.lessonsCompleted}/{course.stats.totalLessons} {t('courseProgress.content')}
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
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, hint, icon: Icon, accent, bgGradient }) => (
            <div
              key={label}
              className={`group rounded-3xl ${bgGradient} p-6 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/10 hover:scale-105`}
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent} transition-all duration-300 group-hover:scale-110`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {label}
              </span>
              <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
              <p className="mt-2 text-sm text-slate-600">{hint}</p>
            </div>
          ))}
        </section>

        {/* Filter/Search (ĐÃ SỬA) */}
        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('courseProgress.searchPlaceholder')}
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* `getFilterTabs()` giờ đã không còn 'assignment' */}
              {getFilterTabs().map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    activeFilter === tab.value
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25 scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105'
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
                    className="group flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-all duration-200 hover:bg-slate-50"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {index + 1}. {section.title}
                      </h3>
                      <p className="text-sm text-slate-600">{section.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="font-medium">{totalItems} {t('courseProgress.content')}</span>
                      {section.totalDuration && section.totalDuration !== 'N/A' && (
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Clock className="h-4 w-4" />
                          {section.totalDuration}
                        </span>
                      )}
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${isSectionExpanded ? 'rotate-180' : ''}`}
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
                            const isItemExpanded = Boolean(expandedItems[item.id]);
                            return (
                              <li
                                key={item.id}
                                className="group rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50/60 to-white p-5 text-sm text-slate-600 transition-all duration-200 hover:border-indigo-200 hover:bg-white hover:shadow-md"
                              >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex min-w-0 flex-1 items-center gap-4">
                                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                      <span
                                        className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${lessonTypeStyles[item.type]}`}
                                      >
                                        <LessonIcon className="h-3.5 w-3.5" />
                                        {getLessonTypeLabel(item.type)}
                                      </span>
                                      <span className="truncate font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors" title={item.title}>
                                        {item.title}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => openLesson(item.id)}
                                      className="group/btn inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-110 hover:shadow-md"
                                    >
                                      <Play className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                    </button>
                                    {item.type === 'doc' && (
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadDocument(item)}
                                        disabled={isDocumentLoading && downloadingItem?.id === item.id}
                                        className="group/btn inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isDocumentLoading && downloadingItem?.id === item.id ? (
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                                        ) : (
                                          <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                        )}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => toggleItem(item.id)}
                                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                      {t('courseProgress.moreInfo')}
                                      <ChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${isItemExpanded ? 'rotate-180' : ''}`}
                                      />
                                    </button>
                                  </div>
                                </div>
                                {isItemExpanded && (
                                  <div className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-5 text-xs border border-indigo-100">
                                    <p className="flex items-center gap-3 font-bold text-indigo-700">
                                      <span
                                        className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${lessonIconWrappers[item.type]} border border-indigo-200`}
                                      >
                                        <LessonIcon className="h-4 w-4" />
                                      </span>
                                      {t('courseProgress.content')} {getLessonTypeLabel(item.type)}
                                    </p>
                                    <p className="mt-3 leading-relaxed text-indigo-600">
                                      {getLessonTypeDescription(item.type)}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold">
                                      {item.duration && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-indigo-600 shadow-sm border border-indigo-200">
                                          <Clock className="h-4 w-4" />
                                          {item.duration}
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-indigo-600 shadow-sm border border-indigo-200">
                                        <LessonIcon className="h-4 w-4" />
                                        {getLessonTypeLabel(item.type)}
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
                          {t('courseProgress.noMatchingContent')}
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
            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg shadow-slate-900/5 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-1">{t('courseProgress.instructor')}</h2>
              <div className="mt-5 flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                  {course.instructorInfo.initials}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">{course.instructorInfo.name}</p>
                  <p className="text-sm text-slate-600">{course.instructorInfo.title}</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">{course.instructorInfo.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.students')}</span>
                  <span className="font-semibold text-slate-900">{course.instructorInfo.students.toLocaleString('vi-VN')}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.courses')}</span>
                  <span className="font-semibold text-slate-900">{course.instructorInfo.courses}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg shadow-slate-900/5 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-1">{t('courseProgress.courseInfo')}</h2>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.sections')}</span>
                  <span className="font-semibold text-slate-900">{course.sections.length}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.lessons')}</span>
                  <span className="font-semibold text-slate-900">{course.stats.totalLessons}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.duration')}</span>
                  <span className="font-semibold text-slate-900">{course.overview.duration}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.level')}</span>
                  <span className="font-semibold text-slate-900">{course.overview.level}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.language')}</span>
                  <span className="font-semibold text-slate-900">{course.overview.language}</span>
                </li>
                <li className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                  <span className="text-slate-600">{t('courseProgress.access')}</span>
                  <span className="font-semibold text-slate-900">{course.overview.access}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg shadow-slate-900/5 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-1">{t('courseProgress.help')}</h2>
              <ul className="mt-5 space-y-3">
                {course.helpLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      className="group w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-left text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105 hover:shadow-md"
                    >
                      <span className="block">{link.label}</span>
                      <small className="block text-xs font-normal text-slate-400 group-hover:text-indigo-400">
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