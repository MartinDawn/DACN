import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
import CheckoutModal from "./components/checkout_modal";

const course = {
  title: "Digital Marketing Mastery 2024",
  description:
    "Chiến lược Digital Marketing toàn diện: SEO, SEM, Social Media, Email và phân tích dữ liệu.",
  rating: 4.7,
  ratingCount: "5,632",
  students: "28,743 học viên",
  duration: "28 giờ",
  lastUpdated: "Cập nhật 04/2024",
  language: "Tiếng Việt",
  subtitles: ["Tiếng Việt"],
  image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80",
  categories: ["Marketing", "Intermediate", "Bán chạy"],
  price: "699,000đ",
  originalPrice: "1,399,000đ",
  discountLabel: "Giảm 50%",
  instructor: {
    name: "Lê Văn C",
    role: "Digital Strategist",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
  },
  learnWhat: [
    "Xây dựng chiến lược marketing đa kênh",
    "Thành thạo SEO và quảng cáo Google",
    "Tối ưu chiến dịch Facebook/Instagram",
    "Đo lường hiệu quả với Google Analytics",
  ],
  stats: [
    { value: "95", label: "Bài học" },
    { value: "28 giờ", label: "Thời lượng" },
    { value: "Intermediate", label: "Cấp độ" },
    { value: "Trọn đời", label: "Truy cập" },
  ],
  benefits: [
    { icon: PlayCircleIcon, text: "28 giờ video theo yêu cầu" },
    { icon: DocumentArrowDownIcon, text: "Template chiến dịch" },
    { icon: CheckBadgeIcon, text: "Chứng chỉ hoàn thành" },
    { icon: LanguageIcon, text: "Hỗ trợ nhóm cộng đồng" },
  ],
  curriculum: [
    {
      title: "Nền tảng Digital Marketing",
      lessons: "12 bài học",
      duration: "1 giờ 40 phút",
      topics: ["Hiểu hành trình khách hàng", "Xây dựng chân dung người mua", "KPI và mục tiêu"],
    },
    {
      title: "Traffic & Acquisition",
      lessons: "16 bài học",
      duration: "2 giờ 30 phút",
      topics: ["SEO thực chiến", "Quảng cáo Google Ads", "Quản lý ngân sách"],
    },
    {
      title: "Conversion & Retention",
      lessons: "18 bài học",
      duration: "3 giờ",
      topics: ["Landing page tối ưu", "Email automation", "Phân tích dữ liệu"],
    },
  ],
};

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "curriculum", label: "Chương trình học" },
  { id: "reviews", label: "Đánh giá" },
] as const;

const CART_STORAGE_KEY = "eduviet_cart";
const CART_SELECTED_KEY = "eduviet_cart_selected";
const courseId = "digital-marketing-mastery-2024";
type StoredCartItem = {
  id: string;
  title: string;
  instructor: string;
  image: string;
  duration: string;
  students: string;
  rating: number;
  ratingCount: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  tag?: string;
  selected?: boolean;
};

const parseCurrencyToNumber = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;

const loadCartFromStorage = (): StoredCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: StoredCartItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const CourseDetail3: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]["id"]>("overview");
  const [isPaymentOpen, setPaymentOpen] = React.useState(false);
  const navigate = useNavigate();

  const ensureCourseInCart = React.useCallback(() => {
    const priceValue = parseCurrencyToNumber(course.price);
    const originalPriceValue = course.originalPrice ? parseCurrencyToNumber(course.originalPrice) : undefined;
    const current = loadCartFromStorage();
    if (current.some((item) => item.id === courseId)) return;
    current.push({
      id: courseId,
      title: course.title,
      instructor: course.instructor.name,
      image: course.image,
      duration: course.duration,
      students: course.students,
      rating: course.rating,
      ratingCount: course.ratingCount,
      price: priceValue,
      originalPrice: originalPriceValue,
      discountPercent:
        originalPriceValue && originalPriceValue > 0
          ? Math.round(((originalPriceValue - priceValue) / originalPriceValue) * 100)
          : undefined,
      tag: course.categories.find((tag) => tag === "Bán chạy") ?? course.categories[0],
      selected: false,
    });
    saveCartToStorage(current);
  }, []);
  const persistSelectedCourse = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const updated = loadCartFromStorage().map((item) => ({
      ...item,
      selected: item.id === courseId,
    }));
    saveCartToStorage(updated);
    window.localStorage.setItem(CART_SELECTED_KEY, JSON.stringify([courseId]));
  }, []);

  const handleAddToCart = React.useCallback(() => {
    ensureCourseInCart();
    navigate("/user/cart");
  }, [ensureCourseInCart, navigate]);

  const handleOpenPayment = React.useCallback(() => setPaymentOpen(true), []);
  const handleProceedPayment = React.useCallback(() => {
    ensureCourseInCart();
    persistSelectedCourse();
    setPaymentOpen(false);
    navigate("/user/cart");
  }, [ensureCourseInCart, navigate, persistSelectedCourse]);

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

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
          <section className="space-y-10">
            <header className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#5a2dff]">
                {course.categories.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#efe7ff] px-3 py-1 text-[#5a2dff]">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="h-5 w-5" />
                  <span className="font-semibold text-gray-900">{course.rating}</span>
                  <span>({course.ratingCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  {course.students}
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  {course.duration}
                </div>
                <span>{course.lastUpdated}</span>
                <span>{course.language}</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <p className="text-sm text-gray-500">{course.instructor.role}</p>
                  <p className="text-base font-semibold text-gray-900">{course.instructor.name}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[28px]">
                <img src={course.image} alt={course.title} className="h-64 w-full object-cover" />
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
                    {course.learnWhat.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8f8ff] p-4">
                        <CheckCircleIcon className="h-5 w-5 text-[#5a2dff]" />
                        <p className="text-sm font-semibold text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  <h2 className="text-xl font-bold text-gray-900">Mô tả khóa học</h2>
                  <p className="mt-4 text-base leading-relaxed text-gray-600">
                    Khóa học giúp bạn làm chủ Digital Marketing bằng cách kết hợp lý thuyết và thực hành. Bạn sẽ tự thiết kế chiến dịch,
                    triển khai và đo lường hiệu quả cho doanh nghiệp hoặc dự án cá nhân.
                  </p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {course.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-[#f7f7fb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#5a2dff]">{stat.value}</p>
                        <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="space-y-6">
                {course.curriculum.map((section) => (
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
                      {section.topics.map((topic) => (
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
              <div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Chưa có đánh giá nào được hiển thị. Hãy là người đầu tiên để lại đánh giá cho khóa học này.
              </div>
            )}
          </section>

          <aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-900">{course.price}</p>
                <p className="text-sm text-gray-400 line-through">{course.originalPrice}</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#ffecef] px-3 py-1 text-xs font-semibold uppercase text-[#ff3d71]">
                {course.discountLabel}
              </span>
              <button
                type="button"
                onClick={handleOpenPayment}
                className="w-full rounded-full bg-[#5a2dff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c1cd6]"
              >
                Đăng ký khóa học
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full rounded-full border border-[#e4e6f1] px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#d6d7e4] hover:bg-[#f7f7fb]"
              >
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
                {course.benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
                    <Icon className="h-5 w-5 text-[#5a2dff]" />
                    <span className="font-semibold">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-[#f6f7ff] p-4 text-sm text-gray-600">
              <p>Kế hoạch học tập đi kèm giúp bạn triển khai chiến dịch thực tế.</p>
              <p className="mt-2 font-semibold text-gray-900">Bảo đảm hoàn tiền 30 ngày.</p>
            </div>
          </aside>
        </div>
      </div>

      {isPaymentOpen && (
        <CheckoutModal
          course={course}
          onClose={() => setPaymentOpen(false)}
          onProceed={handleProceedPayment}
        />
      )}
    </UserLayout>
  );
};

export default CourseDetail3;
