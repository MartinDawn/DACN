import { useState, useEffect, useCallback, useMemo } from "react";
import { notificationService } from "../services/notification.service";
import type {
  NotificationApiItem,
  NotificationCategory,
  NotificationUiItem,
} from "../models/notification.model";

const TYPE_TO_CATEGORY: Record<string, NotificationCategory> = {
  course_update: "courses",
  course: "courses",
  CourseUpdate: "courses",
  Course: "courses",
  achievement: "achievements",
  Achievement: "achievements",
  comment: "social",
  social: "social",
  Social: "social",
  message: "social",
  Message: "social",
  promotion: "offers",
  offer: "offers",
  Promotion: "offers",
  Offer: "offers",
  system: "system",
  System: "system",
  reminder: "reminders",
  Reminder: "reminders",
};

const TAG_LABELS: Record<NotificationCategory, string> = {
  courses: "Cập nhật khóa học",
  achievements: "Thành tích",
  social: "Cộng đồng",
  offers: "Khuyến mãi",
  system: "Hệ thống",
  reminders: "Nhắc nhở",
};

function getCategory(type: string): NotificationCategory {
  return TYPE_TO_CATEGORY[type] ?? "system";
}

function formatTimeAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "1 ngày trước";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks === 1) return "1 tuần trước";
  return `${diffWeeks} tuần trước`;
}

function isThisWeek(createdAt: string): boolean {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  return diffMs <= 7 * 24 * 60 * 60 * 1000;
}

function mapApiToUi(item: NotificationApiItem): NotificationUiItem {
  const category = getCategory(item.type);
  const title =
    item.title ??
    (item.courseName ? `Cập nhật: ${item.courseName}` : "Thông báo mới");
  const message =
    item.message ??
    item.content ??
    (item.sender ? `Từ: ${item.sender}` : "");

  return {
    id: item.id,
    title,
    message,
    category,
    tag: TAG_LABELS[category],
    status: item.isRead ? "read" : "unread",
    timeAgo: formatTimeAgo(item.createdAt),
    isThisWeek: isThisWeek(item.createdAt),
  };
}

export const useMyNotifications = () => {
  const [items, setItems] = useState<NotificationUiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getMyNotifications();
      setItems(data.map(mapApiToUi));
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "read" as const } : item,
      ),
    );
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Keep optimistic update even if API fails
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setItems((prev) => prev.map((item) => ({ ...item, status: "read" as const })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Keep optimistic update even if API fails
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch {
      // Keep optimistic update even if API fails
    }
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => item.status === "unread").length,
    [items],
  );

  const thisWeekCount = useMemo(
    () => items.filter((item) => item.isThisWeek).length,
    [items],
  );

  return {
    items,
    loading,
    error,
    unreadCount,
    thisWeekCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
