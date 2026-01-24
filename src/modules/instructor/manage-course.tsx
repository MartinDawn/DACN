import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, PlusCircle, Video, UploadCloud, Loader2, X, Trash, Edit2, LayoutList } from "lucide-react";
import { toast } from "react-hot-toast";
import InstructorLayout from "../user/layout/layout";
import { useCourseLectures } from "./hooks/useCourseLectures";
import { instructorService } from "./services/instructor.service";
import type { InstructorCourse } from "./models/instructor";

const ManageCoursePage: React.FC = () => {
  const params = useParams();
  const courseId = (params as any).courseId ?? (params as any).id ?? (params as any).course ?? undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const stateCourse = (location.state as any)?.course as InstructorCourse | undefined;

  const [course, setCourse] = useState<InstructorCourse | null>(stateCourse ?? null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  // --- Lecture States ---
  const [showLectureModal, setShowLectureModal] = useState(false);

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

  const { lectures, fetchLectures, isCreating, uploadingLectureIds, createLecture, uploadLectureVideo, editLecture, deleteLecture, lecturesLoading } =
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
  
  const handleManageCourse = () => {
    fetchLectures(); // Fetch lectures when managing the course
    navigate("/instructor?tab=courses");
  };

  // --- Handlers ---

  const handleCreateLecture = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lectureName.trim()) {
      toast.error("Vui lòng nhập tên bài giảng.");
      return;
    }
    
    const lecture = await createLecture({
      name: lectureName.trim(),
      description: lectureDescription.trim(),
      file: undefined,
      courseId: courseId ?? undefined,
    });

    if (lecture) {
      toast.success("Thêm bài giảng thành công! Hãy tải video lên.");
      setLectureName("");
      setLectureDescription("");
      setShowLectureModal(false);
      handleManageCourse();
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
    await uploadLectureVideo(lectureId, file);
    setVideoFiles((prev) => ({ ...prev, [lectureId]: null }));
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
            <button onClick={handleManageCourse} className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeft size={16} /> Quay lại khóa học
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{course?.name}</h1>
          </div>
          <button
            onClick={() => setShowLectureModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4b24cc]"
          >
            <PlusCircle size={18} /> Thêm Bài Giảng
          </button>
        </div>

        {/* Content Area: List of Lectures */}
        <div className="space-y-6">
            {lecturesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#5a2dff]" />
              </div>
            ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 text-center">
                    <LayoutList className="mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Chưa có nội dung. Hãy thêm bài giảng đầu tiên.</p>
                </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">Danh sách bài giảng</h3>
                     <ul className="space-y-3">
                        {lectures.map((lecture, index) => {
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
                                                <input value={editingName} onChange={e => setEditingName(e.target.value)} className="flex-1 text-sm border rounded px-2 py-1" placeholder="Tên bài giảng"/>
                                                <input value={editingDescription} onChange={e => setEditingDescription(e.target.value)} className="flex-1 text-sm border rounded px-2 py-1" placeholder="Mô tả"/>
                                                <button onClick={() => handleSaveEdit(lecture.id)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded">Lưu</button>
                                                <button onClick={handleCancelEdit} className="border text-xs px-3 py-1.5 rounded">Hủy</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    {lecture.chapterName && (
                                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                                                            {lecture.chapterName}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-medium">Bài {index + 1}: {lecture.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {lecture.videoUrl ? (
                                                        <span className="text-green-600 flex items-center gap-1 font-semibold"><UploadCloud size={12}/> Đã có Video</span>
                                                    ) : (
                                                        <span className="text-amber-600">Chưa có video</span>
                                                    )}
                                                    {lecture.description && <span>• {lecture.description}</span>}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Upload & Actions */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-100">
                                            {selectedFile ? (
                                                <>
                                                    <span className="max-w-[100px] truncate text-xs text-gray-700">{selectedFile.name}</span>
                                                    <button onClick={() => handleUploadVideo(lecture.id)} className="text-xs font-bold text-[#5a2dff] hover:underline" disabled={isUploading}>
                                                        {isUploading ? <Loader2 className="animate-spin h-3 w-3"/> : "Upload"}
                                                    </button>
                                                    <button onClick={() => handleVideoChange(lecture.id, null)}><X size={12}/></button>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer text-xs font-medium text-gray-500 hover:text-[#5a2dff] flex items-center gap-1">
                                                    {lecture.videoUrl ? "Đổi Video" : "Tải Video Lên"}
                                                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoChange(lecture.id, e.target.files?.[0] ?? null)} />
                                                </label>
                                            )}
                                        </div>
                                        

                                        <div className="flex gap-1 border-l pl-2 ml-2">
                                            <button onClick={() => handleStartEdit(lecture.id)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit2 size={14}/></button>
                                            <button onClick={() => handleDeleteLecture(lecture.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash size={14}/></button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                     </ul>
                </div>
            )}
        </div>
      </div>

      {/* --- MODAL: Add Lesson (Used to be Add Chapter) --- */}
      {showLectureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="w-full max-w-lg rounded-xl bg-white shadow-xl animate-in fade-in zoom-in-95">
              <div className="border-b px-6 py-4 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Thêm Bài Giảng Mới</h3>
                 <button onClick={() => setShowLectureModal(false)}><X className="text-gray-400"/></button>
              </div>
              <form onSubmit={handleCreateLecture} className="p-6 space-y-5">
                 <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Tiêu đề bài giảng</label>
                    <input autoFocus value={lectureName} onChange={e => setLectureName(e.target.value)} 
                           className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5a2dff] focus:ring-1 focus:ring-[#5a2dff]" placeholder="Tên bài giảng..."/>
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
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Thời lượng (dự kiến)</label>
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
                    <p>💡 Sau khi tạo bài giảng, bạn có thể tải video lên trong danh sách bài giảng.</p>
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t mt-2">
                    <button type="button" onClick={() => setShowLectureModal(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">Hủy</button>
                    <button type="submit" disabled={isCreating} className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-4 py-2 text-sm font-medium text-white hover:bg-[#4b24cc]">
                        {isCreating && <Loader2 className="h-4 w-4 animate-spin"/>} Lưu bài giảng
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
