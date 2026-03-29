import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc";

import {
  HiOutlineEnvelope,
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePhone,
  HiOutlineIdentification,
} from "react-icons/hi2";
import { useAuth } from "./hooks/useAuth";
import type { RegisterRequest } from "./models/auth";
import { AuthNotification } from "./components/AuthNotification";

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error, getGoogleAuthUrl } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    userName: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: "Student" as const,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptTerms) {
      setNotification({
        show: true,
        type: 'error',
        message: t('register.errors.terms')
      });
      return;
    }
    try {
      const response = await register(formData);
      if (response?.success) {
        setNotification({
          show: true,
          type: 'success',
          message: response.message
        });
        // Chờ một chút để người dùng có thể đọc thông báo thành công
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setNotification({
        show: true,
        type: 'error',
        message: error || t('register.errors.failed')
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const redirectUri = `${window.location.origin}/auth/google-callback`;
      const url = await getGoogleAuthUrl(redirectUri);
      if (url) {
        window.location.href = url;
      } else {
        setNotification({
          show: true,
          type: "error",
          message: t('register.errors.googleUrl')
        });
      }
    } catch (err) {
      console.error("Google auth error:", err);
      setNotification({
        show: true,
        type: "error",
        message: (err instanceof Error && err.message) ? err.message : t('register.errors.google')
      });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <AuthNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      <Link to="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 text-sm font-medium text-indigo-500 hover:text-indigo-400">
        {t('forgotPassword.backToHome')}
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">
            {t('register.title')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <FcGoogle className="text-lg" />
            {t('register.googleSignup')}
          </button>
         
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            {t('register.or')}
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="userName" className="text-sm font-medium text-gray-700">
              {t('register.username')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlineIdentification className="text-lg text-gray-400" />
              <input
                id="userName"
                name="userName"
                type="text"
                placeholder={t('register.placeholders.username')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.userName}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              {t('register.fullName')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlineUser className="text-lg text-gray-400" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={t('register.placeholders.fullName')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
              {t('register.phoneNumber')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlinePhone className="text-lg text-gray-400" />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder={t('register.placeholders.phoneNumber')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('auth.email')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlineEnvelope className="text-lg text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t('register.placeholders.email')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('auth.password')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlineLockClosed className="text-lg text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('register.placeholders.password')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-lg text-gray-400 transition hover:text-gray-600"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Mật khẩu phải có ít nhất 8 ký tự
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                {t('register.terms')}
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-[#8b3dff] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,61,255,0.35)] transition hover:bg-[#7a2df0] disabled:opacity-60"
            disabled={loading || !formData.userName || !formData.email || !formData.password || !formData.fullName || !formData.phoneNumber || !acceptTerms}
          >
            {loading ? t('common.loading') : t('register.buttons.create')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('auth.alreadyHaveAccount')}{" "}
          <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-400">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;