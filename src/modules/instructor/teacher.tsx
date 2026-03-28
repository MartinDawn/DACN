import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InstructorLayout from "../user/layout/layout";
import {
  ArrowLeft, Book, Camera, FileText, Lightbulb, UploadCloud, X, List,
  LayoutDashboard, BarChart2, Activity, Users, DollarSign, Star,
  MessageSquare, PlusCircle, UserPlus, MessageCircle, Settings, Trash2,
  AlertTriangle, Send, CheckCircle2, Clock, FileEdit
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import { instructorService } from "./services/instructor.service";
import type { InstructorCourse, CourseComment } from "./models/instructor";
import { useRefreshOnLanguageChange } from "../../hooks/useRefreshOnLanguageChange";

const InstructorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "analytics" | "activity">("courses");
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  
  // State for Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; name: string } | null>(null);

  // State for Publish Confirmation Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [courseToPublish, setCourseToPublish] = useState<{ id: string; name: string } | null>(null);

  // State for Course Comments Modal
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedCourseForComments, setSelectedCourseForComments] = useState<{ id: string; name: string } | null>(null);
  const [courseComments, setCourseComments] = useState<CourseComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // State for Delete Reply Confirmation Modal
  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<{ commentId: string; content: string } | null>(null);

  // State for Reply
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // State for Edit Reply
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [coursePrice, setCoursePrice] = useState<number | string>("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // multi-select: selectedTagIds stores chosen ids, selectedTag is the transient select value
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    courses, 
    isLoading: isLoadingCourses, 
    isSubmitting, 
    createCourse,
    deleteCourse,
    setCourses,
    becomeInstructor,
    tags, // Lấy tags từ hook
    tagsLoading, // Lấy trạng thái loading của tags
    fetchCourses, // Thêm fetchCourses từ hook
  } = useInstructorCourses();

  // Auto refresh comments when language changes
  useRefreshOnLanguageChange(() => {
    // Refresh comments if modal is open
    if (showCommentsModal && selectedCourseForComments) {
      const refreshComments = async () => {
        setCommentsLoading(true);
        try {
          const res = await instructorService.getCourseComments(selectedCourseForComments.id);
          const list: CourseComment[] = (res?.data?.allComments ?? []).filter(
            (c) => Number(c.rate) >= 1 && c.isMyComment !== true
          );
          setCourseComments(list);
          const correctRating = list.length > 0
            ? list.reduce((sum, c) => sum + (c.rate || 0), 0) / list.length
            : 0;
          setCourses(prev => prev.map(c => c.id === selectedCourseForComments.id ? { ...c, rating: correctRating } : c));
        } catch (error) {
          console.error('Error refreshing comments on language change:', error);
        } finally {
          setCommentsLoading(false);
        }
      };
      refreshComments();
    }
  }, [showCommentsModal, selectedCourseForComments]);

  const handleRequestPublish = (courseId: string, courseName: string) => {
    setCourseToPublish({ id: courseId, name: courseName });
    setShowPublishModal(true);
  };

  const confirmRequestPublish = async () => {
    if (!courseToPublish) return;

    try {
      await instructorService.requestPublishCourse(courseToPublish.id);
      toast.success(t("instructor.toast.requestPublishSuccess"));
      await fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error(t("instructor.toast.requestPublishError"));
    } finally {
      setShowPublishModal(false);
      setCourseToPublish(null);
    }
  };

  const handleViewComments = async (courseId: string, courseName: string) => {
    setSelectedCourseForComments({ id: courseId, name: courseName });
    setShowCommentsModal(true);
    setCommentsLoading(true);
    setCourseComments([]);
    try {
      const res = await instructorService.getCourseComments(courseId);
      // Chỉ lấy comment của học viên: rate >= 1 VÀ không phải comment của giảng viên
      const list: CourseComment[] = (res?.data?.allComments ?? []).filter(
        (c) => Number(c.rate) >= 1 && c.isMyComment !== true
      );
      setCourseComments(list);
      // Tính average rating chỉ từ đánh giá học viên (loại bỏ hoàn toàn reply của giảng viên)
      const correctRating = list.length > 0
        ? list.reduce((sum, c) => sum + (c.rate || 0), 0) / list.length
        : 0;
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, rating: correctRating } : c));
    } catch (error) {
      console.error(error);
      toast.error(t("instructor.toast.loadRatingError"));
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await instructorService.replyComment(commentId, replyContent.trim());
      toast.success(t("instructor.toast.replySuccess"));
      setReplyingToCommentId(null);
      setReplyContent("");
      if (selectedCourseForComments) {
        const res = await instructorService.getCourseComments(selectedCourseForComments.id);
        // Chỉ lấy comment của học viên: rate >= 1 VÀ không phải comment của giảng viên
        const filtered = (res?.data?.allComments ?? []).filter(
          (c) => Number(c.rate) >= 1 && c.isMyComment !== true
        );
        setCourseComments(filtered);
        // Tính average rating chỉ từ đánh giá học viên (loại bỏ hoàn toàn reply của giảng viên)
        const correctRating = filtered.length > 0
          ? filtered.reduce((sum, c) => sum + (c.rate || 0), 0) / filtered.length
          : 0;
        setCourses(prev => prev.map(c =>
          c.id === selectedCourseForComments.id ? { ...c, rating: correctRating } : c
        ));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("instructor.toast.replyError"));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEditReply = (replyId: string, currentContent: string) => {
    setEditingReplyId(replyId);
    setEditContent(currentContent);
  };

  const handleUpdateReply = async (commentId: string) => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await instructorService.updateComment(commentId, 0, editContent.trim());
      toast.success(t("instructor.toast.updateReplySuccess"));
      setEditingReplyId(null);
      setEditContent("");
      if (selectedCourseForComments) {
        const res = await instructorService.getCourseComments(selectedCourseForComments.id);
        // Chỉ lấy comment của học viên: rate >= 1 VÀ không phải comment của giảng viên
        const filtered = (res?.data?.allComments ?? []).filter(
          (c) => Number(c.rate) >= 1 && c.isMyComment !== true
        );
        setCourseComments(filtered);
        // Tính average rating chỉ từ đánh giá học viên (loại bỏ hoàn toàn reply của giảng viên)
        const correctRating = filtered.length > 0
          ? filtered.reduce((sum, c) => sum + (c.rate || 0), 0) / filtered.length
          : 0;
        setCourses(prev => prev.map(c =>
          c.id === selectedCourseForComments.id ? { ...c, rating: correctRating } : c
        ));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t("instructor.toast.updateReplyError"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteReply = (commentId: string, content: string) => {
    setReplyToDelete({ commentId, content });
    setShowDeleteReplyModal(true);
  };

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;

    try {
      await instructorService.deleteComment(replyToDelete.commentId);
      toast.success(t("instructor.toast.deleteReplySuccess"));

      if (selectedCourseForComments) {
        const res = await instructorService.getCourseComments(selectedCourseForComments.id);
        // Chỉ lấy comment của học viên: rate >= 1 VÀ không phải comment của giảng viên
        const filtered = (res?.data?.allComments ?? []).filter(
          (c) => Number(c.rate) >= 1 && c.isMyComment !== true
        );
        setCourseComments(filtered);
        // Tính average rating chỉ từ đánh giá học viên (loại bỏ hoàn toàn reply của giảng viên)
        const correctRating = filtered.length > 0
          ? filtered.reduce((sum, c) => sum + (c.rate || 0), 0) / filtered.length
          : 0;
        setCourses(prev => prev.map(c =>
          c.id === selectedCourseForComments.id ? { ...c, rating: correctRating } : c
        ));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || t("instructor.toast.deleteReplyError"));
    } finally {
      setShowDeleteReplyModal(false);
      setReplyToDelete(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Đóng modal theo thứ tự ưu tiên (modal trên cùng đóng trước)
        if (showDeleteReplyModal) {
          setShowDeleteReplyModal(false);
          setReplyToDelete(null);
        } else if (showCommentsModal) {
          setShowCommentsModal(false);
          setSelectedCourseForComments(null);
          setReplyingToCommentId(null);
          setReplyContent("");
          setEditingReplyId(null);
          setEditContent("");
        } else if (showDeleteModal) {
          setShowDeleteModal(false);
          setCourseToDelete(null);
        } else if (showPublishModal) {
          setShowPublishModal(false);
          setCourseToPublish(null);
        } else if (showCreateCourseForm) {
          setShowCreateCourseForm(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteModal, showPublishModal, showCreateCourseForm, showCommentsModal, showDeleteReplyModal]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'courses') {
      setActiveTab('courses');
      // Xóa query param khỏi URL để không bị dính lại khi refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // API yêu cầu một CategoryId khi tạo khóa học.
  // TODO: Thay thế bằng danh sách danh mục thật từ API và cho người dùng chọn.
  // BỎ MẢNG CỨNG NÀY
  /*
  const categories = [
    { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", name: "Lập trình Web" },
    { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Lập trình di động" },
    { id: "b2c3d4e5-f6a7-8901-2345-67890abcdef0", name: "Khoa học dữ liệu" },
  ];
  */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("instructor.toast.imageTooLarge"));
        return;
      }
      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseImage) {
      toast.error(t("instructor.toast.selectImage"));
      return;
    }

    // Cho phép giá là 0 (miễn phí), chỉ báo lỗi nếu để trống
    if (!courseName || coursePrice === "" || !courseDescription || selectedTagIds.length === 0) { // require at least one category
      toast.error(t("instructor.toast.fillRequiredFields"));
      return;
    }

    const formData = new FormData();
    // SỬA LỖI: Sử dụng camelCase (chữ thường đầu) bởi vì Backend thường map theo camelCase hoặc case-insensitive
    // Lỗi "The name field is required" gợi ý backend đang tìm key "name"
    formData.append("name", courseName);
    formData.append("description", courseDescription);
    formData.append("price", Number(coursePrice).toString());
    
    // Gửi danh sách tagIds 
    selectedTagIds.forEach((id) => formData.append("tagIds", id));
    
    if (courseImage) {
      // Backend thường yêu cầu tên trường file là image (lowercase)
      formData.append("image", courseImage);
    }

    // CALL hook -> MAY RETURN InstructorCourse | null | { status: 'not-instructor' }
    const result = await createCourse(formData);

    // Nếu backend trả về "not-instructor" -> chỉ dừng lại (hook đã toast), không điều hướng
    if (result && typeof (result as any).status === "string" && (result as any).status === "not-instructor") {
      return;
    }

    // Nếu trả về course có id -> điều hướng tới trang quản lý khóa học mới
    if (result && (result as any).id) {
      const createdCourse = result as InstructorCourse;
      setCourses((prev) => {
        if (prev.some((c) => c.id === createdCourse.id)) return prev;
        return [createdCourse, ...prev];
      });
      navigate(`/instructor/courses/manage/${createdCourse.id}`, { state: { course: createdCourse } });
      setShowCreateCourseForm(false);
      return;
    }

    // Fallback: result === null hoặc không có id -> không tự động điều hướng,
    // giữ form mở để người dùng có thể xem thông báo từ hook hoặc thử lại.
    return;
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    setCourseToDelete({ id: courseId, name: courseName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.id);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  const handleBecomeInstructor = async () => {
    await becomeInstructor();
    // Optionally, you can refetch user data or update UI state here
  };

  if (showCreateCourseForm) {
    return (
      <InstructorLayout>
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => setShowCreateCourseForm(false)}
            className="group mb-8 flex items-center gap-3 text-sm font-semibold text-[#5a2dff] hover:text-[#4a21eb] transition-colors"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            {t("instructor.teacher.backButton")}
          </button>
          <div className="mb-8 rounded-3xl bg-gradient-to-r from-white to-slate-50 p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {t("instructor.teacher.form.title")}
            </h1>
            <p className="text-lg text-gray-600 font-medium">{t("instructor.teacher.form.subtitle")}</p>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-8 shadow-lg shadow-slate-900/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 p-3 border border-indigo-200">
                  <FileText className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{t("instructor.teacher.form.courseInfoTitle")}</h3>
                  <p className="text-sm text-gray-600">{t("instructor.teacher.form.courseInfoSubtitle")}</p>
                </div>
              </div>

              <div className="space-y-8">{/* Tên Khóa Học */}
                <div>
                  <label htmlFor="name" className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                    <div className="rounded-full bg-emerald-100 p-1.5 border border-emerald-200">
                      <Book size={14} className="text-emerald-600" />
                    </div>
                    {t("instructor.teacher.form.courseName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder={t("instructor.teacher.form.courseNamePlaceholder")}
                    className="block w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 hover:border-slate-300"
                  />
                </div>

                {/* Danh mục Khóa Học */}
                <div>
                  <label htmlFor="category" className="flex items-center gap-3 text-sm font-bold text-gray-700 mb-3">
                    <div className="rounded-full bg-purple-100 p-1.5 border border-purple-200">
                      <List size={14} className="text-purple-600" />
                    </div>
                    {t("instructor.teacher.form.courseCategory")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mb-4 flex flex-wrap gap-3">
                    {selectedTagIds.map((id) => {
                      const tagObj = tags.find((x) => x.id === id);
                      return (
                        <span key={id} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#eef2ff] to-indigo-50 px-4 py-2 text-sm font-bold text-[#2a1aef] border border-indigo-200 shadow-sm">
                          <span>{tagObj?.name ?? id}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTagIds((prev) => prev.filter((x) => x !== id))}
                            className="rounded-full bg-white p-1 text-xs font-bold text-[#5a2dff] opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                            aria-label={t("instructor.teacher.form.removeCategoryAriaLabel", { name: tagObj?.name ?? id })}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <select
                    id="category"
                    value={selectedTag}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      setSelectedTagIds((prev) => (prev.includes(val) ? prev : [...prev, val]));
                      setSelectedTag("");
                    }}
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={tagsLoading}
                  >
                    <option value="">{tagsLoading ? t("instructor.teacher.form.categoryLoading") : t("instructor.teacher.form.categoryPlaceholder")}</option>
                    {!tagsLoading &&
                      tags
                        .filter((tag) => !selectedTagIds.includes(tag.id))
                        .map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                  </select>
                </div>

                {/* Giá Khóa Học */}
                <div>
                  <label htmlFor="price" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="font-bold">$</span> {t("instructor.teacher.form.coursePrice")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={coursePrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Chỉ cho phép số nguyên không âm
                      if (value === "" || /^\d+$/.test(value)) {
                        const num = parseInt(value, 10);
                        if (!isNaN(num) && num >= 0) {
                          setCoursePrice(num);
                        } else if (value === "") {
                          setCoursePrice("");
                        }
                      }
                    }}
                    placeholder={t("instructor.teacher.form.coursePricePlaceholder")}
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Mô Tả Khóa Học */}
                <div>
                  <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText size={16} /> {t("instructor.teacher.form.courseDescription")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder={t("instructor.teacher.form.courseDescriptionPlaceholder")}
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-500">{t("instructor.teacher.form.courseDescriptionHelp")}</p>
                </div>

                {/* Ảnh Hiển Thị */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Camera size={16} /> {t("instructor.teacher.form.courseImage")} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt={t("instructor.teacher.form.imagePreview")} className="h-48 w-auto rounded-md object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setCourseImage(null);
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">{t("instructor.teacher.form.imageUploadText")}</p>
                        <p className="text-xs text-gray-500">{t("instructor.teacher.form.imageUploadHelp")}</p>
                        <label htmlFor="image-upload" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                          <UploadCloud size={16} />
                          {t("instructor.teacher.form.selectImage")}
                        </label>
                        <input id="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lưu ý */}
            <div className="rounded-2xl bg-purple-50 p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-1 text-purple-500" />
                <div>
                  <h4 className="font-semibold text-gray-800">{t("instructor.teacher.form.noteTitle")}</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                    <li>{t("instructor.teacher.form.noteItems.afterCreation")}</li>
                    <li>{t("instructor.teacher.form.noteItems.addContent")}</li>
                    <li>{t("instructor.teacher.form.noteItems.editAnytime")}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateCourseForm(false)}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                {t("instructor.teacher.form.cancelButton")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Book size={16} />
                {isSubmitting ? t("instructor.teacher.form.creatingButton") : t("instructor.teacher.form.createButton")}
              </button>
            </div>
          </form>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("instructor.teacher.dashboardTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("instructor.teacher.dashboardSubtitle")}</p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => setShowCreateCourseForm(true)}
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#5a2dff]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95">
            <PlusCircle size={20} className="transition-transform duration-300 group-hover:rotate-90" />
            {t("instructor.teacher.createCourseButton")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex w-full max-w-3xl rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-2 mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab("overview")}
            className={`group flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-white text-[#5a2dff] shadow-lg transform scale-105"
                : "text-gray-600 hover:text-[#5a2dff] hover:bg-white/50 hover:scale-105"
            }`}
          >
            <LayoutDashboard size={16} className={`transition-all duration-300 ${activeTab === "overview" ? "text-[#5a2dff]" : "group-hover:scale-110"}`} />
            {t("instructor.teacher.tabs.overview")}
            {activeTab === "overview" && <div className="absolute inset-0 bg-gradient-to-r from-[#5a2dff]/5 to-[#8b5cf6]/5 rounded-xl" />}
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`group flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "courses"
                ? "bg-white text-[#5a2dff] shadow-lg transform scale-105"
                : "text-gray-600 hover:text-[#5a2dff] hover:bg-white/50 hover:scale-105"
            }`}
          >
            <Book size={16} className={`transition-all duration-300 ${activeTab === "courses" ? "text-[#5a2dff]" : "group-hover:scale-110"}`} />
            {t("instructor.teacher.tabs.courses")}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`group flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "analytics"
                ? "bg-white text-[#5a2dff] shadow-lg transform scale-105"
                : "text-gray-600 hover:text-[#5a2dff] hover:bg-white/50 hover:scale-105"
            }`}
          >
            <BarChart2 size={16} className={`transition-all duration-300 ${activeTab === "analytics" ? "text-[#5a2dff]" : "group-hover:scale-110"}`} />
            {t("instructor.teacher.tabs.analytics")}
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`group flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "activity"
                ? "bg-white text-[#5a2dff] shadow-lg transform scale-105"
                : "text-gray-600 hover:text-[#5a2dff] hover:bg-white/50 hover:scale-105"
            }`}
          >
            <Activity size={16} className={`transition-all duration-300 ${activeTab === "activity" ? "text-[#5a2dff]" : "group-hover:scale-110"}`} />
            {t("instructor.teacher.tabs.activity")}
          </button>
        </div>
      </div>

      {/* Nội dung theo tab */}
      {activeTab === "overview" && (
        <>
          {/* Overview cards */}
          <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-lg border border-blue-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-600">{t("instructor.teacher.overview.totalStudents")}</p>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Users size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0)}</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 group-hover:w-12" />
                  <p className="text-xs font-semibold text-green-600">{t("instructor.teacher.overview.studentGrowth")}</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-lg border border-emerald-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-600">{t("instructor.teacher.overview.totalRevenue")}</p>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <DollarSign size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">{courses.reduce((sum, c) => sum + ((c.price || 0) * (c.totalStudents || 0)), 0).toLocaleString()}đ</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300 group-hover:w-12" />
                  <p className="text-xs font-semibold text-green-600">{t("instructor.teacher.overview.revenueGrowth")}</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-lg border border-amber-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-600">{t("instructor.teacher.overview.averageRating")}</p>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Star size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">{(() => { const ratedCourses = courses.filter(c => (c.rating || 0) > 0); return ratedCourses.length > 0 ? (ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1) : "0.0"; })()}</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 group-hover:w-12" />
                  <p className="text-xs font-semibold text-green-600">{t("instructor.teacher.overview.ratingGrowth")}</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-lg border border-purple-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-600">{t("instructor.teacher.overview.totalCourses")}</p>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Book size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{courses.length}</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300 group-hover:w-12" />
                  <p className="text-xs font-semibold text-gray-600">{t("instructor.teacher.overview.courseGrowth")}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">{t("instructor.teacher.overview.quickActions")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("instructor.teacher.overview.quickActionsSubtitle")}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <button
                onClick={() => setShowCreateCourseForm(true)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff]">
                <div className="rounded-full bg-white p-3 shadow-sm"><PlusCircle size={24} /></div>
                {t("instructor.teacher.overview.createCourseAction")}
              </button>
              <button
                onClick={handleBecomeInstructor}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff] disabled:cursor-not-allowed disabled:opacity-50">
                <div className="rounded-full bg-white p-3 shadow-sm"><UserPlus size={24} /></div>
                  {isSubmitting ? t("instructor.teacher.overview.processingAction") : t("instructor.teacher.overview.becomeInstructorAction")}
              </button>
              <button className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff]">
                <div className="rounded-full bg-white p-3 shadow-sm"><MessageSquare size={24} /></div>
                {t("instructor.teacher.overview.checkMessagesAction")}
              </button>
            </div>
          </section>
        </>
      )}

      {activeTab === "activity" && (
        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">{t("instructor.teacher.activity.title")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("instructor.teacher.activity.subtitle")}</p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">
                <div className="mt-0.5"><Star className="h-5 w-5 text-yellow-500 fill-yellow-500" /></div>
                <div>{t("instructor.teacher.activity.newRating")} <span className="font-semibold">{t("instructor.teacher.activity.sampleCourse1")}</span>. <span className="text-xs text-gray-400 block mt-1">{t("instructor.teacher.activity.hoursAgo2")}</span></div>
              </li>
              <li className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">
                 <div className="mt-0.5"><UserPlus className="h-5 w-5 text-blue-500" /></div>
                 <div><span className="font-semibold">{t("instructor.teacher.activity.newStudents")}</span> {t("instructor.teacher.activity.registeredToday")}. <span className="text-xs text-gray-400 block mt-1">{t("instructor.teacher.activity.hoursAgo4")}</span></div>
              </li>
              <li className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">
                 <div className="mt-0.5"><MessageCircle className="h-5 w-5 text-purple-500" /></div>
                 <div>{t("instructor.teacher.activity.newQuestion")} <span className="font-semibold">{t("instructor.teacher.activity.sampleCourse2")}</span>. <span className="text-xs text-gray-400 block mt-1">{t("instructor.teacher.activity.hoursAgo6")}</span></div>
              </li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === "courses" && (
        <section>
          <h3 className="mb-4 text-2xl font-bold">{t("instructor.teacher.courseList.title")}</h3>
          {isLoadingCourses ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5a2dff] border-r-transparent"></div>
              <p className="mt-4 text-gray-500">{t("instructor.teacher.courseList.loading")}</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="group overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl ring-1 ring-slate-900/5">
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={course.imageUrl || "/placeholder.jpg"}
                      alt={course.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    {/* Status Badge */}
                    {(course.isPublished || course.status === 'Public') ? (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        <CheckCircle2 size={13} />
                        {t("instructor.teacher.courseList.published")}
                      </span>
                    ) : course.status === 'Pending' ? (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        <Clock size={13} />
                        {t("instructor.teacher.courseList.pending")}
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gray-700/80 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        <FileEdit size={13} />
                        {t("instructor.teacher.courseList.draft")}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h4 className="truncate text-lg font-bold text-gray-900" title={course.name}>{course.name}</h4>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">{course.description}</p>
                    
                    <div className="mt-4 flex items-center gap-2">
                      {course.tags && course.tags.length > 0 && (
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          {course.tags[0].name}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <DollarSign size={15} className="text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {course.price === 0 ? t("instructor.teacher.courseList.free") : `${(course.price ?? 0).toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <Users size={16} className="text-gray-400"/>
                        <span>{course.totalStudents ?? 0} {t("instructor.teacher.courseList.students")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(course.rating ?? 0) > 0 ? (
                          <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                            <Star size={16} className="fill-current" />
                            <span>{course.rating!.toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Star size={16} />
                            <span>—</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleViewComments(course.id, course.name)}
                          className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 transition hover:bg-amber-100 active:translate-y-0.5"
                          title={t("instructor.teacher.courseList.viewRatings")}
                        >
                          <MessageSquare size={12} />
                          {t("instructor.teacher.courseList.ratings")}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/instructor/courses/manage/${course.id}`, { state: { course } })}
                        className="flex-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a21eb] active:translate-y-0.5">
                          <Settings size={18} />
                          {t("instructor.teacher.courseList.manage")}
                      </button>

                      {/* Button Request Publish */}
                      {(course.isPublished || course.status === 'Public') ? (
                        <button
                          disabled
                          className="flex items-center justify-center rounded-xl bg-green-100 px-3 py-2.5 text-green-600 cursor-not-allowed"
                          title={t("instructor.teacher.courseList.publishedTooltip")}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      ) : course.status === 'Pending' ? (
                        <button
                          disabled
                          className="flex items-center justify-center rounded-xl bg-amber-100 px-3 py-2.5 text-amber-500 cursor-not-allowed"
                          title={t("instructor.teacher.courseList.pendingTooltip")}
                        >
                          <Clock size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequestPublish(course.id, course.name)}
                          className="flex items-center justify-center rounded-xl bg-green-50 px-3 py-2.5 text-green-600 transition hover:bg-green-100 hover:text-green-700 active:translate-y-0.5"
                          title={t("instructor.teacher.courseList.requestPublishTooltip")}
                        >
                          <Send size={18} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        className="flex items-center justify-center rounded-xl bg-red-50 px-3 py-2.5 text-red-500 transition hover:bg-red-100 hover:text-red-700 active:translate-y-0.5"
                        title={t("instructor.teacher.courseList.deleteTooltip")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Book className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">{t("instructor.teacher.courseList.empty")}</h4>
              <p className="mb-6 text-sm text-gray-500">{t("instructor.teacher.courseList.emptySubtitle")}</p>
              <button
                onClick={() => setShowCreateCourseForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a21eb]"
              >
                <Book size={16} />
                {t("instructor.teacher.courseList.createFirstCourse")}
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">{t("instructor.teacher.analytics.title")}</h3>
            <p className="mt-1 text-sm text-gray-500">{t("instructor.teacher.analytics.subtitle")}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-sm text-gray-500">{t("instructor.teacher.analytics.weeklyViews")}</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">12,345</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-sm text-gray-500">{t("instructor.teacher.analytics.conversionRate")}</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">3.4%</p>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff]">
                <AlertTriangle className="h-8 w-8 text-[#5a2dff]" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{t("instructor.teacher.modals.delete.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("instructor.teacher.modals.delete.message")} <span className="font-semibold text-gray-900">"{courseToDelete?.name}"</span>?
                <br />{t("instructor.teacher.modals.delete.warning")}
              </p>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-[#5a2dff] hover:border-[#5a2dff]"
              >
                {t("instructor.teacher.modals.delete.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4a21eb] hover:shadow-lg hover:shadow-[#5a2dff]/30"
              >
                {t("instructor.teacher.modals.delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reply Confirmation Modal */}
      {showDeleteReplyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff]">
                <AlertTriangle className="h-8 w-8 text-[#5a2dff]" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{t("instructor.teacher.modals.deleteReply.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("instructor.teacher.modals.deleteReply.message")}
                {replyToDelete?.content && (
                  <>
                    <br />
                    <span className="mt-2 inline-block max-w-full truncate rounded-lg bg-gray-100 px-3 py-2 text-xs italic text-gray-700">
                      "{replyToDelete.content.length > 100 ? replyToDelete.content.slice(0, 100) + '...' : replyToDelete.content}"
                    </span>
                  </>
                )}
                <br />{t("instructor.teacher.modals.deleteReply.warning")}
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowDeleteReplyModal(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-[#5a2dff] hover:border-[#5a2dff]"
              >
                {t("instructor.teacher.modals.deleteReply.cancel")}
              </button>
              <button
                onClick={confirmDeleteReply}
                className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4a21eb] hover:shadow-lg hover:shadow-[#5a2dff]/30"
              >
                {t("instructor.teacher.modals.deleteReply.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Request Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff]">
                <Send className="h-8 w-8 text-[#5a2dff]" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{t("instructor.teacher.modals.publish.title")}</h3>
              <p className="text-sm text-gray-500">
                {t("instructor.teacher.modals.publish.message")} <span className="font-semibold text-gray-900">"{courseToPublish?.name}"</span>?
                <br />{t("instructor.teacher.modals.publish.info")}
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-[#5a2dff] hover:border-[#5a2dff]"
              >
                {t("instructor.teacher.modals.publish.cancel")}
              </button>
              <button
                onClick={confirmRequestPublish}
                className="flex-1 rounded-xl bg-[#5a2dff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#4a21eb] hover:shadow-lg hover:shadow-[#5a2dff]/30"
              >
                {t("instructor.teacher.modals.publish.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-all">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t("instructor.teacher.comments.title")}</h3>
                <p className="mt-1 text-sm text-gray-500 truncate max-w-xs">{selectedCourseForComments?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowCommentsModal(false);
                  setReplyingToCommentId(null);
                  setReplyContent("");
                  setEditingReplyId(null);
                  setEditContent("");
                }}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {commentsLoading ? (
                <div className="py-16 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5a2dff] border-r-transparent" />
                  <p className="mt-4 text-sm text-gray-500">{t("instructor.teacher.comments.loading")}</p>
                </div>
              ) : courseComments.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <Star className="h-7 w-7 text-amber-400" />
                  </div>
                  <p className="font-semibold text-gray-700">{t("instructor.teacher.comments.empty")}</p>
                  <p className="mt-1 text-sm text-gray-400">{t("instructor.teacher.comments.emptySubtitle")}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {courseComments.map((c, idx) => (
                    <li key={idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-sm font-bold text-[#5a2dff]">
                          {(c.userName || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {c.userName || t("instructor.teacher.comments.anonymous")}
                            </p>
                            {c.timestamp && (
                              <p className="text-xs text-gray-400">
                                {new Date(c.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                        {Number(c.rate) >= 1 && (
                          <div className="flex shrink-0 items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.round(c.rate!) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {c.content && (
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{c.content}</p>
                      )}
                      {c.replies && c.replies.length > 0 && (
                        <ul className="mt-3 space-y-2 border-l-2 border-[#5a2dff]/20 pl-4">
                          {c.replies.map((reply, rIdx) => (
                            <li key={rIdx} className="rounded-lg border border-gray-100 bg-white p-3">
                              {editingReplyId === reply.commentId ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#5a2dff]">
                                      G
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-900">{t("instructor.teacher.comments.instructor")}</p>
                                      {reply.timestamp && (
                                        <p className="text-xs text-gray-400">
                                          {new Date(reply.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      onKeyDown={(e) => e.key === "Enter" && !editLoading && handleUpdateReply(reply.commentId!)}
                                      placeholder={t("instructor.teacher.comments.editReplyPlaceholder")}
                                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a2dff]/40"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleUpdateReply(reply.commentId!)}
                                      disabled={editLoading || !editContent.trim()}
                                      className="flex items-center gap-1 rounded-lg bg-[#5a2dff] px-3 py-1.5 text-sm text-white transition hover:bg-[#4a1fe0] disabled:opacity-50"
                                    >
                                      <CheckCircle2 size={13} />
                                      {t("instructor.teacher.comments.save")}
                                    </button>
                                    <button
                                      onClick={() => { setEditingReplyId(null); setEditContent(""); }}
                                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100"
                                    >
                                      {t("instructor.teacher.comments.cancel")}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#5a2dff]">
                                        G
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-gray-900">{t("instructor.teacher.comments.instructor")}</p>
                                        {reply.timestamp && (
                                          <p className="text-xs text-gray-400">
                                            {new Date(reply.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEditReply(reply.commentId!, reply.content || "")}
                                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
                                        title={t("instructor.teacher.comments.editReplyTooltip")}
                                      >
                                        <FileEdit size={12} />
                                        {t("instructor.teacher.comments.edit")}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReply(reply.commentId!, reply.content || '')}
                                        className="flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 transition hover:bg-red-50"
                                        title={t("instructor.teacher.comments.deleteReplyTooltip")}
                                      >
                                        <Trash2 size={12} />
                                        {t("instructor.teacher.comments.delete")}
                                      </button>
                                    </div>
                                  </div>
                                  {reply.content && (
                                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{reply.content}</p>
                                  )}
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3">
                        {replyingToCommentId === c.commentId ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && !replyLoading && handleReply(c.commentId!)}
                              placeholder={t("instructor.teacher.comments.replyPlaceholder")}
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5a2dff]/40"
                              autoFocus
                            />
                            <button
                              onClick={() => handleReply(c.commentId!)}
                              disabled={replyLoading || !replyContent.trim()}
                              className="flex items-center gap-1 rounded-lg bg-[#5a2dff] px-3 py-1.5 text-sm text-white transition hover:bg-[#4a1fe0] disabled:opacity-50"
                            >
                              <Send size={13} />
                              {t("instructor.teacher.comments.send")}
                            </button>
                            <button
                              onClick={() => { setReplyingToCommentId(null); setReplyContent(""); }}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100"
                            >
                              {t("instructor.teacher.comments.cancel")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setReplyingToCommentId(c.commentId!); setReplyContent(""); }}
                            className="flex items-center gap-1 text-xs text-[#5a2dff] hover:underline"
                          >
                            <MessageCircle size={13} />
                            {t("instructor.teacher.comments.reply")}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </InstructorLayout>
  );
};

export default InstructorDashboard;