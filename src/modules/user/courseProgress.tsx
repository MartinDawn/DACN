import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import UserLayout from './layout/layout';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/20/solid';

export type LessonType = 'video' | 'quiz' | 'assignment' | 'doc';
type LessonFilterValue = 'all' | LessonType;

export interface LessonItem {
  id: string;
  title: string;
  type: LessonType;
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
  courses: number;
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

export const lessonTypeLabel: Record<LessonType, string> = {
  video: 'Video',
  quiz: 'Quiz',
  assignment: 'Bài tập',
  doc: 'Tài liệu',
};

export const lessonTypeStyles: Record<LessonType, string> = {
  video: 'bg-indigo-100 text-indigo-600',
  quiz: 'bg-amber-100 text-amber-600',
  assignment: 'bg-emerald-100 text-emerald-600',
  doc: 'bg-sky-100 text-sky-600',
};
export const lessonTypeIcons: Record<LessonType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  video: PlayCircleIcon,
  quiz: QuestionMarkCircleIcon,
  assignment: ClipboardDocumentCheckIcon,
  doc: DocumentTextIcon,
};
export const lessonIconWrappers: Record<LessonType, string> = {
  video: 'bg-indigo-50 text-indigo-500',
  quiz: 'bg-amber-50 text-amber-500',
  assignment: 'bg-emerald-50 text-emerald-500',
  doc: 'bg-sky-50 text-sky-500',
};
export const lessonTypeDescriptions: Record<LessonType, string> = {
  video: 'Bài giảng video với ví dụ trực quan và hướng dẫn chi tiết.',
  quiz: 'Quiz ngắn giúp bạn củng cố kiến thức vừa học.',
  assignment: 'Bài tập thực hành để luyện kỹ năng xây dựng dự án.',
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
export const lessonFilterTabs: Array<{ label: string; value: LessonFilterValue }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Video', value: 'video' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Bài tập', value: 'assignment' },
  { label: 'Tài liệu', value: 'doc' },
];

export const COURSE_FALLBACK_ID = 'lap-trinh-react';

const mockCourseMap: Record<string, CourseProgressData> = {
  [COURSE_FALLBACK_ID]: {
    id: 'lap-trinh-react',
    title: 'Lập trình React từ cơ bản đến nâng cao',
    instructor: 'Nguyễn Văn Hùng · Senior React Developer',
    updatedAt: 'Cập nhật: 2025-10-18',
    stats: {
      completion: 22,
      lessonsCompleted: 2,
      totalLessons: 38,
      timeSpent: '9h',
      totalTime: '42h',
      averageScore: 85,
    },
    overview: {
      duration: '42 giờ',
      level: 'Trung bình',
      language: 'Tiếng Việt',
      access: 'Trọn đời',
    },
    instructorInfo: {
      name: 'Nguyễn Văn Hùng',
      title: 'Senior React Developer',
      initials: 'NVH',
      students: 45821,
      courses: 12,
      rating: 4.8,
    },
    helpLinks: [
      { id: 'qa', label: 'Hỏi đáp với giảng viên', description: 'Đặt câu hỏi để được hỗ trợ nhanh' },
      { id: 'resources', label: 'Tải tài liệu khóa học', description: 'Xem toàn bộ tài nguyên đính kèm' },
      { id: 'guide', label: 'Xem hướng dẫn', description: 'Tìm hiểu cách sử dụng nền tảng' },
    ],
    sections: [
      {
        id: 'section-1',
        title: 'Giới thiệu về React',
        summary: 'Tìm hiểu cơ bản về React và cài đặt môi trường',
        totalDuration: '1h 30m',
        items: [
          { id: 'video-1', title: 'React là gì? Tại sao nên học React?', type: 'video', duration: '15:30', isCompleted: true },
          { id: 'video-2', title: 'Cài đặt môi trường phát triển', type: 'video', duration: '20:45', isCompleted: true },
          { id: 'video-3', title: 'Tạo ứng dụng React đầu tiên', type: 'video', duration: '25:00' },
          { id: 'doc-1', title: 'Tài liệu React chính thức', type: 'doc', duration: 'PDF', isPreview: true },
          { id: 'quiz-1', title: 'Bài kiểm tra: Kiến thức cơ bản', type: 'quiz', duration: '10:00' },
        ],
      },
      {
        id: 'section-2',
        title: 'JSX và Components',
        summary: 'Nắm vững JSX syntax và cách tạo components',
        totalDuration: '2h 15m',
        items: [
          { id: 'video-4', title: 'Hiểu về JSX', type: 'video', duration: '22:15' },
          { id: 'video-5', title: 'Tạo Functional Components', type: 'video', duration: '18:30' },
          { id: 'video-6', title: 'Class Components', type: 'video', duration: '20:10' },
          { id: 'doc-2', title: 'JSX Cheat Sheet', type: 'doc', duration: 'Tài liệu', isPreview: true },
          { id: 'assignment-1', title: 'Bài tập: Xây dựng Component Card', type: 'assignment', duration: '30:00' },
        ],
      },
      {
        id: 'section-3',
        title: 'Props và State',
        summary: 'Quản lý dữ liệu trong React components',
        totalDuration: '3h 00m',
        items: [
          { id: 'video-7', title: 'Props cơ bản', type: 'video', duration: '25:30' },
          { id: 'video-8', title: 'State trong React', type: 'video', duration: '28:45' },
          { id: 'doc-3', title: 'Props vs State', type: 'doc', duration: 'Bài viết' },
          { id: 'video-9', title: 'Event Handling', type: 'video', duration: '22:20' },
          { id: 'quiz-2', title: 'Bài kiểm tra: Props và State', type: 'quiz', duration: '15:00' },
          { id: 'assignment-2', title: 'Bài tập: Todo List App', type: 'assignment', duration: '45:00' },
        ],
      },
      {
        id: 'section-4',
        title: 'React Hooks',
        summary: 'useState, useEffect, useContext và các hooks khác',
        totalDuration: '4h 30m',
        items: [
          { id: 'video-10', title: 'Giới thiệu React Hooks', type: 'video', duration: '18:00' },
          { id: 'video-11', title: 'useState Hook chi tiết', type: 'video', duration: '30:15' },
          { id: 'video-12', title: 'useEffect Hook', type: 'video', duration: '35:40' },
          { id: 'video-13', title: 'useContext và Context API', type: 'video', duration: '28:30' },
          { id: 'video-14', title: 'Custom Hooks', type: 'video', duration: '25:20' },
          { id: 'doc-4', title: 'Hooks Best Practices', type: 'doc', duration: 'Tài liệu' },
          { id: 'quiz-3', title: 'Bài kiểm tra: React Hooks', type: 'quiz', duration: '20:00' },
          { id: 'assignment-3', title: 'Bài tập: Weather App với Hooks', type: 'assignment', duration: '60:00' },
        ],
      },
      {
        id: 'section-5',
        title: 'React Router',
        summary: 'Routing và navigation trong React applications',
        totalDuration: '2h 45m',
        items: [
          { id: 'video-15', title: 'Cài đặt React Router', type: 'video', duration: '15:00' },
          { id: 'video-16', title: 'Basic Routing', type: 'video', duration: '25:30' },
          { id: 'video-17', title: 'Nested Routes', type: 'video', duration: '22:15' },
          { id: 'video-18', title: 'Route Parameters', type: 'video', duration: '20:40' },
          { id: 'video-19', title: 'Protected Routes', type: 'video', duration: '28:10' },
          { id: 'assignment-4', title: 'Bài tập: Multi-page Application', type: 'assignment', duration: '50:00' },
        ],
      },
      {
        id: 'section-6',
        title: 'State Management với Redux',
        summary: 'Quản lý state toàn cục với Redux Toolkit',
        totalDuration: '5h 00m',
        items: [
          { id: 'video-20', title: 'Tại sao cần Redux?', type: 'video', duration: '20:00' },
          { id: 'video-21', title: 'Redux Core Concepts', type: 'video', duration: '30:15' },
          { id: 'video-22', title: 'Redux Toolkit', type: 'video', duration: '35:10' },
          { id: 'assignment-5', title: 'Bài tập: Weather App với Hooks', type: 'assignment', duration: '60:00' },
        ],
      },
    ],
  },
};

const baseCourse = mockCourseMap[COURSE_FALLBACK_ID];

mockCourseMap['react-dev-2024'] = {
  ...baseCourse,
  id: 'react-dev-2024',
  title: 'Complete React Developer Course 2024',
  updatedAt: 'Cập nhật: 2025-01-12',
  stats: {
    ...baseCourse.stats,
    completion: 72,
    lessonsCompleted: 30,
    totalLessons: 42,
    timeSpent: '31h',
    averageScore: 88,
  },
  sections: [
    {
      id: 'react-setup-2024',
      title: 'Bắt đầu với React 2024',
      summary: 'Chuẩn bị môi trường và kiến trúc dự án mới nhất',
      totalDuration: '1h 45m',
      items: [
        { id: 'react24-video-1', title: 'Giới thiệu khóa học', type: 'video', duration: '08:30', isCompleted: true },
        { id: 'react24-video-2', title: 'Thiết lập dự án với Vite', type: 'video', duration: '18:20', isCompleted: true },
        { id: 'react24-doc-1', title: 'Checklist môi trường phát triển', type: 'doc', duration: 'Tài liệu' },
        { id: 'react24-quiz-1', title: 'Quiz: Tổng quan React', type: 'quiz', duration: '10:00' },
      ],
    },
    {
      id: 'react-hooks-2024',
      title: 'Hooks & State nâng cao',
      summary: 'Khai thác useState, useReducer và custom hooks',
      totalDuration: '2h 05m',
      items: [
        { id: 'react24-video-3', title: 'Quản lý state hiện đại', type: 'video', duration: '24:10' },
        { id: 'react24-video-4', title: 'Custom Hooks thực tế', type: 'video', duration: '26:45' },
        { id: 'react24-assignment-1', title: 'Bài tập: Dashboard với Hooks', type: 'assignment', duration: '55:00' },
        { id: 'react24-quiz-2', title: 'Quiz: Hooks', type: 'quiz', duration: '12:00' },
      ],
    },
    {
      id: 'react-project-2024',
      title: 'Dự án cuối khóa',
      summary: 'Xây dựng SPA hoàn chỉnh với React Router',
      totalDuration: '3h 10m',
      items: [
        { id: 'react24-video-5', title: 'Thiết kế kiến trúc SPA', type: 'video', duration: '28:30' },
        { id: 'react24-video-6', title: 'Tối ưu hiệu năng', type: 'video', duration: '23:15' },
        { id: 'react24-assignment-2', title: 'Bài tập: Triển khai sản phẩm', type: 'assignment', duration: '90:00' },
        { id: 'react24-doc-2', title: 'Checklist trước khi deploy', type: 'doc', duration: 'Tài liệu' },
      ],
    },
  ],
};

mockCourseMap['python-beginner'] = {
  ...baseCourse,
  id: 'python-beginner',
  title: 'Python cho Người Mới Bắt Đầu',
  instructor: 'Trần Thị B · Senior Data Scientist',
  updatedAt: 'Cập nhật: 2025-01-05',
  stats: {
    completion: 100,
    lessonsCompleted: 120,
    totalLessons: 120,
    timeSpent: '35h',
    totalTime: '35h',
    averageScore: 94,
  },
  overview: {
    duration: '35 giờ',
    level: 'Mới bắt đầu',
    language: 'Tiếng Việt',
    access: 'Trọn đời',
  },
  instructorInfo: {
    name: 'Trần Thị B',
    title: 'Senior Data Scientist',
    initials: 'TTB',
    students: 68210,
    courses: 9,
    rating: 4.9,
  },
  helpLinks: [
    { id: 'mentoring', label: 'Đặt lịch mentoring', description: 'Nhận tư vấn trực tiếp từ giảng viên' },
    { id: 'lab-files', label: 'Tải file thực hành', description: 'Notebook & tài liệu hỗ trợ' },
    { id: 'community', label: 'Tham gia cộng đồng Python', description: 'Trao đổi với 5k+ học viên' },
  ],
  sections: [
    {
      id: 'py-basics',
      title: 'Làm quen với Python',
      summary: 'Cài đặt, cú pháp cơ bản và kiểu dữ liệu',
      totalDuration: '2h 20m',
      items: [
        { id: 'py-video-1', title: 'Thiết lập môi trường', type: 'video', duration: '18:40', isCompleted: true },
        { id: 'py-video-2', title: 'Biến và toán tử', type: 'video', duration: '22:10', isCompleted: true },
        { id: 'py-doc-1', title: 'Cheatsheet Python', type: 'doc', duration: 'PDF', isPreview: true },
        { id: 'py-quiz-1', title: 'Quiz: Cú pháp cơ bản', type: 'quiz', duration: '12:00', isCompleted: true },
      ],
    },
    {
      id: 'py-collections',
      title: 'Cấu trúc dữ liệu',
      summary: 'List, tuple, dict và xử lý dữ liệu',
      totalDuration: '3h 05m',
      items: [
        { id: 'py-video-3', title: 'List & tuple', type: 'video', duration: '28:30', isCompleted: true },
        { id: 'py-video-4', title: 'Dictionary & set', type: 'video', duration: '24:10', isCompleted: true },
        { id: 'py-assignment-1', title: 'Bài tập: Quản lý thư viện sách', type: 'assignment', duration: '60:00', isCompleted: true },
        { id: 'py-quiz-2', title: 'Quiz: Collections', type: 'quiz', duration: '15:00', isCompleted: true },
      ],
    },
    {
      id: 'py-project',
      title: 'Dự án cuối khóa',
      summary: 'Ứng dụng console phân tích dữ liệu',
      totalDuration: '4h 10m',
      items: [
        { id: 'py-video-5', title: 'Thiết kế dự án', type: 'video', duration: '26:45', isCompleted: true },
        { id: 'py-video-6', title: 'Xử lý file CSV', type: 'video', duration: '32:10', isCompleted: true },
        { id: 'py-assignment-2', title: 'Bài tập: Thống kê doanh số', type: 'assignment', duration: '90:00', isCompleted: true },
        { id: 'py-doc-2', title: 'Guide triển khai', type: 'doc', duration: 'Tài liệu', isCompleted: true },
      ],
    },
  ],
};

mockCourseMap['digital-marketing-2024'] = {
  ...baseCourse,
  id: 'digital-marketing-2024',
  title: 'Digital Marketing Mastery 2024',
  instructor: 'Lê Văn C · Growth Marketing Lead',
  updatedAt: 'Cập nhật: 2025-01-02',
  stats: {
    completion: 0,
    lessonsCompleted: 0,
    totalLessons: 95,
    timeSpent: '0h',
    totalTime: '28h',
    averageScore: 0,
  },
  overview: {
    duration: '28 giờ',
    level: 'Trung bình',
    language: 'Tiếng Việt',
    access: '12 tháng',
  },
  instructorInfo: {
    name: 'Lê Văn C',
    title: 'Growth Marketing Lead',
    initials: 'LVC',
    students: 39540,
    courses: 6,
    rating: 4.7,
  },
  helpLinks: [
    { id: 'template-pack', label: 'Tải template chiến dịch', description: 'Mẫu lập kế hoạch 2024' },
    { id: 'qa-session', label: 'Đăng ký Live Q&A', description: 'Giải đáp thắc mắc cùng giảng viên' },
    { id: 'toolkit', label: 'Danh sách công cụ', description: 'Quản lý chiến dịch hiệu quả' },
  ],
  sections: [
    {
      id: 'dm-fundamentals',
      title: 'Nền tảng Digital Marketing',
      summary: 'Khung chiến lược và kênh chính',
      totalDuration: '1h 50m',
      items: [
        { id: 'dm-video-1', title: 'Tổng quan digital marketing 2024', type: 'video', duration: '16:20' },
        { id: 'dm-video-2', title: 'Xây dựng chân dung khách hàng', type: 'video', duration: '18:45' },
        { id: 'dm-doc-1', title: 'Template digital plan', type: 'doc', duration: 'Tài liệu', isPreview: true },
        { id: 'dm-quiz-1', title: 'Quiz: Kiến thức nền tảng', type: 'quiz', duration: '08:00' },
      ],
    },
    {
      id: 'dm-content',
      title: 'Chiến lược nội dung',
      summary: 'Content, social media và automation',
      totalDuration: '2h 20m',
      items: [
        { id: 'dm-video-3', title: 'Content funnel đa kênh', type: 'video', duration: '24:15' },
        { id: 'dm-video-4', title: 'Automation với email & chatbot', type: 'video', duration: '22:40' },
        { id: 'dm-assignment-1', title: 'Bài tập: Lập lịch nội dung 30 ngày', type: 'assignment', duration: '45:00' },
        { id: 'dm-quiz-2', title: 'Quiz: Social metrics', type: 'quiz', duration: '12:00' },
      ],
    },
    {
      id: 'dm-analytics',
      title: 'Phân tích & tối ưu',
      summary: 'Đo lường hiệu quả và tối ưu chiến dịch',
      totalDuration: '2h 05m',
      items: [
        { id: 'dm-video-5', title: 'Google Analytics 4 thực chiến', type: 'video', duration: '27:30' },
        { id: 'dm-video-6', title: 'Thiết kế dashboard KPI', type: 'video', duration: '25:40' },
        { id: 'dm-doc-2', title: 'Checklist đo lường', type: 'doc', duration: 'Tài liệu' },
        { id: 'dm-assignment-2', title: 'Bài tập: Báo cáo hiệu suất', type: 'assignment', duration: '60:00' },
      ],
    },
  ],
};

const CourseProgressPage: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const effectiveCourseId =
    courseId && mockCourseMap[courseId] ? courseId : COURSE_FALLBACK_ID;
  const isFallback = Boolean(courseId) && effectiveCourseId !== courseId;
  const course = mockCourseMap[effectiveCourseId];
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<LessonFilterValue>('all');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() =>
    course.sections.reduce((acc, section, index) => {
      acc[section.id] = index === 0;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    setSearchTerm('');
    setActiveFilter('all');
    setExpandedSections(
      course.sections.reduce((acc, section, index) => {
        acc[section.id] = index === 0;
        return acc;
      }, {} as Record<string, boolean>)
    );
    setExpandedItems({});
  }, [course.id]);
  const toggleSection = (sectionId: string) =>
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  const toggleItem = (itemId: string) =>
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  const normalizedSearch = searchTerm.trim().toLowerCase();
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
      value: course.stats.timeSpent,
      hint: `Trong tổng ${course.stats.totalTime}`,
      icon: ClockIcon,
      accent: 'bg-sky-50 text-sky-500',
    },
    {
      label: 'Điểm trung bình',
      value: `${course.stats.averageScore}%`,
      hint: 'Quiz & bài tập',
      icon: AcademicCapIcon,
      accent: 'bg-amber-50 text-amber-500',
    },
  ];
  const openLesson = React.useCallback(
    (lessonId: string) => {
      navigate(`/user/course-progress/${effectiveCourseId}/lesson/${lessonId}`);
    },
    [navigate, effectiveCourseId]
  );
  const downloadDocument = React.useCallback((item: LessonItem) => {
    if (item.type !== 'doc' || typeof document === 'undefined') return;
    const anchor = document.createElement('a');
    anchor.href = DEFAULT_DOCUMENT_DOWNLOAD_PATH;
    anchor.rel = 'noopener';
    anchor.download = `${normalizeToFileName(item.title)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, []);
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

        {isFallback && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Không tìm thấy khóa học với ID “{courseId}”, hiển thị khóa học mặc định.
          </div>
        )}

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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, hint, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}
              >
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

        <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm bài học, quiz, bài tập..."
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-500 focus:bg-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
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
                            const LessonIcon = lessonTypeIcons[item.type];
                            const StatusIcon = item.isCompleted ? CheckCircleIcon : LockClosedIcon;
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
                                      {item.isPreview && (
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                                          Xem trước
                                        </span>
                                      )}
                                      {item.isCompleted && (
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                                          Đã hoàn thành
                                        </span>
                                      )}
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
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:text-indigo-600"
                                    >
                                      <ArrowDownTrayIcon className="h-4 w-4" />
                                    </button>
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

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <h2 className="text-lg font-semibold text-slate-900">Giảng viên</h2>
              <div className="mt-4 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-semibold text-white">
                  {course.instructorInfo.initials}
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{course.instructorInfo.name}</p>
                  <p className="text-xs text-slate-500">{course.instructorInfo.title}</p>
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

export const courseProgressMap = mockCourseMap;
export default CourseProgressPage;
