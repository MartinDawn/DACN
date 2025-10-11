import React from "react";
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
import { useCourses } from './hooks/useCourses';

const stats = [
  { label: "Khóa học", value: "0", accent: "text-[#5a2dff]" },
  { label: "Hoàn thành", value: "0", accent: "text-emerald-500" },
  { label: "Thời gian học", value: "0.0h", accent: "text-sky-500" },
  { label: "Chứng chỉ", value: "0", accent: "text-amber-500" },
];

const summaryTabs = ["Tổng quan", "Khóa học của tôi", "Thành tích"] as const;
type SummaryTab = (typeof summaryTabs)[number];

type QuickAction = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const achievementStats = [
  { label: "Tổng thời gian học", value: "0.0 giờ" },
  { label: "Khóa học đã đăng ký", value: "0" },
  { label: "Khóa học đã hoàn thành", value: "0" },
  { label: "Tỷ lệ hoàn thành", value: "0%" },
];

const quickActions: QuickAction[] = [
  {
    title: "Khóa học của tôi",
    description: "Các khóa học bạn đã đăng ký",
    icon: BookOpenIcon,
  },
  {
    title: "Duyệt khóa học",
    description: "Khám phá thư viện khóa học phong phú",
    icon: MagnifyingGlassIcon,
  },
  {
    title: "Danh mục",
    description: "Chọn lĩnh vực bạn yêu thích",
    icon: Squares2X2Icon,
  },
  {
    title: "Giảng dạy",
    description: "Bắt đầu trở thành giảng viên",
    icon: UserGroupIcon,
  },
];

const recommendedCourses = [
  {
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de1d25d?auto=format&fit=crop&w=1200&q=80",
    title: "Complete React Developer Course 2024",
    instructor: "Nguyễn Văn A",
    rating: 4.8,
    students: "2.1k học viên",
    price: "599,000đ",
    href: "/courses/complete-react-developer-2024",
  },
  {
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    title: "Python cho Người Mới Bắt Đầu",
    instructor: "Trần Thị B",
    rating: 4.9,
    students: "3.4k học viên",
    price: "449,000đ",
    href: "/courses/python-cho-nguoi-moi-bat-dau",
  },
  {
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    title: "Digital Marketing Mastery 2024",
    instructor: "Lê Văn C",
    rating: 4.7,
    students: "1.9k học viên",
    price: "699,000đ",
    href: "/courses/digital-marketing-mastery-2024",
  },
];

const SummaryTabSwitcher: React.FC<{
  tabs: readonly SummaryTab[];
  activeTab: SummaryTab;
  onChange: (tab: SummaryTab) => void;
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
  const [activeTab, setActiveTab] = React.useState<SummaryTab>(summaryTabs[0]);
  const { recommendedCourses, loading, error } = useCourses();

  return (
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
                  Chào mừng trở lại, username!
                </h1>
                <p className="text-sm text-gray-500">
                  Tiếp tục hành trình học tập của bạn
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, accent }) => (
              <div
                key={label}
                className="rounded-3xl border border-gray-100 bg-gray-50/80 px-5 py-4 text-center"
              >
                <div className={`text-xl font-semibold ${accent}`}>{value}</div>
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

        {activeTab === "Tổng quan" && (
          <>
            <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Hành động nhanh</h2>
                  <p className="text-sm text-gray-500">
                    Các hành động nhanh để tiếp tục học tập
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
                <h2 className="text-lg font-semibold text-gray-900">Tiếp tục học</h2>
                <p className="text-sm text-gray-500">Các khóa học bạn đang theo dõi</p>
              </div>
              <div className="rounded-4xl bg-white p-10 text-center shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <ClockIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Bạn chưa đăng ký khóa học nào
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Bắt đầu khám phá thư viện khóa học phong phú của EduViet ngay hôm nay.
                </p>
                <button
                  type="button"
                  className="mt-6 rounded-full bg-[#5a2dff] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]"
                >
                  Duyệt khóa học
                </button>
              </div>
            </section>
            <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Khóa học đề xuất</h2>
                <p className="text-sm text-gray-500">Dựa trên sở thích của bạn</p>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div className="col-span-full text-center py-8">Đang tải khóa học...</div>
                ) : error ? (
                  <div className="col-span-full text-center text-red-500 py-8">{error}</div>
                ) : recommendedCourses.length === 0 ? (
                  <div className="col-span-full text-center py-8">Không có khóa học đề xuất</div>
                ) : (
                  recommendedCourses.map((course) => (
                    <PostCard
                      key={course.id}
                      image={course.imageUrl || 'https://via.placeholder.com/400x300'}
                      title={course.name}
                      instructor={course.instructorName}
                      rating={course.rating}
                      students="N/A"
                      price={`${course.price.toLocaleString()}đ`}
                      href={`/courses/${course.id}`}
                    />
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === "Khóa học của tôi" && (
          <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Khóa học đã đăng ký</h2>
              <p className="text-sm text-gray-500">Quản lý và theo dõi tiến độ học tập</p>
            </div>
            <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow">
                <BookOpenIcon className="h-10 w-10 text-[#5a2dff]" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Chưa có khóa học nào</h3>
              <p className="mt-2 text-sm text-gray-500">
                Bắt đầu học tập bằng cách đăng ký khóa học đầu tiên của bạn.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full bg-[#5a2dff] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]"
              >
                Khám phá khóa học
              </button>
            </div>
          </section>
        )}

        {activeTab === "Thành tích" && (
          <section className="rounded-4xl bg-white p-8 shadow-[0_24px_56px_rgba(90,90,140,0.08)]">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center">
                <span className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white shadow">
                  <AcademicCapIcon className="h-12 w-12 text-[#5a2dff]" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">Chứng chỉ</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Hoàn thành khóa học đầu tiên để nhận chứng chỉ của bạn.
                </p>
              </div>
              <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-6">
                <h3 className="text-base font-semibold text-gray-900">Thống kê học tập</h3>
                <dl className="mt-6 space-y-4">
                  {achievementStats.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-semibold text-gray-900">{value}</dd>
                    </div>
                  ))}
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
