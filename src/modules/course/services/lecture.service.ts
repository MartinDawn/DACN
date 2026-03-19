import apiClient from "../../auth/services/apiClient";
import type { ApiResponse, GetVideoApiResponse } from '../models/course';

// Type for video URL response - can be string or object with videoUrl
export type VideoUrlResponse = string | {
  videoUrl?: string;
  url?: string;
  link?: string;
  filePath?: string;
  data?: {
    videoUrl?: string;
    url?: string;
  };
};

export const lectureService = {
  /**
   * Lấy URL phát video từ API.
   * GET /api/Lecture/get-video/{videoId}
   */
  async getVideoUrl(videoId: string): Promise<ApiResponse<VideoUrlResponse>> {
    const response = await apiClient.get<ApiResponse<VideoUrlResponse>>(
      `/Lecture/get-video/${videoId}`
    );
    return response.data;
  },

  /**
   * Lấy thông tin video và khóa học từ API get-video
   * Trả về toàn bộ course detail bao gồm danh sách videos
   */
  async getVideoDetail(videoId: string): Promise<ApiResponse<GetVideoApiResponse>> {
    const response = await apiClient.get<ApiResponse<GetVideoApiResponse>>(
      `/Lecture/get-video/${videoId}`
    );
    return response.data;
  },

  /**
   * Tìm và trả về URL của video cụ thể từ response của get-video API
   */
  async getSpecificVideoUrl(videoId: string, videoName: string): Promise<string | null> {
    try {
      const response = await this.getVideoDetail(videoId);

      if (!response.success || !response.data) {
        return null;
      }

      // Duyệt qua tất cả lectures để tìm video
      for (const lecture of response.data.lectures) {
        for (const video of lecture.videos) {
          // Tìm video theo tên hoặc display order
          if (video.name === videoName && video.videoUrl && video.isTrial) {
            return video.videoUrl;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting specific video URL:', error);
      return null;
    }
  },

  /**
   * Lấy URL tài liệu từ API.
   * GET /api/Lecture/get-document/{documentId}
   */
  async getDocumentUrl(documentId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.get<ApiResponse<unknown>>(
      `/Lecture/get-document/${documentId}`
    );
    return response.data;
  },
};
