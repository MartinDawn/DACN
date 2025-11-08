// src/hooks/useCourses.ts

import { useState, useEffect, useCallback } from 'react';
import type { 
  RecommendedCourse, 
  CourseDetail, 
  CourseComment, 
  MyCourse, 
  ApiCourseContent
} from '../models/course'; 
import { courseService } from '../services/course.service'; 

/**
 * Custom hook quản lý tất cả state và logic gọi API liên quan đến khóa học.
 */
export const useCourses = () => {
  // --- STATE ---

  // State cho: Recommended Courses (Tải tự động 1 lần)
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  
  // State cho: My Courses (Tải khi được gọi)
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [isMyCoursesLoading, setIsMyCoursesLoading] = useState(false);
  const [myCoursesError, setMyCoursesError] = useState<string | null>(null);

  // State cho: Course Detail (Tải khi được gọi)
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // State cho: Course Comments (Tải khi được gọi)
  const [courseComments, setCourseComments] = useState<CourseComment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // STATE CHO COURSE CONTENT
  const [courseContent, setCourseContent] = useState<ApiCourseContent | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // --- LOGIC ---

  // 1. Tự động tải Recommended Courses khi hook được sử dụng
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      setIsRecommendedLoading(true);
      setRecommendedError(null);
      try {
        const response = await courseService.getRecommendedCourses();
        if (response.success) {
          setRecommendedCourses(response.data);
        } else {
          setRecommendedError(response.message || 'Không thể tải khóa học đề xuất');
        }
      } catch (err) {
        setRecommendedError('Lỗi kết nối. Không thể tải khóa học đề xuất.');
      } finally {
        setIsRecommendedLoading(false);
      }
    };
    fetchRecommendedCourses();
  }, []); // Mảng rỗng, chỉ chạy 1 lần

  // 2. Hàm để tải My Courses (dùng cho trang MyCoursePage)
  const getMyCourses = useCallback(async () => {
    setIsMyCoursesLoading(true);
    setMyCoursesError(null);
    try {
      const response = await courseService.getMyCourses();
      if (response.success) {
        setMyCourses(response.data);
      } else {
        setMyCoursesError(response.message || 'Không thể tải khóa học của bạn');
      }
    } catch (err) {
      setMyCoursesError('Lỗi kết nối. Không thể tải khóa học của bạn.');
    } finally {
      setIsMyCoursesLoading(false);
    }
  }, []); // Mảng rỗng, hàm này ổn định

  // 3. Hàm để tải Course Detail (dùng cho trang CourseDetail)
  const getCourseDetail = useCallback(async (courseId: string) => {
    if (!courseId) return;
    
    setIsDetailLoading(true);
    setDetailError(null);
    setCourseDetail(null); // Xóa chi tiết cũ
    try {
      const response = await courseService.getCourseDetail(courseId);
      if (response.success) {
        setCourseDetail(response.data);
      } else {
        setDetailError(response.message || 'Không thể tải thông tin khóa học');
      }
    } catch (err) {
      setDetailError('Lỗi kết nối. Không thể tải thông tin khóa học.');
    } finally {
      setIsDetailLoading(false);
    }
  }, []); // Mảng rỗng, hàm này ổn định

  // 4. Hàm để tải Course Comments (dùng cho trang CourseDetail)
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
      setCommentsError('Lỗi kết nối. Không thể tải bình luận.');
    } finally {
      setIsCommentsLoading(false);
    }
  }, []); // Mảng rỗng, hàm này ổn định
const getCourseContent = useCallback(async (courseId: string) => {
    if (!courseId) return;
    
    setIsContentLoading(true);
    setContentError(null);
    setCourseContent(null); // Xóa nội dung cũ
    try {
      // Giả định bạn đã thêm 'getCourseContent' vào courseService
      const response = await courseService.getCourseContent(courseId); 
      if (response.success) {
        setCourseContent(response.data);
      } else {
        setContentError(response.message || 'Không thể tải nội dung khóa học');
      }
    } catch (err) {
      setContentError('Lỗi kết nối. Không thể tải nội dung khóa học.');
    } finally {
      setIsContentLoading(false);
    }
  }, []);

  // --- RETURN ---
  // Trả về tất cả state và các hàm để component sử dụng
  return { 
    // Dữ liệu
    recommendedCourses, 
    myCourses,
    courseDetail,
    courseComments,
    courseContent,

    // Trạng thái Loading
    isRecommendedLoading,
    isMyCoursesLoading, 
    isDetailLoading, 
    isCommentsLoading,
    isContentLoading,
    
    // Trạng thái Lỗi
    recommendedError,
    myCoursesError,
    detailError,
    commentsError,
    contentError,
    
    // Các hàm gọi API
    getMyCourses,
    getCourseDetail,
    getCourseComments,
    getCourseContent,
  };
};