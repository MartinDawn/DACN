import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import { ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";

type CourseCardProps = {
  image: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  ratingCount?: string;
  students: string;
  duration: string;
  price: string;
  originalPrice?: string;
  badges?: string[];
  href?: string;
};

const PostCard: React.FC<CourseCardProps> = ({
  image,
  title,
  description,
  instructor,
  rating,
  ratingCount,
  students,
  duration,
  price,
  originalPrice,
  badges = [],
  href = "#",
}) => (
  <Link
    to={href}
    className="group flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_32px_64px_rgba(15,23,42,0.12)] sm:flex-row sm:items-stretch"
  >
    <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-48">
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
    <div className="flex flex-1 flex-col justify-between gap-4">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-[#5a2dff]">
          {title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
        <p className="text-sm font-medium text-gray-600">Bởi {instructor}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-500">
        <span className="flex items-center gap-1 text-gray-600">
          <StarIcon className="h-5 w-5 text-amber-400" />
          <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
          {ratingCount && <span className="text-gray-400">({ratingCount})</span>}
        </span>
        <span className="flex items-center gap-1">
          <UserGroupIcon className="h-5 w-5" />
          {students}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="h-5 w-5" />
          {duration}
        </span>
      </div>
      {!!badges.length && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-[#efe7ff] px-3 py-1 text-xs font-semibold text-[#5a2dff]"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="flex flex-col items-end justify-between gap-2">
      <span className="text-xl font-semibold text-gray-900">{price}</span>
      {originalPrice && <span className="text-sm text-gray-400 line-through">{originalPrice}</span>}
    </div>
  </Link>
);

export default PostCard;
