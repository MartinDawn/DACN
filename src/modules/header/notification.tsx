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

type NotificationCategory =
  | "courses"
  | "achievements"
  | "social"
  | "offers"
  | "system"
  | "reminders";

type NotificationFilter =
  | "all"
  | "unread"
  | "courses"
  | "achievements"
  | "social"
  | "offers";

type NotificationStatus = "read" | "unread";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  filter: NotificationFilter;
  tag: string;
  status: NotificationStatus;
  timeAgo: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  isThisWeek: boolean;
};

const tagStyles: Record<NotificationCategory, string> = {
  courses: "bg-[#efe7ff] text-[#5a2dff]",
  achievements: "bg-[#fff6d8] text-[#f59e0b]",
  social: "bg-[#e8f7ef] text-[#0ea879]",
  offers: "bg-[#fce8ff] text-[#d946ef]",
  system: "bg-[#e7edff] text-[#2563eb]",
  reminders: "bg-[#ffeedd] text-[#fb923c]",
};

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Bài học mới trong React Development",
    message: "Giảng viên John Smith vừa thêm bài: “Advanced Hooks Patterns”.",
    category: "courses",
    filter: "courses",
    tag: "Cập nhật khóa học",
    status: "unread",
    timeAgo: "2 giờ trước",
    icon: BookOpenIcon,
    accent: "bg-[#efe7ff] text-[#5a2dff]",
    isThisWeek: true,
  },
  {
    id: "2",
    title: "Chúc mừng! Bạn đã hoàn thành JavaScript Mastery",
    message: "Bạn nhận được chứng chỉ và đề xuất khóa học tiếp theo.",
    category: "achievements",
    filter: "achievements",
    tag: "Thành tích",
    status: "unread",
    timeAgo: "1 ngày trước",
    icon: StarIcon,
    accent: "bg-[#fff6d8] text-[#f59e0b]",
    isThisWeek: true,
  },
  {
    id: "3",
    title: "Bình luận mới về câu hỏi của bạn",
    message: "Sarah Johnson đã phản hồi thắc mắc của bạn trong mục Hỏi & Đáp.",
    category: "social",
    filter: "social",
    tag: "Cộng đồng",
    status: "read",
    timeAgo: "2 ngày trước",
    icon: ChatBubbleLeftRightIcon,
    accent: "bg-[#e8f7ef] text-[#0ea879]",
    isThisWeek: true,
  },
  {
    id: "4",
    title: "Flash Sale: Giảm 50% tất cả khóa Design",
    message: "Ưu đãi kết thúc trong 6 giờ nữa, đừng bỏ lỡ!",
    category: "offers",
    filter: "offers",
    tag: "Khuyến mãi",
    status: "read",
    timeAgo: "3 ngày trước",
    icon: GiftIcon,
    accent: "bg-[#fce8ff] text-[#d946ef]",
    isThisWeek: true,
  },
  {
    id: "5",
    title: "Báo cáo học tập tuần này đã sẵn sàng",
    message: "Kiểm tra tiến độ và thành tích đạt được trong tuần.",
    category: "system",
    filter: "courses",
    tag: "Hệ thống",
    status: "read",
    timeAgo: "5 ngày trước",
    icon: ChartBarIcon,
    accent: "bg-[#e7edff] text-[#2563eb]",
    isThisWeek: true,
  },
  {
    id: "6",
    title: "Duy trì chuỗi học tập của bạn",
    message: "Bạn chưa học bài nào hôm nay. Giữ chuỗi 7 ngày nhé!",
    category: "reminders",
    filter: "offers",
    tag: "Nhắc nhở",
    status: "read",
    timeAgo: "1 tuần trước",
    icon: CalendarIcon,
    accent: "bg-[#ffeedd] text-[#fb923c]",
    isThisWeek: false,
  },
];

const NotificationPage: React.FC = () => {
  const [items, setItems] = React.useState(initialNotifications);
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

  const unreadCount = React.useMemo(
    () => items.filter((item) => item.status === "unread").length,
    [items],
  );

  const thisWeekCount = React.useMemo(
    () => items.filter((item) => item.isThisWeek).length,
    [items],
  );

  const filteredItems = React.useMemo(() => {
    if (activeFilter === "all") return items;
    if (activeFilter === "unread") return items.filter((item) => item.status === "unread");
    return items.filter((item) => item.filter === activeFilter);
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

  const handleMarkAllRead = () =>
    setItems((prev) => prev.map((item) => ({ ...item, status: "read" as NotificationStatus })));

  const handleMarkRead = (id: string) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "read" as NotificationStatus } : item)),
    );

  const handleDelete = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

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
            onClick={handleMarkAllRead}
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
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isUnread = item.status === "unread";
              const cardClass = isUnread
                ? "border-[#cbb6ff] bg-[#f6f1ff]"
                : "border-gray-100 bg-white";
              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)] ${cardClass}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${item.accent}`}
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
                        </div>
                        <p className="text-sm text-gray-600">{item.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start text-sm font-semibold text-gray-600">
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className={`rounded-full px-4 py-2 transition ${
                          isUnread
                            ? "bg-[#5a2dff] text-white shadow-sm shadow-[#5a2dff]/30 hover:bg-[#4a21eb]"
                            : "border border-gray-200 hover:border-[#5a2dff] hover:text-[#5a2dff]"
                        }`}
                        disabled={!isUnread}
                      >
                        Đánh dấu đã đọc
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-full border border-gray-200 px-4 py-2 transition hover:border-red-400 hover:text-red-500"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {!filteredItems.length && (
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
                  {renderToggle(emailSettings.courseUpdates, () => toggleEmailSetting("courseUpdates"))}
                </div>
                <div className="flex items-center justify-between">
                  <span>Tin nhắn mới</span>
                  {renderToggle(emailSettings.newMessages, () => toggleEmailSetting("newMessages"))}
                </div>
                <div className="flex items-center justify-between">
                  <span>Thành tích</span>
                  {renderToggle(emailSettings.achievements, () => toggleEmailSetting("achievements"))}
                </div>
                <div className="flex items-center justify-between">
                  <span>Khuyến mãi</span>
                  {renderToggle(emailSettings.promotions, () => toggleEmailSetting("promotions"))}
                </div>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                Thông báo đẩy
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Cập nhật khóa học</span>
                  {renderToggle(pushSettings.courseUpdates, () => togglePushSetting("courseUpdates"))}
                </div>
                <div className="flex items-center justify-between">
                  <span>Nhắc nhở học tập</span>
                  {renderToggle(pushSettings.learningReminders, () =>
                    togglePushSetting("learningReminders"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Thành tích</span>
                  {renderToggle(pushSettings.achievements, () => togglePushSetting("achievements"))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Hành động nhanh</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
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
