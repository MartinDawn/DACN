import { useState, useCallback } from 'react';
import axios from 'axios';
import { quizService } from '../services/quiz.service';
import type {
  ApiQuizAttempt,
  ApiQuizDetail,
  ApiQuizResult,
  ApiQuizAttemptSummary,
} from '../models/course';

/** Trích xuất message lỗi từ axios error (bao gồm response body của API). */
const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === 'string' && data.length > 0) return data;
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      const msg =
        (d.message as string) ||
        (d.Message as string) ||
        (d.error as string) ||
        (d.Error as string) ||
        (d.title as string) ||
        (d.Title as string);
      if (msg) return msg;
      // ASP.NET validation errors: { errors: { field: [msg] } }
      if (d.errors && typeof d.errors === 'object') {
        const first = Object.values(d.errors as Record<string, string[]>)[0];
        if (Array.isArray(first) && first.length > 0) return first[0];
      }
    }
    if (err.message) return err.message;
  }
  return fallback;
};

interface UseQuizReturn {
  // --- Start quiz ---
  // POST /api/Quiz/{quizId}/attempt  →  stores attemptId
  quizAttempt: ApiQuizAttempt | null;
  // GET /api/Quiz/{quizId}           →  stores question list
  quizDetail: ApiQuizDetail | null;
  isQuizLoading: boolean;
  quizError: string | null;
  startQuiz: (quizId: string) => Promise<void>;

  // --- Submit quiz ---
  // POST /api/Quiz/submit  then  GET /api/Quiz/attempt/{attemptId}/result
  isSubmitting: boolean;
  submitError: string | null;
  attemptResult: ApiQuizResult | null;
  isResultLoading: boolean;
  resultError: string | null;
  submitQuiz: (
    attemptId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ) => Promise<void>;

  // --- Attempt history ---
  // GET /api/Quiz/{quizId}/attempts
  attemptHistory: ApiQuizAttemptSummary[];
  isHistoryLoading: boolean;
  historyError: string | null;
  getAttemptHistory: (quizId: string) => Promise<void>;

  // Reset all quiz state (e.g. when navigating away)
  clearQuiz: () => void;
}

export const useQuiz = (): UseQuizReturn => {
  // --- Start ---
  const [quizAttempt, setQuizAttempt] = useState<ApiQuizAttempt | null>(null);
  const [quizDetail, setQuizDetail] = useState<ApiQuizDetail | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // --- Submit ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<ApiQuizResult | null>(null);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  // --- History ---
  const [attemptHistory, setAttemptHistory] = useState<ApiQuizAttemptSummary[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  /**
   * Bắt đầu làm quiz:
   *   1. POST /api/Quiz/{quizId}/attempt  → lưu attemptId
   *   2. GET  /api/Quiz/{quizId}          → lưu danh sách câu hỏi
   */
  const startQuiz = useCallback(async (quizId: string) => {
    setIsQuizLoading(true);
    setQuizError(null);
    setQuizAttempt(null);
    setQuizDetail(null);
    setAttemptResult(null);
    setSubmitError(null);
    setResultError(null);
    try {
      // 1) Tạo attempt
      const attemptRes = await quizService.startAttempt(quizId);
      console.log('[startQuiz] attemptRes.data:', attemptRes.data);
      if (attemptRes.success === false || !attemptRes.data) {
        setQuizError(attemptRes.message || 'Không thể bắt đầu quiz.');
        return;
      }
      setQuizAttempt(attemptRes.data);

      // 2) Lấy danh sách câu hỏi
      const detailRes = await quizService.getQuizDetail(quizId);
      console.log('[startQuiz] quizDetail.data:', detailRes.data);
      if (detailRes.success === false || !detailRes.data) {
        setQuizError(detailRes.message || 'Không thể tải câu hỏi quiz.');
        return;
      }
      setQuizDetail(detailRes.data);
    } catch (err) {
      setQuizError(extractErrorMessage(err, 'Đã xảy ra lỗi khi bắt đầu quiz. Vui lòng thử lại.'));
    } finally {
      setIsQuizLoading(false);
    }
  }, []);

  /**
   * Nộp bài quiz:
   *   1. POST /api/Quiz/submit            → nộp các câu trả lời
   *   2. GET  /api/Quiz/attempt/{id}/result → lấy kết quả
   */
  const submitQuiz = useCallback(
    async (
      attemptId: string,
      answers: Array<{ questionId: string; selectedOptionId: string }>
    ) => {
      if (!attemptId) {
        setSubmitError('Không tìm thấy mã lần làm (attemptId). Vui lòng bắt đầu lại quiz.');
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        console.log('[submitQuiz] payload:', JSON.stringify({ attemptId, answers }, null, 2));
        const submitRes = await quizService.submitQuiz({ quizAttemptId: attemptId, answers });
        if (submitRes.success === false) {
          setSubmitError(submitRes.message || 'Nộp bài thất bại.');
          return;
        }
        // Nếu submit trả về kết quả luôn, dùng nó (tránh gọi thêm GET result)
        if (
          submitRes.data &&
          (submitRes.data.score != null ||
            submitRes.data.percentage != null ||
            submitRes.data.correctAnswers != null)
        ) {
          setAttemptResult(submitRes.data);
          return;
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const errData = err.response?.data;
          console.error('[submitQuiz] payload sent:', JSON.stringify({ attemptId, answers }, null, 2));
          console.error('[submitQuiz] 400 errors:', JSON.stringify(errData?.errors, null, 2));
          console.error('[submitQuiz] full response:', JSON.stringify(errData, null, 2));
        }
        setSubmitError(extractErrorMessage(err, 'Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.'));
        return;
      } finally {
        setIsSubmitting(false);
      }

      // Lấy kết quả chi tiết
      setIsResultLoading(true);
      setResultError(null);
      try {
        const resultRes = await quizService.getAttemptResult(attemptId);
        if (resultRes.success === false || !resultRes.data) {
          setResultError(resultRes.message || 'Không thể tải kết quả bài làm.');
          return;
        }
        setAttemptResult(resultRes.data);
      } catch (err) {
        setResultError(extractErrorMessage(err, 'Đã xảy ra lỗi khi tải kết quả. Vui lòng thử lại.'));
      } finally {
        setIsResultLoading(false);
      }
    },
    []
  );

  /**
   * Lấy lịch sử tất cả các lần làm quiz.
   * GET /api/Quiz/{quizId}/attempts
   */
  const getAttemptHistory = useCallback(async (quizId: string) => {
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await quizService.getAttemptHistory(quizId);
      if (res.success === false) {
        setHistoryError(res.message || 'Không thể tải lịch sử làm bài.');
        return;
      }
      setAttemptHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setHistoryError(extractErrorMessage(err, 'Đã xảy ra lỗi khi tải lịch sử. Vui lòng thử lại.'));
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const clearQuiz = useCallback(() => {
    setQuizAttempt(null);
    setQuizDetail(null);
    setIsQuizLoading(false);
    setQuizError(null);
    setIsSubmitting(false);
    setSubmitError(null);
    setAttemptResult(null);
    setIsResultLoading(false);
    setResultError(null);
    setAttemptHistory([]);
    setIsHistoryLoading(false);
    setHistoryError(null);
  }, []);

  return {
    quizAttempt,
    quizDetail,
    isQuizLoading,
    quizError,
    startQuiz,

    isSubmitting,
    submitError,
    attemptResult,
    isResultLoading,
    resultError,
    submitQuiz,

    attemptHistory,
    isHistoryLoading,
    historyError,
    getAttemptHistory,

    clearQuiz,
  };
};
