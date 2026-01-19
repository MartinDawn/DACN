import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InstructorLayout from "../user/layout/layout";
import { ArrowLeft, Book, Camera, FileText, Lightbulb, UploadCloud, X, List } from "lucide-react";
import { toast } from "react-hot-toast";
import { useInstructorCourses } from "./hooks/useInstructorCourses";
import type { InstructorCourse } from "./models/instructor";

const InstructorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "analytics" | "activity">("overview");
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
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
    setCourses,
    becomeInstructor,
    tags, // Lấy tags từ hook
    tagsLoading, // Lấy trạng thái loading của tags
  } = useInstructorCourses();

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
        toast.error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB");
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
      toast.error("The image field is required.");
      return;
    }

    if (!courseName || !coursePrice || !courseDescription || selectedTagIds.length === 0) { // require at least one category
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc, bao gồm cả danh mục.");
      return;
    }

    const formData = new FormData();
    formData.append("Name", courseName);
    formData.append("Description", courseDescription);
    formData.append("Price", Number(coursePrice).toString());
    // Append each selected tag id as separate FormData entries (backend often accepts repeated keys)
    selectedTagIds.forEach((id) => formData.append("TagIds", id));
    if (courseImage) {
      formData.append("Image", courseImage);
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
      navigate(`/instructor/courses/manage/${createdCourse.id}`);
      setShowCreateCourseForm(false);
      return;
    }

    // Fallback: result === null hoặc không có id -> không tự động điều hướng,
    // giữ form mở để người dùng có thể xem thông báo từ hook hoặc thử lại.
    return;
  };

  const handleBecomeInstructor = async () => {
    await becomeInstructor();
    // Optionally, you can refetch user data or update UI state here
  };

  if (showCreateCourseForm) {
    return (
      <InstructorLayout>
        <div className="mx-auto max-w-4xl">
          <button onClick={() => setShowCreateCourseForm(false)} className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} />
            Quay lại
          </button>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Tạo Khóa Học Mới</h1>
            <p className="mt-2 text-sm text-gray-500">Nhập thông tin cơ bản để bắt đầu</p>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <FileText className="text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">Thông Tin Khóa Học</h3>
              </div>
              <p className="mt-1 ml-9 text-sm text-gray-500">Sau khi tạo khóa học, bạn có thể thêm chương, bài học và video trong phần quản lý khóa học</p>

              <div className="mt-6 space-y-6">
                {/* Tên Khóa Học */}
                <div>
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Book size={16} /> Tên Khóa Học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Ví dụ: Khóa học React Toàn Diện"
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Danh mục Khóa Học */}
                <div>
                  <label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <List size={16} /> Danh Mục Khóa Học <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 mb-3 flex flex-wrap gap-2">
                    {selectedTagIds.map((id) => {
                      const t = tags.find((x) => x.id === id);
                      return (
                        <span key={id} className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-semibold text-[#2a1aef]">
                          <span>{t?.name ?? id}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTagIds((prev) => prev.filter((x) => x !== id))}
                            className="text-xs font-bold text-[#5a2dff] opacity-80 hover:opacity-100"
                            aria-label={`Xóa danh mục ${t?.name ?? id}`}
                          >
                            ×
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
                    <option value="">{tagsLoading ? "Đang tải danh mục..." : "-- Thêm danh mục --"}</option>
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
                    <span className="font-bold">$</span> Giá Khóa Học (VND) <span className="text-red-500">*</span>
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
                    placeholder="Ví dụ: 1999000 (nhập 0 nếu miễn phí)"
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    min="0"
                    step="1"
                  />
                </div>

                {/* Mô Tả Khóa Học */}
                <div>
                  <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText size={16} /> Mô Tả Khóa Học <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về nội dung và mục tiêu của khóa học..."
                    className="mt-2 block w-full rounded-lg border-gray-200 bg-gray-50 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  ></textarea>
                  <p className="mt-2 text-xs text-gray-500">Mô tả rõ ràng về những gì học viên sẽ học được trong khóa học</p>
                </div>

                {/* Ảnh Hiển Thị */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Camera size={16} /> Ảnh Hiển Thị Khóa Học <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Xem trước" className="h-48 w-auto rounded-md object-cover" />
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
                        <p className="mt-2 text-sm text-gray-600">Tải ảnh hiển thị khóa học lên</p>
                        <p className="text-xs text-gray-500">Khuyến nghị: 1280x720px, JPG hoặc PNG, tối đa 5MB</p>
                        <label htmlFor="image-upload" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                          <UploadCloud size={16} />
                          Chọn Ảnh
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
                  <h4 className="font-semibold text-gray-800">Lưu ý</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                    <li>Sau khi tạo khóa học, bạn sẽ được chuyển đến trang quản lý khóa học</li>
                    <li>Tại đó bạn có thể thêm chương, bài học và upload video</li>
                    <li>Bạn có thể chỉnh sửa thông tin khóa học bất cứ lúc nào</li>
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
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-[#5a2dff] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Book size={16} />
                {isSubmitting ? "Đang tạo..." : "Tạo Khóa Học"}
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
          <h1 className="text-3xl font-bold text-gray-900">Bảng Điều Khiển Giảng Viên</h1>
          <p className="mt-2 text-sm text-gray-500">Quản lý khóa học và theo dõi hiệu suất của bạn.</p>
        </div>
        <div className="pt-2">
          <button 
            onClick={() => setShowCreateCourseForm(true)}
            className="rounded-full bg-[#5a2dff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5a2dff]/20 transition hover:-translate-y-0.5 hover:bg-[#4a21eb]">
            Tạo Khóa Học Mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        {/* đổi inline-flex -> flex và thêm mx-auto để căn giữa */}
        <div className="flex w-full max-w-2xl rounded-full bg-gray-100 p-1 mx-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "overview" ? "bg-white text-[#5a2dff] shadow" : "text-gray-500 hover:text-[#5a2dff]"
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "courses" ? "bg-white text-[#5a2dff] shadow" : "text-gray-500 hover:text-[#5a2dff]"
            }`}
          >
            Khóa Học
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "analytics" ? "bg-white text-[#5a2dff] shadow" : "text-gray-500 hover:text-[#5a2dff]"
            }`}
          >
            Phân Tích
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "activity" ? "bg-white text-[#5a2dff] shadow" : "text-gray-500 hover:text-[#5a2dff]"
            }`}
          >
            Hoạt Động
          </button>
        </div>
      </div>

      {/* Nội dung theo tab */}
      {activeTab === "overview" && (
        <>
          {/* Overview cards */}
          <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <p className="text-sm font-semibold text-gray-500">Tổng Học Viên</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">2,669</p>
              <p className="mt-1 text-xs text-green-500">+12% so với tháng trước</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <p className="text-sm font-semibold text-gray-500">Tổng Doanh Thu</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">48,720,000đ</p>
              <p className="mt-1 text-xs text-green-500">+8% so với tháng trước</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <p className="text-sm font-semibold text-gray-500">Đánh Giá TB</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">4.7 ⭐</p>
              <p className="mt-1 text-xs text-green-500">+0.2 so với tháng trước</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
              <p className="text-sm font-semibold text-gray-500">Khóa Học</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">3</p>
              <p className="mt-1 text-xs text-gray-500">+1 khóa học mới tháng này</p>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">Hành Động Nhanh</h3>
            <p className="mt-1 text-sm text-gray-500">Quản lý khóa học và nội dung của bạn</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <button 
                onClick={() => setShowCreateCourseForm(true)}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff]">Tạo Khóa Học</button>
              <button 
                onClick={handleBecomeInstructor}
                disabled={isSubmitting}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff] disabled:cursor-not-allowed disabled:opacity-50">
                  {isSubmitting ? "Đang xử lý..." : "Đăng ký làm giảng viên"}
              </button>
              <button className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center font-semibold text-gray-700 transition hover:border-[#5a2dff] hover:bg-white hover:text-[#5a2dff]">Kiểm Tra Tin Nhắn</button>
            </div>
          </section>
        </>
      )}

      {activeTab === "activity" && (
        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">Hoạt Động Gần Đây</h3>
            <p className="mt-1 text-sm text-gray-500">Cập nhật hoạt động khóa học của bạn</p>
            <ul className="mt-4 space-y-3">
              <li className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">⭐ Đánh giá 5 sao mới cho khóa học <span className="font-semibold">React Toàn Diện</span>. <span className="text-xs text-gray-400 block">2 giờ trước</span></li>
              <li className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">👥 <span className="font-semibold">25 học viên mới</span> đã đăng ký hôm nay. <span className="text-xs text-gray-400 block">4 giờ trước</span></li>
              <li className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-700">💬 Câu hỏi mới trong phần Q&A của khóa <span className="font-semibold">Thành Thạo JavaScript</span>. <span className="text-xs text-gray-400 block">6 giờ trước</span></li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === "courses" && (
        <section>
          <h3 className="mb-4 text-2xl font-bold">Khóa Học Của Tôi</h3>
          {isLoadingCourses ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : courses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-slate-900/5 transition hover:-translate-y-1">
                  <img src={course.imageUrl || "/placeholder.jpg"} alt={course.name} className="h-48 w-full rounded-t-2xl object-cover" />
                  <div className="p-5">
                    <h4 className="truncate text-base font-semibold" title={course.name}>{course.name}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="font-medium">{course.studentCount || 0} học viên</div>
                      <div className="font-semibold text-amber-500">⭐ {course.averageRating || 0} ({course.ratingCount || 0})</div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => navigate(`/instructor/courses/manage/${course.id}`)}
                        className="flex-1 rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a21eb]">
                          Quản lý
                      </button>
                      <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">Sửa</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Bạn chưa có khóa học nào.</p>
              <button 
                onClick={() => setShowCreateCourseForm(true)}
                className="mt-4 rounded-lg bg-[#5a2dff] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a21eb]">
                Tạo khóa học đầu tiên
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="text-lg font-semibold">Phân Tích Chi Tiết</h3>
            <p className="mt-1 text-sm text-gray-500">Báo cáo nhanh về hiệu suất khóa học.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-sm text-gray-500">Lượt xem tuần này</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">12,345</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
                <p className="mt-2 text-2xl font-bold text-gray-800">3.4%</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </InstructorLayout>
  );
};

export default InstructorDashboard;