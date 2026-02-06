import { useState, useEffect, useCallback } from 'react';
import type { Course } from '../models/course.model';
import { CourseService } from '../services/course.service';

export const useCourseRequests = (activeTab: 'published' | 'pending') => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (activeTab === 'pending') {
      setLoading(true);
      try {
        const data = await CourseService.getPendingRequests();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load requests", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { 
    courses, 
    setCourses, 
    loading, 
    refresh: fetchCourses 
  };
};
