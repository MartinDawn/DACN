import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card2"; // Giả sử post_card2 tương thích
import { useCoursesFilter } from "./hooks/useCoursesFilter"; // Import hook mới
import type { FilterParams } from './models/course';

// Định nghĩa kiểu sắp xếp khớp với API và UI
type SortOption = "popularity" | "rating" | "newest" | "priceasc" | "pricedesc";

const priceLimit = 5_000_000; // Tăng giới hạn giá
const currencyFormatter = new Intl.NumberFormat("vi-VN");

const ViewAllCourse: React.FC = () => {
  // State quản lý các giá trị của bộ lọc
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(priceLimit);
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  // Các state khác chưa được API hỗ trợ, tạm thời giữ lại cho UI
  // const [selectedLevel, setSelectedLevel] = React.useState<LevelFilter>("all");
  // const [onlyOnSale, setOnlyOnSale] = React.useState(false);

  // Sử dụng hook mới để lấy dữ liệu
  const {
    courses,
    coursesLoading,
    coursesError,
    tags,
    tagsLoading,
    tagsError,
    fetchFilteredCourses,
  } = useCoursesFilter();
  
  // Effect để gọi lại API mỗi khi bộ lọc thay đổi
  useEffect(() => {
    const params: FilterParams = {
      SortBy: sortOption,
      TagId: selectedTagId === "all" ? undefined : selectedTagId,
      MinPrice: 0,
      MaxPrice: maxPrice === priceLimit ? undefined : maxPrice, // Nếu là max thì không cần gửi
      Page: 1,
      PageSize: 20, // Lấy 20 khóa học mỗi lần
    };
    
    // Gọi hàm fetch từ hook
    fetchFilteredCourses(params);

  }, [selectedTagId, maxPrice, sortOption, fetchFilteredCourses]);


  const resetFilters = () => {
    setSelectedTagId("all");
    setMaxPrice(priceLimit);
    setSortOption("popularity");
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
                  {/* Nút "Tất cả" */}
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
                  {/* Render tags từ API */}
                  {tagsLoading ? <p>Đang tải...</p> : tagsError ? <p className="text-red-500">{tagsError}</p> :
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
                    ))}
                </div>
              </div>
            </div>

            {/* ... Các bộ lọc khác như Cấp độ, Bộ lọc nâng cao có thể giữ lại nhưng sẽ không ảnh hưởng đến API ... */}

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
          </aside>

          <section className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tất cả khóa học</h1>
                <p className="text-sm text-gray-500">{courses.length} khóa học được tìm thấy</p>
              </div>
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

            {coursesLoading ? (
              <div className="text-center p-12">Đang tải các khóa học...</div>
            ) : coursesError ? (
              <div className="text-center p-12 text-red-500">{coursesError}</div>
            ) : courses.length > 0 ? (
              <div className="space-y-6">
                {courses.map((course) => (
                  <PostCard 
                    key={course.id} 
                    href={`/courses/${course.id}`}
                    title={course.name}
                    instructor={course.instructorName}
                    rating={course.rating}
                    price={`${course.price.toLocaleString()}đ`}
                    image={course.imageUrl}
                    // Các props khác của PostCard2 mà API không có, có thể bỏ trống hoặc dùng giá trị mặc định
                    description=""
                    ratingCount=""
                    students=""
                    duration=""
                    originalPrice=""
                    badges={[]}
                  />
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