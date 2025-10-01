import React, { useState, ChangeEvent, FormEvent } from "react";
import AvatarLayout from "./layout/layout";
import PostCard from "./components/post_card";

const ChangePasswordPage: React.FC = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: "Mật khẩu mới và xác nhận chưa khớp." });
      return;
    }
    setStatus({ type: "success", message: "Mật khẩu của bạn đã được cập nhật." });
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <AvatarLayout>
      <div className="grid gap-8 lg:grid-cols-[360px,minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-md space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">Đổi mật khẩu</h1>
            <p className="text-sm text-gray-500">
              Cập nhật mật khẩu thường xuyên giúp bảo vệ tài khoản của bạn khỏi việc truy cập trái phép.
            </p>
            <div className="space-y-3">
              <PostCard
                icon="🔐"
                title="Sử dụng mật khẩu mạnh"
                description="Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt."
              />
              <PostCard
                icon="🛡️"
                title="Không chia sẻ mật khẩu"
                description="Tránh dùng chung mật khẩu cho nhiều tài khoản."
              />
            </div>
          </section>
        </aside>
        <section className="rounded-3xl bg-white p-6 shadow-md">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800" htmlFor="currentPassword">
                Mật khẩu hiện tại
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={form.currentPassword}
                onChange={handleChange}
                className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                placeholder="Nhập mật khẩu hiện tại"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800" htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={form.newPassword}
                onChange={handleChange}
                className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                placeholder="Nhập mật khẩu mới"
              />
              <p className="text-xs text-gray-400">Tối thiểu 8 ký tự bao gồm chữ, số và ký tự đặc biệt.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800" htmlFor="confirmPassword">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            {status && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "bg-[#f4f9ff] text-[#2563eb]"
                    : "bg-[#fff5f5] text-[#dc2626]"
                }`}
              >
                {status.message}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="h-11 rounded-full bg-[#5a2dff] px-6 text-sm font-semibold text-white transition hover:bg-[#4920d9]"
              >
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
                className="h-11 rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Hủy
              </button>
            </div>
          </form>
        </section>
      </div>
    </AvatarLayout>
  );
};

export default ChangePasswordPage;
