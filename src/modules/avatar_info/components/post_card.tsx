import React from "react";

interface PostCardProps {
  icon: string;
  title: string;
  description?: string;
  asButton?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ icon, title, description, asButton }) => {
  const Component = asButton ? "button" : "div";
  const baseClasses =
    "flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition";
  const buttonClasses = asButton ? " hover:-translate-y-0.5 hover:border-[#5a2dff]/40 hover:shadow-lg" : "";

  return (
    <Component className={`${baseClasses}${buttonClasses}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5a2dff]/10 text-lg text-[#5a2dff]">
          {icon}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      {asButton && <span className="text-lg text-gray-300">›</span>}
    </Component>
  );
};

export default PostCard;
