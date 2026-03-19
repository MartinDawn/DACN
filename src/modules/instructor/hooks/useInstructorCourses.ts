import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { instructorService } from '../services/instructor.service';
import type { InstructorCourse } from '../models/instructor';
import type { Tag } from '../../course/models/course';
import { useRefreshOnLanguageChange } from '../../../hooks/useRefreshOnLanguageChange';

export const useInstructorCourses = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState<string | null>(null);

  // Track loaded data for language refresh
  const loadedDataTracker = useRef({
    coursesLoaded: false,
    tagsLoaded: false
  });

  const fetchCourses = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const response = await instructorService.getMyCourses();

      if (!response.success) {
        if (!silent) toast.error(response.message || t("instructor.hook.cannotLoadCourses"));
        setCourses([]);
        return;
      }

      const rawCourses: any[] = Array.isArray(response.data) ? response.data : [];

      // Normalize API response to match InstructorCourse interface
      const normalizedCourses = rawCourses.map((item: any) => ({
        ...item,
        id: item.id || item.Id,
        name: item.name || item.Name,
        description: item.description || item.Description || '',
        imageUrl: item.imageUrl || item.ImageUrl || '',
        price: item.price ?? item.Price ?? 0,
        totalStudents: item.totalStudents ?? item.TotalStudents ?? 0,
        rating: item.rating ?? item.Rating ?? item.averageRating ?? item.AverageRating ?? 0,
        status: item.status || item.Status,
        tags: Array.isArray(item.tags ?? item.Tags)
            ? (item.tags ?? item.Tags).map((t: any) => ({ id: t.id || t.Id, name: t.name || t.Name }))
            : []
      }));

      setCourses(normalizedCourses);
      loadedDataTracker.current.coursesLoaded = true;

    } catch (error: any) {
      console.error("Error fetching instructor courses:", error);
      if (error?.response?.status === 403) {
        if (!silent) toast.error(t("instructor.hook.notInstructorYet"));
        setCourses([]);
        return;
      }
      if (!silent) {
        toast.error(t("instructor.hook.cannotLoadCourses"));
        setCourses([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [t]);

  const fetchTags = useCallback(async () => {
    setTagsLoading(true);
    setTagsError(null);
    try {
      const response = await instructorService.getAllTags();
      if (response.success) {
        setTags(response.data);
        loadedDataTracker.current.tagsLoaded = true;
      } else {
        setTagsError(response.message || t("instructor.hook.failedFetchTags"));
      }
    } catch (err: any) {
      setTagsError(err.message || t("instructor.hook.tagsFetchError"));
    } finally {
      setTagsLoading(false);
    }
  }, [t]);

  const becomeInstructor = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await instructorService.becomeInstructor();
      if (response.success) {
        toast.success(response.message || t("instructor.hook.becomeInstructorSuccess"));
        return true;
      } else {
        toast.error(response.message || t("instructor.hook.becomeInstructorFailed"));
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t("instructor.hook.becomeInstructorGenericError");
      toast.error(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [t]);

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
        toast.success(t("instructor.hook.createCourseSuccess"), { duration: 2000 });
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
                toast.success(t("instructor.hook.createCourseSuccess"), { duration: 2000 });
                return found as InstructorCourse;
              }
            }
          }
        } catch (e) {
          console.warn('silent refresh after createCourse failed', e);
        }
        toast.success(t("instructor.hook.createCourseSuccess"), { duration: 2000 });
        return null;
      }

      const errorMessage = (respAny)?.message || t("instructor.hook.createCourseFailed");
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.message || '';
      if (status === 403 || /instructor/i.test(serverMessage)) {
        const msg = t("instructor.hook.needInstructorRole");
        toast.error(msg);
        setError(msg);
        return { status: 'not-instructor' };
      }

      let errorMessage = t("instructor.hook.createCourseError");
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
  }, [fetchCourses, t]);

  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      await instructorService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success(t("instructor.hook.deleteCourseSuccess"));
      return true;
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(error.response?.data?.message || t("instructor.hook.deleteCourseError"));
      return false;
    }
  }, [t]);

  // Auto refresh on language change
  useRefreshOnLanguageChange(() => {
    const tracker = loadedDataTracker.current;

    // Refresh data that has been previously loaded
    if (tracker.coursesLoaded) {
      fetchCourses(true); // true = silent refresh
    }

    if (tracker.tagsLoaded) {
      fetchTags();
    }
  });

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
    deleteCourse,
    setCourses,
    becomeInstructor,
  };
};
