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

  const createCourse = useCallback(async (courseData: FormData): Promise<InstructorCourse | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await instructorService.createCourse(courseData);
      if (response.success && response.data) {
        toast.success('Course created successfully!');
        // Add the new course to the start of the list
        setCourses(prev => [response.data, ...prev]);
        return response.data;
      } else {
        toast.error(response.message || 'Failed to create course.');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while creating the course.';
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

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
