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
        id: item.courseId != null ? String(item.courseId) : String(item.id),
        requestId: item.id != null ? String(item.id) : undefined,
        title: item.courseName || 'Khóa học mới',
        instructor: item.instructorName || 'Giảng viên',
        category: 'Chờ duyệt',
        price: item.coursePrice ?? 0,
        status: (item.status || 'pending').toLowerCase(),
        submittedDate: item.createdAt
            ? new Date(item.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        image: 'https://placehold.co/150?text=No+Image',
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

      // Support both wrapped { success, data: { items, ... } } and direct { items, ... } responses
      let data: any;
      if (apiResponse && apiResponse.success !== undefined) {
        if (!apiResponse.success || !apiResponse.data) {
          return { items: [], pagination: EMPTY_PAGINATION };
        }
        data = apiResponse.data;
      } else {
        data = apiResponse;
      }

      const rawItems: any[] = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);

      return {
        items: rawItems.map((item) => ({
          id: item.id,
          title: item.name || 'Khóa học',
          instructor: item.instructorName || 'Giảng viên',
          category: '',
          price: item.price ?? 0,
          status: item.status || 'published',
          submittedDate: item.createTime
            ? new Date(item.createTime).toISOString().split('T')[0]
            : '',
          image: item.imageUrl || 'https://placehold.co/150?text=No+Image',
          lessons: 0,
          totalStudents: item.totalStudents ?? 0,
          averageRating: item.averageRating ?? 0
        })),
        pagination: {
          page: data.page ?? page,
          pageSize: data.pageSize ?? pageSize,
          totalCount: data.totalCount ?? rawItems.length,
          totalPages: data.totalPages ?? 1,
          hasNextPage: data.hasNextPage ?? false,
          hasPreviousPage: data.hasPreviousPage ?? false
        }
      };
    } catch (error) {
      console.error('Error fetching admin courses:', error);
      throw error;
    }
  },

  approveRequest: async (requestId: string): Promise<void> => {
    try {
      await apiClient.post(`/Course/approve-request/${requestId}`, {
        title: 'Khóa học được duyệt',
        message: 'Khóa học của bạn đã được phê duyệt thành công.',
      });
    } catch (error: any) {
      console.error('Error approving course request:', error);
      console.error('Response data:', error?.response?.data);
      throw error;
    }
  },

  rejectRequest: async (requestId: string, reason: string): Promise<void> => {
    try {
      await apiClient.post(`/Course/reject-request/${requestId}`, {
        title: 'Khóa học bị từ chối',
        message: reason,
      });
    } catch (error) {
      console.error('Error rejecting course request:', error);
      throw error;
    }
  }
};
