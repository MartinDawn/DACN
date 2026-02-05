import apiClient from "../../auth/services/apiClient";
import type { CreateQuizPayload, UpdateQuizPayload, QuizDetailResponse } from "../models/quiz";

export const quizService = {
  // Create Quiz
  async createQuiz(payload: CreateQuizPayload, lang = "vi"): Promise<any> {
    const response = await apiClient.post<any>("/Quiz/create", payload, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },

  // Get Quiz Detail
  async getQuizById(quizId: string, lang = "vi"): Promise<any> { // Change return type to match your real API response wrapper
    const response = await apiClient.get<any>(`/Quiz/${quizId}`, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },

  // Update Quiz
  async updateQuiz(quizId: string, payload: UpdateQuizPayload, lang = "vi"): Promise<any> {
    const response = await apiClient.put<any>(`/Quiz/${quizId}`, payload, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  },
};
