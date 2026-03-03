import apiClient from "../../auth/services/apiClient";
import type {
  ApiResponse,
  ApiQuizAttempt,
  ApiQuizDetail,
  ApiQuizSubmitRequest,
  ApiQuizResult,
  ApiQuizAttemptSummary,
} from '../models/course';

export const quizService = {
  /**
   * Bắt đầu làm quiz — tạo attempt.
   * POST /api/Quiz/{quizId}/attempt
   */
  async startAttempt(quizId: string): Promise<ApiResponse<ApiQuizAttempt>> {
    const response = await apiClient.post<ApiResponse<ApiQuizAttempt>>(
      `/Quiz/${quizId}/attempt`
    );
    return response.data;
  },

  /**
   * Lấy danh sách câu hỏi của quiz.
   * GET /api/Quiz/{quizId}
   */
  async getQuizDetail(quizId: string): Promise<ApiResponse<ApiQuizDetail>> {
    const response = await apiClient.get<ApiResponse<ApiQuizDetail>>(
      `/Quiz/${quizId}`
    );
    return response.data;
  },

  /**
   * Nộp bài quiz.
   * POST /api/Quiz/submit
   */
  async submitQuiz(request: ApiQuizSubmitRequest): Promise<ApiResponse<ApiQuizResult>> {
    const response = await apiClient.post<ApiResponse<ApiQuizResult>>(
      `/Quiz/submit`,
      request
    );
    return response.data;
  },

  /**
   * Lấy kết quả của một lần làm.
   * GET /api/Quiz/attempt/{attemptId}/result
   */
  async getAttemptResult(attemptId: string): Promise<ApiResponse<ApiQuizResult>> {
    const response = await apiClient.get<ApiResponse<ApiQuizResult>>(
      `/Quiz/attempt/${attemptId}/result`
    );
    return response.data;
  },

  /**
   * Lấy lịch sử tất cả các lần làm.
   * GET /api/Quiz/{quizId}/attempts
   */
  async getAttemptHistory(quizId: string): Promise<ApiResponse<ApiQuizAttemptSummary[]>> {
    const response = await apiClient.get<ApiResponse<ApiQuizAttemptSummary[]>>(
      `/Quiz/${quizId}/attempts`
    );
    return response.data;
  },
};
