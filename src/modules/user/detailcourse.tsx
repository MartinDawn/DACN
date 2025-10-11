import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  HeartIcon,
  LanguageIcon,
  PlayCircleIcon,
  ShareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/20/solid";
import UserLayout from "./layout/layout";
import { useCourses } from "./hooks/useCourses";

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
    loading, 
    commentsLoading,
    error,
    commentsError 
  } = useCourses();
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]["id"]>("overview");

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        await getCourseDetail(courseId);
        await getCourseComments(courseId);
      } catch (err) {
        // Error is handled in the hook
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

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

        {loading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-lg animate-pulse">Đang tải thông tin khóa học...</div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        )}
        
        {!loading && !error && !courseDetail && (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-lg text-gray-500">Không tìm thấy thông tin khóa học</div>
          </div>
        )}

        {!loading && !error && courseDetail && (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
            <section className="space-y-10">
              <header className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#5a2dff]">
                  {courseDetail.categories?.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-[#efe7ff] px-3 py-1 text-[#5a2dff]">
                      {tag}
                    </span>
                  ))}
                </div>
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
                    src={courseDetail.instructorAvatar || "https://via.placeholder.com/100"} 
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
                    src={courseDetail.imageUrl || "https://via.placeholder.com/800x450"} 
                    alt={courseDetail.name} 
                    className="h-64 w-full object-cover" 
                  />
                </div>
              </header>

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

              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                    <h2 className="text-xl font-bold text-gray-900">Bạn sẽ học được gì</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {courseDetail.learningObjectives?.map((item: string) => (
                        <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8f8ff] p-4">
                          <CheckCircleIcon className="h-5 w-5 text-[#5a2dff]" />
                          <p className="text-sm font-semibold text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div className="space-y-6">
                  {courseDetail.curriculum?.map((section: any) => (
                    <div key={section.title} className="rounded-[28px] border border-gray-200 bg-white p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                          <p className="text-sm text-gray-500">
                            {section.lessons} • {section.duration}
                          </p>
                        </div>
                      </div>
                      <ul className="mt-4 space-y-3 text-sm text-gray-600">
                        {section.topics?.map((topic: string) => (
                          <li key={topic} className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  {commentsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500 animate-pulse">Đang tải đánh giá...</div>
                    </div>
                  )}

                  {!commentsLoading && commentsError && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-red-500">
                      {commentsError}
                    </div>
                  )}

                  {!commentsLoading && !commentsError && courseComments.length === 0 && (
                    <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                      Chưa có đánh giá nào được hiển thị. Hãy là người đầu tiên để lại đánh giá cho khóa học này.
                    </div>
                  )}

                  {!commentsLoading && !commentsError && courseComments.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Đánh giá từ học viên</h2>
                      <div className="divide-y divide-gray-100">
                        {courseComments.map((comment) => (
                          <div key={comment.commentId} className="py-6">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-lg font-semibold text-gray-600">
                                  {comment.studentName[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-900">{comment.studentName}</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(comment.timestamp).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 text-yellow-500">
                                    {[...Array(5)].map((_, index) => (
                                      <StarIcon
                                        key={index}
                                        className={`h-5 w-5 ${
                                          index < comment.rate ? 'text-yellow-500' : 'text-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="mt-3 text-gray-600">{comment.content}</p>
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

            <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-gray-900">
                    {courseDetail.price === 0 ? "Miễn phí" : `${courseDetail.price?.toLocaleString()}đ`}
                  </p>
                  {courseDetail.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">
                      {courseDetail.originalPrice?.toLocaleString()}đ
                    </p>
                  )}
                </div>
                {courseDetail.discountPercent && (
                  <span className="inline-flex items-center rounded-full bg-[#ffecef] px-3 py-1 text-xs font-semibold uppercase text-[#ff3d71]">
                    Giảm {courseDetail.discountPercent}%
                  </span>
                )}
                <button className="w-full rounded-full bg-[#5a2dff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c1cd6]">
                  Đăng ký khóa học
                </button>
                <button className="w-full rounded-full border border-[#e4e6f1] px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#d6d7e4] hover:bg-[#f7f7fb]">
                  Thêm vào giỏ hàng
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
    </UserLayout>
  );
};

export default DetailCourse;