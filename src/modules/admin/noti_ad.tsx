 import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './layout/layout';
import { useNotifications } from './hooks/useNotifications';
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  EnvelopeOpenIcon,
  BookOpenIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

type NotifFilter = 'all' | 'unread' | 'read';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return '1 ngày trước';
  return `${days} ngày trước`;
}

const TYPE_LABEL: Record<string, string> = {
  CourseRequest: 'Yêu cầu duyệt khóa học',
  InstructorRequest: 'Yêu cầu giảng viên',
  System: 'Hệ thống',
  system: 'Hệ thống',
};

const TYPE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  CourseRequest: { bg: 'bg-purple-50', text: 'text-[#5a2dff]', dot: 'bg-[#5a2dff]' },
  InstructorRequest: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  System: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  system: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const DEFAULT_COLOR = { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400' };

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  CourseRequest: BookOpenIcon,
  InstructorRequest: AcademicCapIcon,
  System: Cog6ToothIcon,
  system: Cog6ToothIcon,
};

const TYPE_ROUTE: Record<string, string> = {
  CourseRequest: '/admin/courses',
  InstructorRequest: '/admin/users',
};

export default function AdminNotifications() {
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

  const filteredItems = useMemo(() => {
    if (activeFilter === 'unread') return notifications.filter((n) => !n.isRead);
    if (activeFilter === 'read') return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, activeFilter]);

  const tabs: { label: string; value: NotifFilter; count?: number }[] = [
    { label: 'Tất cả', value: 'all', count: notifications.length },
    { label: 'Chưa đọc', value: 'unread', count: unreadCount },
    { label: 'Đã đọc', value: 'read', count: notifications.length - unreadCount },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efe7ff] text-[#5a2dff]">
              <BellAlertIcon className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                    {unreadCount} chưa đọc
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                Quản lý và theo dõi tất cả thông báo hệ thống.
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 rounded-xl border border-[#5a2dff]/40 px-5 py-2.5 text-sm font-semibold text-[#5a2dff] transition hover:bg-[#efe7ff] whitespace-nowrap"
            >
              <EnvelopeOpenIcon className="h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span className="flex-1">{actionError}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl bg-gray-100 p-1 w-fit">
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-[#5a2dff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs ${
                      isActive ? 'bg-[#efe7ff] text-[#5a2dff]' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Notification List */}
          <div className="space-y-3">
            {/* List */}
            {loading ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <svg className="animate-spin h-6 w-6 mx-auto text-[#5a2dff]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-3 text-sm text-gray-400">Đang tải thông báo...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <p className="text-sm font-medium text-red-500">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-3 text-sm font-semibold text-[#5a2dff] hover:underline"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <BellIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">Không có thông báo nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((notif) => {
                  const typeLabel = TYPE_LABEL[notif.type] ?? notif.type;
                  const color = TYPE_COLOR[notif.type] ?? DEFAULT_COLOR;
                  const route = TYPE_ROUTE[notif.type];
                  const isUnread = !notif.isRead;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => { if (isUnread) markAsRead(notif.id); }}
                      className={`flex items-start gap-4 rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                        isUnread ? 'border-[#cbb6ff] bg-[#f8f5ff] cursor-pointer' : 'border-gray-100 bg-white'
                      }`}
                    >
                      {/* Icon */}
                      <span
                        className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                          isUnread ? color.bg : 'bg-gray-100'
                        }`}
                      >
                        {React.createElement(TYPE_ICON[notif.type] ?? BellIcon, {
                          className: `h-6 w-6 ${isUnread ? color.text : 'text-gray-400'}`,
                        })}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.bg} ${color.text}`}>
                            {typeLabel}
                          </span>
                          {isUnread && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                              Mới
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{formatTimeAgo(notif.createdAt)}</span>
                        </div>

                        <p className="text-sm font-semibold text-gray-900">
                          {notif.title || typeLabel}
                        </p>
                        {(notif.message || notif.content) && (
                          <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                            {notif.message || notif.content}
                          </p>
                        )}
                        {notif.sender && (
                          <p className="mt-0.5 text-xs text-gray-400">Từ: {notif.sender}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{formatDate(notif.createdAt)}</p>

                        {isUnread && (
                          <p className="mt-1 text-xs font-medium text-[#5a2dff]/60">
                            Nhấn vào thông báo để đánh dấu đã đọc
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex flex-col items-end gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {route && (
                          <button
                            type="button"
                            onClick={() => { markAsRead(notif.id); navigate(route); }}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${color.bg} ${color.text} hover:opacity-80`}
                            title="Xem và xét duyệt"
                          >
                            Xét duyệt
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notif.id)}
                              title="Đánh dấu đã đọc"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#efe7ff] hover:text-[#5a2dff]"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteNotification(notif.id)}
                            title="Xóa thông báo"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Stats */}
          <aside className="space-y-4 self-start sticky top-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tổng thông báo</span>
                  <span className="font-semibold text-gray-900">{notifications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Chưa đọc</span>
                  <span className="font-semibold text-red-500">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Đã đọc</span>
                  <span className="font-semibold text-green-600">{notifications.length - unreadCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
              <div className="space-y-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                  >
                    <span>Đánh dấu tất cả đã đọc</span>
                    <span className="text-gray-300">›</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={refetch}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                >
                  <span>Tải lại thông báo</span>
                  <span className="text-gray-300">›</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
