import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  DevicePhoneMobileIcon,
  BookOpenIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import HomepageLayout from "./layout/layout";

const Homepage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleViewAllCourses = () => {
    navigate('/courses');
  };

  const features = [
    {
      title: t('homepage.features.items.students.title'),
      description: t('homepage.features.items.students.description'),
      icon: <UserGroupIcon className="h-8 w-8 text-[#5a2dff]" />,
    },
    {
      title: t('homepage.features.items.certificates.title'),
      description: t('homepage.features.items.certificates.description'),
      icon: <ClipboardDocumentCheckIcon className="h-8 w-8 text-[#5a2dff]" />,
    },
    {
      title: t('homepage.features.items.anywhere.title'),
      description: t('homepage.features.items.anywhere.description'),
      icon: <DevicePhoneMobileIcon className="h-8 w-8 text-[#5a2dff]" />,
    },
    {
      title: t('homepage.features.items.courses.title'),
      description: t('homepage.features.items.courses.description'),
      icon: <BookOpenIcon className="h-8 w-8 text-[#5a2dff]" />,
    },
  ];

  const courses = [
    {
      title: "Complete React Developer Course",
      instructor: "Nguyễn Văn A",
      rating: 4.8,
      students: "45,821",
      price: "599,000₫",
      oldPrice: "1,199,000₫",
      badge: t('homepage.popularCourses.badge'),
      image:
        "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Python cho Người Mới Bắt Đầu",
      instructor: "Trần Thị B",
      rating: 4.9,
      students: "32,154",
      price: "449,000₫",
      oldPrice: "899,000₫",
      badge: t('homepage.popularCourses.badge'),
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Digital Marketing Mastery",
      instructor: "Lê Văn C",
      rating: 4.7,
      students: "28,743",
      price: "699,000₫",
      oldPrice: "1,399,000₫",
      badge: t('homepage.popularCourses.badge'),
      image:
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <HomepageLayout>
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 overflow-hidden rounded-4xl bg-gradient-to-r from-[#6828ff] via-[#7a35ff] to-[#9b4dff] px-6 py-16 text-white md:flex-row md:items-center md:justify-between md:px-12">
        <div className="max-w-xl space-y-6">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            {t('homepage.hero.badge')}
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {t('homepage.hero.title')}
          </h1>
          <p className="text-base text-white/80 md:text-lg">
            {t('homepage.hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow-lg shadow-black/10 transition hover:bg-[#f5f0ff]"
            >
              {t('homepage.hero.startFree')}
            </Link>
            <button
              onClick={handleViewAllCourses}
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t('homepage.hero.viewCourses')}
            </button>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80"
          alt={t('homepage.hero.imageAlt')}
          className="w-full max-w-md rounded-3xl border border-white/20 shadow-2xl shadow-[#3a0fbf]/40"
        />
      </section>

      <section id="features" className="mx-auto mt-16 w-full max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-gray-900">{t('homepage.features.title')}</h2>
          <p className="mt-3 text-base text-gray-500">
            {t('homepage.features.subtitle')}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-[0_20px_40px_rgba(90,45,255,0.08)]">
              <div className="inline-flex items-center justify-center rounded-2xl bg-[#efe8ff] p-3">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="mx-auto mt-16 w-full max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('homepage.popularCourses.title')}</h2>
            <p className="mt-2 text-sm text-gray-500">{t('homepage.popularCourses.subtitle')}</p>
          </div>
          <button
            onClick={handleViewAllCourses}
            className="rounded-full border border-[#5a2dff]/20 px-4 py-2 text-sm font-semibold text-[#5a2dff] transition hover:bg-[#efeaff]"
          >
            {t('homepage.popularCourses.viewAll')}
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {courses.map((course) => (
            <div key={course.title} className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_40px_rgba(90,45,255,0.08)] transition hover:-translate-y-1">
              <img src={course.image} alt={course.title} className="h-48 w-full object-cover" />
              <div className="space-y-3 p-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.instructor}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <StarIcon className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold text-gray-900">{course.rating}</span>
                  <span>({course.students} {t('homepage.popularCourses.studentsLabel')})</span>
                </div>
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-lg font-semibold text-[#5a2dff]">{course.price}</span>
                  <span className="text-gray-400 line-through">{course.oldPrice}</span>
                </div>
                <span className="inline-flex rounded-full bg-[#efeaff] px-3 py-1 text-xs font-semibold text-[#5a2dff]">
                  {course.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="cta"
        className="mx-auto mt-20 w-full max-w-6xl rounded-4xl bg-gradient-to-r from-[#7a35ff] via-[#8b3dff] to-[#a651ff] px-6 py-16 text-center text-white md:px-12"
      >
        <h2 className="text-3xl font-semibold">{t('homepage.cta.title')}</h2>
        <p className="mt-3 text-base text-white/80">
          {t('homepage.cta.subtitle')}
        </p>
        <Link
          to="/register"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow-lg shadow-black/10 transition hover:bg-[#f5f0ff]"
        >
          {t('homepage.cta.registerFree')}
        </Link>
      </section>
    </HomepageLayout>
  );
};

export default Homepage;
