import type { Tag } from "../../course/models/course";

export interface InstructorCourse {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  isPublished?: boolean;
  totalStudents: number;
  rating: number;
  tagIds?: string[];
  tags?: Tag[];
  status?: string;
}

// Interface for the data returned by the create course API
export interface CreateCourseResponse {
  data: InstructorCourse;
  // Add other properties from your API response if they exist
  success: boolean;
  message: string;
  errors?: { [key: string]: string[] };
}

// Interface for the data returned by the become instructor API
export interface BecomeInstructorResponse {
  success: boolean;
  message: string;
}

export interface RequestInstructorPayload {
  experience: string;
  expertise: string;
  certificate: string;
  introduction: string;
  socialLinks: string;
}

export interface RequestInstructorResponse {
  success: boolean;
  message?: string;
  // ...thêm trường nếu backend trả về thêm dữ liệu...
}

export interface InstructorStatusResponse {
  status: 'Pending' | 'Approved' | 'Rejected' | 'None';
  reason?: string;
  submittedAt?: string;
}

// Reply comments returned inside `replies[]` – instructor replies, no userName/rate
export interface CourseReply {
  commentId?: string;
  content?: string;
  timestamp?: string;
}

// Top-level comments in `allComments[]` – have rate and isMyComment
export interface CourseComment {
  commentId?: string;
  userName?: string;
  avatarUrl?: string | null;
  rate?: number;
  isMyComment?: boolean;
  content?: string;
  timestamp?: string;
  replies?: CourseReply[];
}

export interface CourseCommentsData {
  myComment: CourseComment | null;
  allComments: CourseComment[];
}

export interface CourseCommentsResponse {
  success: boolean;
  code: string;
  message: string;
  data: CourseCommentsData;
}
