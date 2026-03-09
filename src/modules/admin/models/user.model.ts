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
  id: number;
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
