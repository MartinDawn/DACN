// src/hooks/useCoursesFilter.ts

import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/course.service';
// Import thêm PaginatedCourses
import type { MyCourse, FilterParams, PaginatedCourses } from '../models/course';
import type { Tag } from '../models/tag.ts';

export const useCoursesFilter = () => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  // Thêm state để lưu thông tin phân trang (tùy chọn nhưng nên có)
  const [pagination, setPagination] = useState<Omit<PaginatedCourses, 'items'> | null>(null);
  
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  const fetchFilteredCourses = useCallback(async (params: FilterParams) => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await courseService.getFilteredCourses(params);
      if (response.success) {
        // SỬA Ở ĐÂY: Lấy mảng 'items' từ trong 'data'
        setCourses(response.data.items); 
        
        // Tách và lưu thông tin phân trang
        const { items, ...paginationInfo } = response.data;
        setPagination(paginationInfo);
      } else {
        setCoursesError(response.message || 'Không thể tải khóa học.');
      }
    } catch (err) {
      setCoursesError('Lỗi kết nối khi tải khóa học.');
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setTagsLoading(true);
      setTagsError(null);
      try {
        const response = await courseService.getAllTags();
        if (response.success) {
          setTags(response.data);
        } else {
          setTagsError(response.message || 'Không thể tải danh mục.');
        }
      } catch (err) {
        setTagsError('Lỗi kết nối khi tải danh mục.');
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  return {
    courses,
    pagination, // Trả về thông tin phân trang để UI có thể sử dụng sau này
    coursesLoading,
    coursesError,
    tags,
    tagsLoading,
    tagsError,
    fetchFilteredCourses,
  };
};