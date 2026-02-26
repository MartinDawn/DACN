import { useState, useCallback } from 'react';
import { quizService } from '../services/quiz.service';
import type { ApiQuizAttempt } from '../models/course';

interface UseQuizReturn {
  quizAttempt: ApiQuizAttempt | null;
  isQuizLoading: boolean;
  quizError: string | null;
  startQuiz: (quizId: string) => Promise<void>;
  clearQuiz: () => void;
}

export const useQuiz = (): UseQuizReturn => {
  const [quizAttempt, setQuizAttempt] = useState<ApiQuizAttempt | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const startQuiz = useCallback(async (quizId: string) => {
    setIsQuizLoading(true);
    setQuizError(null);
    setQuizAttempt(null);
    try {
      const response = await quizService.startAttempt(quizId);
      if (response.success !== false && response.data) {
        setQuizAttempt(response.data);
      } else {
        setQuizError(response.message || 'Không thể bắt đầu quiz.');
      }
    } catch {
      setQuizError('Đã xảy ra lỗi khi tải quiz. Vui lòng thử lại.');
    } finally {
      setIsQuizLoading(false);
    }
  }, []);

  const clearQuiz = useCallback(() => {
    setQuizAttempt(null);
    setQuizError(null);
    setIsQuizLoading(false);
  }, []);

  return { quizAttempt, isQuizLoading, quizError, startQuiz, clearQuiz };
};
