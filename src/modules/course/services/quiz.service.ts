import apiClient from "../../auth/services/apiClient";
import type { ApiResponse, ApiQuizAttempt } from '../models/course';

export const quizService = {
  /**
   * Bắt đầu làm quiz - tạo attempt.
   * POST /api/Quiz/{quizId}/attempt
   * Trả về ApiResponse<ApiQuizAttempt> với data là thông tin quiz và danh sách câu hỏi.
   */
  async startAttempt(quizId: string): Promise<ApiResponse<ApiQuizAttempt>> {
    const response = await apiClient.post<ApiResponse<ApiQuizAttempt>>(
      `/Quiz/${quizId}/attempt`
    );
    return response.data;
  },
};
