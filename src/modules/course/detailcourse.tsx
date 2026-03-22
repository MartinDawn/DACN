import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Heart,
  Globe,
  PlayCircle,
  HelpCircle,
  Share,
  Users,
  X,
} from "lucide-react";
import { Star } from "lucide-react";
import UserLayout from "../user/layout/layout";
import { useCourses } from "./hooks/useCourses.ts";
import { useCart } from "../user/hooks/useCart";
import { cartService } from "../user/services/cart.service";
import { toast } from "react-hot-toast"; // 1. Import toast đã có
import { lectureService } from "./services/lecture.service";
import { EnhancedVideoPreview } from "../shared/components/EnhancedVideoPreview";
import type { EnhancedVideoResponse } from "../admin/models/course";

const DetailCourse: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();

  const tabs = [
    { id: "overview", label: t('common.overview') },
    { id: "curriculum", label: t('navigation.curriculum') },
    { id: "reviews", label: t('course.reviews') },
  ] as const;

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
  const [previewVideo, setPreviewVideo] = useState<EnhancedVideoResponse | null>(null);
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
        toast.success(t('courseDetail.messages.addedToCart'));
        refreshCart();
      } else {
        toast.error(response.message || t('courseDetail.errors.addToCart'));
      }
    } catch (err) {
      toast.error(t('courseDetail.errors.serverError'));
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
            // Tạo mock enhanced response
            setPreviewVideo({
              name: videoName,
              videoUrl: video.videoUrl,
              duration: video.duration || 0,
              analysisResult: {
                summary: '',
                segments: [],
                subtitles: []
              }
            });
            setIsLoadingVideo(false);
            return;
          }
        }
      }

      // Nếu không có URL sẵn, gọi API để lấy dữ liệu video đầy đủ
      const enhancedVideoData = await lectureService.getEnhancedVideoData(videoId);
      
      if (enhancedVideoData) {
        setPreviewVideo(enhancedVideoData);
      } else {
        // Fallback: Thử lấy chỉ URL nếu enhanced data không khả dụng
        const videoUrl = await lectureService.getSpecificVideoUrl(courseId || '', videoName);
        if (videoUrl) {
          setPreviewVideo({
            name: videoName,
            videoUrl: videoUrl,
            duration: 0,
            analysisResult: {
              summary: '',
              segments: [],
              subtitles: []
            }
          });
        } else {
          toast.error(t('courseDetail.messages.videoNotAvailable'));
        }
      }
    } catch (error) {
      toast.error(t('courseDetail.errors.loadVideo'));
      console.error(error);
    } finally {
      setIsLoadingVideo(false);
    }
  }, [courseId, courseDetail, t]);

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
          className="group inline-flex items-center gap-3 text-sm font-semibold text-[#5a2dff] transition-colors hover:text-[#3c1cd6]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t('courseDetail.backToCourses')}
        </Link>

        {/* 6. THAY ĐỔI: Dùng state `isDetailLoading` và `detailError` */}
        {isDetailLoading && <div className="text-center p-12">{t('courseDetail.loading')}</div>}
        {detailError && <div className="text-center p-12 text-red-500">{detailError}</div>}
        
        {!isDetailLoading && !detailError && courseDetail && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
            <section className="space-y-10">
              
              {/* Header */}
              <header className="space-y-6 rounded-[32px] bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] border border-slate-100">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {courseDetail.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">{courseDetail.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{courseDetail.rating?.toFixed(1)}</span>
                    <span className="text-gray-600">({courseDetail.totalReviews} {t('courseDetail.counts.reviews')})</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-600">{courseDetail.totalStudents} {t('courseDetail.counts.students')}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-600">{courseDetail.totalHours} {t('courseDetail.time.hours')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <img
                    src={courseDetail.instructorAvatar || "https://placehold.co/100"}
                    alt={courseDetail.instructorName}
                    className="h-16 w-16 rounded-2xl object-cover shadow-lg border-2 border-white"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('courseDetail.instructor')}</p>
                    <p className="text-lg font-bold text-gray-900">{courseDetail.instructorName}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-[28px] shadow-2xl">
                  <img
                    src={courseDetail.imageUrl || "https://placehold.co/800x450"}
                    alt={courseDetail.name}
                    className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </header>
              
              {/* Tabs Navigation */}
              <nav className="flex flex-wrap gap-3 border-b border-gray-200 pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-[#05001a] text-white shadow-[0_12px_30px_rgba(5,0,26,0.25)] scale-105"
                        : "text-gray-600 hover:bg-[#f3f4fb] hover:scale-105"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute -bottom-4 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#05001a]" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Tab Content: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Mô tả khóa học */}
                  <div className="rounded-[28px] bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] border border-slate-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('courseDetail.description')}</h2>
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
                      <div key={lecture.id} className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{lecture.name}</h3>
                            {lecture.description && (
                              <p className="text-sm text-gray-600 mb-3">{lecture.description}</p>
                            )}
                            <p className="text-sm text-gray-500 font-medium">
                              {lecture.videos.length} video{lecture.videos.length > 1 ? 's' : ''} • {' '}
                              {lecture.quizzes?.length || 0} {t('courseDetail.counts.quiz')} • {' '}
                              {lecture.documents?.length || 0} {t('courseDetail.counts.documents')}
                            </p>
                          </div>
                        </div>

                        {/* Videos */}
                        {lecture.videos && lecture.videos.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <PlayCircle className="h-5 w-5 text-[#5a2dff]" />
                              {t('courseDetail.curriculum.videos')}
                            </h4>
                            <ul className="space-y-3">
                              {lecture.videos.map((video) => (
                                <li
                                  key={video.id}
                                  className="group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#f8f8ff] to-white p-4 border border-slate-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="rounded-full bg-[#5a2dff] p-2 shadow-lg">
                                      <PlayCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-700 truncate min-w-0 group-hover:text-[#5a2dff] transition-colors" title={video.name}>{video.name}</p>
                                      <p className="text-xs text-gray-500 font-medium">
                                        {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')} {t('courseDetail.time.minutes')}
                                      </p>
                                    </div>
                                  </div>
                                  {video.isTrial && (
                                    <button
                                      onClick={() => handlePreviewVideo(video.id, video.name)}
                                      disabled={isLoadingVideo}
                                      className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#5a2dff] to-[#3c1cd6] rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0 hover:scale-105"
                                    >
                                      {isLoadingVideo ? t('common.loading') : t('courseDetail.buttons.preview')}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Quizzes */}
                        {lecture.quizzes && lecture.quizzes.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-[#5a2dff]" />
                              {t('courseDetail.curriculum.tests')}
                            </h4>
                            <ul className="space-y-3">
                              {lecture.quizzes.map((quiz, index) => (
                                <li
                                  key={`${lecture.id}-quiz-${index}`}
                                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f8f8ff] to-white p-4 border border-slate-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                                >
                                  <div className="rounded-full bg-amber-500 p-2 shadow-lg">
                                    <HelpCircle className="h-5 w-5 text-white" />
                                  </div>
                                  <p className="text-sm font-bold text-gray-700">{quiz.name}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Documents */}
                        {lecture.documents && lecture.documents.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <FileText className="h-5 w-5 text-[#5a2dff]" />
                              {t('courseDetail.curriculum.documents')}
                            </h4>
                            <ul className="space-y-3">
                              {lecture.documents.map((doc, index) => (
                                <li
                                  key={`${lecture.id}-doc-${index}`}
                                  className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f8f8ff] to-white p-4 border border-slate-100 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                                >
                                  <div className="rounded-full bg-emerald-500 p-2 shadow-lg">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  <p className="text-sm font-bold text-gray-700">{doc.name}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                      {t('courseDetail.curriculum.empty')}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content: Reviews */}
              {activeTab === "reviews" && (
                <div className="rounded-[28px] bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] border border-slate-100">
                  {isCommentsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500 animate-pulse">{t('courseDetail.reviews.loading')}</div>
                    </div>
                  )}

                  {!isCommentsLoading && commentsError && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-red-500">
                      {commentsError}
                    </div>
                  )}

                  {!isCommentsLoading && !commentsError && courseComments.length === 0 && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                      {t('courseDetail.reviews.empty')}
                    </div>
                  )}

                  {!isCommentsLoading && !commentsError && courseComments.length > 0 && (
                    <div className="space-y-8">
                      <h2 className="text-2xl font-bold text-gray-900">{t('courseDetail.reviews.title')}</h2>
                      <div className="divide-y divide-gray-100">
                        {courseComments.map((comment) => (
                          <div key={comment.commentId} className="py-6">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                                <span className="text-lg font-bold text-indigo-600">
                                  {(comment.userName || '?')[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-bold text-gray-900">{comment.userName || t('courseDetail.reviews.anonymous')}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(comment.timestamp).toLocaleDateString('vi-VN', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  {comment.rate > 0 && (
                                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 flex-shrink-0">
                                      {[...Array(5)].map((_, index) => (
                                        <Star
                                          key={`${comment.commentId}-star-${index}`}
                                          className={`h-4 w-4 ${
                                            index < comment.rate ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="mt-3 text-gray-600 leading-relaxed">{comment.content}</p>
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="mt-4 space-y-3 border-l-4 border-indigo-100 pl-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.commentId} className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-100">
                                        <p className="text-xs font-bold text-indigo-700 mb-2">{t('courseDetail.reviews.instructorReply')}</p>
                                        <p className="text-sm text-gray-700">{reply.content}</p>
                                        <p className="mt-2 text-xs text-gray-400">
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
            <aside className="space-y-6 rounded-[32px] bg-gradient-to-br from-white to-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 border border-slate-100">
              <div className="space-y-6">
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {courseDetail.price === 0 ? t('courseDetail.price.free') : `${courseDetail.price?.toLocaleString()}đ`}
                  </p>
                </div>

                <button className="group w-full rounded-full bg-gradient-to-r from-[#5a2dff] to-[#3c1cd6] px-6 py-4 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#5a2dff]/25 hover:scale-105">
                  {t('courseDetail.buttons.register')}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isInCart}
                  className="group w-full rounded-full border-2 border-[#e4e6f1] px-6 py-4 text-sm font-bold text-gray-700 transition-all duration-200 hover:border-[#5a2dff] hover:bg-[#5a2dff] hover:text-white hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isAdding
                    ? t('courseDetail.buttons.addingToCart')
                    : isInCart
                    ? t('courseDetail.buttons.inCart')
                    : t('courseDetail.buttons.addToCart')
                  }
                </button>
                <div className="flex items-center justify-between text-sm text-gray-500 gap-2">
                  <button className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-4 py-3 transition-all duration-200 hover:border-red-400 hover:text-red-500 hover:scale-105">
                    <Heart className="h-4 w-4 group-hover:fill-current transition-all" />
                    <span className="font-semibold">{t('courseDetail.buttons.favorite')}</span>
                  </button>
                  <button className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-4 py-3 transition-all duration-200 hover:border-blue-400 hover:text-blue-500 hover:scale-105">
                    <Share className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">{t('courseDetail.buttons.share')}</span>
                  </button>
                  <button className="group flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-4 py-3 transition-all duration-200 hover:border-yellow-400 hover:text-yellow-600 hover:scale-105">
                    <Bookmark className="h-4 w-4 group-hover:fill-current transition-all" />
                    <span className="font-semibold">{t('courseDetail.buttons.save')}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('courseDetail.includes.title')}</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-4 border border-indigo-100">
                    <div className="rounded-full bg-[#5a2dff] p-2">
                      <PlayCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-700">{courseDetail.totalHours} {t('courseDetail.time.onDemandVideo')}</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-4 border border-emerald-100">
                    <div className="rounded-full bg-emerald-500 p-2">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-700">{t('courseDetail.includes.learningMaterials')}</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-4 border border-amber-100">
                    <div className="rounded-full bg-amber-500 p-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-700">{t('courseDetail.includes.certificate')}</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-4 border border-blue-100">
                    <div className="rounded-full bg-blue-500 p-2">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-700">{t('courseDetail.includes.onlineSupport')}</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-[#f6f7ff] to-indigo-50 p-6 text-sm border border-indigo-100">
                <p className="text-gray-600 mb-3">{t('courseDetail.guaranteeInfo.studyPlan')}</p>
                <p className="font-bold text-gray-900 text-base">{t('courseDetail.guaranteeInfo.moneyBack')}</p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Video Preview Modal with Enhanced Features (Analysis, Segments, Subtitles) */}
      {previewVideo && (
        <EnhancedVideoPreview
          videoData={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </UserLayout>
  );
};

export default DetailCourse;