import React from "react";
import { Link } from "react-router-dom";
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => (
  <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
    <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4">
      <Link to="/homepage" className="flex items-center gap-2 text-lg font-semibold text-[#5a2dff]">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#5a2dff] text-white">
          📘
        </span>
        EduViet
      </Link>
      <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 xl:flex">
        <button className="flex items-center gap-1 transition hover:text-[#5a2dff]">
          Danh mục
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        <Link to="/courses" className="transition hover:text-[#5a2dff]">
          Duyệt khóa học
        </Link>
      </div>
      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-xl">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm khóa học..."
            className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
          />
        </div>
      </div>
      <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 lg:flex">
        <Link to="#" className="transition hover:text-[#5a2dff]">
          Giảng dạy
        </Link>
        <Link to="/user/my-courses" className="transition hover:text-[#5a2dff]">
          Khóa học của tôi
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5a2dff] text-xs font-semibold text-white">
            3
          </span>
        </button>
        <button
          type="button"
          className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7e6c] text-xs font-semibold text-white">
            5
          </span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
            T
          </span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </header>
);

export default Navbar;
