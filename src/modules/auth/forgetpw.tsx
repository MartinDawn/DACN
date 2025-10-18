import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";
import { useAuth } from "./hooks/useAuth";
import { AuthNotification } from "./components/AuthNotification";
import { OTPVerification } from "./components/OTPVerification";

const ForgetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, sendOTP, verifyOTP, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [newPassword, setNewPassword] = useState("");
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const handleEmailSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    try {
      const response = await sendOTP({ email });
      if (response) {
        setStep('otp');
        setNotification({
          show: true,
          type: 'success',
          message: 'Mã OTP đã được gửi đến email của bạn'
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: error || 'Có lỗi xảy ra khi gửi mã OTP'
      });
    }
  };

  const handleOTPVerified = async (otp: string) => {
    try {
      const response = await verifyOTP({ email, otp, type: 'ForgotPassword' });
      if (response) {
        setStep('reset');
        setNotification({
          show: true,
          type: 'success',
          message: 'Xác thực OTP thành công'
        });
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: error || 'Có lỗi xảy ra khi xác thực mã OTP'
      });
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await resetPassword({ email, newPassword, otp: '' });
      if (response) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Đặt lại mật khẩu thành công'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        message: error || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <AuthNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Quên mật khẩu
          </h1>
          <p className="text-sm text-gray-500">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        {step === 'email' && (
          <form className="mt-6 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
                <HiOutlineEnvelope className="text-lg text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[#8b3dff] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,61,255,0.35)] transition hover:bg-[#7a2df0] disabled:opacity-60"
              disabled={loading || !email}
            >
              {loading ? 'Đang xử lý...' : 'Gửi mã OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div className="mt-6">
            <OTPVerification 
              onVerified={handleOTPVerified}
              onResend={handleEmailSubmit}
              email={email}
              isLoading={loading}
              apiError={error}
            />
          </div>
        )}

        {step === 'reset' && (
          <form className="mt-6 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu mới
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]">
                <HiOutlineLockClosed className="text-lg text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[#8b3dff] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,61,255,0.35)] transition hover:bg-[#7a2df0] disabled:opacity-60"
              disabled={loading || !newPassword}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
          <Link
            to="/login"
            className="block font-semibold text-indigo-500 hover:text-indigo-400"
          >
            Quay lại đăng nhập
          </Link>
          <span>
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-500 hover:text-indigo-400"
            >
              Đăng ký ngay
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
