import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { instructorService } from '../services/instructor.service';
import type { InstructorCourse } from '../models/instructor';
import type { Tag } from '../../course/models/course';
import { API_CONFIG } from '../../../config/api.config';

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (silent = false) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        if (!silent) toast.error("Vui lòng đăng nhập để xem khóa học");
        setCourses([]);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.baseURL}/api/Course/instructor-courses`,
        {
          method: "GET",
          headers: {
            "Accept-Language": "vi",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          if (!silent) toast.error("Bạn chưa đăng ký làm giảng viên");
          setCourses([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle various response patterns (direct array or wrapped in data/result)
      // lấy api list course của instructor
      let rawCourses: any[] = [];
      if (Array.isArray(data)) {
        rawCourses = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          rawCourses = data.data;
        } else if (Array.isArray(data.result)) {
          rawCourses = data.result;
        }
      }

      // Normalize keys to camelCase to ensure UI renders correctly regardless of API casing
      const normalizedCourses = rawCourses.map((item: any) => ({
        ...item,
        id: item.id || item.Id,
        name: item.name || item.Name,
        description: item.description || item.Description,
        imageUrl: item.imageUrl || item.ImageUrl || item.image || item.Image,
        price: item.price ?? item.Price,
        studentCount: item.studentCount ?? item.StudentCount,
        averageRating: item.averageRating ?? item.AverageRating,
        ratingCount: item.ratingCount ?? item.RatingCount,
        tags: Array.isArray(item.tags || item.Tags) 
            ? (item.tags || item.Tags).map((t: any) => ({ id: t.id || t.Id, name: t.name || t.Name })) 
            : []
      }));

      setCourses(normalizedCourses);

    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      if (!silent) toast.error("Không thể tải danh sách khóa học");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const response = await instructorService.getAllTags();
      if (response.success) {
        setTags(response.data);
      } else {
        setTagsError(response.message || 'Failed to fetch tags.');
      }
    } catch (err: any) {
      setTagsError(err.message || 'An error occurred while fetching tags.');
    } finally {
      setTagsLoading(false);
    }
  }, []);

  const becomeInstructor = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await instructorService.becomeInstructor();
      if (response.success) {
        toast.success(response.message || 'Bạn đã trở thành giảng viên!');
        return true;
      } else {
        toast.error(response.message || 'Đăng ký làm giảng viên thất bại.');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đăng ký làm giảng viên.';
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createCourse = useCallback(async (courseData: FormData): Promise<InstructorCourse | null | { status: 'not-instructor' }> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await instructorService.createCourse(courseData);

      // Robustly extract data from various response structures
      const respAny: any = response ?? {};
      let maybeData = respAny.data ?? respAny;
      
      // If data is still wrapped (common in some API frameworks)
      if (maybeData && typeof maybeData === 'object' && 'data' in maybeData) {
        maybeData = maybeData.data;
      }

      // Check if we have a valid course object with an ID
      if (maybeData && (maybeData as any).id) {
        const createdCourse = maybeData as InstructorCourse;
        setCourses(prev => {
          if (prev.some(c => c.id === createdCourse.id)) return prev;
          return [createdCourse, ...prev];
        });
        try { await fetchCourses(true); } catch (e) { /* ignore */ }
        toast.success('Tạo khóa học thành công!', { duration: 2000 });
        return createdCourse;
      }

      const maybeSuccess = !!(respAny && (respAny.success === true || respAny.status === 200 || respAny.status === 201));
      if (maybeSuccess) {
        const submittedName = (courseData.get('Name') as string) || (courseData.get('name') as string) || '';
        try {
          await fetchCourses(true);
          if (submittedName) {
            const resp = await instructorService.getMyCourses();
            const list = (resp && (resp as any).data) ?? resp ?? [];
            if (Array.isArray(list)) {
              const found = list.find((c: any) =>
                ((c.name || c.Name) || '').toString().trim().toLowerCase() === submittedName.toString().trim().toLowerCase()
              ) ?? null;
              if (found) {
                setCourses(prev => [found, ...prev.filter((c: any) => c.id !== found.id)]);
                toast.success('Tạo khóa học thành công!', { duration: 2000 });
                return found as InstructorCourse;
              }
            }
          }
        } catch (e) {
          console.warn('silent refresh after createCourse failed', e);
        }
        toast.success('Tạo khóa học thành công!', { duration: 2000 });
        return null;
      }

      const errorMessage = (respAny)?.message || 'Tạo khóa học thất bại.';
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.message || '';
      if (status === 403 || /instructor/i.test(serverMessage)) {
        const msg = 'Bạn cần phải là giảng viên để tạo khóa học. Vui lòng đăng ký làm giảng viên trước.';
        toast.error(msg);
        setError(msg);
        return { status: 'not-instructor' };
      }

      let errorMessage = 'Có lỗi xảy ra khi tạo khóa học.';
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorKey = Object.keys(errors)[0];
        if (errorKey && errors[errorKey] && errors[errorKey].length > 0) {
          errorMessage = errors[errorKey][0];
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
    fetchTags();
  }, [fetchCourses, fetchTags]);

  return {
    courses,
    isLoading,
    isSubmitting,
    error,
    tags,
    tagsLoading,
    tagsError,
    fetchCourses,
    createCourse,
    setCourses,
    becomeInstructor,
  };
};
