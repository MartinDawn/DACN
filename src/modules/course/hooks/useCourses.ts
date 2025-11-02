// src/hooks/useCourses.ts

import { useState, useEffect, useCallback } from 'react'; // 1. Thêm useCallback
import type { RecommendedCourse, CourseDetail, CourseComment } from '../models/course';
import { courseService } from '../services/course.service';

export const useCourses = () => {
  // --- Các state không thay đổi ---
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [courseComments, setCourseComments] = useState<CourseComment[]>([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // --- Logic fetch recommended courses không thay đổi ---
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setIsRecommendedLoading(true);
      try {
        const response = await courseService.getRecommendedCourses();
        if (response.success) {
          setRecommendedCourses(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsRecommendedLoading(false);
      }
    };
    fetchRecommendedCourses();
  }, []);

  // 2. Bọc các hàm gọi API bằng useCallback để ổn định chúng
  const getCourseDetail = useCallback(async (courseId: string) => {
    if (!courseId) return;
    
    setIsDetailLoading(true);
    setDetailError(null);
    try {
      const response = await courseService.getCourseDetail(courseId);
      if (response.success) {
        // Đơn giản hóa logic, React sẽ tự xử lý việc có render lại hay không
        setCourseDetail(response.data);
      } else {
        setDetailError(response.message || 'Không thể tải thông tin khóa học');
      }
    } catch (err) {
      setDetailError('Không thể tải thông tin khóa học');
      throw err; // Ném lỗi ra để component có thể bắt
    } finally {
      setIsDetailLoading(false);
    }
  }, []); // Mảng dependency rỗng vì hàm này không phụ thuộc vào state nào

  const getCourseComments = useCallback(async (courseId: string) => {
    if (!courseId) return;
    
    setIsCommentsLoading(true);
    setCommentsError(null);
    try {
      const response = await courseService.getCourseComments(courseId);
      if (response.success) {
        setCourseComments(response.data);
      } else {
        setCommentsError(response.message || 'Không thể tải bình luận');
      }
    } catch (err) {
      setCommentsError('Không thể tải bình luận');
      throw err;
    } finally {
      setIsCommentsLoading(false);
    }
  }, []); // Mảng dependency rỗng

  // 3. Trả về các trạng thái một cách rõ ràng và riêng biệt
  return { 
    // Dữ liệu
    recommendedCourses, 
    courseDetail,
    courseComments,
    
    // Các trạng thái loading
    isRecommendedLoading,
    isDetailLoading, 
    isCommentsLoading,
    
    // Các trạng thái lỗi
    detailError,
    commentsError,
    
    // Các hàm để gọi
    getCourseDetail,
    getCourseComments
  };
};