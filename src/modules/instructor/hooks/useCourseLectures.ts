import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-hot-toast";
import { lectureService } from "../services/lecture.service";
import type { Lecture, CreateQuizPayload, UpdateQuizPayload } from "../models/lecture";

interface CreateLectureInput {
  name: string;
  description: string;
  courseId?: string; 
}

// Helper: Video sorter
const sortVideos = (videos: any[]): any[] => {
    return videos.sort((a, b) => {
        // 1. Order (asc) - Prioritize displayOrder similar to lectures logic
        const aOrd = typeof a.displayOrder === 'number' ? a.displayOrder : 
                     (typeof a.order === 'number' ? a.order : 
                     (typeof a.Order === 'number' ? a.Order : Number.MAX_SAFE_INTEGER));

        const bOrd = typeof b.displayOrder === 'number' ? b.displayOrder : 
                     (typeof b.order === 'number' ? b.order : 
                     (typeof b.Order === 'number' ? b.Order : Number.MAX_SAFE_INTEGER));
        
        if (aOrd !== bOrd) return aOrd - bOrd;
        
        // 2. CreatedAt (asc - oldest first)
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        
        if (aTime > 0 && bTime > 0) return aTime - bTime;
        
        return 0; // Keep original order
    });
};

// mapCourseContentToLectures: normalize various shapes from Course/course-content
const mapCourseContentToLectures = (raw: any, fallbackCourseId: string): Lecture[] => {
  // 1. Try to extract direct lectures list (flat structure from API)
  let directLectures: any[] | undefined;
  
  // Handle various response shapes
  if (Array.isArray(raw)) {
      directLectures = raw;
  } else if (Array.isArray(raw?.lectures)) {
      directLectures = raw.lectures;
  } else if (Array.isArray(raw?.data?.lectures)) {
      directLectures = raw.data.lectures;
  } else if (Array.isArray(raw?.data)) {
      directLectures = raw.data;
  }

  if (Array.isArray(directLectures)) {
    const mapped = directLectures.map((lesson: any, index: number) => {
      // Extract videos and sort them
      let mappedVideos = Array.isArray(lesson?.videos) ? lesson.videos.map((v: any) => ({
             ...v,
             // Normalizing video ID: API might return 'id', 'videoId', 'videoid', 'Id', 'VideoId' or 'ID'
             id: v.id || v.videoId || v.videoid || v.Id || v.VideoId || v.ID,
             // Normalizing video name
             name: v.name || v.title || v.fileName || v.Name || v.Title || "Video",
             // Map URL properties just in case
             url: v.url || v.videoUrl || v.filePath || undefined,
             // Mapping Order & Time for sorting
             displayOrder: v.displayOrder ?? v.DisplayOrder,
             order: v.order ?? v.Order,
             createdAt: v.createdAt ?? v.CreatedAt
      })) : [];

      mappedVideos = sortVideos(mappedVideos);

      return {
        id: String(lesson?.id ?? lesson?.lectureId ?? `generated-${index}`),
        name: lesson?.name ?? lesson?.title ?? `Chương ${index + 1}`,
        description: lesson?.description ?? "",
        courseId: String(lesson?.courseId ?? fallbackCourseId),

        // Map content arrays
        videos: mappedVideos,
        documents: Array.isArray(lesson?.documents) ? lesson.documents : [],
        documentNames: Array.isArray(lesson?.documentNames) 
            ? lesson.documentNames 
            : (Array.isArray(lesson?.documents) ? lesson.documents.map((d: any) => d.name || d.fileName || d) : []),
        
        // Map quizzes (objects) if available, normalize ID
        quizzes: Array.isArray(lesson?.quizzes) 
            ? lesson.quizzes.map((q: any) => ({
                ...q,
                id: q.id || q.quizId || q.Id || q.ID,
                name: q.name || q.title || q.Name
              }))
            : [],
        quizNames: Array.isArray(lesson?.quizNames) ? lesson.quizNames : [],

        // Legacy support
        videoUrl: lesson?.videoUrl,

        // Keep original createdAt if present, otherwise null (do NOT default to "now")
        createdAt: lesson?.createdAt ?? null,
        updatedAt: lesson?.updatedAt ?? null,
        // Fix: Nếu API không trả về order hoặc = 0, dùng index + 1 làm mặc định để danh sách chạy từ 1
        order: (typeof lesson?.order === "number" && lesson.order > 0) ? lesson.order : (index + 1),
        displayOrder: (typeof lesson?.displayOrder === "number" && lesson.displayOrder > 0) ? lesson.displayOrder : 
                      ((typeof lesson?.order === "number" && lesson.order > 0) ? lesson.order : (index + 1)),
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
      // Prioritize displayOrder, then fallback to order
      const aOrd = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER);
      const bOrd = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER);
      if (aOrd !== bOrd) return aOrd - bOrd;

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
const normalizeLecture = (raw: any, fallbackCourseId: string): Lecture => {
  let mappedVideos = Array.isArray(raw?.videos) ? raw.videos.map((v: any) => ({
      ...v,
      id: v.id || v.videoId || v.videoid || v.Id || v.VideoId || v.ID,
      name: v.name || v.title || v.fileName || v.Name || v.Title || "Video",
      displayOrder: v.displayOrder ?? v.DisplayOrder,
      order: v.order ?? v.Order,
      createdAt: v.createdAt ?? v.CreatedAt
  })) : [];

  mappedVideos = sortVideos(mappedVideos);

  return {
    id: String(raw?.id ?? raw?.lectureId ?? `generated-${Math.random().toString(36).slice(2,9)}`),
    name: raw?.name ?? raw?.title ?? 'Untitled Lecture',
    description: raw?.description ?? '',
    courseId: String(raw?.courseId ?? fallbackCourseId),
    // Also map videos in normalizeLecture to ensure consistency if this function is used for state updates
    videos: mappedVideos,
    documents: Array.isArray(raw?.documents) ? raw.documents : [],
    documentNames: Array.isArray(raw?.documentNames) ? raw.documentNames : [],
    quizzes: Array.isArray(raw?.quizzes) 
        ? raw.quizzes.map((q: any) => ({
            ...q,
            id: q.id || q.quizId || q.Id || q.ID,
            name: q.name || q.title || q.Name
          }))
        : [],
    quizNames: Array.isArray(raw?.quizNames) ? raw.quizNames : [],
    videoUrl: raw?.videoUrl ?? undefined,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    order: typeof raw?.order === 'number' ? raw.order : null,
    displayOrder: typeof raw?.displayOrder === 'number' ? raw.displayOrder : (typeof raw?.order === 'number' ? raw.order : null),
    chapterId: raw?.chapterId ?? undefined,
    chapterName: raw?.chapterName ?? undefined,
    chapterOrder: raw?.chapterOrder ?? undefined,
  };
};

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
  // REMOVED: isCreatingQuiz state

  // State for document uploading
  const [uploadingDocLectureIds, setUploadingDocLectureIds] = useState<Record<string, boolean>>({});

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

      // Calculate next Order = max(current) + 1
      const maxOrder = lectures.reduce((acc, l) => {
        const o = typeof l.displayOrder === "number" ? l.displayOrder : 0;
        return Math.max(acc, o);
      }, 0);
      const nextOrder = maxOrder + 1;

      setIsCreating(true);
      try {
        const response = await lectureService.createLecture({
          name,
          description,
          courseId: targetCourseId,
          displayOrder: nextOrder,
        });

        if (response) {
          // Try to extract new lecture from response
          const created = extractLectureFromResponse(response.data ?? response, targetCourseId, lectures);
          if (created) {
            // Ensure newly created lecture appears at the end:
            if (created.displayOrder === null || typeof created.displayOrder !== "number" || created.displayOrder === 0) {
                created.displayOrder = nextOrder;
            }
            if (created.order === null || typeof created.order !== "number" || created.order === 0) {
              created.order = nextOrder;
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

  const uploadLectureDocument = useCallback(async (lectureId: string, file: File) => {
    if (!file) {
      toast.error("Vui lòng chọn tài liệu.");
      return null;
    }
    setUploadingDocLectureIds((prev) => ({ ...prev, [lectureId]: true }));
    try {
      const response = await lectureService.addDocument(lectureId, file);
      toast.success(response?.message ?? "Tải tài liệu lên thành công.");
      await fetchLectures();
      return response?.data;
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi tải tài liệu.");
    } finally {
      setUploadingDocLectureIds((prev) => ({ ...prev, [lectureId]: false }));
    }
    return null;
  }, [fetchLectures]);

  const editLecture = useCallback(async (lectureId: string, payload: { name?: string; description?: string; displayOrder?: number }) => {
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
        return true;
      }
      toast.error(response?.message ?? "Không thể xóa chương.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa chương.");
    }
    return false;
  }, []); // removed deps

  const updateLectureOrders = useCallback(async (orders: { id: string; displayOrder: number }[]) => {
    try {
      await lectureService.updateLectureOrders(orders);
      toast.success("Cập nhật thứ tự thành công.");
      await fetchLectures();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật thứ tự.");
      return false;
    }
  }, [fetchLectures]);

  const updateVideoOrders = useCallback(async (orders: { id: string; displayOrder: number }[]) => {
    try {
      await lectureService.updateVideoOrders(orders);
      toast.success("Cập nhật thứ tự video thành công.");
      await fetchLectures();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật thứ tự video.");
      return false;
    }
  }, [fetchLectures]);

  const editVideo = useCallback(async (lectureId: string, videoId: string, payload: { title: string; videoFile?: File }) => {
    try {
      await lectureService.updateVideo(videoId, { title: payload.title, videoFile: payload.videoFile });
      
      // Nếu có thay đổi file video, cần load lại dữ liệu để lấy URL mới
      if (payload.videoFile) {
        await fetchLectures();
        toast.success("Cập nhật video và tiêu đề thành công.");
        return true;
      }
      
      // Nếu chỉ đổi tên, cập nhật state cục bộ cho nhanh
      setLectures((prev) => prev.map((l) => {
          if (l.id !== lectureId) return l;
          return {
            ...l,
            videos: l.videos.map((v) => (String(v.id) === String(videoId) ? { ...v, name: payload.title, title: payload.title } : v))
          };
      }));
      
      toast.success("Cập nhật video thành công.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật video.");
      return false;
    }
  }, [fetchLectures]);

  const deleteVideo = useCallback(async (lectureId: string, videoId: string) => {
    try {
      await lectureService.deleteVideo(videoId);
      // Remove from local state
      setLectures((prev) => prev.map((l) => {
          if (l.id !== lectureId) return l;
          return {
            ...l,
            videos: l.videos.filter((v) => String(v.id) !== String(videoId))
          };
      }));
      toast.success("Xóa video thành công.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa video.");
      return false;
    }
  }, []);

  const editDocument = useCallback(async (lectureId: string, documentId: string, payload: { name: string; documentFile?: File }) => {
    try {
      await lectureService.updateDocument(documentId, { name: payload.name, documentFile: payload.documentFile });
      
      if (payload.documentFile) {
         // If file changed, refetch to assume fresh URLs/metadata
         await fetchLectures(); 
         toast.success("Cập nhật tài liệu thành công.");
         return true;
      }
      
      // Optimistic update for renaming
      setLectures((prev) => prev.map((l) => {
          if (l.id !== lectureId) return l;
          
          let updatedDocs = l.documents ? [...l.documents] : [];
          updatedDocs = updatedDocs.map(d => {
             const dId = d.id || d.documentId || d.Id;
             if (String(dId) === String(documentId)) {
                 return { ...d, name: payload.name };
             }
             return d;
          });
          
          return { ...l, documents: updatedDocs };
      }));
      
      toast.success("Cập nhật tên tài liệu thành công.");
      await fetchLectures(); // Sync
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi cập nhật tài liệu.");
      return false;
    }
  }, [fetchLectures]);

  const deleteDocument = useCallback(async (lectureId: string, documentId: string) => {
      try {
        await lectureService.deleteDocument(documentId);
        // Optimistic remove
        setLectures((prev) => prev.map((l) => {
            if (l.id !== lectureId) return l;
            const newDocs = l.documents ? l.documents.filter((d: any) => String(d.id || d.documentId || d.Id) !== String(documentId)) : [];
            return {
              ...l,
              documents: newDocs,
              // FIX: Cập nhật documentNames đồng bộ với danh sách mới.
              // Điều này ngăn UI fallback về danh sách cũ khi documents trở nên rỗng.
              documentNames: newDocs.map((d: any) => d.name || d.fileName || "")
            };
        }));

        toast.success("Xóa tài liệu thành công.");
        return true;
      } catch (error) {
        console.error(error);
        toast.error("Lỗi xóa tài liệu.");
        return false;
      }
  }, []);

  const deleteQuiz = useCallback(async (lectureId: string, quizId: string) => {
    try {
      await lectureService.deleteQuiz(quizId);
      
      setLectures((prev) => prev.map((l) => {
          if (l.id !== lectureId) return l;

          // Lọc bỏ quiz đã xóa
          let updatedQuizzes = l.quizzes ? l.quizzes.filter((q: any) => {
              const qId = q.id || q.quizId || q.Id || q.ID;
              return String(qId) !== String(quizId);
          }) : [];

          return { 
             ...l, 
             quizzes: updatedQuizzes,
             // Update fallback names just in case
             quizNames: updatedQuizzes.map((q: any) => q.name || q.title || "")
          };
      }));
      
      toast.success("Xóa bài kiểm tra thành công.");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xóa bài kiểm tra.");
      return false;
    }
  }, []);

  // Get Video content for preview
  const getVideo = useCallback(async (videoId: string) => {
    try {
      if (!videoId) return null;
      const blob = await lectureService.getVideo(videoId);
      return blob;
    } catch (error: any) {
      console.error("Error fetching video in hook:", error);
      return null;
    }
  }, []);

  return {
    lectures,
    fetchLectures,
    isCreating,
    uploadingLectureIds,
    lecturesLoading,
    // Removed isCreatingQuiz
    createLecture,
    uploadLectureVideo,  
    editLecture,
    deleteLecture,
    editVideo,
    deleteVideo,
    getVideo,
    uploadLectureDocument,
    uploadingDocLectureIds,
    editDocument,
    deleteDocument,
    updateLectureOrders,
    updateVideoOrders,
    // Removed addQuiz, updateQuiz, getQuizDetail returns
    deleteQuiz,
  };
};
