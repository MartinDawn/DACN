import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from './layout/layout';
import { useNotifications } from './hooks/useNotifications';
import { useTranslation } from 'react-i18next';
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
  Zap,
  GraduationCap,
  Users
} from "lucide-react";

type NotifFilter = 'all' | 'unread' | 'read';

function formatTimeAgo(iso: string, t: any) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return t('admin.notificationsPage.timeAgo.justNow');
  if (mins < 60) return t('admin.notificationsPage.timeAgo.minutesAgo', { minutes: mins });
  if (hours < 24) return t('admin.notificationsPage.timeAgo.hoursAgo', { hours });
  if (days === 1) return t('admin.notificationsPage.timeAgo.oneDayAgo');
  return t('admin.notificationsPage.timeAgo.daysAgo', { days });
}

const tagStyles: Record<string, string> = {
  CourseRequest: "bg-[#efe7ff] text-[#5a2dff]",
  InstructorRequest: "bg-[#e8f7ef] text-[#0ea879]",
  System: "bg-[#e7edff] text-[#2563eb]",
  system: "bg-[#e7edff] text-[#2563eb]",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  CourseRequest: BookOpen,
  InstructorRequest: GraduationCap,
  System: BarChart3,
  system: BarChart3,
};

const TYPE_ROUTE: Record<string, string> = {
  CourseRequest: '/admin/courses',
  InstructorRequest: '/admin/users',
};

export default function AdminNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    actionError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotifFilter>('all');
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

  const TYPE_LABEL = {
    CourseRequest: t('admin.notificationsPage.types.courseRequest'),
    InstructorRequest: t('admin.notificationsPage.types.instructorRequest'),
    System: t('admin.notificationsPage.types.system'),
    system: t('admin.notificationsPage.types.system'),
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter((n) => !n.isRead);
    if (activeFilter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, activeFilter]);

  const tabs: { label: string; value: NotifFilter; count?: number }[] = [
    { label: t('admin.notificationsPage.tabs.all'), value: 'all', count: notifications.length },
    { label: t('admin.notificationsPage.tabs.unread'), value: 'unread', count: unreadCount },
    { label: t('admin.notificationsPage.tabs.read'), value: 'read', count: notifications.length - unreadCount },
  ];

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
    <AdminLayout>
      <div className="space-y-8 mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
        <Link
          to="/admin/dashboard"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition-all duration-300 hover:text-[#3c1cd6] hover:gap-3"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          {t('admin.notificationsPage.backToDashboard')}
        </Link>

        <header className="flex flex-col gap-4 rounded-4xl bg-gradient-to-r from-white to-[#fdf9ff] border border-purple-100 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="group relative">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#5a2dff] to-[#8b5cf6] text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Bell className="h-7 w-7" />
              </span>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 relative">
                  {t('admin.notificationsPage.title')}
                  <div className="absolute -bottom-2 left-0 h-1 w-12 bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] rounded-full"></div>
                </h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-[#f5f0ff] to-[#ede7ff] px-4 py-2 text-sm font-bold text-[#5a2dff] border border-purple-200 shadow-sm animate-pulse">
                    {unreadCount} {t('admin.notificationsPage.unread')}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600 font-medium">
                {t('admin.notificationsPage.subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#5a2dff]/20 bg-white px-6 py-3 text-sm font-bold text-[#5a2dff] transition-all duration-300 hover:bg-[#5a2dff] hover:text-white hover:shadow-lg hover:shadow-[#5a2dff]/25 hover:scale-105 active:scale-95"
          >
            <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            {t('admin.notificationsPage.markAllRead')}
          </button>
        </header>

        {actionError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-500">
            {actionError}
          </div>
        )}

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

                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5a2dff]/0 to-[#8b5cf6]/0 group-hover:from-[#5a2dff]/5 group-hover:to-[#8b5cf6]/5 transition-all duration-300" />
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
          <section className="space-y-4">
            {loading && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
                {t('admin.notificationsPage.loading')}
              </div>
            )}
            {error && !loading && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center text-sm font-semibold text-red-500">
                {error}
                <button
                  onClick={refetch}
                  className="mt-3 block mx-auto text-sm font-semibold text-[#5a2dff] hover:underline"
                >
                  {t('admin.notificationsPage.tryAgain')}
                </button>
              </div>
            )}
            {!loading &&
              !error &&
              filteredItems.map((notif) => {
                const Icon = categoryIcons[notif.type] ?? Bell;
                const isUnread = !notif.isRead;
                const typeLabel = TYPE_LABEL[notif.type] ?? notif.type;
                const route = TYPE_ROUTE[notif.type];
                const cardClass = isUnread
                  ? "border-[#cbb6ff] bg-[#f6f1ff]"
                  : "border-gray-100 bg-white";
                return (
                  <article
                    key={notif.id}
                    onClick={() => { if (isUnread) markAsRead(notif.id); }}
                    className={`group relative overflow-hidden rounded-3xl border-2 p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-100 ${cardClass} ${isUnread ? "cursor-pointer hover:scale-[1.02]" : ""}`}
                  >
                    {isUnread && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <span
                            className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${tagStyles[notif.type] ?? "bg-[#ffeedd] text-[#fb923c]"}`}
                          >
                            <Icon className="h-6 w-6" />
                          </span>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#5a2dff] transition-colors duration-300">
                              {notif.title || typeLabel}
                            </h2>
                            <span
                              className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold shadow-sm transition-all duration-300 group-hover:scale-105 ${tagStyles[notif.type] ?? "bg-[#ffeedd] text-[#fb923c]"}`}
                            >
                              {typeLabel}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatTimeAgo(notif.createdAt, t)}
                            </span>
                            {isUnread && (
                              <div className="relative">
                                <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] animate-pulse" title={t('admin.notificationsPage.status.new')} />
                                <span className="absolute inset-0 rounded-full bg-[#5a2dff] animate-ping opacity-50" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{notif.message || notif.content}</p>
                          {notif.sender && (
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">{t('admin.notificationsPage.from')}:</span> {notif.sender}
                            </p>
                          )}
                          {isUnread && (
                            <p className="flex items-center gap-2 text-xs font-semibold text-[#5a2dff]/80">
                              <Zap className="h-3 w-3" />
                              {t('admin.notificationsPage.clickToMarkRead')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex flex-col items-end gap-3 self-start"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {route && (
                          <button
                            type="button"
                            onClick={() => { markAsRead(notif.id); navigate(route); }}
                            className={`group/btn flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white shadow-lg shadow-[#5a2dff]/30 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95`}
                          >
                            {t('admin.notificationsPage.actions.review')}
                            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </button>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            className={`group/btn flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                              isUnread
                                ? "bg-gradient-to-r from-[#5a2dff] to-[#8b5cf6] text-white shadow-lg shadow-[#5a2dff]/30 hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:scale-105 active:scale-95"
                                : "border-2 border-gray-200 text-gray-400 cursor-default bg-gray-50"
                            }`}
                            disabled={!isUnread}
                          >
                            <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                            {isUnread ? t('admin.notificationsPage.actions.markRead') : t('admin.notificationsPage.actions.alreadyRead')}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteNotification(notif.id)}
                            className="group/del flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition-all duration-300 hover:border-red-400 hover:text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95"
                          >
                            <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover/del:scale-110" />
                            {t('admin.notificationsPage.actions.delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            {!loading && !error && !filteredItems.length && (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <Bell className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-500">{t('admin.notificationsPage.empty')}</p>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.notificationsPage.stats.title')}</h3>
              <div className="mt-4 space-y-4 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.stats.total')}</span>
                  <span className="text-base font-semibold text-gray-900">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.stats.unread')}</span>
                  <span className="text-base font-semibold text-[#ef4444]">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.stats.read')}</span>
                  <span className="text-base font-semibold text-[#0ea879]">{notifications.length - unreadCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.notificationsPage.settings.title')}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                {t('admin.notificationsPage.settings.email')}
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.courseUpdates')}</span>
                  {renderToggle(emailSettings.courseUpdates, () =>
                    toggleEmailSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.newMessages')}</span>
                  {renderToggle(emailSettings.newMessages, () =>
                    toggleEmailSetting("newMessages"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.achievements')}</span>
                  {renderToggle(emailSettings.achievements, () =>
                    toggleEmailSetting("achievements"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.promotions')}</span>
                  {renderToggle(emailSettings.promotions, () =>
                    toggleEmailSetting("promotions"),
                  )}
                </div>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                {t('admin.notificationsPage.settings.push')}
              </p>
              <div className="mt-3 space-y-3 text-sm font-semibold text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.courseUpdates')}</span>
                  {renderToggle(pushSettings.courseUpdates, () =>
                    togglePushSetting("courseUpdates"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.learningReminders')}</span>
                  {renderToggle(pushSettings.learningReminders, () =>
                    togglePushSetting("learningReminders"),
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('admin.notificationsPage.settings.achievements')}</span>
                  {renderToggle(pushSettings.achievements, () =>
                    togglePushSetting("achievements"),
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">{t('admin.notificationsPage.quickActions.title')}</h3>
              <div className="mt-4 space-y-3 text-sm font-semibold text-gray-600">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                    {t('admin.notificationsPage.quickActions.markAllRead')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={refetch}
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                    {t('admin.notificationsPage.quickActions.refresh')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold transition-all duration-300 hover:border-[#5a2dff] hover:text-[#5a2dff] hover:bg-purple-50 hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {t('admin.notificationsPage.quickActions.testNotification')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-all duration-300 group-hover:text-[#5a2dff] group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
