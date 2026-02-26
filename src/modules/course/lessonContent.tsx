// src/modules/course/lessonContent.tsx

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UserLayout from './layout/layout';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import type { ApiLecture } from './models/course';

import { useCourses } from './hooks/useCourses';
import { useLecture } from './hooks/useLecture';

// --- TYPES ---

export type LessonType = 'video' | 'quiz' | 'doc';

export interface LessonItem {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  url?: string;
  videoId?: string;   // ID thực của video để gọi /api/Lecture/get-video/{videoId}
  isPreview?: boolean;
  isCompleted?: boolean;
}

export interface CourseSection {
  id: string;
  title: string;
  summary: string;
  totalDuration: string;
  items: LessonItem[];
}

type QuizQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  answer: string;
  explanation: string;
};

type DocumentGuide = {
  summary: string;
  highlights: string[];
};

type LessonTimelineEntry = {
  section: CourseSection;
  lesson: LessonItem;
};

// --- CONSTANTS ---

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

export const normalizeToFileName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

export const DEFAULT_DOCUMENT_DOWNLOAD_PATH = '/resources/sample-react-handout.txt';

// --- HELPER: Extract lesson items from an API lecture (supports 3 API structures) ---

const LESSON_TYPE_MAP: Record<string | number, LessonType> = {
  0: 'video', video: 'video', Video: 'video',
  1: 'doc', doc: 'doc', document: 'doc', Document: 'doc',
  2: 'quiz', quiz: 'quiz', Quiz: 'quiz',
};

const extractItemsFromLecture = (lecture: ApiLecture): LessonItem[] => {
  const items: LessonItem[] = [];

  const getName = (entry: { title?: string; name?: string } | string): string =>
    typeof entry === 'string' ? entry : (entry.title ?? entry.name ?? 'Không có tiêu đề');

  const getId = (entry: { id?: string } | string, fallback: string): string =>
    typeof entry === 'string' ? fallback : (entry.id ?? fallback);

  const getUrl = (entry: { url?: string; videoUrl?: string } | string): string | undefined =>
    typeof entry === 'string' ? undefined : (entry.url ?? entry.videoUrl);

  const parseDuration = (d: number | string | undefined): string => {
    if (d == null) return 'N/A';
    if (typeof d === 'number') {
      const m = Math.floor(d / 60);
      const s = String(d % 60).padStart(2, '0');
      return `${m}:${s}`;
    }
    return String(d);
  };

  // Structure 3: lessons array with type field
  if (Array.isArray(lecture.lessons) && lecture.lessons.length > 0) {
    lecture.lessons.forEach((lesson, index) => {
      const type: LessonType = LESSON_TYPE_MAP[lesson.type ?? 'video'] ?? 'video';
      items.push({
        id: lesson.id ?? `${lecture.id}-lesson-${index}`,
        title: getName(lesson),
        type,
        duration: parseDuration(lesson.duration),
        url: getUrl(lesson),
        videoId: type === 'video' ? (lesson.videoId ?? lesson.id ?? undefined) : undefined,
        isCompleted: false,
        isPreview: false,
      });
    });
    return items;
  }

  // Structure 2: videos/documents/quizzes arrays
  if (
    (lecture.videos && lecture.videos.length > 0) ||
    (lecture.documents && lecture.documents.length > 0) ||
    (lecture.quizzes && lecture.quizzes.length > 0)
  ) {
    (lecture.videos ?? []).forEach((v, i) => {
      const vid = typeof v !== 'string' ? (v as { id?: string }).id : undefined;
      items.push({
        id: getId(v as { id?: string }, `${lecture.id}-video-${i}`),
        title: getName(v as string | { title?: string; name?: string }),
        type: 'video',
        duration: 'N/A',
        url: getUrl(v as { url?: string; videoUrl?: string }),
        videoId: vid,
        isCompleted: false,
        isPreview: false,
      });
    });
    (lecture.documents ?? []).forEach((d, i) => {
      items.push({
        id: getId(d as { id?: string }, `${lecture.id}-doc-${i}`),
        title: getName(d as string | { title?: string; name?: string }),
        type: 'doc',
        duration: 'Tài liệu',
        isCompleted: false,
        isPreview: false,
      });
    });
    (lecture.quizzes ?? []).forEach((q, i) => {
      items.push({
        id: getId(q as { id?: string }, `${lecture.id}-quiz-${i}`),
        title: getName(q as string | { title?: string; name?: string }),
        type: 'quiz',
        duration: 'N/A',
        isCompleted: false,
        isPreview: false,
      });
    });
    return items;
  }

  // Structure 1: videoNames/documentNames/quizNames with optional videoUrls
  (lecture.videoNames ?? []).forEach((name, index) => {
    items.push({
      id: `${lecture.id}-video-${index}`,
      title: name,
      type: 'video',
      duration: 'N/A',
      url: lecture.videoUrls?.[index],
      isCompleted: false,
      isPreview: false,
    });
  });
  (lecture.documentNames ?? []).forEach((name, index) => {
    items.push({
      id: `${lecture.id}-doc-${index}`,
      title: name,
      type: 'doc',
      duration: 'Tài liệu',
      isCompleted: false,
      isPreview: false,
    });
  });
  (lecture.quizNames ?? []).forEach((name, index) => {
    items.push({
      id: `${lecture.id}-quiz-${index}`,
      title: name,
      type: 'quiz',
      duration: 'N/A',
      isCompleted: false,
      isPreview: false,
    });
  });

  return items;
};

// --- MOCK DATA ---

const quizBank: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 'react-definition',
      question: 'React là gì?',
      options: [
        { id: 'library', label: 'Một thư viện JavaScript để xây dựng giao diện người dùng' },
        { id: 'backend', label: 'Một framework backend' },
        { id: 'database', label: 'Một cơ sở dữ liệu' },
        { id: 'language', label: 'Một ngôn ngữ lập trình mới' },
      ],
      answer: 'library',
      explanation: 'React là thư viện JavaScript do Meta phát triển để xây dựng UI component-based.',
    },
    {
      id: 'jsx-definition',
      question: 'JSX là viết tắt của?',
      options: [
        { id: 'javascript-xml', label: 'JavaScript XML' },
        { id: 'java-syntax', label: 'Java Syntax Extension' },
        { id: 'json-xml', label: 'JSON XML' },
        { id: 'javascript-extra', label: 'JavaScript Extra' },
      ],
      answer: 'javascript-xml',
      explanation: 'JSX là JavaScript XML, cho phép viết HTML-like syntax trong JavaScript.',
    },
  ],
};

const documentBank: Record<string, DocumentGuide> = {
  default: {
    summary: 'Tài liệu tổng hợp các khái niệm quan trọng trong bài học này, bao gồm definitions, best practices và tham khảo.',
    highlights: [
      'Các định nghĩa và thuật ngữ quan trọng cần nắm.',
      'Checklist những việc cần thực hành sau bài học.',
      'Links tham khảo thêm tài liệu ngoài.',
    ],
  },
};

const getQuizQuestions = (lessonId: string) => quizBank[lessonId] ?? quizBank.default;
const getDocumentGuide = (lessonId: string) => documentBank[lessonId] ?? documentBank.default;

// --- VIDEO URL HELPERS ---

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^\s&?#/]+)/
  );
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&autoplay=0`;
  }
  return null;
};

const getVimeoEmbedUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}?badge=0&byline=0&title=0`;
  }
  return null;
};

const isDirectVideoUrl = (url: string): boolean =>
  typeof url === 'string' && /\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url);

// --- SUB-COMPONENTS ---

const VideoPlayer: React.FC<{
  lessonTitle: string;
  url?: string;
  isLoading?: boolean;
  error?: string | null;
}> = ({ lessonTitle, url, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black shadow-2xl">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black shadow-2xl">
        <div className="text-center space-y-3">
          <PlayCircleIcon className="mx-auto h-14 w-14 text-slate-600" />
          <p className="text-sm font-semibold text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!url || typeof url !== 'string') {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black shadow-2xl">
        <div className="text-center space-y-2">
          <PlayCircleIcon className="mx-auto h-14 w-14 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">Không tìm thấy URL video.</p>
        </div>
      </div>
    );
  }

  const youtubeUrl = getYouTubeEmbedUrl(url);
  if (youtubeUrl) {
    return (
      <div className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
        <iframe
          className="aspect-video w-full border-0"
          src={youtubeUrl}
          title={lessonTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const vimeoUrl = getVimeoEmbedUrl(url);
  if (vimeoUrl) {
    return (
      <div className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
        <iframe
          className="aspect-video w-full border-0"
          src={vimeoUrl}
          title={lessonTitle}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Already an embed URL (iframe src)
  if (url.includes('/embed/') || url.includes('player.')) {
    return (
      <div className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
        <iframe
          className="aspect-video w-full border-0"
          src={url}
          title={lessonTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video file or unknown URL — try with <video> tag
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
      <video
        controls
        className="aspect-video w-full bg-black"
        key={url}
        controlsList="nodownload"
      >
        {isDirectVideoUrl(url) ? (
          <source
            src={url}
            type={url.match(/\.webm/i) ? 'video/webm' : url.match(/\.ogg/i) ? 'video/ogg' : 'video/mp4'}
          />
        ) : (
          <source src={url} />
        )}
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
  );
};

const QuizContent: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = questions.length;
  const score = useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce(
      (acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc),
      0
    );
  }, [submitted, answers, questions]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          {total} câu hỏi
        </h3>
        {submitted && (
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
            <AcademicCapIcon className="h-4 w-4" />
            Kết quả: {score}/{total}
          </span>
        )}
      </div>

      {questions.map((question, index) => {
        const selected = answers[question.id];
        return (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-indigo-400">
              <span>Câu {index + 1} / {total}</span>
              {submitted && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                    answers[question.id] === question.answer
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {answers[question.id] === question.answer ? 'Chính xác' : 'Sai'}
                </span>
              )}
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-900">{question.question}</h4>
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                const isCorrect = submitted && question.answer === option.id;
                const isWrong = submitted && isSelected && !isCorrect;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : isWrong
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : isSelected
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => handleSelect(question.id, option.id)}
                      className="h-3.5 w-3.5 text-indigo-600"
                    />
                    <span className="flex-1">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
                <strong>Giải thích:</strong> {question.explanation}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={submitted || Object.keys(answers).length !== total}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Nộp bài
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          Làm lại
        </button>
      </div>
    </div>
  );
};

const DocumentContent: React.FC<{
  lesson: LessonItem;
  guide: DocumentGuide;
  onDownload: () => void;
}> = ({ lesson, guide, onDownload }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
      <DocumentTextIcon className="h-8 w-8 flex-shrink-0 text-sky-500" />
      <div>
        <p className="text-sm font-semibold text-slate-900">{lesson.title}</p>
        <p className="text-xs text-slate-500">{lesson.duration}</p>
      </div>
    </div>
    <p className="text-sm text-slate-600">{guide.summary}</p>
    <ul className="space-y-2">
      {guide.highlights.map((highlight) => (
        <li key={highlight} className="flex items-start gap-2 text-sm text-slate-600">
          <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500">•</span>
          {highlight}
        </li>
      ))}
    </ul>
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      Tải tài liệu
    </button>
  </div>
);

// --- MAIN COMPONENT ---

const LessonContentPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const {
    courseContent,
    isContentLoading,
    contentError,
    getCourseContent,
    courseDetail,
    isDetailLoading,
    detailError,
    getCourseDetail,
  } = useCourses();

  const { videoUrl, isVideoLoading, videoError, getVideoUrl, clearVideo } = useLecture();

  useEffect(() => {
    if (courseId) {
      getCourseContent(courseId);
      getCourseDetail(courseId);
    } else {
      navigate('/user/mycourses');
    }
  }, [courseId, getCourseContent, getCourseDetail, navigate]);

  // Transform API data into timeline
  const { courseTitle, timeline, allSections, currentIndex, currentEntry, previousEntry, nextEntry } =
    useMemo(() => {
      if (!courseContent || !courseDetail) {
        return {
          courseTitle: '',
          timeline: [],
          allSections: [],
          currentIndex: -1,
          currentEntry: null,
          previousEntry: null,
          nextEntry: null,
        };
      }

      const entries: LessonTimelineEntry[] = [];

      const transformedSections: CourseSection[] = courseContent.lectures
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((lecture) => {
          const items: LessonItem[] = extractItemsFromLecture(lecture);

          const section: CourseSection = {
            id: lecture.id,
            title: lecture.name,
            summary: lecture.description ?? '',
            totalDuration: 'N/A',
            items,
          };

          items.forEach((lesson) => entries.push({ section, lesson }));

          return section;
        });

      const idx = entries.findIndex((e) => e.lesson.id === lessonId);

      return {
        courseTitle: courseDetail.name,
        timeline: entries,
        allSections: transformedSections,
        currentIndex: idx,
        currentEntry: idx >= 0 ? entries[idx] : null,
        previousEntry: idx > 0 ? entries[idx - 1] : null,
        nextEntry: idx >= 0 && idx < entries.length - 1 ? entries[idx + 1] : null,
      };
    }, [courseContent, courseDetail, lessonId]);

  // UI state
  const [markedDone, setMarkedDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Auto-expand the current section in sidebar
  useEffect(() => {
    if (currentEntry) {
      setMarkedDone(Boolean(currentEntry.lesson.isCompleted));
      setExpandedSections((prev) => ({ ...prev, [currentEntry.section.id]: true }));
    }
  }, [currentEntry]);

  // Fetch video URL from API when current lesson is a video
  useEffect(() => {
    if (currentEntry?.lesson.type === 'video') {
      const vid = currentEntry.lesson.videoId;
      if (vid) {
        getVideoUrl(vid);
      } else {
        // No API videoId — clear any previous URL so fallback url prop is used
        clearVideo();
      }
    } else {
      clearVideo();
    }
  }, [currentEntry?.lesson.videoId, currentEntry?.lesson.type, getVideoUrl, clearVideo]);

  // Redirect if no lessonId
  useEffect(() => {
    if (!lessonId && timeline.length && courseId) {
      navigate(`/user/course-progress/${courseId}/lesson/${timeline[0].lesson.id}`, { replace: true });
    }
  }, [lessonId, timeline, navigate, courseId]);

  const navigateToLesson = useCallback(
    (lesson: LessonItem) => {
      if (courseId) {
        navigate(`/user/course-progress/${courseId}/lesson/${lesson.id}`);
      }
    },
    [navigate, courseId]
  );

  const handleBackToCourse = useCallback(() => {
    if (courseId) navigate(`/user/course-progress/${courseId}`);
  }, [navigate, courseId]);

  const handleDocumentDownload = useCallback(
    (lesson: LessonItem) => {
      if (lesson.type !== 'doc' || typeof document === 'undefined') return;
      const link = document.createElement('a');
      link.href = DEFAULT_DOCUMENT_DOWNLOAD_PATH;
      link.rel = 'noopener';
      link.download = `${normalizeToFileName(lesson.title)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const toggleSection = (sectionId: string) =>
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));

  const completedCount = useMemo(
    () => timeline.filter((e) => e.lesson.isCompleted).length,
    [timeline]
  );

  // --- LOADING / ERROR STATES ---
  const isLoading = isContentLoading || isDetailLoading;
  const apiError = contentError || detailError;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-600">Đang tải bài học...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (apiError) {
    return (
      <UserLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-base font-semibold text-red-600">{apiError}</p>
          <Link
            to="/user/mycourses"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Quay lại
          </Link>
        </div>
      </UserLayout>
    );
  }

  if (!currentEntry) {
    return (
      <UserLayout>
        <div className="px-4 py-8 lg:px-10">
          <button
            type="button"
            onClick={handleBackToCourse}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại khóa học
          </button>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
            {lessonId
              ? `Không tìm thấy bài học này trong khóa học.`
              : 'Khóa học này chưa có bài học nào.'}
          </div>
        </div>
      </UserLayout>
    );
  }

  const { lesson, section } = currentEntry;
  const LessonIcon = lessonTypeIcons[lesson.type];

  // Tabs available
  const tabs: Array<{ id: 'overview' | 'content'; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> =
    [
      { id: 'overview', label: 'Tổng quan', icon: ListBulletIcon },
      ...(lesson.type !== 'video'
        ? [{ id: 'content' as const, label: lesson.type === 'quiz' ? 'Quiz' : 'Tài liệu', icon: LessonIcon }]
        : []),
    ];

  return (
    <UserLayout>
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">
        <Link to="/user/mycourses" className="font-medium text-indigo-500 hover:text-indigo-600">
          Khóa học của tôi
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />
        <button
          type="button"
          onClick={handleBackToCourse}
          className="font-medium text-indigo-500 hover:text-indigo-600"
        >
          {courseTitle}
        </button>
        <ChevronRightIcon className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-700 truncate max-w-xs">{lesson.title}</span>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="flex gap-6 items-start">

        {/* ── LEFT: Main video/content area ── */}
        <div className="min-w-0 flex-1 space-y-4">

          {/* Video Player */}
          {lesson.type === 'video' && (
            <VideoPlayer
              lessonTitle={lesson.title}
              url={videoUrl ?? (typeof lesson.url === 'string' ? lesson.url : undefined)}
              isLoading={isVideoLoading}
              error={videoError}
            />
          )}

          {/* Non-video: icon placeholder */}
          {lesson.type !== 'video' && (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
              <div className="text-center space-y-4">
                <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${lessonIconWrappers[lesson.type]} bg-opacity-20`}>
                  <LessonIcon className="h-10 w-10 text-white opacity-80" />
                </span>
                <p className="text-sm font-semibold text-slate-300">
                  {lessonTypeLabel[lesson.type]}
                </p>
              </div>
            </div>
          )}

          {/* Lesson Info Bar */}
          <div className="rounded-2xl bg-white p-5 shadow-md shadow-slate-900/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Title + badges */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${lessonTypeStyles[lesson.type]}`}>
                    <LessonIcon className="h-3.5 w-3.5" />
                    {lessonTypeLabel[lesson.type]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {lesson.duration}
                  </span>
                  <span className="text-xs text-slate-400">
                    Bài {currentIndex + 1} / {timeline.length}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">{lesson.title}</h1>
                <p className="text-sm text-slate-500">{section.title}</p>
              </div>

              {/* Actions: Mark done + Prev/Next */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMarkedDone((prev) => !prev)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    markedDone
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                      : 'border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {markedDone
                    ? <CheckCircleSolid className="h-4 w-4 text-emerald-500" />
                    : <CheckCircleIcon className="h-4 w-4" />
                  }
                  {markedDone ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                </button>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => previousEntry && navigateToLesson(previousEntry.lesson)}
                disabled={!previousEntry}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Bài trước
                {previousEntry && (
                  <span className="hidden sm:inline text-xs text-slate-400 max-w-[120px] truncate">
                    – {previousEntry.lesson.title}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => nextEntry && navigateToLesson(nextEntry.lesson)}
                disabled={!nextEntry}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {nextEntry && (
                  <span className="hidden sm:inline text-xs text-slate-300 max-w-[120px] truncate">
                    {nextEntry.lesson.title} –
                  </span>
                )}
                Bài tiếp theo
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl bg-white shadow-md shadow-slate-900/5 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition border-b-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                      Về bài học này
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {lesson.type === 'video' && 'Bài giảng video với ví dụ trực quan và hướng dẫn chi tiết từng bước.'}
                      {lesson.type === 'quiz' && 'Quiz ngắn giúp bạn kiểm tra và củng cố kiến thức vừa học trong chương này.'}
                      {lesson.type === 'doc' && 'Tài liệu tham khảo bổ sung, bao gồm tóm tắt, checklist và links hữu ích.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Loại', value: lessonTypeLabel[lesson.type] },
                      { label: 'Thời lượng', value: lesson.duration },
                      { label: 'Chương', value: section.title },
                      { label: 'Tình trạng', value: markedDone ? 'Hoàn thành' : 'Chưa học' },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'content' && lesson.type === 'quiz' && (
                <QuizContent questions={getQuizQuestions(lesson.id)} />
              )}

              {activeTab === 'content' && lesson.type === 'doc' && (
                <DocumentContent
                  lesson={lesson}
                  guide={getDocumentGuide(lesson.id)}
                  onDownload={() => handleDocumentDownload(lesson)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Course Curriculum Sidebar ── */}
        <aside
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'w-80 xl:w-96' : 'w-12'
          }`}
        >
          {/* Sidebar toggle */}
          <div className="sticky top-28 space-y-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-md shadow-slate-900/5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              title={sidebarOpen ? 'Ẩn nội dung khóa học' : 'Xem nội dung khóa học'}
            >
              {sidebarOpen ? (
                <>
                  <span className="flex items-center gap-2">
                    <ListBulletIcon className="h-4 w-4" />
                    Nội dung khóa học
                  </span>
                  <XMarkIcon className="h-4 w-4 text-slate-400" />
                </>
              ) : (
                <ListBulletIcon className="h-5 w-5 mx-auto" />
              )}
            </button>

            {sidebarOpen && (
              <div className="rounded-2xl bg-white shadow-md shadow-slate-900/5 overflow-hidden max-h-[calc(100vh-180px)] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-4">
                  <p className="text-xs text-slate-500">
                    {completedCount}/{timeline.length} bài đã hoàn thành
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${timeline.length > 0 ? (completedCount / timeline.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* All sections */}
                <div className="divide-y divide-slate-50">
                  {allSections.map((sec, secIndex) => {
                    const isExpanded = expandedSections[sec.id] ?? false;
                    const hasCurrentLesson = sec.items.some((item) => item.id === lessonId);
                    const completedInSection = sec.items.filter((i) => i.isCompleted).length;

                    return (
                      <div key={sec.id}>
                        {/* Section header */}
                        <button
                          type="button"
                          onClick={() => toggleSection(sec.id)}
                          className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                            hasCurrentLesson ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <ChevronDownIcon
                            className={`mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400 transition ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">
                              {secIndex + 1}. {sec.title}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {completedInSection}/{sec.items.length} bài học
                            </p>
                          </div>
                        </button>

                        {/* Lessons list */}
                        {isExpanded && (
                          <div className="bg-slate-50/60">
                            {sec.items.map((item, itemIndex) => {
                              const isActive = item.id === lessonId;
                              const ItemIcon = lessonTypeIcons[item.type];
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => navigateToLesson(item)}
                                  className={`flex w-full items-start gap-3 px-5 py-3.5 text-left text-sm transition ${
                                    isActive
                                      ? 'bg-indigo-50 border-l-2 border-indigo-500'
                                      : 'hover:bg-white border-l-2 border-transparent'
                                  }`}
                                >
                                  {/* Status icon */}
                                  <span className="mt-0.5 flex-shrink-0">
                                    {item.isCompleted ? (
                                      <CheckCircleSolid className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <div className={`h-4 w-4 rounded-full border-2 ${isActive ? 'border-indigo-500 bg-indigo-100' : 'border-slate-300'}`} />
                                    )}
                                  </span>

                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug truncate ${isActive ? 'font-semibold text-indigo-700' : 'font-medium text-slate-700'}`}>
                                      {item.title}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${lessonTypeStyles[item.type]}`}>
                                        <ItemIcon className="h-2.5 w-2.5" />
                                        {lessonTypeLabel[item.type]}
                                      </span>
                                      <span className="text-[10px] text-slate-400">{item.duration}</span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </UserLayout>
  );
};

export default LessonContentPage;
