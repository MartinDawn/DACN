// src/hooks/useCourseSearch.ts
import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { courseService } from "../services/course.service";
import type { SearchParams, CourseSearchItem, CourseSearchResponse } from "../models/course";

export const useCourseSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CourseSearchResponse | null>(null);

  const fetchSearchResults = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const responseData = await courseService.searchCourses(params);
      setData(responseData);
    } catch (err: any) {
      const msg = err.message || "Không thể tải kết quả tìm kiếm.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    searchResults: data?.items ?? [],
    pagination: data, // Trả về toàn bộ data ({ items: ..., page: ... })
    fetchSearchResults,
  };
};