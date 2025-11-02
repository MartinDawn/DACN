import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card2";

// Chỉ import hook cho LỌC
import { useCoursesFilter } from "./hooks/useCoursesFilter"; 
import type { FilterParams, CourseSearchItem } from './models/course';

type SortOption = "popularity" | "rating" | "newest" | "priceasc" | "pricedesc";

const priceLimit = 5_000_000;
const currencyFormatter = new Intl.NumberFormat("vi-VN");

const ViewAllCourse: React.FC = () => {
  // 1. Bỏ logic search (searchTerm, isSearchMode)

  // 2. State cho bộ lọc
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(priceLimit);
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  
  // 3. State cho phân trang
  const [page, setPage] = useState(1);

  // 4. Khởi tạo CHỈ hook LỌC
  const {
    courses: filteredCourses,
    pagination: filterPagination,
    coursesLoading: filterLoading,
    coursesError: filterError,
    tags,
    tagsLoading,
    tagsError,
    fetchFilteredCourses,
  } = useCoursesFilter();
  

  const isLoading = filterLoading;
  const error = filterError;
  const courses: CourseSearchItem[] = filteredCourses as CourseSearchItem[];
  const pagination = filterPagination;

  // 7. useEffect để reset trang
  useEffect(() => {
    // Khi người dùng thay đổi bộ lọc, reset về trang 1
    setPage(1); 
  }, [selectedTagId, maxPrice, sortOption]); 

  // 8. useEffect để gọi API 
  useEffect(() => {

    const params: FilterParams = {
      SortBy: sortOption,
      TagId: selectedTagId === "all" ? undefined : selectedTagId,
      MinPrice: 0,
      MaxPrice: maxPrice === priceLimit ? undefined : maxPrice,
      Page: page,
      PageSize: 10,
    };
    fetchFilteredCourses(params);
  }, [
    page, 
    fetchFilteredCourses, 
    selectedTagId, 
    maxPrice, 
    sortOption,
    priceLimit
  ]); 

  const resetFilters = () => {
    setSelectedTagId("all");
    setMaxPrice(priceLimit);
    setSortOption("popularity");
    setPage(1);
  };

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

        {/* 10. Layout 2 cột CỐ ĐỊNH */}
        <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
          
          {/* 11. Sidebar LỌC luôn hiển thị */}
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
                  <button
                    type="button"
                    onClick={() => setSelectedTagId("all")}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedTagId === "all"
                        ? "bg-[#05001a] text-white shadow-[0_10px_30px_rgba(5,0,26,0.25)]"
                        : "text-gray-700 hover:bg-[#f3f4fb]"
                    }`}
                  >
                    Tất cả
                  </button>
                  {tagsLoading ? (
                    <p className="p-2 text-sm text-gray-400">Đang tải...</p>
                  ) : tagsError ? (
                    <p className="p-2 text-sm text-red-500">{tagsError}</p>
                  ) : (
                    tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTagId(tag.id)}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          selectedTagId === tag.id
                            ? "bg-[#05001a] text-white shadow-[0_10px_30px_rgba(5,0,26,0.25)]"
                            : "text-gray-700 hover:bg-[#f3f4fb]"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Khoảng giá</p>
              <div className="space-y-3">
                <input
                  type="range"
                  min={0}
                  max={priceLimit}
                  step={100000}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e7e9f5]"
                />
                <p className="text-right text-sm font-semibold text-gray-600">Tối đa: {formattedMaxPrice}</p>
              </div>
            </div>
            {/* --- Kết thúc <aside> --- */}
          </aside>

          {/* 12. PHẦN HIỂN THỊ KẾT QUẢ */}
          <section className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                {/* 13. Tiêu đề CỐ ĐỊNH */}
                <h1 className="text-3xl font-bold text-gray-900">Tất cả khóa học</h1>
                <p className="text-sm text-gray-500">
                  {pagination?.totalCount ?? 0} khóa học được tìm thấy
                </p>
              </div>
              
              {/* 14. SẮP XẾP luôn hiển thị */}
              <div className="relative w-full sm:w-56">
                <select
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as SortOption)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#e4e6f1] bg-white px-4 text-sm font-semibold text-gray-600 outline-none transition hover:border-[#d6d7e4] focus:border-[#5a2dff] focus:text-[#5a2dff]"
                >
                  <option value="popularity">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="priceasc">Giá thấp đến cao</option>
                  <option value="pricedesc">Giá cao đến thấp</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">▼</span>
              </div>
            </div>

            {/* 15. Logic render kết quả (dùng chung) */}
            {isLoading ? (
              <div className="text-center p-12 text-lg font-semibold text-gray-500">Đang tải các khóa học...</div>
            ) : error ? (
              <div className="text-center p-12 text-lg font-semibold text-red-500">{error}</div>
            ) : courses.length > 0 ? (
              <div className="space-y-6">
                {courses.map((course) => (
                  <PostCard 
                    key={course.id} 
                    href={`/courses/${course.id}`}
                    title={course.name}
                    instructor={course.instructorName}
                    rating={course.averageRating} 
                    price={`${course.price.toLocaleString()}đ`}
                    image={course.imageUrl}
                    students={`${course.totalStudents} học viên`}
                    duration={`${course.totalHours} giờ`}
                    originalPrice={course.originalPrice ? `${course.originalPrice.toLocaleString()}đ` : ""}
                    ratingCount={`${course.totalReviews}`}
                    description=""
                    badges={course.isBestseller ? ["Bán chạy"] : []}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                {/* 16. Thông báo CỐ ĐỊNH */}
                Không tìm thấy khóa học phù hợp với bộ lọc hiện tại.
              </div>
            )}
            
            {/* 17. Phân Trang */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 text-sm font-semibold">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="rounded-full bg-[#5a2dff] px-5 py-2 text-white shadow-lg shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Trang trước
                </button>
                <span className="text-gray-600">
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="rounded-full bg-[#5a2dff] px-5 py-2 text-white shadow-lg shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Trang sau
                </button>
              </div>
            )}
            
          </section>
        </div>
      </div>
    </UserLayout>
  );
};

export default ViewAllCourse;