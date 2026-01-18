import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../course/models/course";
import type { InstructorCourse, CreateCourseResponse, BecomeInstructorResponse } from "../models/instructor";

export const instructorService = {
  /**
   * Fetches the courses for the current instructor.
   */
  async getMyCourses(): Promise<ApiResponse<InstructorCourse[]>> {
    const response = await apiClient.get<ApiResponse<InstructorCourse[]>>('/Course/my-courses');
    return response.data;
  },

  /**
   * Creates a new course.
   * @param courseData - The FormData for the new course.
   */
  async createCourse(courseData: FormData): Promise<CreateCourseResponse> {
    // For debugging: log FormData entries
    for (let [key, value] of courseData.entries()) {
      console.log(`${key}:`, value);
    }
    const response = await apiClient.post<CreateCourseResponse>('/Course/create', courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Debug: log HTTP status and payload returned by backend
    console.log('createCourse http response:', response.status, response.data);

    return response.data;
  },

  /**
   * Registers the current user to become an instructor.
   */
  async becomeInstructor(): Promise<BecomeInstructorResponse> {
    const response = await apiClient.post<BecomeInstructorResponse>('/User/become-instructor');
    return response.data;
  },
};
