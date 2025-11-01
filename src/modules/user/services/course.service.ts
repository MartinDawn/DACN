// src/services/course.service.ts

import axios from 'axios';
import type { ApiResponse, RecommendedCourse, CourseDetail, MyCourse, CourseComment, FilterParams, PaginatedCourses, } from '../models/course';
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
  const userDataString = localStorage.getItem('user_data');
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

  // THAY ĐỔI Ở ĐÂY
  async getCourseDetail(courseId: string): Promise<ApiResponse<CourseDetail>> {
    // Sửa lại URL để đưa courseId vào path, bỏ phần params
    const response = await axiosInstance.get<ApiResponse<CourseDetail>>(
      `${API_URL}/Course/course-detail/${courseId}` 
    );
    return response.data;
  },

  async getCourseComments(courseId: string): Promise<ApiResponse<CourseComment[]>> {
    // Sửa lại URL để khớp với yêu cầu của API
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
};