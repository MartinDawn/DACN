export interface QuizOptionPayload {
  content: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface QuizQuestionPayload {
  content: string;
  question?: string;
  displayOrder: number;
  explanation: string;
  options: QuizOptionPayload[];
}

export interface CreateQuizPayload {
  name: string;
  lectureId: string;
  description?: string; // Added description
  testTime: number;
  attemptCount: number;
  questions: QuizQuestionPayload[];
}

export interface UpdateQuizPayload {
  name: string;
  description?: string;
  testTime?: number;
  attemptCount?: number;
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
