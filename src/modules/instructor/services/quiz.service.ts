import apiClient from "../../auth/services/apiClient";
import type { CreateQuizPayload, UpdateQuizPayload } from "../models/quiz";

const removeContentType = [
  (data: any, headers: any) => {
    if (headers && headers["Content-Type"]) delete headers["Content-Type"];
    return data;
  },
];

function dataURLtoBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

const appendQuestions = (formData: FormData, questions: UpdateQuizPayload["questions"]) => {
  questions.forEach((q, i) => {
    formData.append(`Questions[${i}].Content`, q.content);
    formData.append(`Questions[${i}].DisplayOrder`, q.displayOrder.toString());
    formData.append(`Questions[${i}].Explanation`, q.explanation ?? "");
    if (q.imageUrl) formData.append(`Questions[${i}].ImageUrl`, q.imageUrl);
    if (q.imagePublicId) formData.append(`Questions[${i}].ImagePublicId`, q.imagePublicId);
    if (q.image) {
      const blob = dataURLtoBlob(q.image);
      const ext = blob.type.split("/")[1] || "jpg";
      formData.append(`Questions[${i}].Image`, blob, `question_${i}.${ext}`);
    }
    q.options.forEach((o, j) => {
      formData.append(`Questions[${i}].Options[${j}].Content`, o.content);
      formData.append(`Questions[${i}].Options[${j}].IsCorrect`, o.isCorrect.toString());
      formData.append(`Questions[${i}].Options[${j}].DisplayOrder`, o.displayOrder.toString());
    });
  });
};

export const quizService = {
  // Create Quiz
  async createQuiz(payload: CreateQuizPayload, lang = "vi"): Promise<any> {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.description) formData.append("Description", payload.description);
    formData.append("LectureId", payload.lectureId);
    formData.append("TestTime", payload.testTime.toString());
    appendQuestions(formData, payload.questions);

    const response = await apiClient.post<any>("/Quiz/create", formData, {
      headers: { "Accept-Language": lang },
      transformRequest: removeContentType,
    });
    return response.data;
  },

  // Update Quiz
  async updateQuiz(quizId: string, payload: UpdateQuizPayload, lang = "vi"): Promise<any> {
    const formData = new FormData();
    formData.append("Name", payload.name);
    if (payload.description) formData.append("Description", payload.description);
    formData.append("TestTime", payload.testTime.toString());
    appendQuestions(formData, payload.questions);

    const response = await apiClient.patch<any>(`/Quiz/${quizId}`, formData, {
      headers: { "Accept-Language": lang },
      transformRequest: removeContentType,
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
    if (!quizId || quizId === "undefined" || quizId === "null") {
      throw new Error("Quiz ID không hợp lệ.");
    }
    const response = await apiClient.delete<any>(`/Quiz/${quizId}`, {
      headers: { "Accept-Language": lang },
    });
    return response.data;
  }
};
