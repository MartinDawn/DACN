import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './layout/layout';
import { useCourses } from './hooks/useCourses';
import { useTranslation } from 'react-i18next';
import RatingsModal from '../../components/shared/RatingsModal';
import {
  BookOpenIcon,
  UsersIcon,
  StarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const CourseReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { allCourses, isAllCoursesLoading, allCoursesError, getAllCourses } = useCourses();
  const [ratingsModal, setRatingsModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
  }>({
    isOpen: false,
    courseId: '',
    courseName: ''
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return t('courseReview.active');
      case 'pending':
        return t('courseReview.pending');
      default:
        return t('courseReview.inactive');
    }
  };

  const openRatingsModal = (courseId: string, courseName: string) => {
    setRatingsModal({
      isOpen: true,
      courseId,
      courseName
    });
  };

  const closeRatingsModal = () => {
    setRatingsModal({
      isOpen: false,
      courseId: '',
      courseName: ''
    });
  };

  useEffect(() => {
    getAllCourses();
  }, [getAllCourses]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && ratingsModal.isOpen) {
        closeRatingsModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [ratingsModal.isOpen]);

  if (isAllCoursesLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-200 border-t-[#5a2dff]"></div>
            </div>
            <p className="text-lg font-semibold text-gray-700">{t('courseReview.loadingCourses')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (allCoursesError) {
    return (
      <AdminLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-2">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-red-600">{allCoursesError}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 py-8 lg:px-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">{t('courseReview.title')}</h1>
          <p className="mt-3 text-base text-gray-600 max-w-3xl">
            {t('courseReview.description')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allCourses?.map((course) => (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] hover:shadow-[0_28px_64px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#5a2dff] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1.5">
                    <span className="font-medium text-gray-500">{t('courseReview.instructor')}:</span>
                    <span className="font-semibold">{course.instructor}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <UsersIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{course.totalStudents || 0} {t('courseReview.students')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StarIcon className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-gray-900">{course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-1.5 bg-purple-50 rounded-lg">
                      <BookOpenIcon className="h-4 w-4 text-[#5a2dff]" />
                    </div>
                    <span className="font-medium">{course.lessons || 0} {t('courseReview.lessons')}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                    course.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : course.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}>
                    {getStatusText(course.status)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Link
                  to={`/admin/course-progress/${course.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] hover:-translate-y-0.5"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('courseReview.viewProgress')}</span>
                </Link>
                <button
                  onClick={() => openRatingsModal(course.id, course.title)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.2)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 whitespace-nowrap"
                  title={t('courseReview.viewRatings')}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span className="hidden xl:inline">{t('courseReview.viewRatings')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!allCourses || allCourses.length === 0) && !isAllCoursesLoading && (
          <div className="text-center py-16 rounded-3xl bg-gray-50 border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-4">
              <BookOpenIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('courseReview.noCourses')}</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">{t('courseReview.noCoursesDescription')}</p>
          </div>
        )}
      </div>

      <RatingsModal
        isOpen={ratingsModal.isOpen}
        onClose={closeRatingsModal}
        courseId={ratingsModal.courseId}
        courseName={ratingsModal.courseName}
      />
    </AdminLayout>
  );
};

export default CourseReviewPage;