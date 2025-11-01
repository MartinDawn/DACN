// src/models/userProfile.model.ts

/**
 * Interface chung cho mọi response từ API
 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

/**
 * Interface cho đối tượng 'stats'
 */
export interface UserProfileStats {
  completionProgress: number;
  totalHours: number;
  totalCertificates: number;
  currentStreak: number;
  averageGivenRating: number;
}

/**
 * Interface cho 'data' của API /Account/profile
 */
export interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  jobPosition: string;
  organization: string;
  phoneNumber: string;
  description: string;
  avatarUrl: string;
  location: string;
  birthDate: string; // "1363-06-03T00:00:00"
  gender: string;
  experience: string;
  memberSinceYear: number;
  stats: UserProfileStats;
}

/**
 * Interface cho payload GỬI ĐI khi cập nhật (PUT/PATCH)
 * Chúng ta sẽ map state của component sang cấu trúc này.
 */
export interface UpdateProfilePayload {
  fullName: string;
  jobPosition: string; // Map từ 'jobTitle'
  phoneNumber: string; // Map từ 'phone'
  location: string; // Map từ 'address'
  organization: string; // Map từ 'company'
  birthDate: string; // Phải là string ISO "YYYY-MM-DDTHH:mm:ss"
  gender: string;
  experience: string;
  description: string; // Map từ 'about'
  website: string;
  // API của bạn chưa rõ cách nhận skills và socialLinks
  // skills: string[];
  // socialLinks: any;
}