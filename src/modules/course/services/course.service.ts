
import apiClient from "../../auth/services/apiClient"; 

// 3. Các import 'type' giữ nguyên
import type { 
  ApiResponse, 
  RecommendedCourse, 
  CourseDetail, 
  MyCourse, 
  CourseComment, 
  FilterParams, 
  PaginatedCourses,
  CourseSearchResponse, 
  SearchParams,
  ApiCourseContent,            
} from '../../course/models/course.ts';
import type { Tag } from '../../course/models/tag.ts';



export const courseService = {
  async getMyCourses(): Promise<ApiResponse<MyCourse[]>> {
    const response = await apiClient.get<ApiResponse<MyCourse[]>>(
      '/Course/student-courses'
    );
    console.log(response.data)
    return response.data;
  },

  async getRecommendedCourses(): Promise<ApiResponse<RecommendedCourse[]>> {
    const response = await apiClient.get<ApiResponse<RecommendedCourse[]>>(
      '/Course/recommended-courses'
    );
    return response.data;
  },

  async getCourseDetail(courseId: string): Promise<ApiResponse<CourseDetail>> {
    const response = await apiClient.get<ApiResponse<CourseDetail>>(
      `/Course/course-detail/${courseId}` // Giữ nguyên string interpolation
    );
    return response.data;
  },

  async getCourseComments(courseId: string): Promise<ApiResponse<CourseComment[]>> {
    const response = await apiClient.get<ApiResponse<CourseComment[]>>(
      `/Course/course-comments/${courseId}`
    );
    return response.data;
  },

  async getFilteredCourses(params: FilterParams): Promise<ApiResponse<PaginatedCourses>> {
    const response = await apiClient.get<ApiResponse<PaginatedCourses>>(
      '/Course/filtered-courses',
      { params } // Logic 'params' này đã đúng, giữ nguyên
    );
    return response.data;
  },

  async getAllTags(): Promise<ApiResponse<Tag[]>> {
    const response = await apiClient.get<ApiResponse<Tag[]>>(
      '/Tag/all-tags'
    );
    return response.data;
  },

  async searchCourses(params: SearchParams): Promise<ApiResponse<CourseSearchResponse>> {
    const response = await apiClient.get<ApiResponse<CourseSearchResponse>>(
      '/Course/search',
      {
        // Logic 'params' này đã đúng, giữ nguyên
        params: {
          SearchTerm: params.searchTerm,
          Page: params.page,
          PageSize: params.pageSize
        }
      }
    );
    return response.data;
  },
  // Thêm vào đối tượng `courseService` trong file: src/services/course.service.ts

  async getCourseContent(courseId: string): Promise<ApiResponse<ApiCourseContent>> {
    const response = await apiClient.get<ApiResponse<ApiCourseContent>>(
      `/Course/course-content/${courseId}`
    );
    return response.data;
  },
};