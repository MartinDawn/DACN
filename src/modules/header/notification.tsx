import React from "react";
import {
  ArrowLeftIcon,
  BellAlertIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import UserLayout from "../user/layout/layout";
import { useMyNotifications } from "./hooks/useNotifications";
import type { NotificationCategory, NotificationFilter } from "./models/notification.model";

const tagStyles: Record<NotificationCategory, string> = {
  courses: "bg-[#efe7ff] text-[#5a2dff]",
  achievements: "bg-[#fff6d8] text-[#f59e0b]",
  social: "bg-[#e8f7ef] text-[#0ea879]",
  offers: "bg-[#fce8ff] text-[#d946ef]",
  system: "bg-[#e7edff] text-[#2563eb]",
  reminders: "bg-[#ffeedd] text-[#fb923c]",
};

const categoryIcons: Record<
  NotificationCategory,
  React.ComponentType<{ className?: string }>
> = {
  courses: BookOpenIcon,
  achievements: StarIcon,
  social: ChatBubbleLeftRightIcon,
  offers: GiftIcon,
  system: ChartBarIcon,
  reminders: CalendarIcon,
};

const NotificationPage: React.FC = () => {
  const {
    items,
    loading,
    error,
    unreadCount,
    thisWeekCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useMyNotifications();

  const [activeFilter, setActiveFilter] = React.useState<NotificationFilter>("all");
  const [emailSettings, setEmailSettings] = React.useState({
    courseUpdates: true,
    newMessages: true,
    achievements: true,
    promotions: false,
  });
  const [pushSettings, setPushSettings] = React.useState({
    courseUpdates: true,
    learningReminders: false,
    achievements: true,
  });

  const filteredItems = React.useMemo(() => {
    if (activeFilter === "all") return items;
    if (activeFilter === "unread") return items.filter((item) => item.status === "unread");
    return items.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  const tabs = React.useMemo(
    () => [
      { label: "Tất cả", value: "all" as NotificationFilter, count: items.length },
      { label: "Chưa đọc", value: "unread" as NotificationFilter, count: unreadCount },
      { label: "Khóa học", value: "courses" as NotificationFilter },
      { label: "Thành tích", value: "achievements" as NotificationFilter },
      { label: "Cộng đồng", value: "social" as NotificationFilter },
      { label: "Ưu đãi", value: "offers" as NotificationFilter },
    ],
    [items.length, unreadCount],
  );

  const toggleEmailSetting = (key: keyof typeof emailSettings) =>
    setEmailSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const togglePushSetting = (key: keyof typeof pushSettings) =>
    setPushSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderToggle = (checked: boolean, onClick: () => void) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? "justify-end bg-[#5a2dff]" : "justify-start bg-gray-300"
      }`}
    >
      <span className="m-1 h-4 w-4 rounded-full bg-white shadow" />
    </button>
  );

  return (
    <UserLayout>
      <div className="space-y-8">
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Quay lại trang chủ
        </Link>
        <header className="flex flex-col gap-4 rounded-4xl bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#efe7ff] text-[#5a2dff]">
              <BellAlertIcon className="h-7 w-7" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#f5f0ff] px-3 py-1 text-xs font-semibold text-[#5a2dff]">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật tiến độ học tập và các thông báo quan trọng.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center rounded-full border border-[#5a2dff]/40 px-5 py-2 text-sm font-semibold text-[#5a2dff] transition hover:bg-[#efe7ff]"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-full bg-gray-100 p-1 text-sm font-semibold text-gray-500">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${
                  isActive ? "bg-white text-[#5a2dff] shadow" : "hover:text-[#5a2dff]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full text-xs ${
                      isActive ? "bg-[#efe7ff] text-[#5a2dff]" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <section className="space-y-4">
            {loading && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Đang tải thông báo...
              </div>
            )}
            {error && !loading && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-sm font-semibold text-red-500">
                {error}
              </div>
            )}
            {!loading &&
              !error &&
              filteredItems.map((item) => {
                const Icon = categoryIcons[item.category];
                const isUnread = item.status === "unread";
                const cardClass = isUnread
                  ? "border-[#cbb6ff] bg-[#f6f1ff]"
                  : "border-gray-100 bg-white";
                return (
                  <article
                    key={item.id}
                    onClick={() => { if (isUnread) markAsRead(item.id); }}
                    className={`rounded-3xl border p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)] ${cardClass} ${isUnread ? "cursor-pointer" : ""}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <span
                          className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${tagStyles[item.category]}`}
                        >
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h2>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tagStyles[item.category]}`}
                            >
                              {item.tag}
                            </span>
                            <span className="text-xs font-medium text-gray-400">
                              {item.timeAgo}
                            </span>
                            {isUnread && (
                              <span className="inline-flex h-2 w-2 rounded-full bg-[#5a2dff]" title="Chưa đọc" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{item.message}</p>
                          {isUnread && (
                            <p className="text-xs font-medium text-[#5a2dff]/70">
                              Nhấn vào thông báo để đánh dấu đã đọc
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 self-start text-sm font-semibold text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className={`rounded-full px-4 py-2 transition ${
                            isUnread
                              ? "bg-[#5a2dff] text-white shadow-sm shadow-[#5a2dff]/30 hover:bg-[#4a21eb]"
                              : "border border-gray-200 text-gray-400 cursor-default"
                          }`}
                          disabled={!isUnread}
                        >
                          {isUnread ? "Đánh dấu đã đọc" : "Đã đọc"}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-red-400 hover:text-red-500"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            {!loading && !error && !filteredItems.length && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                Không có thông báo nào trong danh sách này.
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Thống kê nhanh</h3>
              <div className="mt-4 space-y-4 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Tổng thông báo</span>
                  <span className="text-base font-semibold text-gray-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chưa đọc</span>
                  <span className="text-base font-semibold text-[#ef4444]">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trong tuần này</span>
                  <span className="text-base font-semibold text-[#5a2dff]">{thisWeekCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Cài đặt thông báo</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                Email
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Cập nhật khóa học</span>
                  {renderToggle(emailSettings.courseUpdates, () =>
                    toggleEmailSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Tin nhắn mới</span>
                  {renderToggle(emailSettings.newMessages, () =>
                    toggleEmailSetting("newMessages"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Thành tích</span>
                  {renderToggle(emailSettings.achievements, () =>
                    toggleEmailSetting("achievements"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Khuyến mãi</span>
                  {renderToggle(emailSettings.promotions, () =>
                    toggleEmailSetting("promotions"),
                  )}
                </div>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                Thông báo đẩy
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Cập nhật khóa học</span>
                  {renderToggle(pushSettings.courseUpdates, () =>
                    togglePushSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Nhắc nhở học tập</span>
                  {renderToggle(pushSettings.learningReminders, () =>
                    togglePushSetting("learningReminders"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Thành tích</span>
                  {renderToggle(pushSettings.achievements, () =>
                    togglePushSetting("achievements"),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Hành động nhanh</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                >
                  <span>Đánh dấu tất cả đã đọc</span>
                  <span className="text-lg text-gray-300">›</span>
                </button>
                <a
                  href="#settings"
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                >
                  <span>Cài đặt thông báo</span>
                  <span className="text-lg text-gray-300">›</span>
                </a>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                >
                  <span>Gửi thông báo thử</span>
                  <span className="text-lg text-gray-300">›</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
};

export default NotificationPage;
