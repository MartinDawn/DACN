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
  requestId: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  userName: string;
  createdAt: string;
  status: string; // "Pending" | "Approved" | "Rejected"
}
