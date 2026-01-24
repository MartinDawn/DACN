export interface InstructorCourse {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPublished: boolean;
  studentCount: number;
  averageRating: number;
  ratingCount: number;
  tagIds: string[];
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
