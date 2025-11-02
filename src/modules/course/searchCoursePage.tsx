import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import PostCard from "./components/post_card2.tsx";

// Chỉ import hook cho Search
import { useCourseSearch } from "./hooks/useCourseSearch"; 
import type { CourseSearchItem } from './models/course';

const SearchPage: React.FC = () => {
  // 1. Lấy từ khóa tìm kiếm từ URL
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search"); // Kiểu: string | null

  // 2. State cho phân trang
  const [page, setPage] = useState(1);

  // 3. Khởi tạo HOOK TÌM KIẾM
  const {
    searchResults,
    pagination,
    isLoading,
    error,
    fetchSearchResults,
  } = useCourseSearch();

  // 4. Lấy dữ liệu
  const courses: CourseSearchItem[] = searchResults;

  // === SỬA LỖI LOGIC: GỘP LẠI CÒN 1 USEEFFECT ===

  // useEffect 1: Reset 'page' về 1 KHI 'searchTerm' thay đổi
  useEffect(() => {
    // Khi người dùng gõ tìm kiếm mới, chúng ta muốn quay về trang 1
    setPage(1); 
  }, [searchTerm]); // Chỉ phụ thuộc vào searchTerm

  // useEffect 2: Gọi API KHI 'searchTerm' hoặc 'page' thay đổi
  useEffect(() => {
    // Chỉ gọi API nếu có từ khóa tìm kiếm
    if (searchTerm) {
      console.log(`Fetching API for term: "${searchTerm}", page: ${page}`);
      fetchSearchResults({
        searchTerm: searchTerm,
        page: page,
        pageSize: 10, 
      });
    }
  }, [searchTerm, page, fetchSearchResults]); // Phụ thuộc vào cả 3

  // === KẾT THÚC SỬA LỖI ===

  // 7. Render UI
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

        {/* Layout 1 cột đơn giản */}
        <div className="grid grid-cols-1 gap-10">
          
          {/* PHẦN HIỂN THỊ KẾT QUẢ */}
          <section className="space-y-8">
            
            {/* Tiêu đề trang */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kết quả tìm kiếm</h1>
                {searchTerm ? (
                  <p className="text-sm text-gray-500">
                    Tìm thấy {pagination?.totalCount ?? 0} khóa học cho "{searchTerm}"
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Vui lòng nhập từ khóa vào thanh tìm kiếm để bắt đầu.
                  </p>
                )}
              </div>
            </div>

            {/* Logic render kết quả */}
            {isLoading ? (
              <div className="text-center p-12 text-lg font-semibold text-gray-500">Đang tìm kiếm...</div>
            ) : error ? (
              <div className="text-center p-12 text-lg font-semibold text-red-500">{error}</div>
            ) : !searchTerm ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Hãy bắt đầu tìm kiếm khóa học bạn quan tâm.
              </div>
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
                Không tìm thấy khóa học nào cho từ khóa "{searchTerm}".
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
                  {/* Dùng pagination.page để đảm bảo hiển thị đúng trang từ API */}
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

export default SearchPage;