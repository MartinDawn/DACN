import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  ArrowLeft, PlusCircle, Video, UploadCloud, Loader2, X, Trash, Edit2, 
  LayoutList, FileText, HelpCircle, ChevronDown, ChevronUp 
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
  
  // UI States for Expansion
  const [expandedLectures, setExpandedLectures] = useState<Record<string, boolean>>({});

  const { lectures, fetchLectures, isCreating, uploadingLectureIds, createLecture, uploadLectureVideo, deleteLecture, lecturesLoading, editLecture, editVideo, deleteVideo } =
    useCourseLectures(courseId ?? "");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
       setVideoFile(file);
       // Auto fill title if empty
       if (!videoTitle) {
          setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
       }
    }
  };

  const handleDeleteLecture = async (id: string) => {
    const ok = window.confirm("Bạn có chắc muốn xóa chương này? Hành động không thể hoàn tác.");
    if (!ok) return;
    const success = await deleteLecture(id);
    if (success) {
      // optional visual feedback already handled in hook via toast
      setExpandedLectures((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  // --- Video Actions ---
  const handleDeleteVideo = async (lectureId: string, videoId: string) => {
    const ok = window.confirm("Xóa video này?");
    if (ok) {
        await deleteVideo(lectureId, videoId);
    }
  };

  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingVideoLectureId, setEditingVideoLectureId] = useState<string | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState("");

  const openEditVideo = (lectureId: string, video: any) => {
    setEditingVideoLectureId(lectureId);
    setEditingVideoId(video.id);
    const currTitle = typeof video === 'string' ? video : (video.title ?? video.name ?? "");
    setEditVideoTitle(currTitle);
    setShowEditVideoModal(true);
  }

  const handleEditVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoId || !editingVideoLectureId) return;
    
    await editVideo(editingVideoLectureId, editingVideoId, { title: editVideoTitle });
    setShowEditVideoModal(false);
  };

  const openEditModal = (lecture: any) => {
    setEditLectureId(lecture.id);
    setEditLectureName(lecture.name ?? "");
    setEditLectureDescription(lecture.description ?? "");
    // Default to 0 if undefined
    setEditLectureOrder(lecture.displayOrder ?? lecture.order ?? 0);
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

  if (loadingCourse) return <InstructorLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#5a2dff]" /></div></InstructorLayout>

  return (
    <InstructorLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={handleManageCourse} className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
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
                           <button onClick={() => openEditModal(lecture)} className="p-2 text-gray-400 hover:text-indigo-600" title="Chỉnh sửa"><Edit2 size={16}/></button>
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
                                 const vidName = typeof vid === 'string' ? vid : (vid.name || vid.title || `Video ${vidIdx+1}`);
                                 const vidId = vid?.id; // Assuming object has ID
                                 return (
                                   <div key={vidIdx} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 group">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                        <Video size={14} />
                                      </div>
                                      <span className="flex-1 text-sm font-medium text-gray-700">{vidName}</span>
                                      
                                      {/* Action buttons only if we have an ID */}
                                      {vidId && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                              type="button" 
                                              onClick={() => openEditVideo(lecture.id, vid)}
                                              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-white"
                                              title="Sửa tên video"
                                           >
                                              <Edit2 size={14} />
                                           </button>
                                           <button 
                                              type="button" 
                                              onClick={() => handleDeleteVideo(lecture.id, vidId)}
                                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-white"
                                              title="Xóa video"
                                           >
                                              <Trash size={14} />
                                           </button>
                                        </div>
                                      )}

                                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Video</span>
                                   </div>
                                 );
                               })
                             ) : (
                               <div className="text-sm text-gray-400 italic pl-2">Chưa có video bài giảng nào.</div>
                             )}

                             {/* Documents / Quizzes Placeholders */}
                             {lecture.documentNames?.map((doc, i) => (
                               <div key={`d-${i}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                  <FileText size={16} className="text-orange-500"/>
                                  <span className="flex-1 text-sm">{doc}</span>
                               </div>
                             ))}
                             {lecture.quizNames?.map((quiz, i) => (
                               <div key={`q-${i}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                                  <HelpCircle size={16} className="text-purple-500"/>
                                  <span className="flex-1 text-sm">{quiz}</span>
                               </div>
                             ))}
                          </div>

                          {/* Actions: Add Content */}
                          <div className="flex flex-wrap gap-3 border-t pt-4">
                             <button 
                               onClick={() => openVideoModal(lecture.id)}
                               disabled={isUploading}
                               className="flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                             >
                                {isUploading ? <Loader2 className="animate-spin h-4 w-4"/> : <UploadCloud size={16} />}
                                Thêm Video
                             </button>
                             
                             <button disabled className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed" title="Tính năng đang cập nhật">
                                <HelpCircle size={16} /> Thêm Quiz (Sắp có)
                             </button>
                             <button disabled className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed" title="Tính năng đang cập nhật">
                                <FileText size={16} /> Thêm Tài Liệu (Sắp có)
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
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {videoFile ? (
                                    <>
                                        <Video className="w-8 h-8 mb-2 text-indigo-500" />
                                        <p className="mb-2 text-sm text-gray-700 font-semibold">{videoFile.name}</p>
                                        <p className="text-xs text-gray-500">{(videoFile.size / (1024*1024)).toFixed(2)} MB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click để tải lên</span> hoặc kéo thả</p>
                                        <p className="text-xs text-gray-500">MP4, WebM (Max 50MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
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
                 
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Thứ tự hiển thị</label>
                    <input type="number" value={editLectureOrder} onChange={e => setEditLectureOrder(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" />
                 </div>
                 
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
                  <h3 className="font-bold text-gray-900">Đổi tên Video</h3>
                  <button onClick={() => setShowEditVideoModal(false)}><X className="text-gray-400"/></button>
               </div>
               <form onSubmit={handleEditVideoSubmit} className="p-6 space-y-5">
                  <div>
                     <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề mới <span className="text-red-500">*</span></label>
                     <input autoFocus value={editVideoTitle} onChange={e => setEditVideoTitle(e.target.value)} 
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" />
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

    </InstructorLayout>
  );
};

export default ManageCoursePage;
