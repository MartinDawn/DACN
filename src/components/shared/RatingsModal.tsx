import React, { useEffect } from 'react';
import { useCourses } from '../../modules/admin/hooks/useCourses';
import {
  XMarkIcon,
  StarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

interface RatingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

const RatingsModal: React.FC<RatingsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName
}) => {
  const { t, i18n } = useTranslation();
  const { courseComments, isCommentsLoading, commentsError, getCourseComments } = useCourses();
  const currentLang = i18n.language;

  const translations = {
    vi: {
      title: 'Đánh giá của học viên',
      close: 'Đóng',
      loading: 'Đang tải đánh giá...',
      instructorReply: 'Phản hồi từ giảng viên',
      noReviews: 'Chưa có đánh giá',
      noReviewsDesc: 'Khóa học này chưa có đánh giá nào từ học viên.'
    },
    en: {
      title: 'Student Reviews',
      close: 'Close',
      loading: 'Loading reviews...',
      instructorReply: 'Reply from instructor',
      noReviews: 'No reviews yet',
      noReviewsDesc: 'This course has no reviews from students yet.'
    }
  };

  const lang = currentLang === 'vi' ? translations.vi : translations.en;

  useEffect(() => {
    if (isOpen && courseId) {
      getCourseComments(courseId);
    }
  }, [isOpen, courseId, getCourseComments]);

  const formatDate = (timestamp: string) => {
    const locale = currentLang === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-amber-400 drop-shadow-sm">
            {star <= rating ? (
              <StarSolidIcon className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </span>
        ))}
        <span className="ml-1.5 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity backdrop-blur-sm" aria-hidden="true">
          <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-3xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-[0_25px_60px_rgba(15,23,42,0.12)] transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {lang.title}
              </h3>
              <h4 className="mt-2 text-sm font-medium text-gray-600 line-clamp-1">{courseName}</h4>
            </div>
            <button
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:border-gray-300"
            >
              <span className="sr-only">{lang.close}</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isCommentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#5a2dff]"></div>
                <span className="ml-3 text-gray-600 font-medium">{lang.loading}</span>
              </div>
            ) : commentsError ? (
              <div className="text-center py-12 rounded-2xl bg-red-50 border border-red-100">
                <p className="text-red-600 font-medium">{commentsError}</p>
              </div>
            ) : courseComments && courseComments.length > 0 ? (
              <div className="space-y-4">
                {courseComments.map((comment) => (
                  <div key={comment.commentId} className="border border-gray-200 rounded-2xl p-5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-gray-300 transition-all duration-300 bg-white">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {comment.avatarUrl ? (
                          <img
                            className="h-12 w-12 rounded-full ring-2 ring-gray-100"
                            src={comment.avatarUrl}
                            alt={comment.userName}
                          />
                        ) : (
                          <UserCircleIcon className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {comment.userName}
                            </p>
                            <div className="flex items-center mt-1">
                              {renderStars(comment.rate)}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(comment.timestamp)}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {comment.content}
                          </p>
                        </div>

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {comment.replies.map((reply, index) => (
                              <div key={index} className="relative rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-4 ml-2">
                                <div className="absolute -left-2 top-4 w-4 h-4 bg-purple-100 rotate-45 border-l border-t border-purple-100"></div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-[#5a2dff] uppercase tracking-wide">
                                    {lang.instructorReply}
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {formatDate(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                  <StarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">{lang.noReviews}</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  {lang.noReviewsDesc}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
              onClick={onClose}
            >
              {lang.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsModal;