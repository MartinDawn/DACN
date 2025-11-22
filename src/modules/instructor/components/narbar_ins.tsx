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

const Navbar: React.FC = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // nếu click nằm trong nút profile hoặc trong dropdown thì không đóng
      if (
        (profileMenuRef.current && profileMenuRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      setProfileOpen(false);
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
    setLogoutConfirmOpen(false);
    navigate("/homepage");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4">
        <Link to="/user/home" className="flex items-center gap-2 text-lg font-semibold text-[#5a2dff]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#5a2dff] text-white">
            📘
          </span>
          EduViet
        </Link>
        
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/user/notifications"
            className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7e6c] text-xs font-semibold text-white">
              5
            </span>
          </Link>
          {/* nút profile (vẫn trong flow để giữ vị trí nút) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                T
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
          {/* dropdown được đặt fixed ở góc phải màn hình */}
          {isProfileOpen && (
            <div
              ref={menuRef}
              className="fixed right-4 top-14 z-[60] w-56 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl"
            >
              <div className="flex items-center gap-3 rounded-xl bg-[#f6f0ff] px-3 py-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                  T
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
