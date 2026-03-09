import { useState, useEffect, useCallback } from 'react';
import type { Course, PaginationInfo } from '../models/course.model';
import { CourseService } from '../services/course.service';

const EMPTY_PAGINATION: PaginationInfo = {
  page: 1, pageSize: 10, totalCount: 0, totalPages: 0,
  hasNextPage: false, hasPreviousPage: false
};

export const useCourseRequests = (activeTab: 'published' | 'pending') => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>(EMPTY_PAGINATION);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCourses = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const data = await CourseService.getPendingRequests();
        setCourses(data);
        setPagination(EMPTY_PAGINATION);
      } else {
        const result = await CourseService.getAdminCourses(page);
        setCourses(result.items);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Failed to load courses', error);
      setCourses([]);
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Reset to page 1 and fetch whenever the tab changes
  useEffect(() => {
    setCurrentPage(1);
    fetchCourses(1);
  }, [fetchCourses]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    fetchCourses(page);
  };

  return {
    courses,
    setCourses,
    loading,
    refresh: () => fetchCourses(currentPage),
    pagination,
    currentPage,
    goToPage
  };
};
