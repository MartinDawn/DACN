import { useState, useCallback, Dispatch, SetStateAction } from "react";
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

  const fetchLectures = useCallback(async () => {
    if (!courseId) return;
    setLecturesLoading(true);
    try {
      const courseContent = await lectureService.getCourseContent(courseId);
      const normalized = mapCourseContentToLectures(courseContent, courseId);
      if (normalized.length) {
        setLectures(normalized);
        return;
      }

      const fallback = await lectureService.getLecturesByCourse(courseId);
      const fallbackData = Array.isArray(fallback) ? fallback : fallback?.data;
      setLectures(Array.isArray(fallbackData) ? fallbackData : []);
    } catch (error) {
      console.error(error);
      setLectures([]);
    } finally {
      setLecturesLoading(false);
    }
  }, [courseId]);

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
    setLectures: setLectures as Dispatch<SetStateAction<Lecture[]>>,
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
