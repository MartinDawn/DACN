import apiClient from '../../auth/services/apiClient';
import type { Course, PaginatedCourses } from '../models/course.model';

const EMPTY_PAGINATION = {
  page: 1, pageSize: 10, totalCount: 0, totalPages: 0,
  hasNextPage: false, hasPreviousPage: false
};

export const CourseService = {
  getPendingRequests: async (): Promise<Course[]> => {
    try {
      const response = await apiClient.get('/Course/pending-requests');

      const apiResponse = response.data;
      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        return [];
      }

      return apiResponse.data.map((item: any) => ({
        id: item.courseId,
        requestId: item.id,
        title: item.courseName || 'Khóa học mới',
        instructor: item.instructorName || 'Giảng viên',
        category: 'Chờ duyệt',
        price: 0,
        status: 'pending',
        submittedDate: item.createdAt
            ? new Date(item.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/150?text=No+Image',
        lessons: 0
      }));
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      throw error;
    }
  },

  getAdminCourses: async (page: number = 1, pageSize: number = 10): Promise<PaginatedCourses> => {
    try {
      const response = await apiClient.get('/Course/admin/courses', {
        params: { page, pageSize }
      });

      const apiResponse = response.data;
      if (!apiResponse.success || !apiResponse.data) {
        return { items: [], pagination: EMPTY_PAGINATION };
      }

      const {
        items,
        page: currentPage,
        pageSize: size,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      } = apiResponse.data;

      return {
        items: (items as any[]).map((item) => ({
          id: item.id,
          title: item.name || 'Khóa học',
          instructor: item.instructorName || 'Giảng viên',
          category: item.tagNames?.length > 0 ? item.tagNames.join(', ') : 'Chưa phân loại',
          price: item.price ?? 0,
          status: item.status,
          submittedDate: item.createTime
            ? new Date(item.createTime).toISOString().split('T')[0]
            : '',
          image: item.imageUrl || 'https://via.placeholder.com/150?text=No+Image',
          lessons: 0,
          totalStudents: item.totalStudents ?? 0
        })),
        pagination: { page: currentPage, pageSize: size, totalCount, totalPages, hasNextPage, hasPreviousPage }
      };
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      throw error;
    }
  },

  approveRequest: async (requestId: string): Promise<void> => {
    try {
      await apiClient.post(`/Course/approve-request/${requestId}`);
    } catch (error) {
      console.error('Error approving course request:', error);
      throw error;
    }
  },

  rejectRequest: async (requestId: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/Course/reject-request/${requestId}`, { reason });
    } catch (error) {
      console.error('Error rejecting course request:', error);
      throw error;
    }
  }
};
