import apiClient from "../../auth/services/apiClient";
import type { CreateQuizPayload, UpdateQuizPayload } from "../models/quiz";

export const quizService = {
  // Create Quiz
  async createQuiz(payload: CreateQuizPayload, lang = "vi"): Promise<any> {
    const response = await apiClient.post<any>("/Quiz/create", payload, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },

  // Update Quiz
  async updateQuiz(quizId: string, payload: UpdateQuizPayload, lang = "vi"): Promise<any> {
    // FIX: Changed from PUT to PATCH as shown in the Swagger screenshot
    const response = await apiClient.patch<any>(`/Quiz/${quizId}`, payload, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },

  // Get Quiz Detail
  async getQuizById(quizId: string, lang = "vi"): Promise<any> {
    // FIX: Switch to standard REST path matching PUT/DELETE (/Quiz/{id}).
    // The previous path /Quiz/get-quiz/{id} caused 404 errors.
    const response = await apiClient.get<any>(`/Quiz/${quizId}`, { //dumemi
      headers: { "Accept-Language": lang },
    });

    const body = response.data;
    // Unwrap { success: true, data: ... } or return body directly
    return body?.data ?? body;
  },

  // Delete Quiz
  async deleteQuiz(quizId: string, lang = "vi"): Promise<any> {
      const response = await apiClient.delete<any>(`/Quiz/${quizId}`, {
        headers: { "Accept-Language": lang },
      });
      return response.data;
  }
};
