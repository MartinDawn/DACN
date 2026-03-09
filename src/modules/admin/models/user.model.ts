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
