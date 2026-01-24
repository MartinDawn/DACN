import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, PlusCircle, Video, UploadCloud, Loader2, X, Trash, Edit2, ChevronDown, ChevronUp, LayoutList } from "lucide-react";
import { toast } from "react-hot-toast";
import InstructorLayout from "../user/layout/layout";
import { useCourseLectures } from "./hooks/useCourseLectures";
import { instructorService } from "./services/instructor.service";
import { lectureService } from "./services/lecture.service";
import type { InstructorCourse } from "./models/instructor";

// Define interface for local UI state
interface Chapter {
  id: string;
  title: string;
  description?: string;
  // logic to link lectures could be added here
}

const ManageCoursePage: React.FC = () => {
  const params = useParams();
  const courseId = (params as any).courseId ?? (params as any).id ?? (params as any).course ?? undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const stateCourse = (location.state as any)?.course as InstructorCourse | undefined;

  const [course, setCourse] = useState<InstructorCourse | null>(stateCourse ?? null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // --- Chapter States ---
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // --- Lecture States ---
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const [lectureName, setLectureName] = useState("");
  const [lectureType, setLectureType] = useState("Video");
  const [lectureDuration, setLectureDuration] = useState("");
  const [lectureDescription, setLectureDescription] = useState("");
  
  // existing editing states
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  // per-lecture selected video files
  const [videoFiles, setVideoFiles] = useState<Record<string, File | null>>({});

  const { lectures, setLectures, isCreating, uploadingLectureIds, createLecture, uploadLectureVideo, editLecture, deleteLecture } =
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
        if (response?.data) {
          setCourse(response.data);
        } else {
          toast.error(response?.message ?? "Không tìm thấy khóa học.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi tải khóa học.");
      } finally {
        setLoadingCourse(false);
      }
    };
    loadCourse();
  }, [courseId, stateCourse]);

  useEffect(() => {
    if (!courseId) return;
    const loadLectures = async () => {
      try {
        const response = await lectureService.getLecturesByCourse(courseId);
        if (response?.data && Array.isArray(response.data)) {
          setLectures(response.data);
        } else if (response?.message) {
          toast.error(response.message);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadLectures();
  }, [courseId, setLectures]);

  // Mock initial chapter structure if backend doesn't provide it yet
  useEffect(() => {
    if (lectures.length > 0 && chapters.length === 0) {
       // Create a default chapter to hold existing lectures for UI purposes
       const defaultId = "chap-default";
       setChapters([{ id: defaultId, title: "Chương 1: Nội dung chính", description: "Danh sách bài học" }]);
       setExpandedChapters({ [defaultId]: true });
    }
  }, [lectures, chapters.length]);

  // --- Handlers ---

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) { toast.error("Vui lòng nhập tên chương"); return; }
    
    // Simulate API call for creating chapter
    const newId = `chap-${Date.now()}`;
    const newChapter: Chapter = { id: newId, title: newChapterTitle, description: newChapterDesc };
    
    setChapters([...chapters, newChapter]);
    setExpandedChapters(prev => ({ ...prev, [newId]: true }));
    setNewChapterTitle("");
    setNewChapterDesc("");
    setShowChapterModal(false);
    toast.success("Thêm chương thành công");
  };

  const openAddLectureModal = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setLectureName("");
    setLectureType("Video");
    setLectureDuration("");
    setLectureDescription("");
    setShowLectureModal(true);
  };

  const handleCreateLecture = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lectureName.trim()) {
      toast.error("Vui lòng nhập tên bài giảng.");
      return;
    }
    
    // Note: 'file' is undefined here -> Upload happens after creation
    const lecture = await createLecture({
      name: lectureName.trim(),
      description: lectureDescription.trim(), // Can append Duration/Type here if backend model is limited
      file: undefined,
      courseId: courseId ?? undefined,
    });

    if (lecture) {
      toast.success("Thêm bài giảng thành công! Hãy tải video lên.");
      setShowLectureModal(false);
    }
  };

  const handleVideoChange = (lectureId: string, file: File | null) => {
    setVideoFiles((prev) => ({ ...prev, [lectureId]: file }));
  };

  const handleUploadVideo = async (lectureId: string) => {
    const file = videoFiles[lectureId];
    if (!file) {
      toast.error("Vui lòng chọn video trước khi tải lên.");
      return;
    }
    const updatedLecture = await uploadLectureVideo(lectureId, file);
    if (updatedLecture) {
      setVideoFiles((prev) => ({ ...prev, [lectureId]: null }));
    }
  };

  const handleStartEdit = (lectureId: string) => {
    const l = lectures.find((x) => x.id === lectureId);
    if (!l) return;
    setEditingLectureId(lectureId);
    setEditingName(l.name);
    setEditingDescription(l.description);
  };

  const handleCancelEdit = () => {
    setEditingLectureId(null);
    setEditingName("");
    setEditingDescription("");
  };

  const handleSaveEdit = async (lectureId: string) => {
    if (!editingName.trim() || !editingDescription.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bài giảng.");
      return;
    }
    const updated = await editLecture(lectureId, { name: editingName.trim(), description: editingDescription.trim() });
    if (updated) {
      handleCancelEdit();
    }
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài giảng này?")) return;
    await deleteLecture(lectureId);
    toast.success("Đã xóa bài giảng");
  };

  const toggleChapter = (id: string) => {
      setExpandedChapters(prev => ({...prev, [id]: !prev[id]}));
  };

  // Simple filter for demo: If multiple chapters existed, filter lectures by chapterId
  const getLecturesForChapter = (chapId: string) => {
      // Logic: return lectures.filter(l => l.chapterId === chapId)
      // Fallback for demo: show all lectures in the first/default chapter
      return lectures; 
  };

  if (loadingCourse) {
    return <InstructorLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#5a2dff]" /></div></InstructorLayout>;
  }

  if (!courseId || !course) {
    return <InstructorLayout><div>Không tìm thấy khóa học</div></InstructorLayout>;
  }

  return (
    <InstructorLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => navigate("/instructor?tab=courses")} className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> Quay lại khóa học
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{course?.name}</h1>
          </div>
          <button
            onClick={() => setShowChapterModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4b24cc]"
          >
            <PlusCircle size={18} /> Thêm Chương mới
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
            {chapters.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 text-center">
                    <LayoutList className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Chưa có nội dung. Hãy thêm chương đầu tiên.</p>
                </div>
            )}

            {chapters.map((chapter) => (
                <div key={chapter.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* Chapter Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => toggleChapter(chapter.id)} className="text-gray-400 hover:text-gray-600">
                                {expandedChapters[chapter.id] ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                            </button>
                            <div>
                                <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                                {chapter.description && <p className="text-xs text-gray-500">{chapter.description}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => openAddLectureModal(chapter.id)}
                                className="flex items-center gap-1 rounded border border-[#5a2dff] bg-white px-3 py-1.5 text-xs font-medium text-[#5a2dff] hover:bg-[#5a2dff] hover:text-white transition-colors"
                             >
                                <PlusCircle size={14} /> Thêm bài học
                             </button>
                             <button className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                             <button className="p-1.5 text-gray-400 hover:text-red-500"><Trash size={16}/></button>
                        </div>
                    </div>

                    {/* Chapter Lessons */}
                    {expandedChapters[chapter.id] && (
                        <div className="p-4 bg-white">
                            {getLecturesForChapter(chapter.id).length === 0 ? (
                                <p className="text-center text-sm text-gray-400 py-2">Chưa có bài học nào trong chương này.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {getLecturesForChapter(chapter.id).map((lecture, index) => {
                                        const isUploading = Boolean(uploadingLectureIds[lecture.id]);
                                        const selectedFile = videoFiles[lecture.id];
                                        const isEditing = editingLectureId === lecture.id;

                                        return (
                                            <li key={lecture.id} className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 hover:shadow-md md:flex-row md:items-center">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                    <Video size={20} />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 items-center">
                                                            <input value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-1 text-sm border rounded px-2 py-1"/>
                                                            <button onClick={() => handleSaveEdit(lecture.id)} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Lưu</button>
                                                            <button onClick={handleCancelEdit} className="border text-xs px-2 py-1 rounded">Hủy</button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">Lesson {index + 1}: {lecture.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                {lecture.videoUrl ? (
                                                                    <span className="text-green-600 flex items-center gap-1"><UploadCloud size={12}/> Video Available</span>
                                                                ) : (
                                                                    <span className="text-amber-600">No content</span>
                                                                )}
                                                                <span>• Video Content</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Upload Section (Moved here from creation) */}
                                                <div className="flex items-center gap-3">
                                                    {!lecture.videoUrl || selectedFile ? (
                                                        <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-100">
                                                            {selectedFile ? (
                                                                <>
                                                                    <span className="max-w-[100px] truncate text-xs text-gray-700">{selectedFile.name}</span>
                                                                    <button onClick={() => handleUploadVideo(lecture.id)} className="text-xs font-bold text-[#5a2dff] hover:underline">
                                                                        {isUploading ? "Uploading..." : "Upload"}
                                                                    </button>
                                                                    <button onClick={() => handleVideoChange(lecture.id, null)}><X size={12}/></button>
                                                                </>
                                                            ) : (
                                                                <label className="cursor-pointer text-xs font-medium text-gray-500 hover:text-[#5a2dff]">
                                                                    {lecture.videoUrl ? "Change Video" : "Upload Video"}
                                                                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(lecture.id, e.target.files?.[0] ?? null)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                    
                                                    <div className="flex gap-1 border-l pl-2 ml-2">
                                                        <button onClick={() => handleStartEdit(lecture.id)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={14}/></button>
                                                        <button onClick={() => handleDeleteLecture(lecture.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash size={14}/></button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* --- MODAL: Add Chapter (UI Fixed) --- */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-md rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Chương Mới</h3>
                 <button onClick={() => setShowChapterModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleCreateChapter} className="p-6 space-y-4">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề chương</label>
                    <input autoFocus value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" placeholder="Ví dụ: Giới thiệu về React"/>
                 </div>
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                    <textarea value={newChapterDesc} onChange={e => setNewChapterDesc(e.target.value)} rows={3}
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" placeholder="Mô tả nội dung chương"/>
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowChapterModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">Thêm chương</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* --- MODAL: Add Lesson (UI video removed) --- */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Bài Học Mới</h3>
                 <button onClick={() => setShowLectureModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleCreateLecture} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề bài học</label>
                    <input autoFocus value={lectureName} onChange={e => setLectureName(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" placeholder="Tên bài học..."/>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Loại bài học</label>
                        <select value={lectureType} onChange={e => setLectureType(e.target.value)} 
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff]">
                            <option value="Video">Video</option>
                            <option value="Quiz">Bài tập</option>
                            <option value="Doc">Tài liệu</option>
                        </select>
                     </div>
                     <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Thời lượng</label>
                        <input value={lectureDuration} onChange={e => setLectureDuration(e.target.value)} 
                               className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff]" placeholder="VD: 10:00"/>
                     </div>
                 </div>
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                    <textarea value={lectureDescription} onChange={e => setLectureDescription(e.target.value)} rows={3}
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" placeholder="Mô tả nội dung bài học"/>
                 </div>
                 
                 <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                    <p>💡 Bạn sẽ có thể tải video hoặc tài liệu lên sau khi tạo bài học thành công.</p>
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                    <button type="button" onClick={() => setShowLectureModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button type="submit" disabled={isCreating} className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                        {isCreating && <Loader2 className="h-4 w-4 animate-spin"/>} Thêm bài học
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
