// Tag interface for course categorization
export interface Tag {
  id: string;
  name: string;
}
export interface RecommendedCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  rating: number;
  price: number;
}

export interface Video {
  id: string;
  name: string;
  duration: number;
  displayOrder: number;
  videoUrl: string | null;
  isTrial: boolean;
}

export interface Quiz {
  name: string;
}

export interface Document {
  name: string;
}

export interface Lecture {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  videos: Video[];
  quizzes: Quiz[];
  documents: Document[];
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
  isEnrolled: boolean;
  lectures: Lecture[];
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

export interface CourseCommentReply {
  commentId: string;
  content: string;
  timestamp: string;
  isMyComment: boolean;
  canDelete: boolean;
}

export interface CourseComment {
  commentId: string;
  userName: string;
  avatarUrl: string | null;
  rate: number;
  content: string;
  isMyComment: boolean;
  canDelete: boolean;
  timestamp: string;
  replies?: CourseCommentReply[];
}

export interface CourseCommentsData {
  isInstructor: boolean;
  myComment: CourseComment | null;
  allComments: CourseComment[];
}

export interface ApiResponse<T> {
  success: boolean;
  code?: string;
  message: string;
  data: T;
}

export interface MyCourse {
  id: string;
  imageUrl: string;
  name: string;
  instructorName: string;
  rating: number;
  price: number;
  averageRating?: number;
  totalReviews?: number;
  originalPrice?: number | null;
  totalHours?: number;
  totalStudents?: number;
  isBestseller?: boolean;
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
  imageUrl?: string;
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
  correctOptionId?: string;   // actual API field name
  isCorrect?: boolean;
  explanation?: string;       // from detailedResults
}

export interface ApiQuizResult {
  attemptId?: string;
  quizAttemptId?: string;       // actual API field name
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  correctAnswersCount?: number; // actual API field name
  percentage?: number;
  passed?: boolean;
  completedAt?: string;
  answers?: ApiQuizResultAnswer[];
  detailedResults?: ApiQuizResultAnswer[]; // actual API field name
}

export interface AddCommentRequest {
  courseId: string;
  rate: number;
  content: string;
}

export interface UpdateCommentRequest {
  rate: number;
  content: string;
}

// GET /api/Quiz/{quizId}/attempts  — one entry in history list
export interface ApiQuizAttemptSummary {
  attemptId?: string;
  id?: string;
  quizAttemptId?: string;       // field thay thế có thể có
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  correctAnswersCount?: number; // field thực tế API trả về
  percentage?: number;
  passed?: boolean;
  startedAt?: string;
  attemptedAt?: string;         // field thực tế API trả về
  completedAt?: string;
  // cho phép các field không biết trước từ backend
  [key: string]: unknown;
}

// Video response structure for get-video API
export interface VideoResponse {
  name: string;
  duration: number;
  displayOrder: number;
  videoUrl: string | null;
  isTrial: boolean;
}

export interface QuizResponse {
  name: string;
}

export interface DocumentResponse {
  name: string;
}

export interface LectureResponse {
  name: string;
  description: string;
  displayOrder: number;
  videos: VideoResponse[];
  quizzes: QuizResponse[];
  documents: DocumentResponse[];
}

// Response from /api/Lecture/get-video/{videoId}
export interface GetVideoApiResponse {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  instructorName: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalHours: number;
  isEnrolled: boolean;
  lectures: LectureResponse[];
}
