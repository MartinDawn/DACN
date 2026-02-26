export interface RecommendedCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  rating: number;
  price: number;
}

export interface CourseDetail {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  instructorName: string;
  instructorAvatar?: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalHours: number;
  categories?: string[];
  originalPrice?: number;
  discountPercent?: number;
  learningObjectives?: string[];
  curriculum?: {
    title: string;
    lessons: string;
    duration: string;
    topics: string[];
  }[];
}

export interface CourseComment {
  commentId: string;
  studentName: string;
  rate: number;
  content: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

export interface MyCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  averageRating: number;
  totalReviews: number;
  price: number;
  originalPrice?: number | null;
  totalHours: number;
  totalStudents: number;
  isBestseller: boolean;
}

export interface PaginatedCourses {
  items: MyCourse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterParams {
  Page?: number;
  PageSize?: number;
  SortBy?: 'rating' | 'newest' | 'priceasc' | 'pricedesc' | 'popularity';
  TagId?: string[];
  MinPrice?: number;
  MaxPrice?: number;
}

export interface CourseSearchItem {
  id: string;
  name: string;
  imageUrl: string;
  instructorName: string;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  price: number;
  originalPrice: number | null;
  totalHours: number;
  isBestseller: boolean;
}

export interface CourseSearchResponse {
  items: CourseSearchItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchParams {
  searchTerm: string;
  page: number;
  pageSize: number;
}

// Cấu trúc bài học dạng object (khi backend trả về lessons là array of objects)
export interface ApiLesson {
  id: string;
  title?: string;
  name?: string;
  type?: string | number; // 'video' | 'doc' | 'quiz' hoặc 0 | 1 | 2
  duration?: number | string;
  order?: number;
  url?: string;       // URL của video/tài liệu (nếu backend trả về trong object)
  videoUrl?: string;  // Alias cho url của video
  videoId?: string;   // ID riêng của video để gọi /api/Lecture/get-video/{videoId}
}

export interface ApiLecture {
  id: string;
  name: string;
  description?: string;
  // Cấu trúc 1: API trả về tên theo từng loại (string[])
  videoNames?: string[];
  videoUrls?: string[];
  documentNames?: string[];
  quizNames?: string[];
  // Cấu trúc 2: API trả về mảng lessons gộp chung
  lessons?: ApiLesson[];
  videos?: (ApiLesson | string)[];
  documents?: (ApiLesson | string)[];
  quizzes?: (ApiLesson | string)[];
}

export interface ApiCourseContent {
  id: string;
  name: string;
  lectures: ApiLecture[];
}

export interface ApiQuizAnswer {
  id: string;
  content?: string;
  text?: string;
  label?: string;
  answerText?: string;
  isCorrect?: boolean;
}

export interface ApiQuizQuestion {
  id?: string;
  questionText?: string;
  content?: string;
  question?: string;
  text?: string;
  questionType?: string;
  answers?: ApiQuizAnswer[];
  options?: ApiQuizAnswer[];
  choices?: ApiQuizAnswer[];
  correctAnswer?: string;
  explanation?: string;
}

export interface ApiQuizAttempt {
  attemptId?: string;
  id?: string;
  quizId?: string;
  quizName?: string;
  title?: string;
  description?: string;
  questions?: ApiQuizQuestion[];
  timeLimit?: number;
  testTime?: number; // thời gian làm bài theo phút (trả về từ API startAttempt)
}

// GET /api/Quiz/{quizId}
export interface ApiQuizDetail {
  id?: string;
  title?: string;
  description?: string;
  questions?: ApiQuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
}

// POST /api/Quiz/submit  — request body
export interface ApiQuizSubmitRequest {
  quizAttemptId: string;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
  }>;
}

// GET /api/Quiz/attempt/{attemptId}/result
export interface ApiQuizResultAnswer {
  questionId?: string;
  selectedOptionId?: string;
  correctAnswerId?: string;
  isCorrect?: boolean;
}

export interface ApiQuizResult {
  attemptId?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  percentage?: number;
  passed?: boolean;
  completedAt?: string;
  answers?: ApiQuizResultAnswer[];
}

// GET /api/Quiz/{quizId}/attempts  — one entry in history list
export interface ApiQuizAttemptSummary {
  attemptId?: string;
  id?: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  percentage?: number;
  passed?: boolean;
  startedAt?: string;
  completedAt?: string;
}
