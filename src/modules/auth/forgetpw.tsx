import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineEnvelope } from "react-icons/hi2";

const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Quên mật khẩu
          </h1>
          <p className="text-sm text-gray-500">
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
            className="h-12 w-full rounded-2xl bg-[#8b3dff] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,61,255,0.35)] transition hover:bg-[#7a2df0]"
            disabled={!email}
          >
            Gửi liên kết đặt lại
          </button>
        </form>

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
