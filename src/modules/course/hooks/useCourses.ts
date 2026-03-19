// src/hooks/useCourses.ts

import { useState, useCallback } from 'react';
import type {
  RecommendedCourse,
  CourseDetail,
  CourseComment,
  MyCourse,
  ApiCourseContent,
  AddCommentRequest,
  UpdateCommentRequest,
  CourseCommentsData,
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

  // STATE CHO ADD COMMENT
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [addCommentError, setAddCommentError] = useState<string | null>(null);

  // STATE CHO MY COMMENTS MAP (courseId -> myComment)
  const [myCommentsMap, setMyCommentsMap] = useState<Record<string, CourseComment>>({});

  // --- LOGIC ---

  // 1. Hàm để tải Recommended Courses (gọi tường minh từ trang cần dùng)
  const getRecommendedCourses = useCallback(async () => {
    setIsRecommendedLoading(true);
    setRecommendedError(null);
    try {
      const response = await courseService.getRecommendedCourses();
      if (response.success) {
        setRecommendedCourses(response.data || []);
      } else {
        setRecommendedError(response.message || 'Không thể tải khóa học đề xuất');
      }
    } catch (err) {
      setRecommendedError('Lỗi kết nối. Không thể tải khóa học đề xuất.');
    } finally {
      setIsRecommendedLoading(false);
    }
  }, []);

  // 2. Hàm để tải My Courses (dùng cho trang MyCoursePage)
  const getMyCourses = useCallback(async () => {
    setIsMyCoursesLoading(true);
    setMyCoursesError(null);
    try {
      const response = await courseService.getMyCourses();
      if (response.success) {
        setMyCourses(response.data || []);
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
        // Chỉ lấy đánh giá của học viên (rate >= 1), loại bỏ reply 0 sao
        const comments = (response.data?.allComments ?? []).filter(
          (c) => Number(c.rate) >= 1
        );
        setCourseComments(comments);
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

  const addComment = useCallback(async (data: AddCommentRequest): Promise<boolean> => {
    setIsAddingComment(true);
    setAddCommentError(null);
    try {
      const response = await courseService.addComment(data);
      if (response.success) {
        // Sau khi add comment thành công, fetch lại comment để update map
        await getMyCommentForCourse(data.courseId);
        return true;
      }
      setAddCommentError(response.message || 'Không thể gửi đánh giá');
      return false;
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const serverMsg = axiosErr?.response?.data?.message;
      setAddCommentError(serverMsg || 'Lỗi kết nối. Không thể gửi đánh giá.');
      return false;
    } finally {
      setIsAddingComment(false);
    }
  }, []);

  const updateComment = useCallback(async (commentId: string, data: UpdateCommentRequest, courseId: string): Promise<boolean> => {
    setIsAddingComment(true);
    setAddCommentError(null);
    try {
      const response = await courseService.updateComment(commentId, data);
      if (response.success) {
        // Sau khi update comment thành công, fetch lại comment để update map
        await getMyCommentForCourse(courseId);
        return true;
      }
      setAddCommentError(response.message || 'Không thể cập nhật đánh giá');
      return false;
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const serverMsg = axiosErr?.response?.data?.message;
      setAddCommentError(serverMsg || 'Lỗi kết nối. Không thể cập nhật đánh giá.');
      return false;
    } finally {
      setIsAddingComment(false);
    }
  }, []);

  // Hàm lấy comment của user cho một khóa học cụ thể
  const getMyCommentForCourse = useCallback(async (courseId: string) => {
    try {
      const response = await courseService.getCourseComments(courseId);
      if (response.success && response.data?.myComment) {
        setMyCommentsMap(prev => ({
          ...prev,
          [courseId]: response.data.myComment as CourseComment
        }));
      }
    } catch (err) {
      // Silently fail, không cần hiện lỗi cho việc này
      console.error('Failed to fetch my comment:', err);
    }
  }, []);

  // Hàm lấy tất cả comments của user cho danh sách khóa học
  const getMyCommentsForCourses = useCallback(async (courseIds: string[]) => {
    try {
      const promises = courseIds.map(async (courseId) => {
        try {
          const response = await courseService.getCourseComments(courseId);
          if (response.success && response.data?.myComment) {
            return { courseId, comment: response.data.myComment };
          }
          return null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const newMap: Record<string, CourseComment> = {};
      results.forEach(result => {
        if (result && result.comment) {
          newMap[result.courseId] = result.comment;
        }
      });

      setMyCommentsMap(newMap);
    } catch (err) {
      console.error('Failed to fetch my comments:', err);
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
    myCommentsMap,

    // Trạng thái Loading
    isRecommendedLoading,
    isMyCoursesLoading,
    isDetailLoading,
    isCommentsLoading,
    isContentLoading,
    isAddingComment,

    // Trạng thái Lỗi
    recommendedError,
    myCoursesError,
    detailError,
    commentsError,
    contentError,
    addCommentError,

    // Các hàm gọi API
    getMyCourses,
    getRecommendedCourses,
    getCourseDetail,
    getCourseComments,
    getCourseContent,
    addComment,
    updateComment,
    getMyCommentForCourse,
    getMyCommentsForCourses,
  };
};