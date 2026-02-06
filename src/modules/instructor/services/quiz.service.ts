import apiClient from "../../auth/services/apiClient";
import type { CreateQuizPayload, QuizDetailResponse } from "../models/quiz";

export const quizService = {
  // Create Quiz
  async createQuiz(payload: CreateQuizPayload, lang = "vi"): Promise<any> {
    const response = await apiClient.post<any>("/Quiz/create", payload, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },

  // Get Quiz Detail
  async getQuizById(quizId: string, lang = "vi"): Promise<any> {
    // FIX: Route /Quiz/{id} trả về 405 (Method Not Allowed) nghĩa là Server chỉ map PUT/DELETE cho URL này.
    // Thử gọi action cụ thể theo pattern get-video của Lecture: /Quiz/get-quiz-by-id/{id}
    const response = await apiClient.get<any>(`/Quiz/get-quiz-by-id/${quizId}`, {
      headers: { "Accept-Language": lang },
    });

    const body = response.data;
    // Unwrap { success: true, data: ... } or return body directly
    return body?.data ?? body;
  },

  // Delete Quiz
  async deleteQuiz(quizId: string, lang = "vi"): Promise<any> {
      // Fixed: Use explicit action route
      const response = await apiClient.delete<any>(`/Quiz/delete-quiz/${quizId}`, {
        headers: { "Accept-Language": lang },
      });
      return response.data;
  }
};
