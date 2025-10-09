import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card2";

const categories = [
  "Tất cả",
  "Lập trình",
  "Marketing",
  "Thiết kế",
  "Data Science",
  "Kinh doanh",
  "Ngoại ngữ",
  "Nhiếp ảnh",
] as const;

const levelOptions = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof levelOptions)[number];
type LevelFilter = Level | "all";
type Category = (typeof categories)[number];
type SortOption = "popular" | "topRated" | "newest" | "priceLowToHigh" | "priceHighToLow";
type Course = React.ComponentProps<typeof PostCard> & { createdAt: string };

const courses: Course[] = [
  {
    title: "Complete React Developer Course 2024",
    description:
      "Học React từ cơ bản đến nâng cao. Xây dựng ứng dụng web với Redux, và nhiều công nghệ khác.",
    instructor: "Nguyễn Văn A",
    rating: 4.8,
    ratingCount: "12,547",
    students: "45,821 học viên",
    duration: "42 giờ",
    price: "449,000đ",
    originalPrice: "899,000đ",
    badges: ["Intermediate", "Lập trình", "Bán chạy"],
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-08-01",
    href: "/courses/complete-react-developer-2024",
  },
  {
    title: "Python cho Người Mới Bắt Đầu",
    description:
      "Khóa học Python toàn diện từ cơ bản đến nâng cao. Học lập trình Python qua các dự án thực tế.",
    instructor: "Trần Thị B",
    rating: 4.9,
    ratingCount: "8,945",
    students: "32,154 học viên",
    duration: "35 giờ",
    price: "449,000đ",
    originalPrice: "899,000đ",
    badges: ["Beginner", "Lập trình", "Bán chạy"],
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-09-10",
    href: "/courses/python-cho-nguoi-moi-bat-dau",
  },
  {
    title: "Digital Marketing Mastery 2024",
    description:
      "Khóa học Digital Marketing toàn diện. Học SEO, SEM, Social Media Marketing và Analytics.",
    instructor: "Lê Văn C",
    rating: 4.7,
    ratingCount: "5,632",
    students: "28,743 học viên",
    duration: "28 giờ",
    price: "699,000đ",
    originalPrice: "1,399,000đ",
    badges: ["Intermediate", "Marketing"],
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-06-05",
    href: "/courses/digital-marketing-mastery-2024",
  },
  {
    title: "Node.js Backend Development",
    description:
      "Xây dựng API và ứng dụng backend với Node.js, Express và MongoDB một cách chuyên nghiệp.",
    instructor: "Vũ Minh F",
    rating: 4.8,
    ratingCount: "4,567",
    students: "18,923 học viên",
    duration: "38 giờ",
    price: "649,000đ",
    originalPrice: "1,299,000đ",
    badges: ["Intermediate", "Lập trình", "Bán chạy"],
    image:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-05-20",
    href: "/courses/nodejs-backend-development",
  },
  {
    title: "UI/UX Design với Figma",
    description:
      "Học thiết kế UI/UX chuyên nghiệp với Figma. Từ wireframe đến prototype hoàn chỉnh.",
    instructor: "Phạm Thị D",
    rating: 4.9,
    ratingCount: "3,421",
    students: "15,678 học viên",
    duration: "32 giờ",
    price: "799,000đ",
    originalPrice: "1,599,000đ",
    badges: ["Beginner", "Thiết kế", "Bán chạy"],
    image:
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-07-25",
    href: "/courses/ui-ux-design-voi-figma",
  },
  {
    title: "Data Science với Python",
    description:
      "Khóa học Data Science toàn diện. Học pandas, numpy, matplotlib và machine learning cơ bản.",
    instructor: "Hoàng Văn E",
    rating: 4.6,
    ratingCount: "2,876",
    students: "12,543 học viên",
    duration: "45 giờ",
    price: "899,000đ",
    originalPrice: "1,799,000đ",
    badges: ["Intermediate", "Data Science"],
    image:
      "https://images.unsplash.com/photo-1517148815978-75f6acaaf32c?auto=format&fit=crop&w=1200&q=80",
    createdAt: "2024-03-18",
    href: "/courses/data-science-voi-python",
  },
];

const priceLimit = 2_000_000;
const currencyFormatter = new Intl.NumberFormat("vi-VN");
const priceLimitLabel = `${currencyFormatter.format(priceLimit)}đ`;
const extractNumber = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const parseDurationHours = (duration: string) => {
  const match = duration.match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
};
const getCourseCategory = (course: Course): Category => {
  const badges = course.badges ?? [];
  return (
    (categories.find((category) => category !== "Tất cả" && badges.includes(category)) as Category) ?? "Tất cả"
  );
};
const getCourseLevel = (course: Course): Level => {
  const badges = course.badges ?? [];
  return (levelOptions.find((level) => badges.includes(level)) ?? "Intermediate") as Level;
};

const ViewAllCourse: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<Category>("Tất cả");
  const [selectedLevel, setSelectedLevel] = React.useState<LevelFilter>("all");
  const [maxPrice, setMaxPrice] = React.useState<number>(priceLimit);
  const [onlyOnSale, setOnlyOnSale] = React.useState(false);
  const [shortDurationOnly, setShortDurationOnly] = React.useState(false);
  const [sortOption, setSortOption] = React.useState<SortOption>("popular");

  const resetFilters = () => {
    setSelectedCategory("Tất cả");
    setSelectedLevel("all");
    setMaxPrice(priceLimit);
    setOnlyOnSale(false);
    setShortDurationOnly(false);
    setSortOption("popular");
  };

  const visibleCourses = React.useMemo(() => {
    const filtered = courses.filter((course) => {
      const category = getCourseCategory(course);
      const level = getCourseLevel(course);
      const priceValue = extractNumber(course.price);
      const durationHours = parseDurationHours(course.duration);

      if (selectedCategory !== "Tất cả" && category !== selectedCategory) return false;
      if (selectedLevel !== "all" && level !== selectedLevel) return false;
      if (priceValue > maxPrice) return false;
      if (onlyOnSale && !course.originalPrice) return false;
      if (shortDurationOnly && durationHours > 30) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "topRated":
          return b.rating - a.rating;
        case "newest":
          return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        case "priceLowToHigh":
          return extractNumber(a.price) - extractNumber(b.price);
        case "priceHighToLow":
          return extractNumber(b.price) - extractNumber(a.price);
        default: {
          const byRatingCount = extractNumber(b.ratingCount ?? "0") - extractNumber(a.ratingCount ?? "0");
          return byRatingCount !== 0 ? byRatingCount : b.rating - a.rating;
        }
      }
    });
  }, [selectedCategory, selectedLevel, maxPrice, onlyOnSale, shortDurationOnly, sortOption]);

  const formattedMaxPrice = `${currencyFormatter.format(maxPrice)}đ`;

  return (
    <UserLayout>
      <div className="space-y-8">
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
          <aside className="space-y-10 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
                >
                  Xóa
                </button>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Danh mục</p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedCategory === category
                          ? "bg-[#05001a] text-white shadow-[0_10px_30px_rgba(5,0,26,0.25)]"
                          : "text-gray-700 hover:bg-[#f3f4fb]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cấp độ</p>
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value as LevelFilter)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#e4e6f1] bg-[#f7f7fb] px-4 text-sm font-semibold text-gray-600 outline-none transition hover:border-[#d6d7e4] focus:border-[#5a2dff] focus:bg-white focus:text-[#5a2dff]"
                >
                  <option value="all">Tất cả cấp độ</option>
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▼</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Khoảng giá</p>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0}
                  max={priceLimit}
                  step={50_000}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7e9f5]"
                />
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span>0đ</span>
                  <span>{priceLimitLabel}</span>
                </div>
                <p className="text-right text-sm font-semibold text-gray-600">Tối đa: {formattedMaxPrice}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bộ lọc nâng cao</p>
              <div className="space-y-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={onlyOnSale}
                  onClick={() => setOnlyOnSale((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    onlyOnSale ? "border-[#5a2dff] bg-[#efe7ff] text-[#5a2dff]" : "border-[#e4e6f1] text-gray-600 hover:border-[#d6d7e4]"
                  }`}
                >
                  <span>Đang giảm giá</span>
                  <span className={`inline-flex h-6 w-11 items-center rounded-full ${onlyOnSale ? "justify-end bg-[#5a2dff]" : "justify-start bg-gray-300"}`}>
                    <span className="m-1 h-4 w-4 rounded-full bg-white shadow" />
                  </span>
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={shortDurationOnly}
                  onClick={() => setShortDurationOnly((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    shortDurationOnly ? "border-[#5a2dff] bg-[#efe7ff] text-[#5a2dff]" : "border-[#e4e6f1] text-gray-600 hover:border-[#d6d7e4]"
                  }`}
                >
                  <span>≤ 30 giờ học</span>
                  <span className={`inline-flex h-6 w-11 items-center rounded-full ${shortDurationOnly ? "justify-end bg-[#5a2dff]" : "justify-start bg-gray-300"}`}>
                    <span className="m-1 h-4 w-4 rounded-full bg-white shadow" />
                  </span>
                </button>
              </div>
            </div>
          </aside>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tất cả khóa học</h1>
                <p className="text-sm text-gray-500">{visibleCourses.length} khóa học được tìm thấy</p>
              </div>
              <div className="relative w-full sm:w-56">
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#e4e6f1] bg-white px-4 text-sm font-semibold text-gray-600 outline-none transition hover:border-[#d6d7e4] focus:border-[#5a2dff] focus:text-[#5a2dff]"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="topRated">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="priceLowToHigh">Giá thấp đến cao</option>
                  <option value="priceHighToLow">Giá cao đến thấp</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▼</span>
              </div>
            </div>

            {visibleCourses.length ? (
              <div className="space-y-6">
                {visibleCourses.map(({ createdAt, ...courseProps }) => (
                  <PostCard key={`${courseProps.title}-${createdAt}`} {...courseProps} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Không tìm thấy khóa học phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  );
};

export default ViewAllCourse;

