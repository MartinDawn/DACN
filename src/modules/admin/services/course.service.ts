import axios from 'axios';
import type { Course } from '../models/course.model';

const API_BASE_URL = 'http://dacn.runasp.net/api/Course';

export const CourseService = {
  getPendingRequests: async (): Promise<Course[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending-requests`, {
        headers: {
          'Accept-Language': 'vi'
        }
      });
      
      // Map API response to UI Model
      // Response structure is { success: true, data: [...] }
      const apiResponse = response.data;
      if (!apiResponse.success || !Array.isArray(apiResponse.data)) {
        return [];
      }

      return apiResponse.data.map((item: any) => ({
        id: item.courseId, // Use courseId for navigation links
        requestId: item.id, // Store the request transaction ID
        title: item.courseName || 'Khóa học mới',
        instructor: item.instructorName || 'Giảng viên',
        category: 'Chờ duyệt', // API doesn't provide category yet
        price: 0, // API doesn't provide price yet
        status: 'pending',
        submittedDate: item.createdAt 
            ? new Date(item.createdAt).toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/150?text=No+Image', // Default placeholder
        lessons: 0 // API doesn't provide lesson count yet
      }));
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      throw error;
    }
  }
};
