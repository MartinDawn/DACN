import { useState, useCallback } from 'react';
import { homepageCourseService } from '../services/course.service';
import type { FilterParams, PaginatedCourses, MyCourse } from '../models/course';

/**
 * Hook for fetching filtered courses in homepage
 * @returns {Object} - Courses data, loading state, error, and fetch function
 */
export const useHomepageCourses = () => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [pagination, setPagination] = useState<PaginatedCourses | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch filtered courses based on parameters
   * @param params - Filter parameters (sort, tags, price range, pagination)
   */
  const fetchCourses = useCallback(async (params: FilterParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await homepageCourseService.getFilteredCourses(params);

      if (response.success && response.data) {
        setCourses(response.data.items);
        setPagination(response.data);
      } else {
        setError(response.message || 'Failed to fetch courses');
        setCourses([]);
        setPagination(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setCourses([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    courses,
    pagination,
    isLoading,
    error,
    fetchCourses
  };
};
