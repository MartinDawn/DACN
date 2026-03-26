// src/components/Navbar.tsx

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
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../user/hooks/useCart";
import { useAuth } from "../auth/hooks/useAuth";
import { useMyNotifications } from "./hooks/useNotifications";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLanguageOpen, setLanguageOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { unreadCount } = useMyNotifications();

  const [searchTerm, setSearchTerm] = useState("");

  // Language options
  const languages = [
    { code: 'vi' as const, name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  ];

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
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

  // 3. GỌI HÀM LOGOUT TỪ CONTEXT
  const handleConfirmLogout = () => {
    logout(); // Gọi hàm logout toàn cục
    setLogoutConfirmOpen(false);
    navigate("/homepage"); // Điều hướng về trang chủ
  };

  // Language functions
  const handleLanguageMenuToggle = () => {
    setLanguageOpen((prev) => !prev);
  };

  const handleLanguageSelect = (langCode: 'vi' | 'en') => {
    changeLanguage(langCode);
    setLanguageOpen(false);
  };
  
  // Lấy chữ cái đầu của user
  const userInitials = user?.fullName ? user.fullName[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'A');

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 py-4">
        {/* ... (Logo, Links, Search bar giữ nguyên) ... */}
        <Link to="/user/home" className="flex items-center gap-2 text-lg font-semibold text-[#5a2dff]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#5a2dff] text-white">
            📘
          </span>
          EduViet
        </Link>
        <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 xl:flex">
          <button className="flex items-center gap-1 transition hover:text-[#5a2dff]">
            {t('common.filter')}
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <Link to="/courses" className="transition hover:text-[#5a2dff]">
            {t('navigation.courses')}
          </Link>
        </div>
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-xl">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder={t('course.searchPlaceholder')}
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>
        </div>
        <div className="hidden items-center gap-5 text-sm font-semibold text-gray-600 lg:flex">
          <Link to={user?.role?.includes('Instructor') ? '/instructor/dashboard' : '/register-teacher'} className="transition hover:text-[#5a2dff]">
            {t('instructor.dashboard')}
          </Link>
          <Link to="/user/mycourses" className="transition hover:text-[#5a2dff]">
            {t('navigation.myCourses')}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={handleLanguageMenuToggle}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-gray-500 transition hover:text-[#5a2dff]"
              title={t('common.selectLanguage')}
            >
              <GlobeAltIcon className="h-5 w-5" />
              <span className="hidden sm:block text-sm font-medium">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isLanguageOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <div className="space-y-1">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        currentLanguage === language.code
                          ? 'bg-[#f6f0ff] text-[#5a2dff] font-semibold'
                          : 'text-gray-600 hover:bg-[#efeaff] hover:text-[#5a2dff]'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                      {currentLanguage === language.code && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-[#5a2dff]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart (Đã đúng) */}
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
          
          {/* Notifications */}
          <Link
            to="/user/notifications"
            className="relative rounded-full border border-gray-200 p-2 text-gray-500 transition hover:text-[#5a2dff]"
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff7e6c] text-xs font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          
          {/* 4. DÙNG DỮ LIỆU USER TỪ CONTEXT */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 text-sm font-semibold text-gray-600 transition hover:text-[#5a2dff]"
            >
              {user?.avatarUrl ? (
                <img 
                    src={user.avatarUrl} 
                    alt="User Avatar" 
                    className="h-9 w-9 rounded-full object-cover border border-[#efe7ff]"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                    {userInitials} {/* Thay T bằng chữ cái đầu */}
                </span>
              )}
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
                <div className="flex items-center gap-3 rounded-xl bg-[#f6f0ff] px-3 py-2">
                  {user?.avatarUrl ? (
                    <img 
                        src={user.avatarUrl} 
                        alt="User Avatar" 
                        className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe7ff] text-[#5a2dff]">
                        {userInitials} {/* Thay T bằng chữ cái đầu */}
                    </span>
                  )}
                  <div className="text-sm overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">{user?.fullName || t('user.profile')}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "..."}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <Link
                    to="/user/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#efeaff] hover:text-[#5a2dff]"
                  >
                    <UserIcon className="h-4 w-4" />
                    {t('user.personalInfo')}
                  </Link>
                  <Link
                    to="/user/security"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#efeaff] hover:text-[#5a2dff]"
                  >
                    <KeyIcon className="h-4 w-4" />
                    {t('user.changePassword')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setLogoutConfirmOpen(true)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-[#ffeceb] hover:text-[#ff4b3a]"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    {t('navigation.logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Logout Modal (Giữ nguyên) */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">{t('navigation.logout')}?</h3>
            <div className="mt-6 flex justify-end gap-3 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="rounded-full border border-gray-200 px-4 py-2 text-gray-600 transition hover:bg-gray-100"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-full bg-[#5a2dff] px-4 py-2 text-white transition hover:bg-[#4920d9]"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;