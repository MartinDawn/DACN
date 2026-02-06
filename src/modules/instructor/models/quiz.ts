export interface QuizOptionPayload {
  content: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface QuizQuestionPayload {
  content: string;
  // question?: string; // Removed: API Schema uses 'content'
  displayOrder: number;
  explanation: string;
  options: QuizOptionPayload[];
}

export interface CreateQuizPayload {
  name: string;
  lectureId: string;
  description?: string;
  testTime: number;
  attemptCount: number;
  questions: QuizQuestionPayload[];
}

export interface QuizDetailResponse {
  id: string;
  name: string;
  description?: string;
  testTime?: number;
  attemptCount?: number;
  questions: QuizQuestionPayload[];
}
