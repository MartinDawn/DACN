import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  SlidersHorizontal,
  Grid3X3,
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  ChevronDown,
  X,
  Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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



  return (
    <UserLayout>
      <div className="space-y-8">
        <Link
          to="/user/home"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition-all duration-300 hover:text-[#3c1cd6] hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t('myCourses.backToHome')}
        </Link>

        <div className="grid gap-10 lg:grid-cols-[280px,1fr]">
          
          {/* Sidebar LỌC */}
          <aside className="space-y-8 rounded-[32px] bg-gradient-to-br from-white to-purple-50/30 border border-purple-100/50 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#5a2dff] to-[#8b5cf6] shadow-lg">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{t('filters.title')}</h2>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="group flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition-all duration-300 hover:text-[#3c1cd6] hover:scale-105"
                >
                  <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  {t('filters.clear')}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <Filter className="h-4 w-4" />
                  <span>{t('filters.category')}</span>
                </div>

                <div className="space-y-3">
                  {/* Nút "Tất cả" */}
                  <button
                    type="button"
                    onClick={clearTags}
                    className={`group w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                      selectedTagIds.length === 0
                        ? "bg-gradient-to-r from-[#1a0b2e] to-[#16082a] text-white shadow-[0_10px_30px_rgba(26,11,46,0.4)]"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        <span>{t('filters.all')}</span>
                      </div>
                      {selectedTagIds.length === 0 && (
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      )}
                    </div>
                  </button>

                  {/* Danh sách Tags (Multi-select) */}
                  {tagsLoading ? (
                    <div className="flex items-center gap-2 p-4 text-sm text-gray-500 bg-gray-50 rounded-2xl">
                      <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common.loading')}</span>
                    </div>
                  ) : tagsError ? (
                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-2xl border border-red-200">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        <span>{tagsError}</span>
                      </div>
                    </div>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`group w-full rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                            isSelected
                              ? "bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white shadow-[0_10px_30px_rgba(90,45,255,0.4)]"
                              : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>{tag.name}</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <DollarSign className="h-4 w-4" />
                <span>{t('filters.priceRange')}</span>
              </div>
              <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-purple-50/50 rounded-2xl border border-gray-200">
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={priceLimit}
                    step={100000}
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r
                      [&::-webkit-slider-thumb]:from-[#5a2dff] [&::-webkit-slider-thumb]:to-[#8b5cf6]
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-125"
                    style={{
                      background: `linear-gradient(to right, #5a2dff 0%, #8b5cf6 ${(maxPrice / priceLimit) * 100}%, #e5e7eb ${(maxPrice / priceLimit) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0đ</span>
                    <span>{`${currencyFormatter.format(priceLimit)}đ`}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Kết quả */}
          <section className="space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between rounded-3xl bg-gradient-to-r from-white to-purple-50/50 border border-purple-100/50 p-6 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#5a2dff] to-[#8b5cf6] shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t('filters.allCourses')}
                  </h1>
                </div>
                <p className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Users className="h-4 w-4 text-[#5a2dff]" />
                  <span className="font-bold text-[#5a2dff]">{pagination?.totalCount ?? 0}</span>
                  <span>{t('filters.coursesFound')}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Sort by:</span>
                </div>
                <div className="relative group">
                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value as SortOption)}
                    className="h-12 w-full min-w-[200px] appearance-none rounded-2xl border-2 border-purple-200 bg-white px-4 pr-10 text-sm font-bold text-gray-700 outline-none transition-all duration-300 hover:border-purple-300 focus:border-[#5a2dff] focus:text-[#5a2dff] focus:shadow-lg focus:shadow-purple-200/50 cursor-pointer"
                  >
                    <option value="popularity">{t('filters.sortOptions.popularity')}</option>
                    <option value="rating">{t('filters.sortOptions.highestRated')}</option>
                    <option value="newest">{t('filters.sortOptions.newest')}</option>
                    <option value="priceasc">{t('filters.sortOptions.priceLowToHigh')}</option>
                    <option value="pricedesc">{t('filters.sortOptions.priceHighToLow')}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 h-5 w-5 text-gray-500 transition-transform duration-300 group-hover:text-[#5a2dff] top-1/2 transform -translate-y-1/2" />

                  {/* Decorative gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#5a2dff]/0 via-[#8b5cf6]/0 to-[#5a2dff]/0 group-hover:from-[#5a2dff]/5 group-hover:via-[#8b5cf6]/5 group-hover:to-[#5a2dff]/5 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center p-12 text-lg font-semibold text-gray-500">{t('filters.loadingCourses')}</div>
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
                    image={course.imageUrl || "https://placehold.co/300x200"}
                    students={`${course.totalStudents || 0} ${t('courseDetail.counts.students')}`}
                    duration={`${course.totalHours || 0} ${t('courseDetail.time.hours')}`}
                    originalPrice={course.originalPrice ? `${currencyFormatter.format(course.originalPrice)}đ` : undefined}
                    ratingCount="0" 
                    description=""
                    badges={[]}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                {t('filters.noCoursesMatch')}
              </div>
            )}

            {/* Phân Trang */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-3xl border border-purple-100/50">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#5a2dff]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  {t('filters.previousPage')}
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-purple-200 shadow-sm">
                  <span className="text-sm font-semibold text-gray-600">
                    {t('filters.page')}
                  </span>
                  <span className="px-2 py-1 bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white font-bold rounded-lg text-sm">
                    {pagination.page}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">/</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm">
                    {pagination.totalPages}
                  </span>
                </div>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#5a2dff]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:scale-100"
                >
                  {t('filters.nextPage')}
                  <ArrowLeft className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
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