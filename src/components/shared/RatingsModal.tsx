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
  const { t } = useTranslation();
  const { courseComments, isCommentsLoading, commentsError, getCourseComments } = useCourses();

  useEffect(() => {
    if (isOpen && courseId) {
      getCourseComments(courseId);
    }
  }, [isOpen, courseId, getCourseComments]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            {star <= rating ? (
              <StarSolidIcon className="h-4 w-4" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Đánh giá của học viên
            </h3>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-700 truncate">{courseName}</h4>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isCommentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Đang tải đánh giá...</span>
              </div>
            ) : commentsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{commentsError}</p>
              </div>
            ) : courseComments && courseComments.length > 0 ? (
              <div className="space-y-4">
                {courseComments.map((comment) => (
                  <div key={comment.commentId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {comment.avatarUrl ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={comment.avatarUrl}
                            alt={comment.userName}
                          />
                        ) : (
                          <UserCircleIcon className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.userName}
                          </p>
                          <div className="flex items-center space-x-2">
                            {renderStars(comment.rate)}
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {comment.content}
                          </p>
                        </div>

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-4 space-y-2">
                            {comment.replies.map((reply, index) => (
                              <div key={index} className="bg-gray-50 rounded-md p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-600">
                                    Phản hồi từ giảng viên
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 mt-1 whitespace-pre-line">
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
              <div className="text-center py-8">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đánh giá</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Khóa học này chưa có đánh giá nào từ học viên.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingsModal;