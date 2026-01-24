import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-hot-toast";
import { lectureService } from "../services/lecture.service";
import type { Lecture } from "../models/lecture";

interface CreateLectureInput {
  name: string;
  description: string;
  file?: File | null;
  courseId?: string; // allow override when invoking
}

// mapCourseContentToLectures: normalize various shapes from Course/course-content
const mapCourseContentToLectures = (raw: any, fallbackCourseId: string): Lecture[] => {
  // 1. Try to extract direct lectures list (flat structure from API screenshot)
  // Your API returns { data: { lectures: [...] } }, so 'raw' here is likely the data object.
  const directLectures =
    Array.isArray(raw?.lectures) ? raw.lectures :
    Array.isArray(raw?.data?.lectures) ? raw.data.lectures :
    undefined;

  if (Array.isArray(directLectures)) {
    return directLectures.map((lesson: any, index: number) => {
      // Map video URL. The screenshot shows a 'videos' array.
      let vidUrl = lesson?.videoUrl ?? lesson?.videoUrlPath ?? lesson?.videoPath ?? lesson?.video;
      // If direct url is missing, check the videos array (take first item if available)
      if (!vidUrl && Array.isArray(lesson?.videos) && lesson.videos.length > 0) {
        const v = lesson.videos[0];
        vidUrl = typeof v === 'string' ? v : v?.url ?? v?.filePath ?? undefined;
      }

      return {
        id: String(lesson?.id ?? lesson?.lectureId),
        name: lesson?.name ?? lesson?.title ?? "Bài giảng",
        description: lesson?.description ?? "",
        courseId: String(lesson?.courseId ?? fallbackCourseId),
        videoUrl: vidUrl,
        createdAt: lesson?.createdAt,
        updatedAt: lesson?.updatedAt,
        order: typeof lesson?.order === "number" ? lesson.order : index,
        // Flat list implies no chapter info available
        chapterId: undefined,
        chapterName: undefined,
        chapterOrder: undefined,
      };
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // 2. Fallback to Chapter-based structure
  const chaptersSource =
    Array.isArray(raw?.data) ? raw.data :
    Array.isArray(raw?.chapters) ? raw.chapters :
    Array.isArray(raw) ? raw :
    raw?.data?.chapters ??
    raw?.data?.courseChapters ??
    raw?.courseChapters ??
    [];

  const chapters = Array.isArray(chaptersSource) ? chaptersSource : [];
  const flattened: Lecture[] = [];

  chapters.forEach((chapter: any, chapterIndex: number) => {
    const lessonsSource = Array.isArray(chapter?.lectures) ? chapter.lectures : chapter?.lessons ?? [];
    const lessons = Array.isArray(lessonsSource) ? lessonsSource : [];

    lessons.forEach((lesson: any, lessonIndex: number) => {
      const id = lesson?.id ?? lesson?.lectureId;
      const resolvedCourseId = lesson?.courseId ?? fallbackCourseId;
      if (!id || !resolvedCourseId) return;

      const chapterId = chapter?.id ?? chapter?.chapterId;

      flattened.push({
        id: String(id),
        name: lesson?.name ?? lesson?.title ?? "Bài giảng",
        description: lesson?.description ?? "",
        courseId: String(resolvedCourseId),
        videoUrl: lesson?.videoUrl ?? lesson?.videoUrlPath ?? lesson?.videoPath ?? lesson?.video,
        createdAt: lesson?.createdAt,
        updatedAt: lesson?.updatedAt,
        order: typeof lesson?.order === "number" ? lesson.order : lesson?.sortOrder ?? lessonIndex,
        chapterId: chapterId != null ? String(chapterId) : undefined,
        chapterName: chapter?.name ?? chapter?.title ?? undefined,
        chapterOrder: typeof chapter?.order === "number" ? chapter.order : chapter?.sortOrder ?? chapterIndex,
      });
    });
  });

  return flattened.sort((a, b) => {
    const chapterDiff = (a.chapterOrder ?? 0) - (b.chapterOrder ?? 0);
    if (chapterDiff !== 0) return chapterDiff;
    return (a.order ?? 0) - (b.order ?? 0);
  });
};

export const useCourseLectures = (courseId: string) => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingLectureIds, setUploadingLectureIds] = useState<Record<string, boolean>>({});
  const [lecturesLoading, setLecturesLoading] = useState(false);

  const fetchLectures = useCallback(async () => {   //api lecture
    if (!courseId) return;
    setLecturesLoading(true);
    try {
      // 1. First try the specific lectures-by-course endpoint (if it exists)
      let hasData = false;
      try {
        const listResp = await lectureService.getLecturesByCourse(courseId);
        const listData = Array.isArray(listResp) ? listResp : Array.isArray(listResp?.data) ? listResp.data : [];
        if (listData.length > 0) {
          setLectures(listData);
          hasData = true;
        }
      } catch (err) {
        // If this endpoint fails (e.g. 404), simply warn and proceed to fallback
        console.warn("getLecturesByCourse failed, trying course-content...", err);
      }

      if (hasData) return;

      // 2. Fallback to course-content (based on your screenshot)
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
    async ({ name, description, file, courseId: inputCourseId }: CreateLectureInput) => {
      const targetCourseId = inputCourseId ?? courseId;
      if (!targetCourseId) {
        toast.error("Thiếu mã khóa học.");
        return null;
      }

      setIsCreating(true);
      try {
        // Create lecture (JSON). If file provided, upload via add-video afterwards.
        const response = await lectureService.createLecture({
          name,
          description,
          courseId: targetCourseId,
          // DO NOT send file here - upload separately below
        });

        if (response?.data) {
          toast.success(response.message ?? "Tạo bài giảng thành công.");
          
          // Refresh list from server using the new API
          await fetchLectures();

          // If caller provided a file, upload it to add-video endpoint
          if (file) {
            const lectureId = response.data!.id;
            // mark uploading
            setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: true }));
            try {
              const uploadResp = await lectureService.uploadLectureVideo(lectureId, file);
              if (uploadResp?.data) {
                toast.success(uploadResp.message ?? "Tải video thành công.");
                // Refresh again to ensure video url is updated in the list
                await fetchLectures();
              } else {
                toast.error(uploadResp?.message ?? "Không thể tải video.");
              }
            } catch (err) {
              console.error(err);
              toast.error("Có lỗi khi tải video.");
            } finally {
              setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: false }));
            }
          }

          return response.data;
        }
        toast.error(response?.message ?? "Không thể tạo bài giảng.");
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tạo bài giảng.");
      } finally {
        setIsCreating(false);
      }
      return null;
    },
    [courseId, fetchLectures]
  );

  const uploadLectureVideo = useCallback(async (lectureId: string, file: File) => {
    if (!file) {
      toast.error("Vui lòng chọn video.");
      return null;
    }
    setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: true }));
    try {
      const response = await lectureService.uploadLectureVideo(lectureId, file);
      if (response?.data) {
        toast.success(response.message ?? "Tải video thành công.");
        setLectures((prev) =>
          prev.map((lecture) => (lecture.id === lectureId ? { ...lecture, ...response.data } : lecture))
        );
        return response.data;
      }
      toast.error(response?.message ?? "Không thể tải video.");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi tải video.");
    } finally {
      setUploadingLectureIds((prev) => ({ ...prev, [lectureId]: false }));
    }
    return null;
  }, []);

  // Edit lecture
  const editLecture = useCallback(async (lectureId: string, payload: { name?: string; description?: string }) => {
    try {
      const response = await lectureService.updateLecture(lectureId, payload);
      if (response?.data) {
        toast.success(response.message ?? "Cập nhật bài giảng thành công.");
        setLectures((prev) => prev.map((l) => (l.id === lectureId ? { ...l, ...response.data } : l)));
        return response.data;
      }
      toast.error(response?.message ?? "Không thể cập nhật bài giảng.");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi cập nhật bài giảng.");
    }
    return null;
  }, []);

  // Delete lecture
  const deleteLecture = useCallback(async (lectureId: string) => {
    try {
      const response = await lectureService.deleteLecture(lectureId);
      if (response?.data) {
        toast.success(response.message ?? "Xóa bài giảng thành công.");
        setLectures((prev) => prev.filter((l) => l.id !== lectureId));
        return true;
      }
      toast.error(response?.message ?? "Không thể xóa bài giảng.");
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi xóa bài giảng.");
    }
    return false;
  }, []);

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
