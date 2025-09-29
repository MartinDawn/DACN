import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => (
  <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-[#5a2dff]">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#5a2dff] text-white">
          📘
        </span>
        EduViet
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
        <a href="#features" className="transition hover:text-[#5a2dff]">Lợi ích</a>
        <a href="#courses" className="transition hover:text-[#5a2dff]">Khóa học</a>
        <a href="#cta" className="transition hover:text-[#5a2dff]">Ưu đãi</a>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-full px-4 py-2 text-sm font-semibold text-[#5a2dff] transition hover:bg-[#efeaff]"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb]"
        >
          Đăng ký
        </Link>
      </div>
    </div>
  </header>
);

export default Navbar;
