import apiClient from "../../auth/services/apiClient";
import type { ApiResponse, Tag } from "../../course/models/course";
import type { InstructorCourse, CreateCourseResponse, BecomeInstructorResponse, CourseCommentsResponse } from "../models/instructor";
import type { RequestInstructorPayload, RequestInstructorResponse, InstructorStatusResponse } from "../models/instructor";

export const instructorService = {
  /**
   * Fetches the courses for the current instructor.
   */
  async getMyCourses(): Promise<ApiResponse<InstructorCourse[]>> {
    const response = await apiClient.get<ApiResponse<InstructorCourse[]>>('/Course/instructor-courses');
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

    // SỬA LỖI: Thêm headers multipart/form-data để đảm bảo apiClient không override thành application/json
    const response = await apiClient.post<CreateCourseResponse>('/Course/create', courseData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Debug: log HTTP status and payload returned by backend
    console.log('createCourse http response:', response.status, response.data);

    return response.data;
  },

  /**
   * Deletes a course by its ID.
   * @param courseId The ID of the course to delete.
   */
  async deleteCourse(courseId: string): Promise<any> {
    const response = await apiClient.delete(`/Course/${courseId}`);
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
   * Requests to publish a course.
   * @param courseId The ID of the course to publish.
   */
  async requestPublishCourse(courseId: string): Promise<any> {
    const response = await apiClient.post(`/Course/request-publish/${courseId}`, {}, {
      headers: {
        "Accept-Language": "vi",
      },
    });
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

  /**
   * Fetches the status of the instructor registration request.
   */
  async getInstructorStatus(): Promise<ApiResponse<InstructorStatusResponse>> {
    const response = await apiClient.get<ApiResponse<InstructorStatusResponse>>('/Account/my-request-status');
    return response.data;
  },

  /**
   * Fetches the list of comments/ratings for a course.
   * @param courseId The ID of the course.
   */
  async getCourseComments(courseId: string): Promise<CourseCommentsResponse> {
    const response = await apiClient.get<CourseCommentsResponse>(`/Course/course-comments/${courseId}`);
    return response.data;
  },

  /**
   * Replies to a comment/rating.
   * @param parentCommentId The ID of the parent comment.
   * @param content The reply content.
   */
  async replyComment(parentCommentId: string, content: string): Promise<any> {
    const response = await apiClient.post('/Course/reply-comment', { parentCommentId, content });
    return response.data;
  },
};
