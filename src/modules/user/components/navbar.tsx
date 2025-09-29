import React from "react";
import { Link } from "react-router-dom";
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Navbar: React.FC = () => (
  <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
    <div className="border-b border-gray-100">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 lg:px-0">
        <Link to="/homepage" className="flex items-center gap-2 text-lg font-semibold text-[#5a2dff]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#5a2dff] text-white">
            📘
          </span>
          EduViet
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-gray-600 md:flex">
          <button className="flex items-center gap-1 transition hover:text-[#5a2dff]">
            Danh mục khóa học
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <Link to="#" className="transition hover:text-[#5a2dff]">
            Khám phá
          </Link>
          <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Tìm kiếm khóa học..."
            className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
          />
        </div>
          <Link to="#" className="transition hover:text-[#5a2dff]">
            Khóa học của tôi
          </Link>
          <Link to="#" className="transition hover:text-[#5a2dff]">
            Giảng viên
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]">
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5a2dff] text-xs font-semibold text-white">
              3
            </span>
          </button>
          <button className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]">
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7e6c] text-xs font-semibold text-white">
              5
            </span>
          </button>
          <button className="hidden rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff] md:inline-flex">
            VN
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7ff] text-base font-semibold text-[#5a2dff]">
            T
          </button>
        </div>
      </div>
    </div>
    {/* <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-0">
      <div className="flex items-center gap-2 text-lg font-semibold text-[#5a2dff]">
        <UserCircleIcon className="h-6 w-6" />
        Username
      </div>
      <div className="flex w-full flex-col gap-3 sm:max-w-xl sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search for courses..."
            className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="#"
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]"
        >
          Cài đặt
        </Link>
        <Link
          to="#"
          className="rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]"
        >
          Đăng xuất
        </Link>
      </div>
    </div> */}
  </header>
);

export default Navbar;
