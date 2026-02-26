import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from '../models/course';

export const lectureService = {
  /**
   * Lấy URL phát video từ API.
   * GET /api/Lecture/get-video/{videoId}
   */
  async getVideoUrl(videoId: string): Promise<ApiResponse<string>> {
    const response = await apiClient.get<ApiResponse<string>>(
      `/Lecture/get-video/${videoId}`
    );
    return response.data;
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
