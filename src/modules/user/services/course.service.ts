import axios from 'axios';
import type { ApiResponse, RecommendedCourse, CourseDetail, MyCourse } from '../models/course';

const API_URL = 'http://dacn.runasp.net/api';

const axiosInstance = axios.create({
  headers: {
    'Accept-Language': 'vi',
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseService = {
  async getMyCourses(): Promise<ApiResponse<MyCourse[]>> {
    const response = await axiosInstance.get<ApiResponse<MyCourse[]>>(
      `${API_URL}/Student/my-courses`
    );
    return response.data;
  },

  async getRecommendedCourses(): Promise<ApiResponse<RecommendedCourse[]>> {
    const response = await axiosInstance.get<ApiResponse<RecommendedCourse[]>>(
      `${API_URL}/Student/recommended-courses`
    );
    return response.data;
  },

  async getCourseDetail(courseId: string): Promise<ApiResponse<CourseDetail>> {
    const response = await axiosInstance.get<ApiResponse<CourseDetail>>(
      `${API_URL}/Course/course-detail`,
      {
        params: { courseId }
      }
    );
    return response.data;
  },

  async getCourseComments(courseId: string): Promise<ApiResponse<CourseComment[]>> {
    const response = await axiosInstance.get<ApiResponse<CourseComment[]>>(
      `${API_URL}/Course/comments`,
      {
        params: { courseId }
      }
    );
    return response.data;
  }
};