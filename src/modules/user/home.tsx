import React from "react";
import { useTranslation } from "react-i18next";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card";

import { useCourses } from '../course/hooks/useCourses';
// Sửa đường dẫn này cho đúng với file MyInfo.tsx
import { useUserProfileData } from "../avatar_info/hooks/useUserProfile";

type QuickAction = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SummaryTabSwitcher: React.FC<{
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
}> = ({ tabs, activeTab, onChange }) => (
  <div className="mt-10 grid grid-cols-3 gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-500">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={`rounded-full px-4 py-2 text-center transition ${
          tab === activeTab ? "bg-white text-[#5a2dff] shadow" : "hover:text-[#5a2dff]"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

const UserHome: React.FC = () => {
  const { t } = useTranslation();

  const summaryTabs = [t('home.tabs.overview'), t('home.tabs.myCourses'), t('home.tabs.achievements')];
  const [activeTab, setActiveTab] = React.useState<string>(summaryTabs[0]);

  const quickActions: QuickAction[] = [
    {
      title: t('home.quickActions.myCourses'),
      description: t('home.quickActions.myCoursesDesc'),
      icon: BookOpenIcon,
    },
    {
      title: t('home.quickActions.browseCourses'),
      description: t('home.quickActions.browseCoursesDesc'),
      icon: MagnifyingGlassIcon,
    },
    {
      title: t('home.quickActions.categories'),
      description: t('home.quickActions.categoriesDesc'),
      icon: Squares2X2Icon,
    },
    {
      title: t('home.quickActions.teaching'),
      description: t('home.quickActions.teachingDesc'),
      icon: UserGroupIcon,
    },
  ];

  // GỌI TẤT CẢ DỮ LIỆU TỪ HOOKS
  const {
    myCourses,
    isMyCoursesLoading,
    getMyCourses,
    recommendedCourses,
    isRecommendedLoading,
    getRecommendedCourses,
  } = useCourses();
  
  // 1. SỬA LẠI: Lấy thêm hàm `fetchProfile`
  const { 
    profileData, 
    isLoading: isProfileLoading,
    fetchProfile // <-- Lấy hàm fetch
  } = useUserProfileData();

  // 2. SỬA LẠI: Gọi cả 2 hàm fetch khi component mount
  React.useEffect(() => {
    getMyCourses();
    getRecommendedCourses();
    fetchProfile();
  }, [getMyCourses, getRecommendedCourses, fetchProfile]);

  // TẠO STATS ĐỘNG TỪ DỮ LIỆU HOOKS
  const stats = React.useMemo(() => {
    const defaultStats = [
      { label: t('home.stats.courses'), value: "0", accent: "text-[#5a2dff]" },
      { label: t('home.stats.completed'), value: "0%", accent: "text-emerald-500" },
      { label: t('home.stats.studyTime'), value: "0.0h", accent: "text-sky-500" },
      { label: t('home.stats.certificates'), value: "0", accent: "text-amber-500" },
    ];

    // Bây giờ `profileData` sẽ có dữ liệu
    if (profileData && profileData.stats) {
      return [
        { label: t('home.stats.courses'), value: myCourses.length.toString(), accent: "text-[#5a2dff]" },
        { label: t('home.stats.completed'), value: `${profileData.stats.completionProgress}%`, accent: "text-emerald-500" },
        { label: t('home.stats.studyTime'), value: `${profileData.stats.totalHours}h`, accent: "text-sky-500" },
        { label: t('home.stats.certificates'), value: profileData.stats.totalCertificates.toString(), accent: "text-amber-500" },
      ];
    }
    return defaultStats;
  }, [profileData, myCourses.length]); // Phụ thuộc vào cả 2

  // HÀM RENDER "KHÓA HỌC CỦA TÔI"
  const renderMyCourses = () => {
    if (isMyCoursesLoading) {
      return <div className="text-center py-8">{t('home.loading.courses')}</div>;
    }

    if (myCourses.length === 0) {
      return (
        <div className="rounded-4xl bg-white p-10 text-center shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
            <ClockIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mt-6 text-lg font-semibold text-gray-900">
            {t('home.empty.title')}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {t('home.empty.description')}
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-[#5a2dff] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]"
          >
            {t('home.empty.browseCourses')}
          </button>
        </div>
      );
    }
    
    // Nếu có khóa học
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {myCourses.map((course) => (
          <PostCard
            key={course.id}
            image={course.imageUrl || 'https://placehold.co/400x300'}
            title={course.name}
            instructor={course.instructorName}
            rating={course.rating} // Đã sửa
            students="N/A" 
            price={(course.price || 0) > 0 ? `${course.price.toLocaleString()}đ` : "Miễn phí"} // Đã sửa
            href={`/user/course-progress/${course.id}`} 
          />
        ))}
      </div>
    );
  };
  
  // TẠO THỐNG KÊ THÀNH TÍCH ĐỘNG
  const achievementStats = React.useMemo(() => {
    if (profileData && profileData.stats) {
      return [
        { label: t('home.stats.totalStudyTime'), value: `${profileData.stats.totalHours} ${t('courseDetail.time.hours')}` },
        { label: t('home.stats.enrolledCourses'), value: myCourses.length.toString() },
        { label: t('home.stats.completedCourses'), value: profileData.stats.totalCertificates.toString() },
        { label: t('home.stats.completionRate'), value: `${profileData.stats.completionProgress}%` },
      ];
    }
    return [
      { label: t('home.stats.totalStudyTime'), value: `0.0 ${t('courseDetail.time.hours')}` },
      { label: t('home.stats.enrolledCourses'), value: "0" },
      { label: t('home.stats.completedCourses'), value: "0" },
      { label: t('home.stats.completionRate'), value: "0%" },
    ];
  }, [profileData, myCourses.length, t]);

  // (Phần JSX bên dưới giữ nguyên, nó sẽ tự động cập nhật khi `stats` và `profileData` thay đổi)
  return (
    <UserLayout>
      <div className="space-y-8">
        <section className="rounded-4xl bg-white p-8 shadow-[0_28px_60px_rgba(90,90,140,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              {/* DÙNG DỮ LIỆU THẬT TỪ PROFILE */}
              {profileData?.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt="User Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#efe7ff] text-2xl font-semibold text-[#5a2dff]">
                  {profileData?.fullName ? profileData.fullName.charAt(0).toUpperCase() : (isProfileLoading ? '...' : 'U')}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {t('home.welcomeBack', { name: isProfileLoading ? "..." : (profileData?.fullName || 'bạn') })}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('home.continueJourney')}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* DÙNG STATS ĐỘNG */}
            {stats.map(({ label, value, accent }) => (
              <div
                key={label}
                className="rounded-3xl border border-gray-100 bg-gray-50/80 px-5 py-4 text-center"
              >
                <div className={`text-xl font-semibold ${accent}`}>{isProfileLoading || isMyCoursesLoading ? '...' : value}</div>
                <div className="mt-1 text-sm font-medium text-gray-500">{label}</div>
              </div>
            ))}
          </div>
          <SummaryTabSwitcher
            tabs={summaryTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </section>

        {activeTab === summaryTabs[0] && (
          <>
            <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
              {/* ... (Quick Actions giữ nguyên) ... */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('home.quickActions.title')}</h2>
                  <p className="text-sm text-gray-500">
                    {t('home.quickActions.description')}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map(({ title, description, icon: Icon }) => (
                  <button
                    key={title}
                    type="button"
                    className="flex h-full flex-col items-start gap-4 rounded-3xl border border-gray-100 bg-gray-50/70 p-5 text-left transition hover:-translate-y-1 hover:border-[#5a2dff] hover:bg-white"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow">
                      <Icon className="h-6 w-6 text-[#5a2dff]" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{title}</div>
                      <p className="mt-1 text-xs text-gray-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('home.continueStudying')}</h2>
                <p className="text-sm text-gray-500">{t('home.quickActions.myCoursesDesc')}</p>
              </div>
              {/* SỬ DỤNG HÀM RENDER MỚI */}
              {renderMyCourses()}
            </section>
            
            {/* KHÓA HỌC ĐỀ XUẤT (GIỮ NGUYÊN) */}
            <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('home.recommendations')}</h2>
                <p className="text-sm text-gray-500">{t('home.recommendationDescription')}</p>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {isRecommendedLoading ? (
                  <div className="col-span-full text-center py-8">{t('home.loading.recommendations')}</div>
                ) : recommendedCourses.length === 0 ? (
                  <div className="col-span-full text-center py-8">{t('home.noRecommendations')}</div>
                ) : (
                  recommendedCourses.map((course) => (
                    <PostCard
                      key={course.id}
                      image={course.imageUrl || 'https://placehold.co/400x300'}
                      title={course.name}
                      instructor={course.instructorName}
                      rating={course.rating}
                      students="N/A"
                      price={(course.price || 0) > 0 ? `${course.price.toLocaleString()}đ` : "Miễn phí"}
                      href={`/courses/${course.id}`}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === summaryTabs[1] && (
          <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,99,140,0.08)]">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('home.coursePage.registered')}</h2>
              <p className="text-sm text-gray-500">{t('home.coursePage.manageProgress')}</p>
            </div>
            {/* SỬ DỤNG HÀM RENDER MỚI */}
            <div className="mt-8">
              {renderMyCourses()}
            </div>
          </section>
        )}

        {activeTab === summaryTabs[2] && (
          <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center">
                <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white shadow">
                  <AcademicCapIcon className="h-12 w-12 text-[#5a2dff]" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{t('home.achievements.certificates')}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('home.achievements.certificateDescription')}
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-6">
                <h3 className="text-base font-semibold text-gray-900">{t('home.achievements.learningStats')}</h3>
                {/* DÙNG STATS THÀNH TÍCH ĐỘNG */}
                <dl className="mt-6 space-y-4">
                  {isProfileLoading || isMyCoursesLoading ? ( // Thêm kiểm tra loading
                     <div className="text-sm text-gray-500">{t('home.loading.stats')}</div>
                  ) : (
                    achievementStats.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="font-semibold text-gray-900">{value}</dd>
                      </div>
                    ))
                  )}
                </dl>
              </div>
            </div>
          </section>
        )}
      </div>
    </UserLayout>
  );
};

export default UserHome;