import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  ArrowLeft, PlusCircle, Video, UploadCloud, Loader2, X, Trash, Edit2, 
  LayoutList, FileText, HelpCircle, ChevronDown, ChevronUp, PlayCircle // Ensure PlayCircle is imported
} from "lucide-react";
import { toast } from "react-hot-toast";
import InstructorLayout from "../user/layout/layout";
import { useCourseLectures } from "./hooks/useCourseLectures";
import { instructorService } from "./services/instructor.service";
import type { InstructorCourse } from "./models/instructor";
import { Confirm } from "react-confirm-box"; // optional - if not available fallback to window.confirm (see usage)

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
  
  // --- Delete Confirmation States ---
  const [showDeleteLectureModal, setShowDeleteLectureModal] = useState(false);
  const [lectureToDeleteId, setLectureToDeleteId] = useState<string | null>(null);

  const [showDeleteVideoModal, setShowDeleteVideoModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{ lectureId: string; videoId: string } | null>(null);

  // --- Video Preview State ---
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // --- Document Modal States ---
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);

  // --- Document Edit/Delete States ---
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [editingDocLectureId, setEditingDocLectureId] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [editDocFile, setEditDocFile] = useState<File | null>(null);

  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ lectureId: string; documentId: string } | null>(null);

  // UI States for Expansion
  const [expandedLectures, setExpandedLectures] = useState<Record<string, boolean>>({});

  const { 
    lectures, fetchLectures, isCreating, uploadingLectureIds, createLecture, 
    uploadLectureVideo, deleteLecture, lecturesLoading, editLecture, editVideo, deleteVideo, getVideo,
    uploadLectureDocument, uploadingDocLectureIds, editDocument, deleteDocument // Destructure new hooks
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
  const openEditDocument = (lectureId: string, doc: any) => {
    setEditingDocLectureId(lectureId);
    const docId = doc.id || doc.documentId || doc.Id || doc.DocumentId;
    setEditingDocumentId(docId);
    setEditDocFile(null);
    const currentName = typeof doc === 'string' ? doc : (doc.name ?? doc.fileName ?? "");
    setEditDocName(currentName);
    setShowEditDocumentModal(true);
  };

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
    if (!editingDocumentId || !editingDocLectureId) return;

    if (!editDocName.trim()) {
        toast.error("Tên tài liệu không được để trống");
        return;
    }

    await editDocument(editingDocLectureId, editingDocumentId, {
        name: editDocName.trim(),
        documentFile: editDocFile || undefined
    });
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

  const handlePreviewVideo = async (video: any) => {
    // 1. Tìm ID để fetch từ API 
    // Dữ liệu từ useCourseLectures đã được chuẩn hóa ID vào trường 'id'
    const vidId = video?.id || video?.videoId || video?.Id || video?.ID;
    
    // Tên video 
    const vidName = typeof video === 'string' ? video : (video.name || video.title || video.fileName || "video.mp4");

    // Nếu video là object Blob preview local (vừa upload chưa refresh) thì dùng luôn URL local
    const directUrl = video?.url || video?.videoUrl || video?.filePath;
    if (directUrl && typeof directUrl === 'string' && directUrl.startsWith('blob:')) {
        setPreviewVideo({
            url: directUrl,
            title: vidName
        });
        return;
    }

    if (!vidId) {
       // Fallback: Chỉ dùng URL http có sẵn nếu không có ID
       if (directUrl && typeof directUrl === 'string' && (directUrl.startsWith('http') || directUrl.startsWith('/'))) {
          setPreviewVideo({
            url: directUrl,
            title: vidName
          });
          return;
       }
       toast.error("Không tìm thấy ID video để phát. Hãy thử tải lại trang.");
       return;
    }

    const toastId = toast.loading("Đang lấy đường dẫn video...");
    try {
      // Get video info from API (Return JSON object with URL)
      const data = await getVideo(String(vidId));
      
      if (!data) {
        throw new Error("Không nhận được dữ liệu từ server.");
      }

      // FIX: Cập nhật logic lấy URL từ response: 
      // API Return: { success: true, data: { videoUrl: "https://..." } }
      const remoteUrl = typeof data === 'string' 
          ? data 
          : (
              // 1. Ưu tiên lấy từ data.data.videoUrl (Theo Format API)
              (data.data && data.data.videoUrl) || 
              (data.data && data.data.url) ||
              // 2. Fallback các trường hợp object phẳng
              data.videoUrl || 
              data.url || 
              data.link || 
              data.filePath
            );

      if (remoteUrl) {
         setPreviewVideo({
             url: remoteUrl,
             title: vidName
         });
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
       const cleanName = file.name.replace(/\.(mp4|mp3|webm|mkv|avi|mov)$/i, "");
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
    
    await editVideo(editingVideoLectureId, editingVideoId, { 
      title: editVideoTitle.trim(),
      videoFile: editVideoFile || undefined
    });
    setShowEditVideoModal(false);
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
          if (previewVideo.url && previewVideo.url.startsWith('blob:')) {
            URL.revokeObjectURL(previewVideo.url);
          }
          setPreviewVideo(null);
          return;
        }
        
        // Đóng các modal khác
        if (showDeleteVideoModal) { setShowDeleteVideoModal(false); return; }
        if (showDeleteDocumentModal) { setShowDeleteDocumentModal(false); return; } // Added
        if (showDeleteLectureModal) { setShowDeleteLectureModal(false); return; }
        if (showEditVideoModal) { setShowEditVideoModal(false); return; }
        if (showEditDocumentModal) { setShowEditDocumentModal(false); return; } // Added
        if (showVideoModal) { setShowVideoModal(false); return; }
        if (showDocumentModal) { setShowDocumentModal(false); return; }
        if (showEditModal) { setShowEditModal(false); return; }
        if (showLectureModal) { setShowLectureModal(false); return; }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewVideo, showDeleteVideoModal, showDeleteDocumentModal, showDeleteLectureModal, showEditVideoModal, showEditDocumentModal, showVideoModal, showDocumentModal, showEditModal, showLectureModal]);

  if (loadingCourse) return <InstructorLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#5a2dff]" /></div></InstructorLayout>

  return (
    <InstructorLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={handleManageCourse} className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5a2dff] hover:text-[#4a21eb]">
              <ArrowLeft size={16} /> Quay lại khóa học
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{course?.name}</h1>
            <p className="text-sm text-gray-500">Quản lý nội dung chương trình học</p>
          </div>
          <button
            onClick={() => setShowLectureModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4b24cc]"
          >
            <PlusCircle size={18} /> Thêm Chương Học
          </button>
        </div>

        <div className="space-y-6">
            {lecturesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#5a2dff]" />
              </div>
            ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 text-center">
                    <LayoutList className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Chưa có nội dung. Hãy thêm chương học đầu tiên (Lecture).</p>
                </div>
            ) : (
             <div className="space-y-4">
               {lectures.map((lecture, index) => {
                 const isExpanded = expandedLectures[lecture.id] ?? true; // default expand
                 const isUploading = uploadingLectureIds[lecture.id];
                 
                 return (
                   <div key={lecture.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                     {/* Lecture Header (Chapter) */}
                     <div className="flex items-center justify-between bg-gray-50 px-6 py-4">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleExpand(lecture.id)}>
                           <div className="font-bold text-gray-400">CHƯƠNG {index + 1}</div>
                           <h3 className="font-bold text-gray-900">{lecture.name}</h3>
                           {isExpanded ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => openEditModal(lecture)} className="p-2 text-gray-400 hover:text-[#5a2dff]" title="Chỉnh sửa"><Edit2 size={16}/></button>
                           <button onClick={() => handleDeleteLecture(lecture.id)} className="p-2 text-gray-400 hover:text-red-500" title="Xóa"><Trash size={16}/></button>
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
                                      <span className="flex-1 text-sm font-medium text-gray-700">{vidName}</span>
                                      
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
                                    <a href={docUrl} target="_blank" rel="noreferrer" className="flex-1 text-sm hover:underline hover:text-[#4b24cc]">{docName}</a>
                                  ) : (
                                    <span className="flex-1 text-sm">{docName}</span>
                                  )}
                                  
                                  {/* Actions for Document */}
                                  {docId && (
                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => openEditDocument(lecture.id, doc)}
                                            className="p-1.5 text-gray-500 hover:text-[#5a2dff] hover:bg-white rounded transition-colors"
                                            title="Sửa tài liệu"
                                        >
                                            <Edit2 size={15} />
                                        </button>
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

                             {lecture.quizNames?.map((quiz, i) => (
                               <div key={`q-${i}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                  <HelpCircle size={16} className="text-[#5a2dff]"/>
                                  <span className="flex-1 text-sm">{quiz}</span>
                               </div>
                             ))}
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
                             
                             <button disabled className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed" title="Tính năng đang cập nhật">
                                <HelpCircle size={16} /> Thêm Quiz (Sắp có)
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

      {/* --- PREVIEW VIDEO MODAL --- */}
      {previewVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-xl bg-black shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white border-b border-gray-800">
              <h3 className="font-medium text-lg truncate pr-4">{previewVideo.title}</h3>
              <button 
                onClick={() => {
                  // Cleanup: Revoke Object URL để tránh memory leak
                  if (previewVideo.url && previewVideo.url.startsWith('blob:')) {
                    URL.revokeObjectURL(previewVideo.url);
                  }
                  setPreviewVideo(null);
                }}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                title="Đóng"
              >
                <X className="text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center relative">
              <video 
                key={previewVideo.url} 
                src={previewVideo.url}
                controls 
                autoPlay 
                className="w-full h-full max-h-[80vh]"
                onError={(e) => {
                  console.error("Video playback error:", e);
                  toast.error("Lỗi phát video. Định dạng không được hỗ trợ.");
                }}
              >
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            </div>
          </div>
        </div>
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
                                        <p className="text-xs text-gray-500">MP4, WebM, AVI, MKV (Max 50MB)</p>
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
                                        <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click để tải lên</span> hoặc kéo thả</p>
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

    </InstructorLayout>
  );
};

export default ManageCoursePage;
