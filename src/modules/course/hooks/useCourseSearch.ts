// src/hooks/useCourseSearch.ts
import { useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { courseService } from "../services/course.service.ts";
import { useRefreshOnLanguageChange } from "../../../hooks/useRefreshOnLanguageChange";
import type { SearchParams, CourseSearchResponse } from "../models/course";

// Kiểu cho toàn bộ đối tượng API trả về
type ApiResponse<T> = {
  success: boolean;
  code?: string;
  message: string;
  data: T;
};

export const useCourseSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State 'data' chỉ nên lưu phần 'data' của response,
  // chính là kiểu 'CourseSearchResponse'
  const [data, setData] = useState<CourseSearchResponse | null>(null);

  // Track last search params for language refresh
  const lastSearchParams = useRef<SearchParams | null>(null);

  const fetchSearchResults = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    lastSearchParams.current = params; // Track search params for refresh
    try {
      // Giả sử courseService.searchCourses trả về toàn bộ đối tượng ApiResponse
      const responseData: ApiResponse<CourseSearchResponse> =
        await courseService.searchCourses(params);

      console.log("Full API Response:", responseData);


      if (responseData && responseData.success) {
        setData(responseData.data);
      } else {
        // Xử lý trường hợp API báo lỗi (ví dụ: success: false)
        const msg = responseData.message || "Có lỗi xảy ra.";
        setError(msg);
        toast.error(msg);
        setData(null); // Đảm bảo data cũ bị xóa
      }
      // === KẾT THÚC SỬA LỖI ===

    } catch (err: any) {
      const msg = err.message || "Không thể tải kết quả tìm kiếm.";
      setError(msg);
      toast.error(msg);
      setData(null); // Đảm bảo data cũ bị xóa
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto refresh on language change
  useRefreshOnLanguageChange(() => {
    if (lastSearchParams.current) {
      fetchSearchResults(lastSearchParams.current);
    }
  });

  return {
    isLoading,
    error,
    searchResults: data?.items ?? [],
    pagination: data, // 'data' giờ đã là đối tượng pagination
    fetchSearchResults,
  };
};