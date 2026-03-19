import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  HeartIcon,
  LanguageIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/20/solid";
import UserLayout from "../user/layout/layout";
import { useCourses } from "./hooks/useCourses.ts";
import { useCart } from "../user/hooks/useCart";
import { cartService } from "../user/services/cart.service";
import { toast } from "react-hot-toast"; // 1. Import toast đã có
import { lectureService } from "./services/lecture.service";

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "curriculum", label: "Chương trình học" },
  { id: "reviews", label: "Đánh giá" },
] as const;

const DetailCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const {
    getCourseDetail,
    getCourseComments,
    courseDetail,
    courseComments,
    isDetailLoading,
    isCommentsLoading,
    detailError,
    commentsError
  } = useCourses();

  const { cart, refreshCart } = useCart();

  const [isAdding, setIsAdding] = useState(false);

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("overview");

  // State cho video preview
  const [previewVideo, setPreviewVideo] = useState<{ id: string; name: string; url: string } | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    if (courseId) {
      getCourseDetail(courseId).catch(console.error);
      getCourseComments(courseId).catch(console.error);
    }
  }, [courseId, getCourseDetail, getCourseComments]);

  const isInCart = useMemo(() => {
    if (!cart || !courseId) return false;

    return cart.items.some(item => item.id === courseId || item.id === courseId);
  }, [cart, courseId]);

  const handleAddToCart = useCallback(async () => {
    if (!courseId || isInCart) return;

    setIsAdding(true);
    try {
      const response = await cartService.addCourseToCart(courseId);
      if (response.success) {
        toast.success("Đã thêm vào giỏ hàng thành công!");
        refreshCart();
      } else {
        toast.error(response.message || "Thêm vào giỏ hàng thất bại.");
      }
    } catch (err) {
      toast.error("Lỗi: Không thể kết nối đến máy chủ.");
    } finally {
      setIsAdding(false);
    }
  }, [courseId, isInCart, refreshCart]);

  const handlePreviewVideo = useCallback(async (videoId: string, videoName: string) => {
    setIsLoadingVideo(true);
    try {
      // Đầu tiên kiểm tra xem video đã có URL sẵn trong courseDetail chưa
      if (courseDetail?.lectures) {
        for (const lecture of courseDetail.lectures) {
          const video = lecture.videos.find(v => v.id === videoId && v.isTrial);
          if (video && video.videoUrl) {
            setPreviewVideo({ id: videoId, name: videoName, url: video.videoUrl });
            setIsLoadingVideo(false);
            return;
          }
        }
      }

      // Nếu không có URL sẵn, gọi API để lấy
      const videoUrl = await lectureService.getSpecificVideoUrl(courseId || '', videoName);

      if (videoUrl) {
        setPreviewVideo({ id: videoId, name: videoName, url: videoUrl });
      } else {
        toast.error("Video này không khả dụng để xem thử hoặc chưa có URL");
      }
    } catch (error) {
      toast.error("Lỗi khi tải video");
      console.error(error);
    } finally {
      setIsLoadingVideo(false);
    }
  }, [courseId, courseDetail]);

  const closePreviewVideo = useCallback(() => {
    setPreviewVideo(null);
  }, []);

  // Effect để xử lý phím ESC cho video preview modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewVideo) {
        closePreviewVideo();
      }
    };

    if (previewVideo) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [previewVideo, closePreviewVideo]);

  return (
    <UserLayout>

      <div className="space-y-8">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại khóa học
        </Link>

        {/* 6. THAY ĐỔI: Dùng state `isDetailLoading` và `detailError` */}
        {isDetailLoading && <div className="text-center p-12">Đang tải...</div>}
        {detailError && <div className="text-center p-12 text-red-500">{detailError}</div>}
        
        {!isDetailLoading && !detailError && courseDetail && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
            <section className="space-y-10">
              
              {/* Header */}
              <header className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <h1 className="text-4xl font-bold text-gray-900">{courseDetail.name}</h1>
                <p className="text-lg text-gray-600">{courseDetail.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <StarIcon className="h-5 w-5" />
                    <span className="font-semibold text-gray-900">{courseDetail.rating?.toFixed(1)}</span>
                    <span>({courseDetail.totalReviews} đánh giá)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5" />
                    {courseDetail.totalStudents} học viên
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5" />
                    {courseDetail.totalHours} giờ
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={courseDetail.instructorAvatar || "https://placehold.co/100"}
                    alt={courseDetail.instructorName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm text-gray-500">Giảng viên</p>
                    <p className="text-base font-semibold text-gray-900">{courseDetail.instructorName}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[28px]">
                  <img
                    src={courseDetail.imageUrl || "https://placehold.co/800x450"}
                    alt={courseDetail.name}
                    className="h-64 w-full object-cover"
                  />
                </div>
              </header>
              
              {/* Tabs Navigation */}
              <nav className="flex flex-wrap gap-3 border-b border-gray-200 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      activeTab === tab.id ? "bg-[#05001a] text-white shadow-[0_12px_30px_rgba(5,0,26,0.25)]" : "text-gray-600 hover:bg-[#f3f4fb]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Tab Content: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Mô tả khóa học */}
                  <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <h2 className="text-xl font-bold text-gray-900">Mô tả khóa học</h2>
                    <div className="mt-6">
                      <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">{courseDetail.description}</p>
                    </div>
                  </div>

                  {/* Bạn sẽ học được gì */}
                  {/* <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <h2 className="text-xl font-bold text-gray-900">Bạn sẽ học được gì</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {courseDetail.learningObjectives?.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 rounded-2xl bg-[#f8f8ff] p-4">
                          <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
                          <p className="text-sm font-semibold text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div> */}
                </div>
              )}

              {/* Tab Content: Curriculum */}
              {activeTab === "curriculum" && (
                <div className="space-y-6">
                  {courseDetail.lectures && courseDetail.lectures.length > 0 ? (
                    courseDetail.lectures.map((lecture) => (
                      <div key={lecture.id} className="rounded-[28px] border border-gray-200 bg-white p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{lecture.name}</h3>
                            {lecture.description && (
                              <p className="text-sm text-gray-500">{lecture.description}</p>
                            )}
                            <p className="text-sm text-gray-400 mt-1">
                              {lecture.videos.length} video{lecture.videos.length > 1 ? 's' : ''} • {' '}
                              {lecture.quizzes?.length || 0} quiz • {' '}
                              {lecture.documents?.length || 0} tài liệu
                            </p>
                          </div>
                        </div>

                        {/* Videos */}
                        {lecture.videos && lecture.videos.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Videos</h4>
                            <ul className="space-y-3">
                              {lecture.videos.map((video) => (
                                <li
                                  key={video.id}
                                  className="flex items-center justify-between gap-2 rounded-2xl bg-[#f8f8ff] p-4"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <PlayCircleIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-gray-700">{video.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')} phút
                                      </p>
                                    </div>
                                  </div>
                                  {video.isTrial && (
                                    <button
                                      onClick={() => handlePreviewVideo(video.id, video.name)}
                                      disabled={isLoadingVideo}
                                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5a2dff] rounded-full hover:bg-[#3c1cd6] transition disabled:opacity-50"
                                    >
                                      Xem thử
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Quizzes */}
                        {lecture.quizzes && lecture.quizzes.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Bài kiểm tra</h4>
                            <ul className="space-y-3">
                              {lecture.quizzes.map((quiz, index) => (
                                <li
                                  key={`${lecture.id}-quiz-${index}`}
                                  className="flex items-center gap-3 rounded-2xl bg-[#f8f8ff] p-4"
                                >
                                  <QuestionMarkCircleIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
                                  <p className="text-sm font-semibold text-gray-700">{quiz.name}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents */}
                        {lecture.documents && lecture.documents.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tài liệu</h4>
                            <ul className="space-y-3">
                              {lecture.documents.map((doc, index) => (
                                <li
                                  key={`${lecture.id}-doc-${index}`}
                                  className="flex items-center gap-3 rounded-2xl bg-[#f8f8ff] p-4"
                                >
                                  <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
                                  <p className="text-sm font-semibold text-gray-700">{doc.name}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                      Chưa có chương trình học nào.
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Reviews */}
              {activeTab === "reviews" && (
                <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  {isCommentsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500 animate-pulse">Đang tải đánh giá...</div>
                    </div>
                  )}

                  {!isCommentsLoading && commentsError && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-red-500">
                      {commentsError}
                    </div>
                  )}

                  {!isCommentsLoading && !commentsError && courseComments.length === 0 && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                      Chưa có đánh giá nào được hiển thị.
                    </div>
                  )}

                  {!isCommentsLoading && !commentsError && courseComments.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Đánh giá từ học viên</h2>
                      <div className="divide-y divide-gray-100">
                        {courseComments.map((comment) => (
                          <div key={comment.commentId} className="py-6">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-gray-600">
                                  {(comment.userName || '?')[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{comment.userName || 'Ẩn danh'}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(comment.timestamp).toLocaleDateString('vi-VN', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  {comment.rate > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                                      {[...Array(5)].map((_, index) => (
                                        <StarIcon
                                          key={`${comment.commentId}-star-${index}`}
                                          className={`h-5 w-5 ${
                                            index < comment.rate ? 'text-yellow-500' : 'text-gray-200'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="mt-3 text-gray-600">{comment.content}</p>
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 space-y-3 border-l-2 border-indigo-100 pl-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.commentId} className="rounded-lg bg-indigo-50 p-3">
                                        <p className="text-xs font-semibold text-indigo-700">Giảng viên phản hồi</p>
                                        <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                                        <p className="mt-1 text-xs text-gray-400">
                                          {new Date(reply.timestamp).toLocaleDateString('vi-VN', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </section>

            {/* Sidebar (Phần giỏ hàng) */}
            <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {courseDetail.price === 0 ? "Miễn phí" : `${courseDetail.price?.toLocaleString()}đ`}
                  </p>
                </div>
                
                <button 
                  className="w-full rounded-full bg-[#5a2dff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c1cd6]">
                  Đăng ký khóa học
                </button>
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding || isInCart}
                  className="w-full rounded-full border border-[#e4e6f1] px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#d6d7e4] hover:bg-[#f7f7fb] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isAdding 
                    ? "Đang thêm..." 
                    : isInCart 
                    ? "Đã có trong giỏ hàng" 
                    : "Thêm vào giỏ hàng"
                  }
                </button>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
                    <HeartIcon className="h-4 w-4" />
                    Yêu thích
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
                    <ShareIcon className="h-4 w-4" />
                    Chia sẻ
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
                    <BookmarkIcon className="h-4 w-4" />
                    Lưu lại
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Khóa học này bao gồm</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
                    <PlayCircleIcon className="h-5 w-5 text-[#5a2dff]" />
                    <span className="font-semibold">{courseDetail.totalHours} giờ video theo yêu cầu</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
                    <DocumentArrowDownIcon className="h-5 w-5 text-[#5a2dff]" />
                    <span className="font-semibold">Tài liệu học tập</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
                    <CheckBadgeIcon className="h-5 w-5 text-[#5a2dff]" />
                    <span className="font-semibold">Chứng chỉ hoàn thành</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
                    <LanguageIcon className="h-5 w-5 text-[#5a2dff]" />
                    <span className="font-semibold">Hỗ trợ trực tuyến</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl bg-[#f6f7ff] p-4 text-sm text-gray-600">
                <p>Kế hoạch học tập đi kèm giúp bạn triển khai kiến thức thực tế.</p>
                <p className="mt-2 font-semibold text-gray-900">Bảo đảm hoàn tiền trong 30 ngày.</p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={closePreviewVideo}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{previewVideo.name}</h3>
              <button
                onClick={closePreviewVideo}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="w-full h-full"
              >
                Trình duyệt của bạn không hỗ trợ phát video.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                Đây là video xem thử. Đăng ký khóa học để xem toàn bộ nội dung.
              </p>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default DetailCourse;