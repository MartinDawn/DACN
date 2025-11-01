// src/hooks/useCoursesFilter.ts

import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/course.service';
import type { MyCourse, FilterParams } from '../models/course';
import type { Tag } from '../models/tag.ts';

export const useCoursesFilter = () => {
  // State cho danh sách khóa học
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // State cho danh sách tags
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // Hàm gọi API để lấy khóa học theo bộ lọc
  const fetchFilteredCourses = useCallback(async (params: FilterParams) => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const response = await courseService.getFilteredCourses(params);
      if (response.success) {
        setCourses(response.data);
      } else {
        setCoursesError(response.message || 'Không thể tải khóa học.');
      }
    } catch (err) {
      setCoursesError('Lỗi kết nối khi tải khóa học.');
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Lấy danh sách tags khi hook được sử dụng lần đầu
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
    coursesLoading,
    coursesError,
    tags,
    tagsLoading,
    tagsError,
    fetchFilteredCourses,
  };
};