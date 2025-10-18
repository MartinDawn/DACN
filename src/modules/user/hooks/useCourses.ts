// src/hooks/useCourses.ts

import { useState, useEffect } from 'react';
import type { RecommendedCourse, CourseDetail, CourseComment } from '../models/course';
import { courseService } from '../services/course.service';

export const useCourses = () => {
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [courseComments, setCourseComments] = useState<CourseComment[]>([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isCourseDetailLoading, setIsCourseDetailLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  const fetchRecommendedCourses = async () => {
    try {
      setIsRecommendedLoading(true);
      setError(null); // Reset lỗi trước khi gọi API
      const response = await courseService.getRecommendedCourses();
      if (response.success) {
        setRecommendedCourses(response.data);
      } else {
        setError(response.message || 'Không thể tải khóa học đề xuất');
      }
    } catch (err) {
      setError('Không thể tải khóa học đề xuất. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedCourses();
  }, []);

  const getCourseDetail = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      if (!isCourseDetailLoading) {
        setIsCourseDetailLoading(true);
        setError(null);
      }
      
      const response = await courseService.getCourseDetail(courseId);
      if (response.success) {
        setCourseDetail(prevDetail => {
          if (JSON.stringify(prevDetail) !== JSON.stringify(response.data)) {
            return response.data;
          }
          return prevDetail;
        });
      }
      return response.data;
    } catch (err) {
      setError('Không thể tải thông tin khóa học');
      throw err;
    } finally {
      setIsCourseDetailLoading(false);
    }
  };

  const getCourseComments = async (courseId: string) => {
    if (!courseId) return;
    
    try {
      setIsCommentsLoading(true);
      setCommentsError(null);
      
      const response = await courseService.getCourseComments(courseId);
      if (response.success) {
        setCourseComments(response.data);
      }
      return response;
    } catch (err) {
      setCommentsError('Không thể tải bình luận');
      throw err;
    } finally {
      setIsCommentsLoading(false);
    }
  };

  return { 
    recommendedCourses, 
    courseDetail,
    courseComments,
    // Thay đổi duy nhất ở đây: trả về đúng trạng thái loading
    loading: isRecommendedLoading, 
    commentsLoading: isCommentsLoading,
    error,
    commentsError,
    getCourseDetail,
    getCourseComments
  };
};