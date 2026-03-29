// src/modules/admin/adminLessonContent.tsx

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from './layout/layout';
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
import { useLecture } from '../course/hooks/useLecture';
import { useQuiz } from '../course/hooks/useQuiz';
import type {
  ApiQuizDetail,
  ApiQuizQuestion,
  ApiQuizResult,
  ApiQuizAttemptSummary,
} from '../course/models/course';

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

type LessonTimelineEntry = {
  section: CourseSection;
  lesson: LessonItem;
};

// --- CONSTANTS ---

export const getLessonTypeLabel = (t: (key: string) => string): Record<LessonType, string> => ({
  video: t('lessonTypes.video'),
  quiz: t('lessonTypes.quiz'),
  doc: t('lessonTypes.doc'),
});

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


// Now requires t as argument
const extractItemsFromLecture = (lecture: ApiLecture, t: (key: string) => string): LessonItem[] => {
  const items: LessonItem[] = [];

  const getName = (entry: { title?: string; name?: string } | string): string =>
    typeof entry === 'string' ? entry : (entry.title ?? entry.name ?? t('lessonContent.noTitle'));

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
        duration: '',
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
      duration: t('lessonContent.document'),
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
}> = ({ lessonTitle, url, isLoading }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black shadow-2xl">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">{t('lessonContent.loadingLesson')}</p>
        </div>
      </div>
    );
  }

  if (!url || typeof url !== 'string') {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-black shadow-2xl">
        <div className="text-center space-y-2">
          <PlayCircleIcon className="mx-auto h-14 w-14 text-slate-600" />
          <p className="text-sm font-semibold text-slate-400">{t('lessonContent.lessonNotFound')}</p>
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
        {t('lessonContent.browserNotSupport')}
      </video>
    </div>
  );
};

// --- NORMALIZE QUIZ DATA FROM API ---

type NormalizedQuestion = {
  id: string;
  question: string;
  imageUrl?: string;
  options: Array<{ id: string; label: string; isCorrect?: boolean }>;
  correctAnswer?: string;
  explanation?: string;
};

// Helper to format question titles like "Question 1", "Question 2", etc.
const formatQuestionTitle = (index: number, t: any) => {
  return `${t('lessonContent.question')} ${index}`;
};

const normalizeQuizQuestions = (rawQuestions: ApiQuizQuestion[], t: any): NormalizedQuestion[] => {
  console.log('[normalizeQuizQuestions] Raw quiz questions:', JSON.stringify(rawQuestions, null, 2));

  if (!Array.isArray(rawQuestions)) {
    console.warn('[normalizeQuizQuestions] rawQuestions is not an array:', rawQuestions);
    return [];
  }

  return rawQuestions.map((q, idx) => {
    if (!q || typeof q !== 'object') {
      console.warn(`[normalizeQuizQuestions] Question ${idx} is not a valid object:`, q);
      return {
        id: `q-${idx}`,
        question: formatQuestionTitle(idx + 1, t),
        options: [],
        correctAnswer: undefined,
        explanation: undefined,
      };
    }

    // Debug log for each question
    console.log(`[normalizeQuizQuestions] Question ${idx}:`, {
      id: q.id,
      questionText: q.questionText,
      content: q.content,
      question: q.question,
      text: q.text,
      allKeys: Object.keys(q as any),
      questionValue: q.questionText ?? q.content ?? q.question ?? q.text
    });

    const rawAnswers = q.answers ?? q.options ?? q.choices ?? [];
    const questionFields = q as any; // Cast để access tất cả fields

    // Thử nhiều field names có thể có và kiểm tra giá trị hợp lệ
    let questionText =
      q.questionText ??
      q.content ??
      q.question ??
      q.text ??
      questionFields.title ??
      questionFields.description ??
      questionFields.questionContent ??
      questionFields.name;

    // Kiểm tra nếu questionText không phải string hoặc là string rỗng/invalid
    if (!questionText || typeof questionText !== 'string' || questionText.trim() === '') {
      console.warn(`[normalizeQuizQuestions] No valid question text found for question ${idx}, using fallback`);
      questionText = formatQuestionTitle(idx + 1, t);
    }

    // Kiểm tra và thay thế nếu questionText trông như data lỗi
    if (typeof questionText === 'string' &&
        (questionText.startsWith('string') ||
         questionText.match(/^[a-z]+\d+$/i) ||
         questionText.length < 3)) {
      console.error(`[normalizeQuizQuestions] Detected potentially invalid question text: "${questionText}" for question ${idx}, using fallback`);
      console.log('Question object:', q);
      questionText = formatQuestionTitle(idx + 1, t);
    }

    return {
      id: q.id ?? `q-${idx}`,
      question: questionText,
      imageUrl: q.imageUrl,
      options: Array.isArray(rawAnswers) ? rawAnswers.map((a, i) => {
        if (!a || typeof a !== 'object') {
          console.warn(`[normalizeQuizQuestions] Answer ${i} is not a valid object:`, a);
          return {
            id: `opt-${idx}-${i}`,
            label: `${t('lessonContent.answer')} ${i + 1}`,
            isCorrect: false,
          };
        }

        const answerFields = a as any;
        let answerLabel =
          a.content ??
          a.text ??
          a.label ??
          a.answerText ??
          answerFields.title ??
          answerFields.description ??
          answerFields.name;

        if (!answerLabel || typeof answerLabel !== 'string' || answerLabel.trim() === '') {
          console.warn(`[normalizeQuizQuestions] No valid answer text found for answer ${i} of question ${idx}, using fallback`);
          answerLabel = `${t('lessonContent.answer')} ${i + 1}`;
        }

        return {
          id: a.id ?? `opt-${idx}-${i}`,
          label: answerLabel,
          isCorrect: a.isCorrect,
        };
      }) : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  });
};

// --- SUB-COMPONENTS ---

interface QuizContentProps {
  // Start quiz state
  isStarting: boolean;
  startError: string | null;
  currentAttemptId: string | null;
  quizDetail: ApiQuizDetail | null;
  testTime?: number; // thời gian làm bài (phút), lấy từ quizAttempt.testTime
  // Submit state
  isSubmitting: boolean;
  submitError: string | null;
  // Result state
  attemptResult: ApiQuizResult | null;
  isResultLoading: boolean;
  resultError: string | null;
  // History state
  attemptHistory: ApiQuizAttemptSummary[];
  isHistoryLoading: boolean;
  historyError: string | null;
  // Review a past attempt
  reviewResult: ApiQuizResult | null;
  isReviewLoading: boolean;
  reviewError: string | null;
  // Actions
  onStart: () => void;
  onSubmit: (answers: Array<{ questionId: string; selectedOptionId: string }>) => void;
  onViewHistory: () => void;
  onViewAttempt: (attemptId: string) => void;
  onClearReview: () => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  isStarting,
  startError,
  currentAttemptId,
  quizDetail,
  testTime,
  isSubmitting,
  submitError,
  attemptResult,
  isResultLoading,
  resultError,
  attemptHistory,
  isHistoryLoading,
  historyError,
  reviewResult,
  isReviewLoading,
  reviewError,
  onStart,
  onSubmit,
  onViewHistory,
  onViewAttempt,
  onClearReview,
}) => {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Refs to avoid stale closure in auto-submit
  const answersRef = React.useRef(answers);
  React.useEffect(() => { answersRef.current = answers; }, [answers]);
  const onSubmitRef = React.useRef(onSubmit);
  React.useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  // Reset answers and timer when a new attempt is started
  React.useEffect(() => {
    setAnswers({});
    setShowHistory(false);
    const effectiveTime = testTime ?? quizDetail?.timeLimit;
    if (currentAttemptId && effectiveTime && effectiveTime > 0) {
      setTimeLeft(effectiveTime * 60);
    } else {
      setTimeLeft(null);
    }
  }, [currentAttemptId]);

  // Countdown interval — pauses when submitting or result is available
  React.useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitting || !!attemptResult) return;
    const id = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(id);
  }, [timeLeft, isSubmitting, attemptResult]);

  // Auto-submit when timer hits 0
  React.useEffect(() => {
    if (timeLeft !== 0) return;
    const payload = Object.entries(answersRef.current).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    onSubmitRef.current(payload);
  }, [timeLeft]);

  // Handle ESC key to close modals
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Đóng modal theo thứ tự ưu tiên (modal trên cùng đóng trước)
        if (showReview) {
          setShowReview(false);
          onClearReview();
          setShowHistory(true);
        } else if (showHistory) {
          setShowHistory(false);
        }
      }
    };

    if (showHistory || showReview) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showHistory, showReview, onClearReview]);

  // ── History panel ──
  if (showHistory) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{t('lessonContent.quizHistory')}</h3>
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            {t('lessonContent.goBack')}
          </button>
        </div>

        {isHistoryLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        )}

        {historyError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {historyError}
          </div>
        )}

        {!isHistoryLoading && !historyError && attemptHistory.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm font-semibold text-slate-500 text-center">
            {t('lessonContent.noRecords')}
          </div>
        )}

        {!isHistoryLoading && attemptHistory.length > 0 && (
          <div className="overflow-x-auto overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">{t('lessonContent.dateCompleted')}</th>
                  <th className="px-4 py-3 text-left">{t('lessonContent.submitTime')}</th>
                  <th className="px-4 py-3 text-center">{t('lessonContent.correctTotal')}</th>
                  <th className="px-4 py-3 text-center">{t('lessonContent.result')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {attemptHistory.map((entry, i) => {
                  // Thử tất cả field name có thể chứa attempt ID
                  const id =
                    (entry.attemptId as string | undefined) ??
                    (entry.quizAttemptId as string | undefined) ??
                    (entry.id as string | undefined) ??
                    (entry['attempt_id'] as string | undefined) ??
                    (entry['AttemptId'] as string | undefined) ??
                    `row-${i}`;
                  console.log(`[History] entry[${i}] extracted id="${id}"`, entry);
                  const startDate = entry.attemptedAt ?? entry.startedAt;
                  const submitDate = entry.completedAt;
                  const correct = entry.correctAnswersCount ?? entry.correctAnswers ?? entry.score;
                  return (
                    <tr key={id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {startDate ? new Date(startDate).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {submitDate ? new Date(submitDate).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-800">
                        {correct ?? '-'} / {entry.totalQuestions ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => { onViewAttempt(id); setShowReview(true); setShowHistory(false); }}
                          className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          {t('lessonContent.reviewAttempt')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowHistory(false);
            onStart();
          }}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
        >
          {t('lessonContent.retakeQuiz')}
        </button>
      </div>
    );
  }

  // ── Full review page ──
  if (showReview) {
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{t('lessonContent.detailedResults')}</h3>
          <button
            type="button"
            onClick={() => { setShowReview(false); onClearReview(); setShowHistory(true); }}
            className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
          >
            {t('lessonContent.backToHistory')}
          </button>
        </div>

        {/* Loading */}
        {isReviewLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-500">{t('lessonContent.loadingResults')}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {reviewError && !isReviewLoading && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-600">
            {reviewError}
          </div>
        )}

        {/* Review result */}
        {reviewResult && !isReviewLoading && (
          <div className="space-y-5">
            {/* Score banner */}
            <div className={`flex flex-col items-center gap-3 rounded-2xl p-6 ${
              reviewResult.passed == null
                ? 'bg-amber-50'
                : reviewResult.passed
                ? 'bg-emerald-50'
                : 'bg-rose-50'
            }`}>
              <AcademicCapIcon className={`h-12 w-12 ${
                reviewResult.passed == null ? 'text-amber-400' : reviewResult.passed ? 'text-emerald-500' : 'text-rose-500'
              }`} />
              <p className={`text-3xl font-bold ${
                reviewResult.passed == null ? 'text-amber-700' : reviewResult.passed ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {(() => {
                  const correct = reviewResult.correctAnswers ?? reviewResult.correctAnswersCount;
                  const total = reviewResult.totalQuestions;
                  const pct = reviewResult.percentage ?? reviewResult.score;
                  if (correct != null && total != null) return `${correct}/${total}`;
                  if (pct != null) return `${pct}%`;
                  return '-';
                })()}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                {reviewResult.passed == null
                  ? t('lessonContent.isCompleted')
                  : reviewResult.passed
                  ? t('lessonContent.congratulationsPass')
                  : t('lessonContent.notMeetRequirements')}
              </p>
              {reviewResult.completedAt && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs text-slate-500">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {t('lessonContent.submittedAt')}: {new Date(reviewResult.completedAt).toLocaleString('vi-VN')}
                </div>
              )}
            </div>

            {/* Per-answer detail — full question view if quizDetail available, otherwise summary */}
            {(() => {
              const questions = normalizeQuizQuestions(quizDetail?.questions ?? [], t);
              const allAnswers = reviewResult.answers ?? reviewResult.detailedResults ?? [];
              const resultMap: Record<string, { correctAnswerId?: string; isCorrect?: boolean; explanation?: string }> = {};
              allAnswers.forEach((a) => {
                if (a.questionId) {
                  resultMap[a.questionId] = {
                    correctAnswerId: a.correctAnswerId ?? a.correctOptionId,
                    isCorrect: a.isCorrect,
                    explanation: a.explanation,
                  };
                }
              });

              if (questions.length > 0) {
                return (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('lessonContent.reviewByQuestion')}</p>
                    {questions.map((q, idx) => {
                      const apiInfo = resultMap[q.id];
                      const correctId =
                        apiInfo?.correctAnswerId ??
                        q.correctAnswer ??
                        q.options.find((o) => o.isCorrect)?.id;
                      const selectedId = allAnswers.find(
                        (a) => a.questionId === q.id
                      )?.selectedOptionId;
                      // Ưu tiên so sánh ID (đáng tin hơn apiInfo.isCorrect từ backend)
                      const isCorrect: boolean | null =
                        correctId != null && selectedId != null
                          ? selectedId === correctId
                          : apiInfo?.isCorrect != null
                          ? apiInfo.isCorrect
                          : null;

                      // Don't show question text if it's just the fallback "Question N" title
                      const questionTitle = formatQuestionTitle(idx + 1, t);
                      const shouldShowQuestionText = q.question && q.question !== questionTitle;

                      return (
                        <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-amber-500">
                            <span>{questionTitle}</span>
                            {isCorrect !== null && (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                                isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                              }`}>
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                {isCorrect ? t('lessonContent.accurate') : t('lessonContent.incorrect')}
                              </span>
                            )}
                          </div>
                          {shouldShowQuestionText && (
                            <p className="mt-2 text-sm font-semibold text-slate-900">{q.question}</p>
                          )}
                          {q.imageUrl && (
                            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                              <img src={q.imageUrl} alt={t('lessonContent.questionImageAlt')} className="w-full object-contain max-h-72" />
                            </div>
                          )}
                          <div className="mt-2 grid gap-1.5">
                            {q.options.map((opt) => {
                              const isSelected = opt.id === selectedId;
                              const isCorrectOpt = opt.id === correctId;
                              return (
                                <div
                                  key={opt.id}
                                  className={`rounded-xl border px-3 py-2 text-sm ${
                                    isCorrectOpt
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                      : isSelected && !isCorrectOpt
                                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                                      : 'border-slate-100 bg-slate-50 text-slate-500'
                                  }`}
                                >
                                  {isCorrectOpt && '✓ '}
                                  {isSelected && !isCorrectOpt && '✗ '}
                                  {opt.label}
                                </div>
                              );
                            })}
                          </div>
                          {(q.explanation || apiInfo?.explanation) && (
                            <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                              <strong>{t('lessonContent.explanation')}</strong> {q.explanation || apiInfo?.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Fallback: chỉ có dữ liệu Đúng/Sai, không có câu hỏi
              if (allAnswers.length > 0) {
                return (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('lessonContent.resultsByQuestion')}</p>
                    <div className="grid gap-2">
                      {allAnswers.map((a, idx) => {
                        const answerCorrect =
                          a.isCorrect === true
                            ? true
                            : a.isCorrect === false
                            ? false
                            : null;
                        return (
                        <div
                          key={a.questionId ?? idx}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                            answerCorrect === true
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : answerCorrect === false
                              ? 'border-rose-100 bg-rose-50 text-rose-700'
                              : 'border-slate-100 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="font-medium">{formatQuestionTitle(idx + 1, t)}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            answerCorrect === true
                              ? 'bg-emerald-100 text-emerald-700'
                              : answerCorrect === false
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            {answerCorrect === true ? t('lessonContent.correct') : answerCorrect === false ? t('lessonContent.incorrect') : 'N/A'}
                          </span>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setShowReview(false);
              onClearReview();
              setShowHistory(false);
              onStart();
            }}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
          >
            {t('lessonContent.retakeQuiz')}
          </button>
          <button
            type="button"
            onClick={() => { setShowReview(false); onClearReview(); setShowHistory(true); }}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-amber-600"
          >
            {t('lessonContent.viewHistory')}
          </button>
        </div>
      </div>
    );
  }

  // ── Loading: starting quiz ──
  if (isStarting) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">{t('lessonContent.startingQuiz')}</p>
        </div>
      </div>
    );
  }

  // ── Error: start failed ──
  if (startError) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-600">
          {startError}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
          >
            {t('lessonContent.retryBtn')}
          </button>
          <button
            type="button"
            onClick={() => { onViewHistory(); setShowHistory(true); }}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-amber-600"
          >
            {t('lessonContent.viewHistory')}
          </button>
        </div>
      </div>
    );
  }

  // ── Start screen ──
  if (!currentAttemptId) {
    const displayTime = testTime ?? quizDetail?.timeLimit;
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <QuestionMarkCircleIcon className="h-8 w-8 text-amber-500" />
        </span>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-slate-800">{t('lessonContent.readyToTakeQuiz')}</p>
          <p className="text-sm text-slate-500">{t('lessonContent.pressStartInstructions')}</p>
          {displayTime != null && displayTime > 0 && (
            <p className="text-sm text-slate-500">
              {t('lessonContent.quizTime')}{' '}
              <span className="font-semibold text-amber-600">{displayTime} {t('lessonContent.minutes')}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
          >
            {t('lessonContent.startQuiz')}
          </button>
          <button
            type="button"
            onClick={() => { onViewHistory(); setShowHistory(true); }}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-amber-600"
          >
            {t('lessonContent.viewHistory')}
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting / Fetching result ──
  if (isSubmitting || isResultLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">
            {isSubmitting ? t('lessonContent.submittingAnswers') : t('lessonContent.loadingResults')}
          </p>
        </div>
      </div>
    );
  }

  // ── Result screen ──
  if (attemptResult) {
    const pct =
      attemptResult.percentage != null
        ? attemptResult.percentage
        : attemptResult.correctAnswers != null && attemptResult.totalQuestions
        ? Math.round((attemptResult.correctAnswers / attemptResult.totalQuestions) * 100)
        : attemptResult.score != null
        ? attemptResult.score
        : null;

    const correctAnswerCount =
      attemptResult.correctAnswers != null
        ? attemptResult.correctAnswers
        : pct != null && attemptResult.totalQuestions
        ? Math.round((pct / 100) * attemptResult.totalQuestions)
        : null;

    // Build a map of per-question results for review
    const resultMap: Record<string, { correctAnswerId?: string; isCorrect?: boolean }> = {};
    (attemptResult.answers ?? []).forEach((a) => {
      if (a.questionId) {
        resultMap[a.questionId] = {
          correctAnswerId: a.correctAnswerId,
          isCorrect: a.isCorrect,
        };
      }
    });

    const questions = normalizeQuizQuestions(quizDetail?.questions ?? [], t);

    return (
      <div className="space-y-5">
        {/* Score banner */}
        <div className={`flex flex-col items-center gap-2 rounded-2xl p-6 ${
          attemptResult.passed == null
            ? 'bg-amber-50'
            : attemptResult.passed
            ? 'bg-emerald-50'
            : 'bg-rose-50'
        }`}>
          <AcademicCapIcon className={`h-10 w-10 ${
            attemptResult.passed == null ? 'text-amber-500' : attemptResult.passed ? 'text-emerald-500' : 'text-rose-500'
          }`} />
          <p className={`text-2xl font-bold ${
            attemptResult.passed == null ? 'text-amber-700' : attemptResult.passed ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {correctAnswerCount != null && attemptResult.totalQuestions != null
              ? `${correctAnswerCount}/${attemptResult.totalQuestions}`
              : pct != null
              ? `${pct}%`
              : '-'}
          </p>
          <p className="text-sm font-semibold text-slate-600">
            {attemptResult.passed == null
              ? t('lessonContent.submitSuccess')
              : attemptResult.passed
              ? t('lessonContent.congratulationsSuccess')
              : t('lessonContent.notMeetRequirementsRetry')}
          </p>
          {attemptResult.correctAnswers != null && (
            <p className="text-xs text-slate-500">
              {(() => {
                const correct = attemptResult.correctAnswers;
                const total = attemptResult.totalQuestions ?? questions.length;
                if (typeof correct === 'number' && typeof total === 'number') {
                  return `${t('lessonContent.score')}: ${correct}/${total}`;
                }
                return '';
              })()}
            </p>
          )}
        </div>

        {(submitError || resultError) && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
            {submitError || resultError}
          </div>
        )}

        {/* Per-question review (if result contains answer breakdown or questions have isCorrect info) */}
        {questions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">{t('lessonContent.reviewByQuestion')}</h4>
            {questions.map((q, idx) => {
              const userAnswerId = answers[q.id];
              const apiInfo = resultMap[q.id];
              const correctId =
                apiInfo?.correctAnswerId ??
                q.correctAnswer ??
                q.options.find((o) => o.isCorrect)?.id;
              const isCorrect =
                apiInfo?.isCorrect != null
                  ? apiInfo.isCorrect
                  : correctId != null && userAnswerId === correctId;

              // Don't show question text if it's just the fallback "Question N" title
              const questionTitle = formatQuestionTitle(idx + 1, t);
              const shouldShowQuestionText = q.question && q.question !== questionTitle;

              return (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-amber-500">
                    <span>{questionTitle}</span>
                    {(correctId || apiInfo) && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        {isCorrect ? t('lessonContent.accurate') : t('lessonContent.incorrect')}
                      </span>
                    )}
                  </div>
                  {shouldShowQuestionText && (
                    <p className="mt-2 text-sm font-semibold text-slate-900">{q.question}</p>
                  )}
                  {q.imageUrl && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                      <img src={q.imageUrl} alt={t('lessonContent.questionImageAlt')} className="w-full object-contain max-h-72" />
                    </div>
                  )}
                  <div className="mt-2 grid gap-1.5">
                    {q.options.map((opt) => {
                      const isUser = opt.id === userAnswerId;
                      const isCorrectOpt = opt.id === correctId;
                      return (
                        <div
                          key={opt.id}
                          className={`rounded-xl border px-3 py-2 text-sm ${
                            isCorrectOpt
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : isUser && !isCorrectOpt
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-slate-100 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {isCorrectOpt && '✓ '}
                          {isUser && !isCorrectOpt && '✗ '}
                          {opt.label}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                      <strong>{t('lessonContent.explanation')}</strong> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setShowHistory(false);
              onStart();
            }}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500"
          >
            {t('lessonContent.retake')}
          </button>
          <button
            type="button"
            onClick={() => { onViewHistory(); setShowHistory(true); }}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-amber-600"
          >
            {t('lessonContent.viewHistory')}
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz screen: show questions ──
  const questions = normalizeQuizQuestions(quizDetail?.questions ?? [], t);
  const total = questions.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm font-semibold text-amber-700">
        {t('lessonContent.noQuestions')}
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  const handleSubmit = () => {
    const payload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));
    onSubmit(payload);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatQuestionsCount = (count: number, t: any) => {
    return count === 1 ? `1 ${t('lessonContent.question')}` : `${count} ${t('lessonContent.questions')}`;
  };

  const formatQuestionNumber = (index: number, total: number, t: any) => {
    return t('lessonContent.questionNum', { index, total });
  };

  const totalSecs = (testTime ?? quizDetail?.timeLimit ?? 0) * 60;
  const timerColorClass =
    timeLeft === null
      ? ''
      : timeLeft <= 60
      ? 'text-rose-600'
      : totalSecs > 0 && timeLeft / totalSecs <= 0.3
      ? 'text-amber-500'
      : 'text-emerald-600';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{formatQuestionsCount(total, t)}</h3>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <span className={`flex items-center gap-1 text-sm font-bold tabular-nums ${timerColorClass}`}>
              <ClockIcon className="h-4 w-4" />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {questions.map((question, index) => {
        const selected = answers[question.id];
        // Don't show question text if it's just the fallback "Question N" title
        const questionTitle = formatQuestionTitle(index + 1, t);
        const shouldShowQuestionText = question.question && question.question !== questionTitle;

        return (
          <div
            key={question.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              {formatQuestionNumber(index + 1, total, t)}
            </p>
            {shouldShowQuestionText && (
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{question.question}</h4>
            )}
            {question.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <img src={question.imageUrl} alt={t('lessonContent.questionImageAlt')} className="w-full object-contain max-h-72" />
              </div>
            )}
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => {
                const isSelected = selected === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                      }
                      className="h-3.5 w-3.5 text-amber-500"
                    />
                    <span className="flex-1">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {submitError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
          {submitError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={answeredCount !== total}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {t('lessonContent.submitAnswers', { answered: answeredCount, total })}
        </button>
        <button
          type="button"
          onClick={() => { onViewHistory(); setShowHistory(true); }}
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-amber-200 hover:text-amber-600"
        >
          {t('lessonContent.viewHistory')}
        </button>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const LessonContentPage: React.FC = () => {
  const { t } = useTranslation();
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();

  const getLessonTypeLabel = (type: LessonType) => {
    return t(`lessonTypes.${type}`);
  };
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

  const {
    videoUrl, isVideoLoading, getVideoUrl, clearVideo,
    documentUrl, isDocumentLoading, getDocumentUrl, clearDocument,
  } = useLecture();

  const {
    quizAttempt,
    quizDetail,
    isQuizLoading,
    quizError,
    startQuiz,
    isSubmitting,
    submitError,
    attemptResult,
    isResultLoading,
    resultError,
    submitQuiz,
    attemptHistory,
    isHistoryLoading,
    historyError,
    getAttemptHistory,
    loadQuizDetail,
    reviewResult,
    isReviewLoading,
    reviewError,
    getAttemptReview,
    clearReview,
    clearQuiz,
  } = useQuiz();

  useEffect(() => {
    if (courseId) {
      getCourseContent(courseId);
      getCourseDetail(courseId);
    } else {
      navigate('/admin/manage-course');
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
          const items: LessonItem[] = extractItemsFromLecture(lecture, t);

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
  const [downloadPending, setDownloadPending] = useState(false);

  // Auto-expand the current section in sidebar
  useEffect(() => {
    if (currentEntry) {
      setMarkedDone(Boolean(currentEntry.lesson.isCompleted));
      setExpandedSections((prev) => ({ ...prev, [currentEntry.section.id]: true }));
      setActiveTab('overview');
      setDownloadPending(false);
    }
  }, [currentEntry]);

  // Fetch video URL from API when current lesson is a video
  useEffect(() => {
    if (currentEntry?.lesson.type === 'video') {
      const vid = currentEntry.lesson.videoId;
      if (vid) {
        getVideoUrl(vid);
      } else {
        clearVideo();
      }
      clearDocument();
      clearQuiz();
    } else if (currentEntry?.lesson.type === 'doc') {
      clearVideo();
      clearDocument();
      clearQuiz();
    } else {
      // quiz or unknown
      clearVideo();
      clearDocument();
      clearQuiz();
    }
  }, [currentEntry?.lesson.id, currentEntry?.lesson.type, getVideoUrl, clearVideo, clearDocument, clearQuiz]);

  // Redirect if no lessonId
  useEffect(() => {
    if (!lessonId && timeline.length && courseId) {
      navigate(`/admin/course-progress/${courseId}/lesson/${timeline[0].lesson.id}`, { replace: true });
    }
  }, [lessonId, timeline, navigate, courseId]);

  const navigateToLesson = useCallback(
    (lesson: LessonItem) => {
      if (courseId) {
        navigate(`/admin/course-progress/${courseId}/lesson/${lesson.id}`);
      }
    },
    [navigate, courseId]
  );

  const handleBackToCourse = useCallback(() => {
    if (courseId) navigate(`/admin/course-progress/${courseId}`);
  }, [navigate, courseId]);

  const handleDocumentDownload = useCallback(
    (lesson: LessonItem) => {
      if (lesson.type !== 'doc' || typeof document === 'undefined') return;
      const href = documentUrl ?? DEFAULT_DOCUMENT_DOWNLOAD_PATH;
      const link = document.createElement('a');
      link.href = href;
      link.rel = 'noopener';
      link.target = '_blank';
      link.download = `${normalizeToFileName(lesson.title)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [documentUrl]
  );

  // Trigger download sau khi URL được fetch về (khi người dùng nhấn nút Tải tài liệu)
  useEffect(() => {
    if (downloadPending && documentUrl && currentEntry?.lesson) {
      handleDocumentDownload(currentEntry.lesson);
      setDownloadPending(false);
    }
  }, [downloadPending, documentUrl, currentEntry?.lesson, handleDocumentDownload]);

  const handleDownloadButtonClick = useCallback(() => {
    if (!currentEntry?.lesson || currentEntry.lesson.type !== 'doc') return;
    setDownloadPending(true);
    getDocumentUrl(currentEntry.lesson.id);
  }, [currentEntry?.lesson, getDocumentUrl]);

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
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm font-semibold text-slate-600">{t('lessonContent.loadingLesson')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (apiError) {
    return (
      <AdminLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-base font-semibold text-red-600">{apiError}</p>
          <Link
            to="/admin/manage-course"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {t('lessonContent.backBtn')}
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!currentEntry) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 lg:px-10">
          <button
            type="button"
            onClick={handleBackToCourse}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('lessonContent.backToCourse')}
          </button>
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-600">
            {lessonId
              ? t('lessonContent.lessonNotFoundInCourse')
              : t('lessonContent.courseHasNoLessons')}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { lesson, section } = currentEntry;
  const LessonIcon = lessonTypeIcons[lesson.type];

  // Tabs: only overview (quiz content is shown directly in main area above)
  const tabs: Array<{ id: 'overview' | 'content'; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> =
    [
      { id: 'overview', label: t('common.overview'), icon: ListBulletIcon },
    ];

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-sm">
        <Link to="/admin/manage-course" className="font-medium text-indigo-500 hover:text-indigo-600">
          {t('navigation.myCourses')}
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
            />
          )}

          {/* Quiz Content — shown directly in main area */}
          {lesson.type === 'quiz' && (
            <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-900/5">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-amber-500" />
                </span>
                <h2 className="text-base font-semibold text-slate-800">{t('lessonContent.doQuiz')}</h2>
              </div>
              <QuizContent
                isStarting={isQuizLoading}
                startError={quizError}
                currentAttemptId={quizAttempt?.attemptId ?? quizAttempt?.id ?? null}
                quizDetail={quizDetail}
                testTime={quizAttempt?.testTime}
                isSubmitting={isSubmitting}
                submitError={submitError}
                attemptResult={attemptResult}
                isResultLoading={isResultLoading}
                resultError={resultError}
                attemptHistory={attemptHistory}
                isHistoryLoading={isHistoryLoading}
                historyError={historyError}
                reviewResult={reviewResult}
                isReviewLoading={isReviewLoading}
                reviewError={reviewError}
                onStart={() => startQuiz(lesson.id)}
                onSubmit={(answers) => {
                  const id = quizAttempt?.attemptId ?? quizAttempt?.id ?? '';
                  submitQuiz(id, answers);
                }}
                onViewHistory={() => { getAttemptHistory(lesson.id); loadQuizDetail(lesson.id); }}
                onViewAttempt={(attemptId) => getAttemptReview(attemptId)}
                onClearReview={clearReview}
              />
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
                    {getLessonTypeLabel(lesson.type)}
                  </span>

                  <span className="text-xs text-slate-400">
                    {t('lessonContent.lessonNum')} {currentIndex + 1} / {timeline.length}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug truncate overflow-hidden max-w-md" title={lesson.title}>{lesson.title}</h1>
                <p className="text-sm text-slate-500">{section.title}</p>
              </div>

              {/* Actions: Mark done + Download (for doc) */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {lesson.type === 'doc' && (
                  <button
                    type="button"
                    onClick={handleDownloadButtonClick}
                    disabled={isDocumentLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDocumentLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    ) : (
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    )}
                    {t('lessonContent.downloadDocument')}
                  </button>
                )}
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
                  {markedDone ? t('lessonContent.completed') : t('lessonContent.markAsCompleted')}
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
                {t('lessonContent.previousLesson')}
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
                {t('lessonContent.nextLesson')}
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl bg-white shadow-md shadow-slate-900/5 overflow-hidden">
            {/* Tab bar — chỉ hiển thị khi có nhiều hơn 1 tab */}
            {tabs.length > 1 && (
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
            )}

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                      {t('lessonContent.aboutThisLesson')}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {lesson.type === 'video' && t('lessonContent.videoLessonDescription')}
                      {lesson.type === 'quiz' && t('lessonContent.quizLessonDescription')}
                      {lesson.type === 'doc' && t('lessonContent.docLessonDescription')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t('lessonContent.type'), value: getLessonTypeLabel(lesson.type) },
                      { label: t('course.duration'), value: lesson.duration },
                      { label: t('lessonContent.chapter'), value: section.title },
                      { label: t('lessonContent.status'), value: markedDone ? t('lessonContent.completed') : t('lessonContent.notStarted') },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
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
              title={sidebarOpen ? t('lessonContent.hideCourseContent') : t('lessonContent.showCourseContent')}
            >
              {sidebarOpen ? (
                <>
                  <span className="flex items-center gap-2">
                    <ListBulletIcon className="h-4 w-4" />
                    {t('lessonContent.courseContent')}
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
                <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-5 py-2">
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
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
                    // const completedInSection = sec.items.filter((i) => i.isCompleted).length;

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
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${lessonTypeStyles[item.type]}`}>
                                        <ItemIcon className="h-2.5 w-2.5" />
                                        {getLessonTypeLabel(item.type)}
                                      </span>
                                      <span className="text-[10px] font-medium text-slate-500">
                                        {t('lessonContent.lessonNum')} {itemIndex + 1} / {sec.items.length}
                                      </span>
                                    </div>
                                    <p className={`text-sm leading-snug truncate ${isActive ? 'font-semibold text-indigo-700' : 'font-medium text-slate-700'}`}>
                                      {item.title}
                                    </p>
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
    </AdminLayout>
  );
};

export default LessonContentPage;
