// src/modules/user/lessonContent.tsx (Ho%E1%BA%B7c t%C3%AAn file c%E1%BB%A7a b%E1%BA%A1n)

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UserLayout from './layout/layout'; // Đảm bảo đường dẫn layout đúng
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon, // Giữ lại icon
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  PlayCircleIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

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
export interface CourseSection {
  id: string;
  title: string;
  summary: string;
  totalDuration: string;
  items: LessonItem[];
}
// Giữ lại các type cho Quiz và Doc (dùng cho mock nội dung)
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
// Dùng để tạo timeline
type LessonTimelineEntry = {
  section: CourseSection;
  lesson: LessonItem;
};

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

// --- DỮ LIỆU MOCK CỤ BỘ (Cho nội dung quiz/doc) ---
// (Vì API chỉ trả về *tên* quiz, không phải *câu hỏi*)

const sampleVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const quizBank: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 'react-definition',
      question: 'React là gì?',
      options: [
        { id: 'library', label: 'Một thư viện JavaScript để xây dựng giao diện người dùng' },
        { id: 'backend', label: 'Một framework backend' },
      ],
      answer: 'library',
      explanation: 'React là thư viện JavaScript do Meta phát triển để xây dựng UI.',
    },
    // ... (Thêm các câu hỏi mock khác nếu muốn)
  ],
};

const documentBank: Record<string, DocumentGuide> = {
  default: {
    summary: 'Tài liệu tổng hợp các khái niệm quan trọng trong bài học.',
    highlights: [
      'Các định nghĩa và lưu ý quan trọng.',
      'Checklist những việc cần thực hành.',
    ],
  },
};

const getQuizQuestions = (lessonId: string) => quizBank[lessonId] ?? quizBank.default;
const getDocumentGuide = (lessonId: string) => documentBank[lessonId] ?? documentBank.default;

// --- CÁC COMPONENT CON (Render nội dung) ---

const VideoContent: React.FC<{ lesson: LessonItem; description: string }> = ({ lesson, description }) => (
  <div className="space-y-6">
    <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-900 shadow-xl shadow-slate-900/20">
      <video controls className="aspect-video w-full bg-black">
        <source src={sampleVideoUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-900/5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Mô tả bài học</h3>
      <p className="mt-3 text-sm text-slate-600">{description}</p>
    </div>
  </div>
);

const QuizContent: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  // ... (Toàn bộ logic của QuizContent giữ nguyên như file gốc của bạn)
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const total = questions.length;
  const score = React.useMemo(() => {
    if (!submitted) return 0;
    return questions.reduce((acc, question) => (answers[question.id] === question.answer ? acc + 1 : acc), 0);
  }, [submitted, answers, questions]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    if (total && Object.keys(answers).length === total) {
      setSubmitted(true);
    }
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const selected = answers[question.id];
        return (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm shadow-slate-900/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
              <span>
                Câu {index + 1} / {total}
              </span>
              {submitted && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                    answers[question.id] === question.answer
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {answers[question.id] === question.answer ? 'Chính xác' : 'Chưa đúng'}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">{question.question}</h3>
            <div className="mt-4 grid gap-3">
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                const isCorrect = submitted && question.answer === option.id;
                const isWrong = submitted && isSelected && !isCorrect;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : isWrong
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : isSelected
                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40'
                    }`}
                  >
                    <span className="flex-1">{option.label}</span>
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      onChange={() => handleSelect(question.id, option.id)}
                      className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-sm text-indigo-600">Giải thích: {question.explanation}</p>
            )}
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted || Object.keys(answers).length !== total}
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Nộp bài
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          Làm lại
        </button>
        {submitted && (
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600">
            <AcademicCapIcon className="h-4 w-4" />
            Điểm: {score}/{total}
          </span>
        )}
      </div>
    </div>
  );
};

const DocumentContent: React.FC<{ lesson: LessonItem; guide: DocumentGuide; onDownload: () => void }> = ({
  lesson,
  guide,
  onDownload,
}) => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-3 text-indigo-600">
        <DocumentTextIcon className="h-6 w-6" />
        <h3 className="text-lg font-semibold text-slate-900">{lesson.title}</h3>
      </div>
      <p className="mt-3 text-sm text-slate-600">{guide.summary}</p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
        {guide.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onDownload}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
      >
        <ArrowDownTrayIcon className="h-4 w-4" />
        Tải tài liệu ({lesson.duration})
      </button>
    </div>
  </div>
);
// --- KẾT THÚC COMPONENT CON ---


// --- COMPONENT CHÍNH ---
const LessonContentPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const navigate = useNavigate();

  // 4. GỌI HOOK LẤY DỮ LIỆU
  const { 
    courseContent, 
    isContentLoading, 
    contentError, 
    getCourseContent,
    courseDetail,      // <-- LẤY CẢ DETAIL
    isDetailLoading,
    detailError,
    getCourseDetail
  } = useCourses();

  // 5. GỌI CẢ 2 API
  useEffect(() => {
    if (courseId) {
      getCourseContent(courseId);
      getCourseDetail(courseId); // <-- GỌI DETAIL
    } else {
      navigate('/user/mycourses');
    }
  }, [courseId, getCourseContent, getCourseDetail, navigate]);

  // 6. "BẮC CẦU" DỮ LIỆU VÀ TÌM BÀI HỌC HIỆN TẠI
  const { courseTitle, timeline, currentEntry, previousEntry, nextEntry } = useMemo(() => {
    // Đợi cả hai API
    if (!courseContent || !courseDetail) {
      return { courseTitle: '', timeline: [], currentEntry: null, previousEntry: null, nextEntry: null };
    }
    
    const entries: LessonTimelineEntry[] = [];
    
    // Dùng transformer logic giống hệt `courseProgress.tsx`
    const transformedSections: CourseSection[] = courseContent.lectures
      .sort((a, b) => a.name.localeCompare(b.name)) 
      .map(lecture => {
      const items: LessonItem[] = []; 
      lecture.videoNames.forEach((name, index) => items.push({ id: `${lecture.id}-video-${index}`, title: name, type: 'video', duration: 'N/A', isCompleted: false, isPreview: false }));
      lecture.documentNames.forEach((name, index) => items.push({ id: `${lecture.id}-doc-${index}`, title: name, type: 'doc', duration: 'Tài liệu', isCompleted: false, isPreview: false }));
      lecture.quizNames.forEach((name, index) => items.push({ id: `${lecture.id}-quiz-${index}`, title: name, type: 'quiz', duration: 'N/A', isCompleted: false, isPreview: false }));
      
      const section: CourseSection = {
        id: lecture.id,
        title: lecture.name,
        summary: lecture.description,
        totalDuration: 'N/A',
        items: items,
      };

      // Đồng thời tạo timeline
      items.forEach(lesson => {
        entries.push({ section, lesson });
      });

      return section;
    });

    const currentIndex = entries.findIndex((entry) => entry.lesson.id === lessonId);
    const currentEntry = currentIndex >= 0 ? entries[currentIndex] : null;
    const previousEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
    const nextEntry = currentIndex >= 0 && currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;

    return { 
      courseTitle: courseDetail.name, // Lấy tên thật từ courseDetail
      timeline: entries, 
      currentEntry, 
      previousEntry, 
      nextEntry 
    };

  }, [courseContent, courseDetail, lessonId]);

  // 7. CÁC HÀM NỘI BỘ (Giữ nguyên)
  const [markedDone, setMarkedDone] = React.useState(false);

  useEffect(() => {
    if (currentEntry) {
      setMarkedDone(Boolean(currentEntry.lesson.isCompleted));
    }
  }, [currentEntry]);

  // Chuyển hướng nếu không có lessonId
  useEffect(() => {
    if (!lessonId && timeline.length && courseId) {
      navigate(`/user/course-progress/${courseId}/lesson/${timeline[0].lesson.id}`, { replace: true });
    }
  }, [lessonId, timeline, navigate, courseId]);

  const navigateToLesson = useCallback(
    (lesson: LessonItem) => {
      if(courseId) {
        navigate(`/user/course-progress/${courseId}/lesson/${lesson.id}`);
      }
    },
    [navigate, courseId]
  );

  const handleBackToCourse = useCallback(() => {
    if(courseId) {
      navigate(`/user/course-progress/${courseId}`);
    }
  }, [navigate, courseId]);

  const handleDocumentDownload = useCallback((lesson: LessonItem) => {
    if (lesson.type !== 'doc' || typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = DEFAULT_DOCUMENT_DOWNLOAD_PATH;
    link.rel = 'noopener';
    link.download = `${normalizeToFileName(lesson.title)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 8. XỬ LÝ LOADING / ERROR
  const isLoading = isContentLoading || isDetailLoading;
  const apiError = contentError || detailError;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">Đang tải bài học...</p>
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

  if (!currentEntry) {
    return (
      <UserLayout>
        <div className="px-4 py-8 lg:px-10">
          <button
            type="button"
            onClick={handleBackToCourse}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại khóa học
          </button>
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
            Không tìm thấy bài học. Có thể {lessonId ? `bài học "${lessonId}" không tồn tại` : "khóa học này chưa có bài học nào"}.
          </div>
        </div>
      </UserLayout>
    );
  }

  // 9. RENDER NỘI DUNG (Đã an toàn)
  const { lesson, section } = currentEntry;
  const LessonIcon = lessonTypeIcons[lesson.type];
  const lessonDescription = lessonTypeDescriptions[lesson.type];
  const sectionLessons = section.items;

  let renderedContent: React.ReactNode = null;
  if (lesson.type === 'video') {
    renderedContent = <VideoContent lesson={lesson} description={lessonDescription} />;
  } else if (lesson.type === 'quiz') {
    renderedContent = <QuizContent questions={getQuizQuestions(lesson.id)} />;
  } else if (lesson.type === 'doc') {
    renderedContent = <DocumentContent lesson={lesson} guide={getDocumentGuide(lesson.id)} onDownload={() => handleDocumentDownload(lesson)} />;
  }
  // 'assignment' đã bị xóa

  // 10. RENDER JSX (Giữ nguyên)
  return (
    <UserLayout>
      <div className="space-y-6 px-4 py-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link // Đổi từ button sang Link
            to="/user/mycourses"
            className="font-semibold text-indigo-500 transition hover:text-indigo-600"
          >
            Khóa học của tôi
          </Link>
          <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          <button
            type="button"
            onClick={handleBackToCourse}
            className="font-semibold text-indigo-500 transition hover:text-indigo-600"
          >
            {courseTitle} {/* Dùng tên thật */}
          </button>
          <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-700">{lesson.title}</span>
        </div>

        <button
          type="button"
          onClick={handleBackToCourse}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại danh sách bài học
        </button>

        {/* Xóa bỏ `isFallback` */}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
          <section className="space-y-6">
            <article className="space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${lessonIconWrappers[lesson.type]}`}
                  >
                    <LessonIcon className="h-5 w-5" />
                  </span>
                  <h1 className="text-2xl font-semibold text-slate-900">{lesson.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 ${lessonTypeStyles[lesson.type]}`}>
                      {lessonTypeLabel[lesson.type]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      <ClockIcon className="h-4 w-4" />
                      {lesson.duration}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                        markedDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {markedDone ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {previousEntry && (
                    <button
                      type="button"
                      onClick={() => navigateToLesson(previousEntry.lesson)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      ← Bài trước
                    </button>
                  )}
                  {nextEntry && (
                    <button
                      type="button"
                      onClick={() => navigateToLesson(nextEntry.lesson)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                    >
                      Bài tiếp theo →
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/60 p-5 text-sm text-indigo-600">
                {lessonDescription}
              </div>

              <button
                type="button"
                onClick={() => setMarkedDone((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  markedDone
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300'
                    : 'border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                <CheckCircleIcon className="h-4 w-4" />
                {markedDone ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
              </button>

              {renderedContent}
            </article>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Phần hiện tại</h2>
              <p className="mt-2 text-sm text-slate-600">{section.summary}</p>
              <ul className="mt-4 space-y-2">
                {sectionLessons.map((item) => {
                  const isActive = item.id === lesson.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => navigateToLesson(item)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          isActive
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                            : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white hover:text-indigo-600'
                        }`}
                      >
                        <span className="block font-semibold">{item.title}</span>
                        <span className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${lessonTypeStyles[item.type]}`}>
                            {lessonTypeLabel[item.type]}
                          </span>
                          <ClockIcon className="h-4 w-4" />
                          {item.duration}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin bài học</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li>Thứ tự: {currentIndex + 1}/{timeline.length}</li>
                <li>Thời lượng: {lesson.duration}</li>
                <li>Loại nội dung: {lessonTypeLabel[lesson.type]}</li>
                <li>Tình trạng: {markedDone ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
};

export default LessonContentPage;