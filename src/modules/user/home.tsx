import React from "react";
import {
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card";

const stats = [
  { label: "Khóa học", value: "0", accent: "text-[#5a2dff]" },
  { label: "Hoàn thành", value: "0", accent: "text-emerald-500" },
  { label: "Thời gian học", value: "0.0h", accent: "text-sky-500" },
  { label: "Chứng chỉ", value: "0", accent: "text-amber-500" },
];

const quickActions = [
  {
    title: "My Learning",
    description: "Các khóa học bạn đã đăng ký",
    icon: BookOpenIcon,
  },
  {
    title: "Browse Courses",
    description: "Khám phá thư viện khóa học",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Categories",
    description: "Chọn chủ đề bạn quan tâm",
    icon: Squares2X2Icon,
  },
  {
    title: "Teach",
    description: "Chia sẻ kiến thức của bạn",
    icon: UserGroupIcon,
  },
];

const recommendedCourses = [
  {
    title: "Complete React Developer Course 2024",
    instructor: "Nguyễn Văn A",
    rating: 4.8,
    students: "45,821",
    price: "599,000₫",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Python cho Người Mới Bắt Đầu",
    instructor: "Trần Thị B",
    rating: 4.9,
    students: "32,154",
    price: "449,000₫",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Digital Marketing Mastery 2024",
    instructor: "Lê Văn C",
    rating: 4.7,
    students: "28,743",
    price: "699,000₫",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
  },
];

const UserHome: React.FC = () => (
  <UserLayout>
    <div className="space-y-8">
      <section className="rounded-4xl bg-white p-8 shadow-[0_28px_60px_rgba(90,90,140,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#efe7ff] text-2xl font-semibold text-[#5a2dff]">
              T
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Chào mừng trở lại, trieuphung3922!
              </h1>
              <p className="text-sm text-gray-500">
                Tiếp tục hành trình học tập của bạn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]">
              <ArrowTrendingUpIcon className="h-5 w-5" />
              Xem báo cáo
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]">
              Tiếp tục học
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-gray-100 bg-gray-50/70 px-5 py-4 text-center"
            >
              <div className={`text-xl font-semibold ${item.accent}`}>{item.value}</div>
              <div className="mt-1 text-sm font-medium text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex w-full items-center justify-between rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-500">
          <span className="rounded-full bg-white px-6 py-2 text-[#5a2dff] shadow">Tổng quan</span>
          <span className="px-6 py-2">Khóa học của tôi</span>
          <span className="px-6 py-2">Thành tích</span>
        </div>
      </section>

      <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">
              Các hành động nhanh để tiếp tục học tập
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                className="flex h-full flex-col items-start gap-4 rounded-3xl border border-gray-100 bg-gray-50/70 p-5 text-left transition hover:-translate-y-1 hover:border-[#5a2dff] hover:bg-white"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow">
                  <Icon className="h-6 w-6 text-[#5a2dff]" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{action.title}</div>
                  <p className="mt-1 text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-4xl bg-white p-10 text-center shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <TrophyIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">Bạn chưa đăng ký khóa học nào</h3>
        <p className="mt-2 text-sm text-gray-500">
          Khám phá thư viện khóa học phong phú để bắt đầu hành trình học tập.
        </p>
        <button className="mt-6 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-700">
          Khám phá khóa học
        </button>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Khóa học đề xuất</h2>
            <p className="text-sm text-gray-500">Dựa trên sở thích của bạn</p>
          </div>
          <button className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]">
            Xem tất cả
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <PostCard key={course.title} {...course} />
          ))}
        </div>
      </section>
    </div>
  </UserLayout>
);

export default UserHome;
