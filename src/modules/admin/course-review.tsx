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

  if (isAllCoursesLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-gray-700">{t('courseReview.loadingCourses')}</p>
        </div>
      </AdminLayout>
    );
  }

  if (allCoursesError) {
    return (
      <AdminLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-red-600">{allCoursesError}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-4 py-8 lg:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('courseReview.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('courseReview.description')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allCourses?.map((course) => (
            <div
              key={course.id}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {t('courseReview.instructor')}: {course.instructor}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{course.totalStudents || 0} {t('courseReview.students')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4" />
                  <span>{course.averageRating ? course.averageRating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpenIcon className="h-4 w-4" />
                  <span>{course.lessons || 0} {t('courseReview.lessons')}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : course.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(course.status)}
                </span>
              </div>

              <div className="mt-6 flex gap-2 items-center">
                <Link
                  to={`/admin/course-progress/${course.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <EyeIcon className="h-4 w-4" />
                  {t('courseReview.viewProgress')}
                </Link>
                <button
                  onClick={() => openRatingsModal(course.id, course.title)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  <ChatBubbleLeftRightIcon className="h-3 w-3" />
                  {t('courseReview.viewRatings')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!allCourses || allCourses.length === 0) && !isAllCoursesLoading && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('courseReview.noCourses')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('courseReview.noCoursesDescription')}</p>
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