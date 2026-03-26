// src/components/shared/formatHelpers.ts

import type { TFunction } from 'react-i18next';

/**
 * Formats simple question title (without total count)
 * @param index Question index (1-based)
 * @param t Translation function
 * @returns Formatted string like "CÂU HỎI 1" or "QUESTION 1"
 */
export const formatQuestionTitle = (index: number, t: TFunction): string => {
  const questionWord = t('lessonContent.question').toUpperCase();

  return `${questionWord} ${index}`;
};

/**
 * Formats progress text for lessons
 * @param completed Number of completed lessons
 * @param total Total number of lessons
 * @param t Translation function
 * @returns Formatted string like "5/10 bài học đã hoàn thành" or "5/10 lessons completed"
 */
export const formatLessonsProgress = (completed: number, total: number, t: TFunction): string => {
  const lessonWord = total === 1 ? t('lessonContent.lesson') : t('lessonContent.lessons');
  const completedWord = t('lessonContent.completed');

  return `${completed}/${total} ${lessonWord} ${completedWord}`;
};

/**
 * Formats question number display
 * @param index Question index (1-based)
 * @param total Total number of questions (not used anymore, kept for compatibility)
 * @param t Translation function
 * @returns Formatted string like "CÂU HỎI 1" or "QUESTION 1"
 */
export const formatQuestionNumber = (index: number, total: number, t: TFunction): string => {
  const questionWord = t('lessonContent.question').toUpperCase();

  return `${questionWord} ${index}`;
};

/**
 * Formats questions count display
 * @param count Number of questions
 * @param t Translation function
 * @returns Formatted string like "5 câu hỏi" or "5 questions"
 */
export const formatQuestionsCount = (count: number, t: TFunction): string => {
  const questionWord = count === 1 ? t('lessonContent.question') : t('lessonContent.questions');

  return `${count} ${questionWord}`;
};

/**
 * Formats quiz score display
 * @param correct Number of correct answers
 * @param total Total number of questions
 * @param t Translation function
 * @returns Formatted string like "Đúng 3 / 5 câu hỏi" or "Correct 3 / 5 questions"
 */
export const formatQuizScore = (correct: number, total: number, t: TFunction): string => {
  const correctWord = t('lessonContent.correct');
  const questionWord = total === 1 ? t('lessonContent.question') : t('lessonContent.questions');

  return `${correctWord} ${correct} / ${total} ${questionWord}`;
};