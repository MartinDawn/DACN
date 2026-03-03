export interface QuizOptionPayload {
  content: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface QuizQuestionPayload {
  content: string;
  displayOrder: number;
  explanation: string;
  imageUrl?: string;
  imagePublicId?: string;
  image?: string;
  options: QuizOptionPayload[];
}

export interface CreateQuizPayload {
  name: string;
  description?: string;
  lectureId: string;
  testTime: number;
  questions: QuizQuestionPayload[];
}

export interface UpdateQuizPayload {
  name: string;
  description?: string;
  testTime: number;
  questions: QuizQuestionPayload[];
}

export interface QuizDetailResponse {
  id: string;
  name: string;
  description?: string;
  testTime?: number;
  questions: QuizQuestionPayload[];
}
