import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-hot-toast";
import { lectureService } from "../services/lecture.service";
import type { Lecture } from "../models/lecture";

interface CreateLectureInput {
  name: string;
  description: string;
  courseId?: string; 
}

// mapCourseContentToLectures: normalize various shapes from Course/course-content
const mapCourseContentToLectures = (raw: any, fallbackCourseId: string): Lecture[] => {
  // 1. Try to extract direct lectures list (flat structure from API screenshot)
  const directLectures =
    Array.isArray(raw?.lectures) ? raw.lectures :
    Array.isArray(raw?.data?.lectures) ? raw.data.lectures :
    undefined;

  if (Array.isArray(directLectures)) {
    const mapped = directLectures.map((lesson: any, index: number) => {
      return {
        id: String(lesson?.id ?? lesson?.lectureId ?? `generated-${index}`),
        name: lesson?.name ?? lesson?.title ?? `Chương ${index + 1}`,
        description: lesson?.description ?? "",
        courseId: String(lesson?.courseId ?? fallbackCourseId),

        // Map content arrays
        videos: Array.isArray(lesson?.videos) ? lesson.videos : [],
        documentNames: Array.isArray(lesson?.documentNames) ? lesson.documentNames : [],
        quizNames: Array.isArray(lesson?.quizNames) ? lesson.quizNames : [],

        // Legacy support
        videoUrl: lesson?.videoUrl,

        // Keep original createdAt if present, otherwise null (do NOT default to "now")
        createdAt: lesson?.createdAt ?? null,
        updatedAt: lesson?.updatedAt ?? null,
        order: typeof lesson?.order === "number" ? lesson.order : null,
        chapterId: lesson?.chapterId ?? undefined,
        chapterName: lesson?.chapterName ?? undefined,
        chapterOrder: lesson?.chapterOrder ?? undefined,
      };
    });

    // Determine if API provided any ordering hints at all
    const anyOrderOrCreatedAt = mapped.some((m) => m.order !== null || m.createdAt);

    // Use a large fallback so missing order/createdAt are treated as "last"
    if (!anyOrderOrCreatedAt) {
      // Preserve API order when there is no order/createdAt metadata
      return mapped;
    }

    // Otherwise sort by order (if provided), then createdAt (oldest first so new appear last)
    return mapped.sort((a, b) => {
      // Treat missing order as very large so items without order go to the end
      const aOrder = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const bOrder = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;

      // Treat missing createdAt as very large so items without date go to the end
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }

  // Fallback if data structure is different (omitted for brevity, prioritizing the user's current API shape)
  return [];
};

// normalize single lecture object to our Lecture shape
const normalizeLecture = (raw: any, fallbackCourseId: string): Lecture => ({
  id: String(raw?.id ?? raw?.lectureId ?? `generated-${Math.random().toString(36).slice(2,9)}`),
  name: raw?.name ?? raw?.title ?? 'Untitled Lecture',
  description: raw?.description ?? '',
  courseId: String(raw?.courseId ?? fallbackCourseId),
  videos: Array.isArray(raw?.videos) ? raw.videos : [],
  documentNames: Array.isArray(raw?.documentNames) ? raw.documentNames : [],
  quizNames: Array.isArray(raw?.quizNames) ? raw.quizNames : [],
  videoUrl: raw?.videoUrl ?? undefined,
  createdAt: raw?.createdAt ?? null,
  updatedAt: raw?.updatedAt ?? null,
  order: typeof raw?.order === 'number' ? raw.order : null,
  chapterId: raw?.chapterId ?? undefined,
  chapterName: raw?.chapterName ?? undefined,
  chapterOrder: raw?.chapterOrder ?? undefined,
});

// try to extract created/updated lecture from various response shapes
const extractLectureFromResponse = (respData: any, fallbackCourseId: string, existing: Lecture[]): Lecture | null => {
  if (!respData) return null;
  
  // Check common wrapper patterns
  const candidate = respData.data || respData;

  // case: API returns a Lecture object directly
  if (candidate?.id) return normalizeLecture(candidate, fallbackCourseId);
  
  // also check outer object just in case
  if (respData?.id) return normalizeLecture(respData, fallbackCourseId);

  // case: API returns a course-like payload with lectures array
  const lecturesArr = Array.isArray(candidate?.lectures) ? candidate.lectures : 
                      Array.isArray(respData?.lectures) ? respData.lectures : undefined;
                      
  if (lecturesArr && lecturesArr.length) {
    const existingIds = new Set(existing.map((l) => String(l.id)));
    const added = lecturesArr.find((l: any) => !existingIds.has(String(l?.id ?? l?.lectureId)));
    const lastOne = added ?? lecturesArr[lecturesArr.length - 1];
    return lastOne ? normalizeLecture(lastOne, fallbackCourseId) : null;
  }

  return null;
};

export const useCourseLectures = (courseId: string) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingLectureIds, setUploadingLectureIds] = useState<Record<string, boolean>>({});
  const [lecturesLoading, setLecturesLoading] = useState(false);

  const fetchLectures = useCallback(async () => {
    if (!courseId) return;
    setLecturesLoading(true);
    try {
      // Prioritize getCourseContent as it returns the full nested structure needed
      const courseContent = await lectureService.getCourseContent(courseId);
      const normalized = mapCourseContentToLectures(courseContent, courseId);
      setLectures(normalized);
    } catch (error) {
      console.error(error);
      setLectures([]);
    } finally {
      setLecturesLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const createLecture = useCallback(
    async ({ name, description, courseId: inputCourseId }: CreateLectureInput) => {
      const targetCourseId = inputCourseId ?? courseId;
      if (!targetCourseId) {
        toast.error("Thiếu mã khóa học.");
        return null;
      }

      setIsCreating(true);
      try {
        const response = await lectureService.createLecture({
          name,
          description,
          courseId: targetCourseId,
        });

        if (response) {
          // Try to extract new lecture from response
          const created = extractLectureFromResponse(response.data ?? response, targetCourseId, lectures);
          if (created) {
            // Ensure newly created lecture appears at the end:
            // if server didn't provide `order`/`createdAt`, assign values based on current local state
            const maxOrder = lectures.reduce((acc, l) => {
              const o = typeof l.order === "number" ? l.order : -Infinity;
              return Math.max(acc, o);
            }, -Infinity);

            if (created.order === null || typeof created.order !== "number") {
              created.order = Number.isFinite(maxOrder) ? maxOrder + 1 : lectures.length + 1;
            }
            if (!created.createdAt) {
              created.createdAt = new Date().toISOString();
            }

            // Append to the end (preserve existing order; new chapter goes last)
            setLectures((prev) => {
              if (prev.some((p) => p.id === created.id)) {
                return prev.map((p) => (p.id === created.id ? created : p));
              }
              return [...prev, created];
            });
            toast.success(response.message ?? "Tạo chương học thành công.");
            return response.data ?? created;
          }

          // Fallback: if API reports success but didn't return lecture object, refetch
          if ((response as any).success) {
            await fetchLectures();
            toast.success(response.message ?? "Tạo chương học thành công.");
            return response.data ?? null;
          }
        }

        toast.error(response?.message ?? "Không thể tạo chương học.");
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tạo chương học.");
      } finally {
        setIsCreating(false);
      }
      return null;
    },
    [courseId, fetchLectures, lectures]
  );

  const uploadLectureVideo = useCallback(async (lectureId: string, file: File) => {
    if (!file) {
      toast.error("Vui lòng chọn video.");
      return null;
    }
    setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: true }));
    try {
      const response = await lectureService.uploadLectureVideo(lectureId, file);
      // The API add-video might return the updated lecture or just success. 
      // We assume simple success and refetch.
      toast.success(response?.message ?? "Tải video lên thành công.");
      await fetchLectures();
      return response?.data;
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi tải video.");
    } finally {
      setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: false }));
    }
    return null;
  }, [fetchLectures]);

  const editLecture = useCallback(async (lectureId: string, payload: { name?: string; description?: string }) => {
    try {
      const response = await lectureService.updateLecture(lectureId, payload);
      if (response) {
        const updated = extractLectureFromResponse(response.data ?? response, courseId, lectures);
        if (updated) {
          setLectures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } else if ((response as any).success) {
          // fallback to refetch if no lecture payload
          await fetchLectures();
        }
        toast.success("Cập nhật thành công.");
        return response.data ?? updated;
      }
      toast.error(response?.message ?? "Không thể cập nhật chương.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật.");
    }
    return null;
  }, [courseId, fetchLectures, lectures]);

  const deleteLecture = useCallback(async (lectureId: string) => {
    try {
      const response = await lectureService.deleteLecture(lectureId);
      // treat success flag OR returned data as success
      if ((response && ((response as any).success || response.data)) ) {
        // remove from local state immediately
        setLectures((prev) => prev.filter((l) => l.id !== lectureId));
        toast.success("Xóa chương thành công.");
        // no refetch necessary; but keep it optional if server ordering logic requires it
        return true;
      }
      toast.error(response?.message ?? "Không thể xóa chương.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa chương.");
    }
    return false;
  }, [/* no deps */]);

  return {
    lectures,
    fetchLectures,
    isCreating,
    uploadingLectureIds,
    lecturesLoading,
    createLecture,
    uploadLectureVideo,  
    editLecture,
    deleteLecture,
  };
};
