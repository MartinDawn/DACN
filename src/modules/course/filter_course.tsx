import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card2";

// Chỉ import hook cho LỌC
import { useCoursesFilter } from "./hooks/useCoursesFilter"; 
import type { FilterParams, MyCourse } from './models/course'; 

// interface CourseWithRating extends MyCourse {
//   averageRating?: number; // Thêm thuộc tính này
// }

type SortOption = "popularity" | "rating" | "newest" | "priceasc" | "pricedesc";

const priceLimit = 5_000_000;
const currencyFormatter = new Intl.NumberFormat("vi-VN");

const ViewAllCourse: React.FC = () => {
  // 2. State cho bộ lọc - SỬA THÀNH MẢNG (string[])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]); // Mặc định rỗng là "Tất cả"
  const [maxPrice, setMaxPrice] = useState<number>(priceLimit);
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  
  // 3. State cho phân trang
  const [page, setPage] = useState(1);

  // 4. Khởi tạo hook
  const {
    courses: rawCourses,
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
  const courses = rawCourses as MyCourse[]; 
  const pagination = filterPagination;

  // 5. Hàm xử lý chọn Tag (Logic Multi-select)
  const toggleTag = (tagId: string) => {
    setPage(1); // Reset trang khi đổi filter
    setSelectedTagIds(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId); // Bỏ chọn nếu đã có
      } else {
        return [...prev, tagId]; // Thêm vào nếu chưa có
      }
    });
  };

  const clearTags = () => {
    setPage(1);
    setSelectedTagIds([]); // Về rỗng (Tất cả)
  };

  // 6. useEffect reset trang khi đổi giá hoặc sort
  useEffect(() => {
    setPage(1); 
  }, [maxPrice, sortOption]); 

  // 7. Gọi API với mảng TagId
  useEffect(() => {
    const params: FilterParams = {
      SortBy: sortOption,
      // Truyền trực tiếp mảng selectedTagIds (nếu rỗng thì là undefined để lấy tất cả)
      TagId: selectedTagIds.length > 0 ? selectedTagIds : undefined, 
      MinPrice: 0,
      MaxPrice: maxPrice === priceLimit ? undefined : maxPrice,
      Page: page,
      PageSize: 10,
    };
    fetchFilteredCourses(params);
  }, [
    page, 
    fetchFilteredCourses, 
    selectedTagIds, // Phụ thuộc vào mảng tag
    maxPrice, 
    sortOption,
    priceLimit
  ]); 

  const resetFilters = () => {
    setSelectedTagIds([]);
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

        <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
          
          {/* Sidebar LỌC */}
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
                    onClick={clearTags}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      selectedTagIds.length === 0
                        ? "bg-[#05001a] text-white shadow-[0_10px_30px_rgba(5,0,26,0.25)]"
                        : "text-gray-700 hover:bg-[#f3f4fb]"
                    }`}
                  >
                    Tất cả
                  </button>

                  {/* Danh sách Tags (Multi-select) */}
                  {tagsLoading ? (
                    <p className="p-2 text-sm text-gray-400">Đang tải...</p>
                  ) : tagsError ? (
                    <p className="p-2 text-sm text-red-500">{tagsError}</p>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                            isSelected
                              ? "bg-[#5a2dff] text-white shadow-[0_10px_30px_rgba(90,45,255,0.3)]"
                              : "text-gray-700 hover:bg-[#f3f4fb]"
                          }`}
                        >
                          <span>{tag.name}</span>
                          {isSelected && <span>✓</span>} 
                        </button>
                      );
                    })
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
          </aside>

          {/* Kết quả */}
          <section className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tất cả khóa học</h1>
                <p className="text-sm text-gray-500">
                  {pagination?.totalCount ?? 0} khóa học được tìm thấy
                </p>
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
                    
                    // 8. SỬ DỤNG averageRating (có thể undefined nếu API chưa trả về, nên fallback về 0)
                    rating={course.averageRating || course.rating || 0} 
                    
                    price={`${currencyFormatter.format(course.price)}đ`}
                    image={course.imageUrl || "https://via.placeholder.com/300x200"}
                    students={`${course.totalStudents || 0} học viên`}
                    duration={`${course.totalHours || 0} giờ`}
                    originalPrice={course.originalPrice ? `${currencyFormatter.format(course.originalPrice)}đ` : undefined}
                    ratingCount="0" 
                    description=""
                    badges={[]}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Không tìm thấy khóa học phù hợp với bộ lọc hiện tại.
              </div>
            )}
            
            {/* Phân Trang */}
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