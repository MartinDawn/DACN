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
}

// Interface for the data returned by the create course API
export interface CreateCourseResponse {
  data: InstructorCourse;
  // Add other properties from your API response if they exist
  success: boolean;
  message: string;
}

// Interface for the data returned by the become instructor API
export interface BecomeInstructorResponse {
  success: boolean;
  message: string;
}
