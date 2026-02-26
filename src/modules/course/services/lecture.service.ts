import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from '../models/course';

export const lectureService = {
  /**
   * Lấy URL phát video từ API.
   * GET /api/Lecture/get-video/{videoId}
   * Trả về ApiResponse<string> với data là URL video.
   */
  async getVideoUrl(videoId: string): Promise<ApiResponse<string>> {
    const response = await apiClient.get<ApiResponse<string>>(
      `/Lecture/get-video/${videoId}`
    );
    return response.data;
  },
};
