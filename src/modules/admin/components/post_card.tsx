import React from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";

type CourseCardProps = {
  image: string;
  title: string;
  instructor: string;
  rating: number;
  students: string;
  price: string;
  href?: string;
};

const PostCard: React.FC<CourseCardProps> = ({
  image,
  title,
  instructor,
  rating,
  students,
  price,
  href = "#",
}) => (
  <Link
    to={href}
    className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_48px_rgba(80,80,120,0.08)] transition hover:-translate-y-1 hover:shadow-[0_28px_64px_rgba(80,80,120,0.12)]"
  >
    <img
      src={image}
      alt={title}
      className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
    />
    <div className="space-y-4 p-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-500">{instructor}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 text-gray-600">
          <StarIcon className="h-5 w-5 text-amber-400" />
          <span className="font-semibold text-gray-900">{(rating|0).toFixed(1)}</span>
          <span className="text-xs text-gray-400">{students}</span>
        </span>
        <span className="text-base font-semibold text-[#5a2dff]">{price}</span>
      </div>
    </div>
  </Link>
);

export default PostCard;
