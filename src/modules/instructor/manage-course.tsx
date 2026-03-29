import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  ArrowLeft, PlusCircle, Video, UploadCloud, Loader2, X, Trash, Edit2, 
  LayoutList, FileText, HelpCircle, ChevronDown, ChevronUp, PlayCircle, List
} from "lucide-react";
import { toast } from "react-hot-toast";
import InstructorLayout from "../user/layout/layout";
import { useCourseLectures } from "./hooks/useCourseLectures";
import { instructorService } from "./services/instructor.service";
import type { InstructorCourse } from "./models/instructor";

import type { Lecture } from "./models/lecture"; 
import QuizModal from "./components/QuizModal"; // New Import
import { EnhancedVideoPreview } from "../shared/components/EnhancedVideoPreview";


const ManageCoursePage: React.FC = () => {
  const params = useParams();
  const courseId = (params as any).courseId ?? (params as any).id ?? (params as any).course ?? undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const stateCourse = (location.state as any)?.course as InstructorCourse | undefined;

  const [course, setCourse] = useState<InstructorCourse | null>(stateCourse ?? null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // --- Modal States ---
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lectureName, setLectureName] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  
  // --- Video/Content Modal States ---
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentLectureId, setCurrentLectureId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // --- Reorder Modal States ---
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderList, setReorderList] = useState<Lecture[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // --- Video Reorder Modal States ---
  const [showVideoReorderModal, setShowVideoReorderModal] = useState(false);
  const [videoReorderList, setVideoReorderList] = useState<any[]>([]);
  const [isVideoSavingOrder, setIsVideoSavingOrder] = useState(false);

  // --- Delete Confirmation States ---
  const [showDeleteLectureModal, setShowDeleteLectureModal] = useState(false);
  const [lectureToDeleteId, setLectureToDeleteId] = useState<string | null>(null);
  const [showDeleteVideoModal, setShowDeleteVideoModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ lectureId: string; videoId: string } | null>(null);

  // --- Video Preview State ---
   const [previewVideo, setPreviewVideo] = useState<any>(null);

  // --- Document Modal States ---
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);

  // --- Document Edit/Delete States ---
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);

  const [editDocName, setEditDocName] = useState("");
  const [editDocFile, setEditDocFile] = useState<File | null>(null);

  // --- Quiz Modal States (REDUCED) ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizLectureId, setQuizLectureId] = useState<string | null>(null);
  const [quizIdToEdit, setQuizIdToEdit] = useState<string | null>(null); // New state

  // --- Delete Quiz States ---
  const [showDeleteQuizModal, setShowDeleteQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{ lectureId: string; quizId: string } | null>(null);

  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ lectureId: string; documentId: string } | null>(null);

  // UI States for Expansion
  const [expandedLectures, setExpandedLectures] = useState<Record<string, boolean>>({});

  const { 
    lectures, fetchLectures, isCreating, uploadingLectureIds, createLecture, 
    uploadLectureVideo, deleteLecture, lecturesLoading, editLecture, editVideo, deleteVideo, getVideo,
   uploadLectureDocument, uploadingDocLectureIds, deleteDocument, updateLectureOrders,
    updateVideoOrders, deleteQuiz // Removed editQuiz
  } = useCourseLectures(courseId ?? "");

  useEffect(() => {
    if (!courseId) {
      setLoadingCourse(false);
      toast.error("Thiếu mã khóa học.");
      return;
    }
    if (stateCourse) {
      setLoadingCourse(false);
      return;
    }
    const loadCourse = async () => {
       try {
        const response = await instructorService.getCourseById(courseId);
        if (response?.data) setCourse(response.data);
       } catch (e) {} finally { setLoadingCourse(false); }
    };
    loadCourse();
  }, [courseId, stateCourse]);
  
  const handleManageCourse = () => {
    fetchLectures();
    navigate("/instructor?tab=courses");
  };

  const openReorderModal = () => {
    // Clone and sort by current logic
    const sorted = [...lectures].sort((a, b) => {
        const orderA = a.displayOrder ?? a.order ?? 0;
        const orderB = b.displayOrder ?? b.order ?? 0;
        return orderA - orderB;
    });
    setReorderList(sorted);
    setShowReorderModal(true);
  };

  const moveLecture = (index: number, direction: 'up' | 'down') => {
    const newList = [...reorderList];
    if (direction === 'up') {
      if (index === 0) return;
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    } else {
      if (index === newList.length - 1) return;
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    }
    setReorderList(newList);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    const payload = reorderList.map((l, index) => ({
      id: l.id,
      displayOrder: index + 1
    }));
    
    const success = await updateLectureOrders(payload);
    setIsSavingOrder(false);
    
    if (success) {
      setShowReorderModal(false);
    }
  };

  // --- Video Reorder Handlers ---
  const openVideoReorderModal = (lecture: any) => {
    if (!lecture.videos || lecture.videos.length === 0) {
        toast.error("Chương này chưa có video nào để sắp xếp.");
        return;
    }
    // Clone and sort videos
    const sorted = [...lecture.videos].sort((a: any, b: any) => {
        const orderA = a.displayOrder ?? a.order ?? 0;
        const orderB = b.displayOrder ?? b.order ?? 0;
        return orderA - orderB;
    });
    setVideoReorderList(sorted);
    setShowVideoReorderModal(true);
  };

  const moveVideoItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...videoReorderList];
    if (direction === 'up') {
      if (index === 0) return;
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    } else {
      if (index === newList.length - 1) return;
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    }
    setVideoReorderList(newList);
  };

  const handleSaveVideoOrder = async () => {
    setIsVideoSavingOrder(true);
    const payload = videoReorderList.map((v, index) => ({
      id: v.id,
      displayOrder: index + 1
    }));
    
    const success = await updateVideoOrders(payload);
    setIsVideoSavingOrder(false);
    
    if (success) {
      setShowVideoReorderModal(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLectures(prev => ({...prev, [id]: !prev[id]}));
  };

  const handleCreateLecture = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lectureName.trim()) {
      toast.error("Vui lòng nhập tên chương.");
      return;
    }
    
    // Ensure courseId is present
    if (!courseId) {
        toast.error("Không tìm thấy ID khóa học.");
        return;
    }

    // API create-lecture: Creates a container (Chapter)
    const result = await createLecture({
      name: lectureName.trim(),
      description: lectureDescription.trim(),
      courseId: courseId, 
    });

    if (result) {
      setLectureName("");
      setLectureDescription("");
      setShowLectureModal(false);
      // Auto expand the new lecture (optional)
      setExpandedLectures(prev => ({...prev, [result.id]: true}));
    }
  };

  const openVideoModal = (lectureId: string) => {
    setCurrentLectureId(lectureId);
    setVideoTitle("");
    setVideoFile(null);
    setShowVideoModal(true);
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLectureId) return;
    if (!videoFile) {
      toast.error("Vui lòng chọn file video.");
      return;
    }

    // Validation bổ sung: Chặn gửi nếu không phải video
    if (!videoFile.type.startsWith("video/")) {
       toast.error("File được chọn không phải định dạng video hợp lệ.");
       return;
    }

    // Nếu người dùng nhập tên video, ta đổi tên file trước khi gửi (Tip để backend nhận được tên mong muốn nếu backend dùng filename)
    let fileToSend = videoFile;
    if (videoTitle.trim()) {
       // Lấy extension cũ
       const ext = videoFile.name.split('.').pop();
       const newName = `${videoTitle.trim()}.${ext}`;
       fileToSend = new File([videoFile], newName, { type: videoFile.type });
    }

    const result = await uploadLectureVideo(currentLectureId, fileToSend);
    if (result || result === undefined) { // result check logic from hook
       setShowVideoModal(false);
       setVideoTitle("");
       setVideoFile(null);
    }
  };

  const openDocumentModal = (lectureId: string) => {
    setCurrentLectureId(lectureId);
    setDocFile(null);
    setShowDocumentModal(true);
  };

  const openQuizModal = (lectureId: string, quizId: string | null = null) => {
    setQuizLectureId(lectureId);
    setQuizIdToEdit(quizId);
    setShowQuizModal(true);
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLectureId) return;
    if (!docFile) {
      toast.error("Vui lòng chọn file tài liệu.");
      return;
    }
    
    // Validate trước khi submit
    if (docFile.type.startsWith("video/") || docFile.type.startsWith("image/")) {
        toast.error("Vui lòng chỉ tải lên file tài liệu (PDF, Word, Excel, TXT...)");
        return;
    }

    const result = await uploadLectureDocument(currentLectureId, docFile);
    if (result || result === undefined) {
       setShowDocumentModal(false);
       setDocFile(null);
    }
  };
  
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       
       // FIX: Sửa logic check file. Trước đây copy nhầm check video.
       // Chấp nhận các loại tài liệu phổ biến, chặn video/ảnh
       if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
          toast.error("Vui lòng không chọn video hoặc ảnh. Chỉ chấp nhận tài liệu (PDF, Office, TXT).");
          e.target.value = ""; // Reset input
          return;
       }

       setDocFile(file);
    }
  };

  // --- Document Actions ---


  const handleEditDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       
       // FIX: Sửa logic check file.
       if (file.type.startsWith("video/") || file.type.startsWith("image/")) {
          toast.error("Vui lòng không chọn video hoặc ảnh. Chỉ chấp nhận tài liệu (PDF, Office, TXT).");
          e.target.value = ""; // Reset input
          return;
       }

       setEditDocFile(file);
    }
  };

  const handleEditDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   // Removed check for editingDocumentId and editingDocLectureId as they are not defined

    if (!editDocName.trim()) {
        toast.error("Tên tài liệu không được để trống");
        return;
    }

   // Removed call to editDocument with editingDocLectureId and editingDocumentId as they are not defined
    setShowEditDocumentModal(false);
  };

  const handleDeleteDocument = (lectureId: string, documentId: string) => {
      setDocToDelete({ lectureId, documentId });
      setShowDeleteDocumentModal(true);
  };

  const confirmDeleteDocument = async () => {
      if (!docToDelete) return;
      await deleteDocument(docToDelete.lectureId, docToDelete.documentId);
      setShowDeleteDocumentModal(false);
      setDocToDelete(null);
  };

  const handleDeleteQuiz = (lectureId: string, quizId: string) => {
    setQuizToDelete({ lectureId, quizId });
    setShowDeleteQuizModal(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;
    await deleteQuiz(quizToDelete.lectureId, quizToDelete.quizId);
    setShowDeleteQuizModal(false);
    setQuizToDelete(null);
  };

  const handlePreviewVideo = async (video: any) => {
    // 1. Tìm ID để fetch từ API 
    // Dữ liệu từ useCourseLectures đã được chuẩn hóa ID vào trường 'id'
    const vidId = video?.id || video?.videoId || video?.Id || video?.ID;
    
    // Nếu video là object Blob preview local (vừa upload chưa refresh) thì dùng luôn URL local
    const directUrl = video?.url || video?.videoUrl || video?.filePath;
    if (directUrl && typeof directUrl === 'string' && directUrl.startsWith('blob:')) {
        // Tạo một mock enhanced video response cho local preview
        setPreviewVideo({
          name: video.name || video.title || "Untitled Video",
          videoUrl: directUrl,
          duration: 0, // Không có duration cho blob
          analysisResult: {
            summary: '',
            segments: [],
            subtitles: []
          }
        });
        return;
    }

    if (!vidId) {
       // Fallback: Chỉ dùng URL http có sẵn nếu không có ID
       if (directUrl && typeof directUrl === 'string' && (directUrl.startsWith('http') || directUrl.startsWith('/'))) {
          setPreviewVideo({
            name: video.name || video.title || "Untitled Video",
            videoUrl: directUrl,
            duration: video.duration || 0,
            analysisResult: {
              summary: '',
              segments: [],
              subtitles: []
            }
          });
          return;
       }
       toast.error("Không tìm thấy ID video để phát. Hãy thử tải lại trang.");
       return;
    }

    const toastId = toast.loading("Đang lấy thông tin video...");
    try {
      // Get enhanced video data from API (Return video object with analysis, segments, subtitles)
      const data = await getVideo(String(vidId));
      
      if (!data) {
        throw new Error("Không nhận được dữ liệu từ server.");
      }

      // Check if this is enhanced video response with analysisResult
      if ('videoUrl' in data && 'analysisResult' in data) {
        // This is already the enhanced response
      setPreviewVideo(data);
        toast.dismiss(toastId);
        return;
      }

      // Fallback: If only URL is returned, create a mock response
      const remoteUrl = typeof data === 'string' 
          ? data 
          : (
              (data as any)?.videoUrl || 
              (data as any)?.url || 
              (data as any)?.link || 
              (data as any)?.filePath
            );

      if (remoteUrl) {
        setPreviewVideo({
          name: (data as any)?.name || video.name || video.title || "Video",
          videoUrl: remoteUrl,
          duration: (data as any)?.duration || video.duration || 0,
          analysisResult: (data as any)?.analysisResult || {
            summary: '',
            segments: [],
            subtitles: []
          }
        });
        toast.dismiss(toastId);
        return;
      }

      toast.error("Không tìm thấy đường dẫn video hợp lệ trong phản hồi.");
    
    } catch (error) {
      console.error("Error loading video:", error);
      toast.error("Không thể lấy thông tin video. Vui lòng kiểm tra lại kết nối.");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];

       // Thêm validation video chặt chẽ
       if (!file.type.startsWith("video/")) {
           toast.error("Vui lòng chỉ chọn file video (MP4, WebM, AVI, ...)");
           e.target.value = "";
           return;
       }

       setVideoFile(file);
       
       // Tự động điền tiêu đề bằng tên file (bỏ đuôi mở rộng .mp4, .mp3, ...)
       const cleanName = file.name.replace(/\.(mp4|mp3|webm|mkv|avi)$/i, "");
       setVideoTitle(cleanName);
    }
  };

  const handleDeleteLecture = (id: string) => {
    setLectureToDeleteId(id);
    setShowDeleteLectureModal(true);
  };

  const confirmDeleteLecture = async () => {
    if (!lectureToDeleteId) return;
    const success = await deleteLecture(lectureToDeleteId);
    if (success) {
      setExpandedLectures((prev) => {
        const copy = { ...prev };
        delete copy[lectureToDeleteId];
        return copy;
      });
    }
    setShowDeleteLectureModal(false);
    setLectureToDeleteId(null);
  };

  // --- Video Actions ---
  const handleDeleteVideo = (lectureId: string, videoId: string) => {
    setVideoToDelete({ lectureId, videoId });
    setShowDeleteVideoModal(true);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    await deleteVideo(videoToDelete.lectureId, videoToDelete.videoId);
    setShowDeleteVideoModal(false);
    setVideoToDelete(null);
  };

  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingVideoLectureId, setEditingVideoLectureId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState("");
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);

  const openEditVideo = (lectureId: string, video: any) => {
    setEditingVideoLectureId(lectureId);
    setEditingVideoId(video.id);
    setEditVideoFile(null); // Reset file
    // Determine current name based on available properties
    const currTitle = typeof video === 'string' ? video : (video.title ?? video.name ?? "");
    // Loại bỏ đuôi file khi hiển thị form sửa
    setEditVideoTitle(currTitle.replace(/\.(mp4|mp3|webm|mkv|avi)$/i, ""));
    setShowEditVideoModal(true);
  }

  const handleEditVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       
       // Thêm validation khi sửa video
       if (!file.type.startsWith("video/")) {
           toast.error("Vui lòng chỉ chọn file video (MP4, WebM, AVI, ...)");
           e.target.value = "";
           return;
       }

       setEditVideoFile(file);
    }
  };

  const handleEditVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoId || !editingVideoLectureId) return;
    
    if (!editVideoTitle.trim()) {
        toast.error("Tên video không được để trống");
        return;
    }

    // Validation bổ sung khi cập nhật video
    if (editVideoFile && !editVideoFile.type.startsWith("video/")) {
        toast.error("File được chọn không phải định dạng video hợp lệ.");
        return;
    }
    
    // FIX: Thêm biến receive success để chỉ tắt modal khi thành công
    const success = await editVideo(editingVideoLectureId, editingVideoId, { 
      title: editVideoTitle.trim(),
      videoFile: editVideoFile || undefined
    });
    
    if (success) {
      setShowEditVideoModal(false);
    }
  };

  const openEditModal = (lecture: any) => {
    setEditLectureId(lecture.id);
    setEditLectureName(lecture.name ?? "");
    setEditLectureDescription(lecture.description ?? "");
    // Default to 1 if undefined or 0
    const currentOrder = lecture.displayOrder ?? lecture.order ?? 0;
    setEditLectureOrder(currentOrder > 0 ? currentOrder : 1);
    setShowEditModal(true);
  };

  const handleEditLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLectureId) return;
    if (!editLectureName.trim()) {
      toast.error("Tên chương không được để trống.");
      return;
    }
    const updated = await editLecture(editLectureId, {
      name: editLectureName.trim(),
      description: editLectureDescription.trim(),
      displayOrder: Number(editLectureOrder),
    });
    if (updated) {
      setShowEditModal(false);
      // ensure UI reflects change (hook already refetched)
      setExpandedLectures((prev) => ({ ...prev, [editLectureId]: true }));
    }
  };

  // --- Edit Modal States ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLectureId, setEditLectureId] = useState<string | null>(null);
  const [editLectureName, setEditLectureName] = useState("");
  const [editLectureDescription, setEditLectureDescription] = useState("");
  const [editLectureOrder, setEditLectureOrder] = useState<number | string>(0);

  // Thêm xử lý phím ESC để đóng các modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Ưu tiên đóng preview video trước (nếu đang bật)
        if (previewVideo) {
          if (previewVideo.videoUrl && previewVideo.videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewVideo.videoUrl);
          }
          setPreviewVideo(null);
          return;
        }
        
        // Đóng các modal khác
        if (showDeleteQuizModal) { setShowDeleteQuizModal(false); return; } // Add: Close Delete Quiz
        if (showQuizModal) { setShowQuizModal(false); return; } // Add: Close Add/Edit Quiz
        if (showReorderModal) { setShowReorderModal(false); return; } 
        if (showVideoReorderModal) { setShowVideoReorderModal(false); return; } // Add video reorder modal close
        if (showDeleteVideoModal) { setShowDeleteVideoModal(false); return; }
        if (showDeleteDocumentModal) { setShowDeleteDocumentModal(false); return; } 
        if (showDeleteLectureModal) { setShowDeleteLectureModal(false); return; }
        if (showEditVideoModal) { setShowEditVideoModal(false); return; }
        if (showEditDocumentModal) { setShowEditDocumentModal(false); return; }
        if (showVideoModal) { setShowVideoModal(false); return; }
        if (showDocumentModal) { setShowDocumentModal(false); return; }
        if (showEditModal) { setShowEditModal(false); return; }
        if (showLectureModal) { setShowLectureModal(false); return; }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewVideo, showReorderModal, showVideoReorderModal, showDeleteQuizModal, showQuizModal, showDeleteVideoModal, showDeleteDocumentModal, showDeleteLectureModal, showEditVideoModal, showEditDocumentModal, showVideoModal, showDocumentModal, showEditModal, showLectureModal]);

  if (loadingCourse) return <InstructorLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#5a2dff]" /></div></InstructorLayout>

  return (
    <InstructorLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-white to-slate-50 p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <button
                onClick={handleManageCourse}
                className="group mb-4 flex items-center gap-3 text-sm font-semibold text-[#5a2dff] hover:text-[#4a21eb] transition-colors"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Quay lại khóa học
              </button>
              <h1 className="truncate text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2" title={course?.name}>
                {course?.name}
              </h1>
              <p className="text-base text-gray-600 font-medium">Quản lý nội dung chương trình học</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openReorderModal}
                className="group flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-105"
              >
                <List size={18} className="group-hover:scale-110 transition-transform" />
                Sắp xếp lại
              </button>
              <button
                onClick={() => setShowLectureModal(true)}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5a2dff] to-[#3c1cd6] px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-[#5a2dff]/25 hover:scale-105"
              >
                <PlusCircle size={18} className="group-hover:scale-110 transition-transform" />
                Thêm Chương Học
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            {lecturesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#5a2dff]" />
              </div>
            ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gradient-to-r from-white to-slate-50 py-16 text-center">
                    <div className="mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                      <LayoutList className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-500 mb-2">Chưa có nội dung</p>
                    <p className="text-sm text-gray-400">Hãy thêm chương học đầu tiên</p>
                </div>
            ) : (
             <div className="space-y-4">
               {lectures.map((lecture, index) => {
                 const isExpanded = expandedLectures[lecture.id] ?? true; // default expand
                 const isUploading = uploadingLectureIds[lecture.id];
                 
                 return (
                   <div key={lecture.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 shadow-lg shadow-slate-900/5 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/10">
                     {/* Lecture Header (Chapter) */}
                     <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(lecture.id)}>
                           <div className="font-bold text-gray-500 text-sm uppercase tracking-wider">CHƯƠNG {index + 1}</div>
                           <h3 className="font-bold text-xl text-gray-900 truncate min-w-0 max-w-xs">{lecture.name}</h3>
                           <div className="rounded-full bg-white p-2 shadow-sm">
                             {isExpanded ? <ChevronUp size={16} className="text-gray-600"/> : <ChevronDown size={16} className="text-gray-600"/>}
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {/* Reorder Videos Button */}
                           <button
                             onClick={() => openVideoReorderModal(lecture)}
                             className="group/btn rounded-full bg-white p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all duration-200"
                             title="Sắp xếp video trong chương"
                           >
                             <List size={16} className="group-hover/btn:scale-110 transition-transform"/>
                           </button>
                           <button
                             onClick={() => openEditModal(lecture)}
                             className="group/btn rounded-full bg-white p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm transition-all duration-200"
                             title="Chỉnh sửa"
                           >
                             <Edit2 size={16} className="group-hover/btn:scale-110 transition-transform"/>
                           </button>
                           <button
                             onClick={() => handleDeleteLecture(lecture.id)}
                             className="group/btn rounded-full bg-white p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 shadow-sm transition-all duration-200"
                             title="Xóa"
                           >
                             <Trash size={16} className="group-hover/btn:scale-110 transition-transform"/>
                           </button>
                        </div>
                     </div>
                     
                     {/* Lecture Content */}
                     {isExpanded && (
                       <div className="p-6">
                          <p className="text-sm text-gray-500 mb-4">{lecture.description}</p>
                          
                          {/* List: Videos / Content */}
                          <div className="space-y-2 mb-6">
                             {/* Videos */}
                             {lecture.videos && lecture.videos.length > 0 ? (
                               lecture.videos.map((vid: any, vidIdx: number) => {
                                 // Handle if video is object or string
                                 const rawVidName = typeof vid === 'string' ? vid : (vid.name || vid.title || `Video ${vidIdx+1}`);
                                 // Loại bỏ đuôi .mp4, .mp3... khỏi tên hiển thị trong danh sách
                                 const vidName = rawVidName.replace(/\.(mp4|mp3|webm|mkv|avi)$/i, "");

                                 const vidId = vid?.id; // Assuming object has ID
                                 const hasUrl = vid.url || vid.filePath || vid.videoUrl; // Check if URL exists

                                 return (
                                   <div key={vidIdx} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 group hover:border-[#5a2dff]/30 transition-colors">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5a2dff]/10 text-[#5a2dff]">
                                        <Video size={14} />
                                      </div>
                                      <span className="flex-1 text-sm font-medium text-gray-700 truncate min-w-0">{vidName}</span>
                                      
                                      {/* Preview Button: Bấm vào đây để xem video */}
                                      {(hasUrl || vidId) && (
                                        <button 
                                            type="button" 
                                            onClick={() => handlePreviewVideo(vid)}
                                            className="p-1.5 text-gray-500 hover:text-[#5a2dff] hover:bg-white rounded transition-colors"
                                            title="Xem video"
                                        >
                                            <PlayCircle size={15} />
                                        </button>
                                      )}

                                      {/* Action buttons only if we have an ID */}
                                      {vidId && (
                                        <div className="flex gap-2">
                                           <button 
                                              type="button" 
                                              onClick={() => openEditVideo(lecture.id, vid)}
                                              className="p-1.5 text-gray-500 hover:text-[#5a2dff] hover:bg-white rounded transition-colors"
                                              title="Sửa tên video"
                                           >
                                              <Edit2 size={15} />
                                           </button>
                                           <button 
                                              type="button" 
                                              onClick={() => handleDeleteVideo(lecture.id, vidId)}
                                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                              title="Xóa video"
                                           >
                                              <Trash size={15} />
                                           </button>
                                        </div>
                                      )}

                                      <span className="text-xs text-[#5a2dff] bg-[#5a2dff]/10 px-2 py-1 rounded border border-[#5a2dff]/20">Video</span>
                                   </div>
                                 );
                               })
                             ) : (
                               <div className="text-sm text-gray-400 italic pl-2">Chưa có video bài giảng nào.</div>
                             )}

                             {/* Documents / Quizzes Placeholders */}
                             {/* Display Documents - Prefer 'documents' array of objects if available, fallback to names */}
                             {(lecture.documents && lecture.documents.length > 0 ? lecture.documents : lecture.documentNames)?.map((doc: any, i: number) => {
                               const docName = typeof doc === 'string' ? doc : (doc.name || doc.fileName || `Tài liệu ${i+1}`);
                               const docUrl = typeof doc === 'object' ? (doc.url || doc.filePath) : null;
                               const docId = typeof doc === 'object' ? (doc.id || doc.documentId || doc.Id || doc.DocumentId) : null;

                               return (
                               <div key={`d-${i}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 group hover:border-[#5a2dff]/30 transition-colors">
                                  <FileText size={16} className="text-[#5a2dff]"/>
                                  {docUrl ? (
                                    <a href={docUrl} target="_blank" rel="noreferrer" className="flex-1 text-sm hover:underline hover:text-[#4b24cc] truncate min-w-0">{docName}</a>
                                  ) : (
                                    <span className="flex-1 text-sm truncate min-w-0">{docName}</span>
                                  )}
                                  
                                  {/* Actions for Document */}
                                  {docId && (
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteDocument(lecture.id, docId)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                            title="Xóa tài liệu"
                                        >
                                            <Trash size={15} />
                                        </button>
                                    </div>
                                  )}

                                  {/* Tag Tài liệu giống tag Video */}
                                  <span className="text-xs text-[#5a2dff] bg-[#5a2dff]/10 px-2 py-1 rounded border border-[#5a2dff]/20">Tài liệu</span>
                               </div>
                               );
                             })}

                             {/* QUIZZES SECTION */}
                             {(lecture.quizzes && lecture.quizzes.length > 0 ? lecture.quizzes : lecture.quizNames)?.map((quiz: any, i: number) => {
                               const quizName = typeof quiz === 'string' ? quiz : (quiz.name || quiz.title || `Quiz ${i+1}`);
                               // Use standardized ID from hook (or fallback check)
                               const quizId = typeof quiz === 'object' ? (quiz.id || quiz.quizId || quiz.Id) : null;

                               return (
                                <div key={`q-${i}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 group hover:border-[#5a2dff]/30 transition-colors">
                                   <HelpCircle size={16} className="text-[#5a2dff]"/>
                                   <span className="flex-1 text-sm truncate min-w-0">{quizName}</span>
                                   
                                   {/* Actions for Quiz - EDIT BUTTON */}
                                   {quizId && (
                                     <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => openQuizModal(lecture.id, quizId)}
                                            className="p-1.5 text-gray-500 hover:text-[#5a2dff] hover:bg-white rounded transition-colors"
                                            title="Sửa Quiz"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDeleteQuiz(lecture.id, quizId)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded transition-colors"
                                            title="Xóa Quiz"
                                        >
                                            <Trash size={15} />
                                        </button>
                                     </div>
                                   )}
                                   <span className="text-xs text-[#5a2dff] bg-[#5a2dff]/10 px-2 py-1 rounded border border-[#5a2dff]/20">Quiz</span>
                                </div>
                               );
                             })}
                          </div>

                          {/* Actions: Add Content */}
                          <div className="flex flex-wrap gap-3 border-t pt-4">
                             <button 
                               onClick={() => openVideoModal(lecture.id)}
                               disabled={isUploading}
                               className="flex items-center gap-2 rounded-md bg-[#5a2dff]/10 px-3 py-2 text-sm font-medium text-[#5a2dff] hover:bg-[#5a2dff]/20 disabled:opacity-50"
                             >
                                {isUploading ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={16} />}
                                Thêm Video
                             </button>
                             
                             <button 
                               onClick={() => openQuizModal(lecture.id)}
                               className="flex items-center gap-2 rounded-md bg-[#5a2dff]/10 px-3 py-2 text-sm font-medium text-[#5a2dff] hover:bg-[#5a2dff]/20"
                             >
                                <HelpCircle size={16} /> Thêm Quiz
                             </button>
                             
                             <button 
                               onClick={() => openDocumentModal(lecture.id)}
                               disabled={uploadingDocLectureIds?.[lecture.id]} 
                               className="flex items-center gap-2 rounded-md bg-[#5a2dff]/10 px-3 py-2 text-sm font-medium text-[#5a2dff] hover:bg-[#5a2dff]/20 disabled:opacity-50"
                             >
                                {uploadingDocLectureIds?.[lecture.id] ? <Loader2 className="animate-spin h-4 w-4"/> : <FileText size={16} />} 
                                Thêm Tài Liệu
                             </button>
                          </div>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
            )}
        </div>
      </div>

      {/* --- PREVIEW VIDEO MODAL (with Analysis, Segments, and Subtitles) --- */}
      {previewVideo && (
        <EnhancedVideoPreview
          videoData={previewVideo}
          onClose={() => {
            // Cleanup: Revoke Object URL để tránh memory leak
            if (previewVideo.videoUrl && previewVideo.videoUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewVideo.videoUrl);
            }
            setPreviewVideo(null);
          }}
        />
      )}

      {/* --- ADD CHAPTER MODAL --- */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Chương Mới (Lecture)</h3>
                 <button onClick={() => setShowLectureModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleCreateLecture} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tên chương <span className="text-red-500">*</span></label>
                    <input autoFocus value={lectureName} onChange={e => setLectureName(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                           placeholder="Ví dụ: Chương 1: Giới thiệu..."/>
                 </div>
                 
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                    <textarea value={lectureDescription} onChange={e => setLectureDescription(e.target.value)} rows={3}
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                           placeholder="Mô tả ngắn về nội dung chương này..."/>
                 </div>
                 
                 <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                    <p>💡 Sau khi tạo chương, bạn có thể thêm nhiều video, bài tập và tài liệu vào chương đó.</p>
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                    <button type="button" onClick={() => setShowLectureModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button type="submit" disabled={isCreating} className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                        {isCreating ? "Đang tạo..." : "Tạo Chương"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- ADD VIDEO MODAL --- */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Video Bài Giảng</h3>
                 <button onClick={() => setShowVideoModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleUploadVideo} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề video (Tùy chọn)</label>
                    <input 
                       value={videoTitle} 
                       onChange={e => setVideoTitle(e.target.value)} 
                       className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                       placeholder="Nhập tên video hiển thị... (Mặc định lấy tên file)"
                    />
                 </div>
                 
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">File Video <span className="text-red-500">*</span></label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center text-center">
                                {videoFile ? (
                                    <>
                                        <Video className="w-8 h-8 mb-2 text-[#5a2dff]" />
                                        <p className="mb-2 text-sm text-gray-700 font-semibold">{videoFile.name}</p>
                                        <p className="text-xs text-gray-500">{(videoFile.size / (1024*1024)).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click để tải lên</span> hoặc kéo thả</p>
                                        <p className="text-xs text-gray-400 mt-1">MP4, WebM, AVI, MKV (Max 50MB)</p>
                                    </>
                                )}
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="video/*, .mp4, .webm, .mkv, .avi, .mov" 
                              onChange={handleFileChange} 
                            />
                        </label>
                    </div> 
                 </div>

                 <div className="flex justify-end gap-2 pt-4 border-t">
                    <button type="button" onClick={() => setShowVideoModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button 
                      type="submit" 
                      disabled={!videoFile || uploadingLectureIds[currentLectureId || '']} 
                      className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc] disabled:opacity-50"
                    >
                        {uploadingLectureIds[currentLectureId || ''] ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={16} />}
                        Tải Lên
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- ADD DOCUMENT MODAL --- */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Tài Liệu</h3>
                 <button onClick={() => setShowDocumentModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleUploadDocument} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">File Tài Liệu <span className="text-red-500">*</span></label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center text-center">
                                {docFile ? (
                                    <>
                                        <FileText className="w-8 h-8 mb-2 text-[#5a2dff]" />
                                        <p className="mb-2 text-sm text-gray-700 font-semibold">{docFile.name}</p>
                                        <p className="text-xs text-gray-500">{(docFile.size / (1024*1024)).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                                        <span className="text-sm text-gray-500">Chọn file mới để thay thế</span>
                                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PPT, TXT</p>
                                    </>
                                )}
                            </div>
                            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleDocFileChange} />
                        </label>
                    </div> 
                 </div>

                 <div className="flex justify-end gap-2 pt-4 border-t">
                    <button type="button" onClick={() => setShowDocumentModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button 
                      type="submit" 
                      disabled={!docFile || uploadingDocLectureIds?.[currentLectureId || '']} 
                      className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc] disabled:opacity-50"
                    >
                        {uploadingDocLectureIds?.[currentLectureId || ''] ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={16} />}
                        Tải Lên
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- EDIT CHAPTER MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Chỉnh sửa Chương</h3>
                 <button onClick={() => setShowEditModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleEditLectureSubmit} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tên chương <span className="text-red-500">*</span></label>
                    <input autoFocus value={editLectureName} onChange={e => setEditLectureName(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                           placeholder="Ví dụ: Chương 1: Giới thiệu..."/>
                 </div>
                 
                 {/* <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Thứ tự hiển thị</label>
                    <input type="number" value={editLectureOrder} onChange={e => setEditLectureOrder(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" />
                 </div> */}
                 
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                    <textarea value={editLectureDescription} onChange={e => setEditLectureDescription(e.target.value)} rows={3}
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                           placeholder="Mô tả ngắn về nội dung chương này..."/>
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                    <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                        Lưu thay đổi
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- EDIT VIDEO MODAL --- */}
      {showEditVideoModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
               <div className="border-b px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Chỉnh sửa Video</h3>
                  <button onClick={() => setShowEditVideoModal(false)}><X className="text-gray-400"/></button>
               </div>
               <form onSubmit={handleEditVideoSubmit} className="p-6 space-y-5">
                  <div>
                     <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề video <span className="text-red-500">*</span></label>
                     <input 
                        autoFocus 
                        value={editVideoTitle} 
                        onChange={e => setEditVideoTitle(e.target.value)} 
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                        placeholder="Nhập tiêu đề video..."
                     />
                  </div>
                  
                  <div>
                     <label className="mb-1 block text-sm font-semibold text-gray-700">Thay đổi file video (Tùy chọn)</label>
                     <div className="flex items-center gap-3">
                        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 hover:bg-gray-50">
                           <div className="flex flex-col items-center justify-center text-center">
                              {editVideoFile ? (
                                 <>
                                    <Video className="mb-1 h-6 w-6 text-[#5a2dff]" />
                                    <p className="text-sm font-medium text-gray-700">{editVideoFile.name}</p>
                                    <p className="text-xs text-gray-500">{(editVideoFile.size / (1024*1024)).toFixed(2)} MB</p>
                                 </>
                              ) : (
                                 <>
                                    <UploadCloud className="mb-1 h-6 w-6 text-gray-400" />
                                    <span className="text-sm text-gray-500">Chọn file mới để thay thế</span>
                                    <p className="text-xs text-gray-400 mt-1">MP4, WebM, AVI, MKV (Max 50MB)</p>
                                 </>
                              )}
                           </div>
                           <input 
                              type="file" 
                              className="hidden" 
                              accept="video/*, .mp4, .webm, .mkv, .avi, .mov" 
                              onChange={handleEditVideoFileChange} 
                           />
                        </label>
                        {editVideoFile && (
                          <button type="button" onClick={() => setEditVideoFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Hủy chọn file">
                            <Trash size={18}/>
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                     <button type="button" onClick={() => setShowEditVideoModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                     <button type="submit" className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                         Lưu thay đổi
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* --- EDIT DOCUMENT MODAL --- */}
      {showEditDocumentModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
               <div className="border-b px-6 py-4 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Chỉnh sửa Tài Liệu</h3>
                  <button onClick={() => setShowEditDocumentModal(false)}><X className="text-gray-400"/></button>
               </div>
               <form onSubmit={handleEditDocumentSubmit} className="p-6 space-y-5">
                  <div>
                     <label className="mb-1 block text-sm font-semibold text-gray-700">Tên tài liệu <span className="text-red-500">*</span></label>
                     <input 
                        autoFocus 
                        value={editDocName} 
                        onChange={e => setEditDocName(e.target.value)} 
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" 
                        placeholder="Nhập tên tài liệu..."
                     />
                  </div>
                  
                  <div>
                     <label className="mb-1 block text-sm font-semibold text-gray-700">Thay đổi file tài liệu (Tùy chọn)</label>
                     <div className="flex items-center gap-3">
                        <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 hover:bg-gray-50">
                           <div className="flex flex-col items-center justify-center text-center">
                              {editDocFile ? (
                                 <>
                                    <FileText className="mb-1 h-6 w-6 text-[#5a2dff]" />
                                    <p className="text-sm font-medium text-gray-700">{editDocFile.name}</p>
                                    <p className="text-xs text-gray-500">{(editDocFile.size / (1024*1024)).toFixed(2)} MB</p>
                                 </>
                              ) : (
                                 <>
                                    <UploadCloud className="mb-1 h-6 w-6 text-gray-400" />
                                    <span className="text-sm text-gray-500">Chọn file mới để thay thế</span>
                                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PPT, TXT</p>
                                 </>
                              )}
                           </div>
                           <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden" onChange={handleEditDocFileChange} />
                        </label>
                        {editDocFile && (
                          <button type="button" onClick={() => setEditDocFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Hủy chọn file">
                            <Trash size={18}/>
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                     <button type="button" onClick={() => setShowEditDocumentModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                     <button type="submit" className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                         Lưu thay đổi
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* --- DELETE LECTURE MODAL --- */}
      {showDeleteLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="p-6 text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#5a2dff]/10">
                    <Trash className="h-6 w-6 text-[#5a2dff]" />
                 </div>
                 <h3 className="mt-4 text-lg font-semibold text-gray-900">Xóa Chương Học?</h3>
                 <p className="mt-2 text-sm text-gray-500">
                    Bạn có chắc chắn muốn xóa chương này? <br/>
                    Hành động này không thể hoàn tác và tất cả video bên trong sẽ bị xóa.
                 </p>
                 <div className="mt-6 flex justify-center gap-3">
                    <button
                       onClick={() => setShowDeleteLectureModal(false)}
                       className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                       Hủy
                    </button>
                    <button
                       onClick={confirmDeleteLecture}
                       className="rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]"
                    >
                       Đồng ý xóa
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- DELETE DOCUMENT MODAL --- */}
      {showDeleteDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="p-6 text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#5a2dff]/10">
                    <Trash className="h-6 w-6 text-[#5a2dff]" />
                 </div>
                 <h3 className="mt-4 text-lg font-semibold text-gray-900">Xóa Tài liệu?</h3>
                 <p className="mt-2 text-sm text-gray-500">
                    Bạn có chắc chắn muốn xóa tài liệu này khỏi bài giảng?
                 </p>
                 <div className="mt-6 flex justify-center gap-3">
                    <button
                       onClick={() => setShowDeleteDocumentModal(false)}
                       className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                       Hủy
                    </button>
                    <button
                       onClick={confirmDeleteDocument}
                       className="rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]"
                    >
                       Xóa ngay
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- DELETE QUIZ MODAL --- */}
      {showDeleteQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="p-6 text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#5a2dff]/10">
                    <Trash className="h-6 w-6 text-[#5a2dff]" />
                 </div>
                 <h3 className="mt-4 text-lg font-semibold text-gray-900">Xóa Bài Kiểm Tra?</h3>
                 <p className="mt-2 text-sm text-gray-500">
                    Bạn có chắc chắn muốn xóa bài kiểm tra này? hành động này không thể hoàn tác.
                 </p>
                 <div className="mt-6 flex justify-center gap-3">
                    <button
                       onClick={() => setShowDeleteQuizModal(false)}
                       className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                       Hủy
                    </button>
                    <button
                       onClick={confirmDeleteQuiz}
                       className="rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]"
                    >
                       Xóa ngay
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- DELETE VIDEO MODAL --- */}
      {showDeleteVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-sm rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="p-6 text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#5a2dff]/10">
                    <Video className="h-6 w-6 text-[#5a2dff]" />
                 </div>
                 <h3 className="mt-4 text-lg font-semibold text-gray-900">Xóa Video?</h3>
                 <p className="mt-2 text-sm text-gray-500">
                    Bạn có chắc chắn muốn xóa video này khỏi danh sách bài giảng?
                 </p>
                 <div className="mt-6 flex justify-center gap-3">
                    <button
                       onClick={() => setShowDeleteVideoModal(false)}
                       className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                       Hủy
                    </button>
                    <button
                       onClick={confirmDeleteVideo}
                       className="rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]"
                    >
                       Xóa ngay
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- REORDER MODAL --- */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Sắp xếp lại chương học</h3>
                 <button onClick={() => setShowReorderModal(false)}><X className="text-gray-400"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <p className="text-sm text-gray-500 mb-4">Sử dụng nút lên xuống để thay đổi thứ tự hiển thị.</p>
                 <div className="space-y-2">
                    {reorderList.map((l, idx) => (
                       <div key={l.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                          <div className="flex items-center gap-3">
                             <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                                {idx + 1}
                             </div>
                             <span className="text-sm font-medium text-gray-800 line-clamp-1">{l.name}</span>
                          </div>
                          <div className="flex gap-1">
                             <button 
                                onClick={() => moveLecture(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-gray-500 hover:bg-white hover:shadow rounded disabled:opacity-30"
                             >
                                <ChevronUp size={18}/>
                             </button>
                             <button 
                                onClick={() => moveLecture(idx, 'down')}
                                disabled={idx === reorderList.length - 1}
                                className="p-1 text-gray-500 hover:bg-white hover:shadow rounded disabled:opacity-30"
                             >
                                <ChevronDown size={18}/>
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="border-t px-6 py-4 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                 <button onClick={() => setShowReorderModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white text-gray-700">Hủy</button>
                 <button 
                    onClick={handleSaveOrder} 
                    disabled={isSavingOrder}
                    className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc] disabled:opacity-70"
                 >
                    {isSavingOrder && <Loader2 className="animate-spin h-4 w-4"/>}
                    Lưu thứ tự
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- VIDEO REORDER MODAL --- */}
      {showVideoReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Sắp xếp Video</h3>
                 <button onClick={() => setShowVideoReorderModal(false)}><X className="text-gray-400"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <p className="text-sm text-gray-500 mb-4">Sử dụng nút lên xuống để thay đổi thứ tự video trong chương học.</p>
                 <div className="space-y-2">
                    {videoReorderList.map((v, idx) => {
                       const vName = typeof v === 'string' ? v : (v.name || v.title || v.fileName || "Video");
                       const cleanName = vName.replace(/\.(mp4|mp3|webm|mkv|avi)$/i, "");
                       return (
                           <div key={v.id || idx} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                              <div className="flex items-center gap-3">
                                 <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                                    {idx + 1}
                                 </div>
                                 <Video size={16} className="text-gray-500"/>
                                 <span className="text-sm font-medium text-gray-800 line-clamp-1">{cleanName}</span>
                              </div>
                              <div className="flex gap-1">
                                 <button 
                                    onClick={() => moveVideoItem(idx, 'up')}
                                    disabled={idx === 0}
                                    className="p-1 text-gray-500 hover:bg-white hover:shadow rounded disabled:opacity-30"
                                 >
                                    <ChevronUp size={18}/>
                                 </button>
                                 <button 
                                    onClick={() => moveVideoItem(idx, 'down')}
                                    disabled={idx === videoReorderList.length - 1}
                                    className="p-1 text-gray-500 hover:bg-white hover:shadow rounded disabled:opacity-30"
                                 >
                                    <ChevronDown size={18}/>
                                 </button>
                              </div>
                           </div>
                       );
                    })}
                 </div>
              </div>

              <div className="border-t px-6 py-4 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                 <button onClick={() => setShowVideoReorderModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-white text-gray-700">Hủy</button>
                 <button 
                    onClick={handleSaveVideoOrder} 
                    disabled={isVideoSavingOrder}
                    className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc] disabled:opacity-70"
                 >
                    {isVideoSavingOrder && <Loader2 className="animate-spin h-4 w-4"/>}
                    Lưu thứ tự
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- ADD/EDIT QUIZ MODAL IS NOW SEPARATED --- */}
      <QuizModal 
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        lectureId={quizLectureId}
        quizIdToEdit={quizIdToEdit} // Pass the state here
        onSuccess={() => {
            fetchLectures(); // Refresh list after create/update
        }}
      />

    </InstructorLayout>
  );
};

export default ManageCoursePage;
