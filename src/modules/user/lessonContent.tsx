import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserLayout from './layout/layout';
import {
  COURSE_FALLBACK_ID,
  courseProgressMap,
  lessonTypeLabel,
  lessonTypeStyles,
  lessonTypeIcons,
  lessonTypeDescriptions,
  lessonIconWrappers,
  DEFAULT_DOCUMENT_DOWNLOAD_PATH,
  normalizeToFileName,
  LessonItem,
  CourseSection,
} from './courseProgress';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

type LessonTimelineEntry = {
  section: CourseSection;
  lesson: LessonItem;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  answer: string;
  explanation: string;
};

type AssignmentGuide = {
  objective: string;
  steps: string[];
  deliverables: string[];
  tips: string[];
};

type DocumentGuide = {
  summary: string;
  highlights: string[];
};

const sampleVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const quizBank: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 'react-definition',
      question: 'React là gì?',
      options: [
        { id: 'library', label: 'Một thư viện JavaScript để xây dựng giao diện người dùng' },
        { id: 'backend', label: 'Một framework backend' },
        { id: 'database', label: 'Một cơ sở dữ liệu' },
        { id: 'language', label: 'Một ngôn ngữ lập trình' },
      ],
      answer: 'library',
      explanation: 'React là thư viện JavaScript do Meta phát triển để xây dựng UI.',
    },
    {
      id: 'jsx',
      question: 'JSX mô tả điều gì?',
      options: [
        { id: 'templating', label: 'Cú pháp mở rộng để viết UI bằng JavaScript' },
        { id: 'styling', label: 'CSS-in-JS' },
        { id: 'routing', label: 'Định nghĩa đường dẫn' },
        { id: 'state', label: 'Định nghĩa state toàn cục' },
      ],
      answer: 'templating',
      explanation: 'JSX giúp mô tả UI bằng cú pháp giống HTML nằm trong JavaScript.',
    },
  ],
};

const assignmentBank: Record<string, AssignmentGuide> = {
  default: {
    objective: 'Xây dựng component ứng dụng kiến thức vừa học.',
    steps: [
      'Phân tích yêu cầu và xác định props/state cần dùng.',
      'Tạo component, triển khai logic và style cơ bản.',
      'Kiểm tra component hoạt động với dữ liệu mẫu.',
    ],
    deliverables: [
      'Mã nguồn component hoàn chỉnh.',
      'Ảnh chụp hoặc video demo.',
      'Ghi chú ngắn mô tả cách tiếp cận.',
    ],
    tips: [
      'Áp dụng quy tắc đặt tên rõ ràng.',
      'Tách component nhỏ nếu cần tái sử dụng.',
      'Kiểm tra UI trên thiết bị di động.',
    ],
  },
};

const documentBank: Record<string, DocumentGuide> = {
  default: {
    summary: 'Tài liệu tổng hợp các khái niệm quan trọng trong bài học.',
    highlights: [
      'Các định nghĩa và lưu ý quan trọng.',
      'Checklist những việc cần thực hành.',
      'Đường dẫn tới tài nguyên tham khảo.',
    ],
  },
};

const getQuizQuestions = (lessonId: string) => quizBank[lessonId] ?? quizBank.default;
const getAssignmentGuide = (lessonId: string) => assignmentBank[lessonId] ?? assignmentBank.default;
const getDocumentGuide = (lessonId: string) => documentBank[lessonId] ?? documentBank.default;

const VideoContent: React.FC<{ lesson: LessonItem; description: string }> = ({ lesson, description }) => (
  <div className="space-y-6">
    <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-900 shadow-xl shadow-slate-900/20">
      <video controls className="aspect-video w-full bg-black">
        <source src={sampleVideoUrl} type="video/mp4" />
        Trình duyệt của bạn không hỗ trợ video.
      </video>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Ghi chú chính</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>{lesson.title} giới thiệu khái niệm cốt lõi.</li>
          <li>Tạm dừng và thử ngay trong editor.</li>
          <li>Đánh dấu câu hỏi để trao đổi với giảng viên.</li>
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm shadow-slate-900/5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Transcript mẫu</h3>
        <p className="mt-3 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  </div>
);

const QuizContent: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
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

const AssignmentContent: React.FC<{ guide: AssignmentGuide }> = ({ guide }) => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-3 text-indigo-600">
        <ClipboardDocumentCheckIcon className="h-6 w-6" />
        <h3 className="text-lg font-semibold text-slate-900">Mục tiêu</h3>
      </div>
      <p className="mt-3 text-sm text-slate-600">{guide.objective}</p>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Các bước gợi ý</h4>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {guide.steps.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="mt-1 h-6 w-6 shrink-0 rounded-full bg-indigo-100 text-center text-xs font-semibold leading-6 text-indigo-600">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-indigo-500">Bàn giao</h4>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          {guide.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-indigo-500">Mẹo</h4>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

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

const LessonContentPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const effectiveCourseId = courseId && courseProgressMap[courseId] ? courseId : COURSE_FALLBACK_ID;
  const isFallback = Boolean(courseId) && effectiveCourseId !== courseId;
  const course = courseProgressMap[effectiveCourseId];

  const timeline = React.useMemo(() => {
    const entries: LessonTimelineEntry[] = [];
    course.sections.forEach((section) => {
      section.items.forEach((lesson) => {
        entries.push({ section, lesson });
      });
    });
    return entries;
  }, [course]);

  const currentIndex = React.useMemo(
    () => timeline.findIndex((entry) => entry.lesson.id === lessonId),
    [timeline, lessonId]
  );

  const currentEntry = currentIndex >= 0 ? timeline[currentIndex] : null;
  const previousEntry = currentIndex > 0 ? timeline[currentIndex - 1] : null;
  const nextEntry = currentIndex >= 0 && currentIndex < timeline.length - 1 ? timeline[currentIndex + 1] : null;

  React.useEffect(() => {
    if (!lessonId && timeline.length) {
      navigate(`/user/course-progress/${course.id}/lesson/${timeline[0].lesson.id}`, { replace: true });
    }
  }, [lessonId, timeline, navigate, course.id]);

  const navigateToLesson = React.useCallback(
    (lesson: LessonItem) => {
      navigate(`/user/course-progress/${course.id}/lesson/${lesson.id}`);
    },
    [navigate, course.id]
  );

  const handleBackToCourse = React.useCallback(() => {
    navigate(`/user/course-progress/${course.id}`);
  }, [navigate, course.id]);

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
            Không tìm thấy bài học, vui lòng chọn bài khác trong khóa học.
          </div>
        </div>
      </UserLayout>
    );
  }

  const { lesson, section } = currentEntry;
  const LessonIcon = lessonTypeIcons[lesson.type];
  const lessonDescription = lessonTypeDescriptions[lesson.type];
  const sectionLessons = section.items;
  const [markedDone, setMarkedDone] = React.useState(Boolean(lesson.isCompleted));

  React.useEffect(() => {
    setMarkedDone(Boolean(lesson.isCompleted));
  }, [lesson.id, lesson.isCompleted]);

  const handleDocumentDownload = React.useCallback(() => {
    if (lesson.type !== 'doc' || typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = DEFAULT_DOCUMENT_DOWNLOAD_PATH;
    link.rel = 'noopener';
    link.download = `${normalizeToFileName(lesson.title)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [lesson]);

  let renderedContent: React.ReactNode = null;
  if (lesson.type === 'video') {
    renderedContent = <VideoContent lesson={lesson} description={lessonDescription} />;
  } else if (lesson.type === 'quiz') {
    renderedContent = <QuizContent questions={getQuizQuestions(lesson.id)} />;
  } else if (lesson.type === 'assignment') {
    renderedContent = <AssignmentContent guide={getAssignmentGuide(lesson.id)} />;
  } else if (lesson.type === 'doc') {
    renderedContent = <DocumentContent lesson={lesson} guide={getDocumentGuide(lesson.id)} onDownload={handleDocumentDownload} />;
  }

  return (
    <UserLayout>
      <div className="space-y-6 px-4 py-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/user/mycourses')}
            className="font-semibold text-indigo-500 transition hover:text-indigo-600"
          >
            Khóa học của tôi
          </button>
          <ChevronRightIcon className="h-4 w-4 text-slate-400" />
          <button
            type="button"
            onClick={handleBackToCourse}
            className="font-semibold text-indigo-500 transition hover:text-indigo-600"
          >
            {course.title}
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

        {isFallback && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Không tìm thấy khóa học với ID “{courseId}”, đã chuyển sang khóa học mặc định.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
          <section className="space-y-6">
            <article className="space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-slate-900/6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                
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
