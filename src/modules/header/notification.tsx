import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Calendar,
  BarChart3,
  MessageSquare,
  Gift,
  Star,
  CheckCircle,
  Trash2,
  ChevronRight,
  Settings,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import UserLayout from "../user/layout/layout";
import { useNotificationContext } from "../../contexts/NotificationContext";
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
  courses: BookOpen,
  achievements: Star,
  social: MessageSquare,
  offers: Gift,
  system: BarChart3,
  reminders: Calendar,
};

const NotificationPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    items,
    loading,
    error,
    unreadCount,
    thisWeekCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();

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
      { label: t('notifications.tabs.all'), value: "all" as NotificationFilter, count: items.length },
      { label: t('notifications.tabs.unread'), value: "unread" as NotificationFilter, count: unreadCount },
      { label: t('notifications.tabs.courses'), value: "courses" as NotificationFilter },
      { label: t('notifications.tabs.achievements'), value: "achievements" as NotificationFilter },
      { label: t('notifications.tabs.social'), value: "social" as NotificationFilter },
      { label: t('notifications.tabs.offers'), value: "offers" as NotificationFilter },
    ],
    [items.length, unreadCount, t],
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
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition-all duration-300 hover:text-[#3c1cd6] hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t('notifications.backToHome')}
        </Link>
        <header className="flex flex-col gap-4 rounded-4xl bg-gradient-to-r from-white to-[#fdf9ff] border border-purple-100 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="group relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#5a2dff] to-[#8b5cf6] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Bell className="h-7 w-7" />
              </span>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 relative">
                  {t('notifications.title')}
                  <div className="absolute -bottom-2 left-0 h-1 w-12 bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] rounded-full"></div>
                </h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-[#f5f0ff] to-[#ede7ff] px-4 py-2 text-sm font-bold text-[#5a2dff] border border-purple-200 shadow-sm animate-pulse">
                    {t('notifications.new')}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                {t('notifications.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#5a2dff]/20 bg-white px-6 py-3 text-sm font-bold text-[#5a2dff] transition-all duration-300 hover:bg-[#5a2dff] hover:text-white hover:shadow-lg hover:shadow-[#5a2dff]/25 hover:scale-105 active:scale-95"
          >
            <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            {t('notifications.markAllRead')}
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gray-50 p-2 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`group relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-white text-[#5a2dff] shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-[#5a2dff] hover:bg-white/50 hover:scale-105"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5a2dff]/5 to-[#8b5cf6]/5 rounded-xl" />
                )}

                <span className="relative z-10">{tab.label}</span>

                {tab.count != null && tab.count > 0 && (
                  <span
                    className={`relative z-10 inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white shadow-md transform scale-110"
                        : "bg-gray-200 text-gray-700 group-hover:bg-purple-100 group-hover:text-purple-700 group-hover:scale-110"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5a2dff]/0 to-[#8b5cf6]/0 group-hover:from-[#5a2dff]/5 group-hover:to-[#8b5cf6]/5 transition-all duration-300" />
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <section className="space-y-4">
            {loading && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                {t('notifications.loading')}
              </div>
            )}
            {error && !loading && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-sm font-semibold text-red-500">
                {t('notifications.error', { error })}
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
                    className={`group relative overflow-hidden rounded-3xl border-2 p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-100 ${cardClass} ${isUnread ? "cursor-pointer hover:scale-[1.02]" : ""}`}
                  >
                    {/* Gradient overlay for unread items */}
                    {isUnread && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <span
                            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${tagStyles[item.category]}`}
                          >
                            <Icon className="h-6 w-6" />
                          </span>
                          {/* Icon shine effect */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#5a2dff] transition-colors duration-300">
                              {item.title}
                            </h2>
                            <span
                              className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold shadow-sm transition-all duration-300 group-hover:scale-105 ${tagStyles[item.category]}`}
                            >
                              {item.tag}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {item.timeAgo}
                            </span>
                            {isUnread && (
                              <div className="relative">
                                <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] animate-pulse" title={t('notifications.unreadBadge')} />
                                <span className="absolute inset-0 rounded-full bg-[#5a2dff] animate-ping opacity-50" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
                          {isUnread && (
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#5a2dff]/80">
                              <Zap className="h-3 w-3" />
                              {t('notifications.clickToMarkRead')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-3 self-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className={`group/btn flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap min-w-[160px] ${
                            isUnread
                              ? "bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white shadow-lg shadow-[#5a2dff]/30 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95"
                              : "border-2 border-gray-200 text-gray-400 cursor-default bg-gray-50"
                          }`}
                          disabled={!isUnread}
                        >
                          <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                          {isUnread ? t('notifications.markRead') : t('notifications.alreadyRead')}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteNotification(item.id)}
                          className="group/del flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition-all duration-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover/del:scale-110" />
                          {t('notifications.delete')}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            {!loading && !error && !filteredItems.length && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                {t('notifications.empty')}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('notifications.stats.title')}</h3>
              <div className="mt-4 space-y-4 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>{t('notifications.stats.total')}</span>
                  <span className="text-base font-semibold text-gray-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.stats.unread')}</span>
                  <span className="text-base font-semibold text-[#ef4444]">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.stats.thisWeek')}</span>
                  <span className="text-base font-semibold text-[#5a2dff]">{thisWeekCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('notifications.settings.title')}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                {t('notifications.settings.email')}
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.courseUpdates')}</span>
                  {renderToggle(emailSettings.courseUpdates, () =>
                    toggleEmailSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.newMessages')}</span>
                  {renderToggle(emailSettings.newMessages, () =>
                    toggleEmailSetting("newMessages"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.achievements')}</span>
                  {renderToggle(emailSettings.achievements, () =>
                    toggleEmailSetting("achievements"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.promotions')}</span>
                  {renderToggle(emailSettings.promotions, () =>
                    toggleEmailSetting("promotions"),
                  )}
                </div>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                {t('notifications.settings.push')}
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.courseUpdates')}</span>
                  {renderToggle(pushSettings.courseUpdates, () =>
                    togglePushSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.learningReminders')}</span>
                  {renderToggle(pushSettings.learningReminders, () =>
                    togglePushSetting("learningReminders"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('notifications.settings.achievements')}</span>
                  {renderToggle(pushSettings.achievements, () =>
                    togglePushSetting("achievements"),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('notifications.quickActions.title')}</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                    {t('notifications.quickActions.markAllRead')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
                </button>
                <a
                  href="#settings"
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    {t('notifications.quickActions.notificationSettings')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
                </a>
                <button
                  type="button"
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {t('notifications.quickActions.testNotification')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
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
