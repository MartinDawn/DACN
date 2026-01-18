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
    const response = await apiClient.post<CreateCourseResponse>('/Course/create', courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
