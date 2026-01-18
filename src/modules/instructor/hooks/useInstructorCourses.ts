import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { instructorService } from '../services/instructor.service';
import type { InstructorCourse } from '../models/instructor';

export const useInstructorCourses = () => {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await instructorService.getMyCourses();
      if (response.success) {
        setCourses(response.data);
      } else {
        setError(response.message || 'Failed to fetch courses.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching courses.');
    } finally {
      if (!silent) setIsLoading(false);
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

      // Robust extraction: support multiple shapes returned by backend
      const respAny: any = response ?? {};
      // Common shapes: { success: true, data: { ...course } } OR { data: { ...course } } OR direct course object
      let maybeData = respAny.data ?? respAny;
      // handle double-nesting e.g. { data: { data: {...} } }
      if (maybeData && maybeData.data) maybeData = maybeData.data;

      if (maybeData && (maybeData as any).id) {
        const createdCourse = maybeData as InstructorCourse;
        setCourses(prev => {
          if (prev.some(c => c.id === createdCourse.id)) return prev;
          return [createdCourse, ...prev];
        });
        try { await fetchCourses(true); } catch (e) { /* ignore */ }
        toast.success((respAny)?.message || 'Tạo khóa học thành công!', { duration: 2000 });
        return createdCourse;
      }

      const maybeSuccess = !!(respAny && respAny.success === true);
      if (maybeSuccess) {
        const submittedName = (courseData.get('Name') as string) || (courseData.get('name') as string) || '';
        try {
          await fetchCourses(true); // silent refresh
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
        toast.success((respAny)?.message || 'Tạo khóa học thành công!', { duration: 2000 });
        return null;
      }

      const errorMessage = (respAny)?.message || 'Tạo khóa học thất bại.';
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } catch (err: any) {
      // Detect "not instructor" response from backend (403 or message mentioning instructor)
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
  }, [fetchCourses]); // <-- add fetchCourses to deps

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    isLoading,
    isSubmitting,
    error,
    fetchCourses,
    createCourse,
    setCourses,
    becomeInstructor,
  };
};
