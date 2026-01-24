import apiClient from "../../auth/services/apiClient";
import type { ApiResponse, Tag } from "../../course/models/course";
import type { InstructorCourse, CreateCourseResponse, BecomeInstructorResponse } from "../models/instructor";
import type { RequestInstructorPayload, RequestInstructorResponse } from "../models/instructor";

export const instructorService = {
  /**
   * Fetches the courses for the current instructor.
   */
  async getMyCourses(): Promise<ApiResponse<InstructorCourse[]>> {
    const response = await apiClient.get<ApiResponse<InstructorCourse[]>>('/Course/my-courses');
    return response.data;
  },

  /**
   * Fetches a single course by its ID.
   * @param courseId The ID of the course to fetch.
   */
  async getCourseById(courseId: string): Promise<ApiResponse<InstructorCourse>> {
    const response = await apiClient.get<ApiResponse<InstructorCourse>>(`/Course/${courseId}`);
    return response.data;
  },

  /**
   * Fetches all available tags/categories.
   */
  async getAllTags(): Promise<ApiResponse<Tag[]>> {
    const response = await apiClient.get<ApiResponse<Tag[]>>('/Tag/all-tags');
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
        // Let axios set Content-Type for FormData (boundary)
        // 'Content-Type': 'multipart/form-data',
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

  /**
   * Sends a request to become an instructor with required fields.
   * @param payload - { experience, expertise, certificate, introduction, socialLinks }
   * @param lang - optional Accept-Language header (default 'vi')
   */
  async requestInstructor(
    payload: RequestInstructorPayload,
    lang = "vi"
  ): Promise<RequestInstructorResponse> {
    const response = await apiClient.post<RequestInstructorResponse>(
      "/Account/request-instructor",
      payload,
      {
        headers: {
          "Accept-Language": lang,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};
