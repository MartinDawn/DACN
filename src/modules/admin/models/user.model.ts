export interface UserResponse {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: string; // "Instructor" | "Student"
  isBanned: boolean;
  createdAt: string;
}

export interface InstructorRequest {
  id: number;        // alias dự phòng
  requestId: number; // field chính từ backend
  userId: string;
  fullName: string;
  email: string;
  experience: string;
  expertise: string;
  certificate: string;
  introduction: string;
  socialLinks: string;
  status: string; // "Pending" | "Approved" | "Rejected"
  createdAt: string;
  processedAt: string | null;
}

export interface ApproveInstructorResponse {
  title: string;
  message: string;
  requestId: number;
  isApproved: boolean;
}
