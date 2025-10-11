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
      const response = await courseService.getRecommendedCourses();
      if (response.success) {
        setRecommendedCourses(response.data);
      }
    } catch (err) {
      setError('Không thể tải khóa học đề xuất');
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
        // Only update if the data is different
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
    loading: isCourseDetailLoading, 
    commentsLoading: isCommentsLoading,
    error,
    commentsError,
    getCourseDetail,
    getCourseComments
  };
};