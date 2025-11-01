// src/components/Navbar.tsx (Đã cập nhật)

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BellIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  KeyIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../user/hooks/useCart"; // Giả sử hook này từ file bạn đã tạo

const Navbar: React.FC = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const { cart } = useCart();
  
  // --- THÊM MỚI ---
  // 1. State để lưu nội dung ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Hàm xử lý khi nhấn phím (Enter)
  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Nếu phím nhấn là 'Enter' và có nội dung (đã bỏ qua khoảng trắng)
    if (event.key === 'Enter' && searchTerm.trim()) {
      // Chuyển hướng đến trang /courses với query param
      navigate(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  // --- KẾT THÚC THÊM MỚI ---

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLogoutConfirmOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLogoutConfirmOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isLogoutConfirmOpen]);

  const handleConfirmLogout = () => {
    // Giả sử bạn có logic logout ở đây (xóa token, gọi authService.logout())
    setLogoutConfirmOpen(false);
    navigate("/homepage"); // Hoặc trang login
  };

  return (
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
              
              // --- THÊM MỚI ---
              // 3. Liên kết input với state và hàm xử lý
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
              // --- KẾT THÚC THÊM MỚI ---
            />
          </div>
        </div>
        <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 lg:flex">
          <Link to="#" className="transition hover:text-[#5a2dff]">
            Giảng dạy
          </Link>
          <Link to="/user/mycourses" className="transition hover:text-[#5a2dff]">
            Khóa học của tôi
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/user/cart"
            className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cart && cart.totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5a2dff] text-xs font-semibold text-white">
                {cart.totalItems}
              </span>
            )}
          </Link>
          <Link
            to="/user/notifications"
            className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7e6c] text-xs font-semibold text-white">
              5
            </span>
          </Link>
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                T {/* Bạn nên thay bằng tên user */}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
                <div className="flex items-center gap-3 rounded-xl bg-[#f6f0ff] px-3 py-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                    T {/* Thay bằng tên user */}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Username</p>
                    <p className="text-xs text-gray-500">vnt@gmail.com</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <Link
                    to="/user/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#efeaff] hover:text-[#5a2dff]"
                  >
                    <UserIcon className="h-4 w-4" />
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/user/security"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#efeaff] hover:text-[#5a2dff]"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Đổi mật khẩu
                  </Link>
                  <button
                    type="button"
                    onClick={() => setLogoutConfirmOpen(true)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-[#ffeceb] hover:text-[#ff4b3a]"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Bạn có muốn đăng xuất không?</h3>
            <div className="mt-6 flex justify-end gap-3 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                Không
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-full bg-[#5a2dff] px-4 py-2 text-white transition hover:bg-[#4920d9]"
              >
                Có
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;