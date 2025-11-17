import React, { useState } from "react";
import InstructorLayout from "./layout/layout_ins";

const InstructorDashboard: React.FC = () => {
  // Thêm state quản lý tab
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "analytics" | "activity">("overview");

  return (
    <InstructorLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Bảng Điều Khiển Giảng Viên</h1>
          <p className="mt-2 text-sm text-gray-500">Quản lý khóa học và theo dõi hiệu suất của bạn</p>
        </div>
        <div className="pt-2">
          <button className="rounded-full bg-[#7b2bff] px-5 py-3 text-white shadow hover:opacity-95">
            +&nbsp;Tạo Khóa Học Mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        {/* đổi inline-flex -> flex và thêm mx-auto để căn giữa */}
        <div className="flex w-full max-w-4xl rounded-full bg-gray-100 p-1 mx-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition rounded-full ${
              activeTab === "overview" ? "bg-white shadow-sm" : "bg-transparent"
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition rounded-full ${
              activeTab === "courses" ? "bg-white shadow-sm" : "bg-transparent"
            }`}
          >
            Khóa Học Của Tôi
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition rounded-full ${
              activeTab === "analytics" ? "bg-white shadow-sm" : "bg-transparent"
            }`}
          >
            Phân Tích
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition rounded-full ${
              activeTab === "activity" ? "bg-white shadow-sm" : "bg-transparent"
            }`}
          >
            Hoạt Động
          </button>
        </div>
      </div>

      {/* Nội dung theo tab */}
      {activeTab === "overview" && (
        <>
          {/* Overview cards */}
          <section className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Tổng Học Viên</p>
              <p className="mt-4 text-3xl font-bold">2,669</p>
              <p className="mt-2 text-xs text-gray-400">+12% so với tháng trước</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Tổng Doanh Thu</p>
              <p className="mt-4 text-3xl font-bold">48,720,000đ</p>
              <p className="mt-2 text-xs text-gray-400">+8% so với tháng trước</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Đánh Giá Trung Bình</p>
              <p className="mt-4 text-3xl font-bold">4.7</p>
              <p className="mt-2 text-xs text-gray-400">+0.2 so với tháng trước</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm text-gray-500">Khóa Học Hoạt Động</p>
              <p className="mt-4 text-3xl font-bold">3</p>
              <p className="mt-2 text-xs text-gray-400">+1 khóa học mới tháng này</p>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mb-8 rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold">Hành Động Nhanh</h3>
            <p className="mt-1 text-sm text-gray-500">Quản lý khóa học và nội dung của bạn</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <button className="rounded-xl border border-gray-200 p-6 text-center font-semibold">+&nbsp;Tạo Khóa Học</button>
              <button className="rounded-xl border border-gray-200 p-6 text-center font-semibold">📊&nbsp;Xem Phân Tích</button>
              <button className="rounded-xl border border-gray-200 p-6 text-center font-semibold">💬&nbsp;Kiểm Tra Tin Nhắn</button>
            </div>
          </section>
        </>
      )}

      {activeTab === "activity" && (
        <section className="mb-8">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold">Hoạt Động Gần Đây</h3>
            <p className="mt-1 text-sm text-gray-500">Cập nhật hoạt động khóa học của bạn</p>
            <ul className="mt-4 space-y-3">
              <li className="rounded-lg border border-gray-100 p-4">⭐ Đánh giá 5 sao mới cho khóa học React <span className="text-xs text-gray-400 block">2 giờ trước</span></li>
              <li className="rounded-lg border border-gray-100 p-4">👥 25 học viên mới đăng ký hôm nay <span className="text-xs text-gray-400 block">4 giờ trước</span></li>
              <li className="rounded-lg border border-gray-100 p-4">💬 Câu hỏi mới trong phần Q&A <span className="text-xs text-gray-400 block">6 giờ trước</span></li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === "courses" && (
        <section>
          <h3 className="mb-4 text-2xl font-bold">Khóa Học Của Tôi</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl bg-white shadow">
              <div className="h-48 rounded-t-2xl bg-gray-200" />
              <div className="p-5">
                <h4 className="text-lg font-semibold">Khóa học React Toàn Diện</h4>
                <p className="mt-2 text-sm text-gray-500">Học React từ cơ bản đến nâng cao</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div>1,234 học viên</div>
                  <div>⭐ 4.8 (156)</div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-full border border-gray-200 px-4 py-2">Xem</button>
                  <button className="rounded-full border border-gray-200 px-4 py-2">Sửa</button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl bg-white shadow">
              <div className="h-48 rounded-t-2xl bg-gray-200" />
              <div className="p-5">
                <h4 className="text-lg font-semibold">Thành Thạo JavaScript</h4>
                <p className="mt-2 text-sm text-gray-500">Làm chủ lập trình JavaScript</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div>892 học viên</div>
                  <div>⭐ 4.6 (98)</div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-full border border-gray-200 px-4 py-2">Xem</button>
                  <button className="rounded-full border border-gray-200 px-4 py-2">Sửa</button>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl bg-white shadow">
              <div className="h-48 rounded-t-2xl bg-gray-200" />
              <div className="p-5">
                <h4 className="text-lg font-semibold">Phát Triển Backend Node.js</h4>
                <p className="mt-2 text-sm text-gray-500">Xây dựng ứng dụng backend mở rộng</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div>543 học viên</div>
                  <div>⭐ 4.7 (67)</div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-full border border-gray-200 px-4 py-2">Xem</button>
                  <button className="rounded-full border border-gray-200 px-4 py-2">Sửa</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="mb-8">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-semibold">Phân Tích</h3>
            <p className="mt-1 text-sm text-gray-500">Báo cáo nhanh về hiệu suất khóa học.</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Lượt xem tuần này</p>
                <p className="mt-2 text-2xl font-bold">12,345</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
                <p className="mt-2 text-2xl font-bold">3.4%</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </InstructorLayout>
  );
};

export default InstructorDashboard;