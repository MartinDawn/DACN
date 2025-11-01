import axios from 'axios';
// 1. Thêm CourseSearchResponse và SearchParams vào import
import type { 
  ApiResponse, 
  RecommendedCourse, 
  CourseDetail, 
  MyCourse, 
  CourseComment, 
  FilterParams, 
  PaginatedCourses,
  CourseSearchResponse, // <-- THÊM MỚI
  SearchParams,         // <-- THÊM MỚI
} from '../models/course';
import type { Tag } from '../models/tag.ts';

const API_URL = 'http://dacn.runasp.net/api';

// ... axiosInstance và interceptor giữ nguyên ...
const axiosInstance = axios.create({
  headers: {
    'Accept-Language': 'vi',
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use((config) => {
  const userDataString = localStorage.getItem('user_data'); // Giữ nguyên logic của bạn
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    const token = userData?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


export const courseService = {
  // ... các hàm khác giữ nguyên ...
  async getMyCourses(): Promise<ApiResponse<MyCourse[]>> {
    const response = await axiosInstance.get<ApiResponse<MyCourse[]>>(
      `${API_URL}/Course/student-courses`
    );
    return response.data;
  },

  async getRecommendedCourses(): Promise<ApiResponse<RecommendedCourse[]>> {
    const response = await axiosInstance.get<ApiResponse<RecommendedCourse[]>>(
      `${API_URL}/Course/recommended-courses`
    );
    return response.data;
  },

  async getCourseDetail(courseId: string): Promise<ApiResponse<CourseDetail>> {
    const response = await axiosInstance.get<ApiResponse<CourseDetail>>(
      `${API_URL}/Course/course-detail/${courseId}` 
    );
    return response.data;
  },

  async getCourseComments(courseId: string): Promise<ApiResponse<CourseComment[]>> {
    const response = await axiosInstance.get<ApiResponse<CourseComment[]>>(
      `${API_URL}/Course/course-comments/${courseId}`
    );
    return response.data;
  },

  async getFilteredCourses(params: FilterParams): Promise<ApiResponse<PaginatedCourses>> {
    const response = await axiosInstance.get<ApiResponse<PaginatedCourses>>(
      `${API_URL}/Course/filtered-courses`,
      { params } 
    );
    return response.data;
  },

  async getAllTags(): Promise<ApiResponse<Tag[]>> {
    const response = await axiosInstance.get<ApiResponse<Tag[]>>(
      `${API_URL}/Tag/all-tags`
    );
    return response.data;
  },

  // 2. THÊM HÀM SEARCH VÀO ĐÂY
  /**
   * Gọi API tìm kiếm khóa học
   * (API này dùng Headers để truyền tham số)
   */
  async searchCourses(params: SearchParams): Promise<ApiResponse<CourseSearchResponse>> {
    const response = await axiosInstance.get<ApiResponse<CourseSearchResponse>>(
      `${API_URL}/Course/search`,
      {
        headers: {
          'SearchTerm': params.searchTerm,
          'Page': params.page,
          'PageSize': params.pageSize
        }
      }
    );
    return response.data;
  },
};