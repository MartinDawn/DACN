// src/pages/auth/login.tsx

import React, { useState, useEffect } from "react"; // Thêm useEffect
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import { useAuth } from "./hooks/useAuth";
import type { LoginRequest } from "./models/auth";
import { AuthNotification } from "./components/AuthNotification";
import { useTranslation } from 'react-i18next';
import { mapAuthErrorToTranslation } from './utils/auth.utils';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  const { login, loading, error, getGoogleAuthUrl, getProfile, getDefaultRoute } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  // Lấy username đã lưu nếu có
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('remember_username');
    if (rememberedUsername) {
      setFormData(prev => ({ ...prev, username: rememberedUsername }));
      setRememberMe(true);
    }

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token") || params.get("token") || params.get("accessToken");
    if (accessToken) {
      (async () => {
        try {
          // Persist token to the same key used across the app
          localStorage.setItem("accessToken", accessToken);
          const profileRes = await getProfile(accessToken);
          if (profileRes?.success && profileRes.data) {
            setTimeout(() => {
              const defaultRoute = getDefaultRoute();
              window.location.href = defaultRoute;
            }, 500);
          } else {
            setNotification({
              show: true,
              type: "error",
              message: profileRes?.message || t('errors.auth.userNotFound')
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          // Remove query string so we don't re-process
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      })();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await login(formData);
      if (response?.success && response.data) {
        if (rememberMe) {
          localStorage.setItem('remember_username', formData.username);
        } else {
          localStorage.removeItem('remember_username');
        }

        setNotification({
          show: true,
          type: 'success',
          message: t('auth.loginSuccess')
        });

        // Force reload để đảm bảo state được cập nhật
        setTimeout(() => {
          const defaultRoute = getDefaultRoute();
          window.location.href = defaultRoute;
        }, 500);
      } else {
        // Xử lý trường hợp response không thành công dù không có lỗi catch
        setNotification({
          show: true,
          type: 'error',
          message: response?.message || t('auth.invalidCredentials')
        });
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Sử dụng error state từ hook nếu có, nếu không thì dùng thông báo chung
      const errorMessage = error || mapAuthErrorToTranslation((err instanceof Error ? err.message : null), t);
      setNotification({
        show: true,
        type: 'error',
        message: errorMessage
      });
    }
  };

  // Thêm hàm xử lý Google auth
  const handleGoogleAuth = async () => {
    try {
      const redirectUri = `${window.location.origin}/login-success`;
      const url = await getGoogleAuthUrl(redirectUri);
      if (url) {
        window.location.href = url;
      } else {
        setNotification({
          show: true,
          type: "error",
          message: t('errors.auth.googleAuthUrlFailed')
        });
      }
    } catch (err) {
      console.error("Google auth error:", err);
      setNotification({
        show: true,
        type: "error",
        message: mapAuthErrorToTranslation((err instanceof Error && err.message) ? err.message : null, t)
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
        ← {t('navigation.home')}
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">{t('auth.login')}</h1>
          <p className="text-sm text-gray-500">
            {t('auth.loginDescription')}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <FcGoogle className="text-lg" />
            {t('auth.orLoginWith')} Google
          </button>

        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
            {t('auth.orLoginWith').toLowerCase()}
          </span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              {t('auth.email')}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
              <HiOutlineEnvelope className="text-lg text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder={t('auth.email')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                placeholder={t('auth.password')}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-lg text-gray-400 transition hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-indigo-500 hover:text-indigo-400"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {mapAuthErrorToTranslation(error, t)}
            </div>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-2xl bg-[#8b3dff] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,61,255,0.35)] transition hover:bg-[#7a2df0] disabled:opacity-60"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('auth.dontHaveAccount')}{" "}
          <Link to="/register" className="font-semibold text-indigo-500 hover:text-indigo-400">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;