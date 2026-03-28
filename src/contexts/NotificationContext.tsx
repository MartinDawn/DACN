import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel } from "@microsoft/signalr";
import { notificationService } from "../modules/header/services/notification.service";
import { useRefreshOnLanguageChange } from "../hooks/useRefreshOnLanguageChange";
import { API_CONFIG } from "../config/api.config";
import type {
  NotificationApiItem,
  NotificationCategory,
  NotificationUiItem,
} from "../modules/header/models/notification.model";

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

interface NotificationContextType {
  items: NotificationUiItem[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  thisWeekCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [items, setItems] = useState<NotificationUiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if notifications have been loaded for language refresh
  const notificationsLoaded = useRef(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getMyNotifications();
      setItems(data.map(mapApiToUi));
      notificationsLoaded.current = true;
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto refresh on language change
  useRefreshOnLanguageChange(() => {
    if (notificationsLoaded.current) {
      fetchNotifications();
    }
  });

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

  useEffect(() => {
    let connection: HubConnection | null = null;

    const NOTIFICATION_HUB_PATH = "/notificationHub";

    const startSignalR = async (token: string): Promise<HubConnection> => {
      const url = `${API_CONFIG.baseURL.replace(/\/$/, "")}${NOTIFICATION_HUB_PATH}`;
      console.info("SignalR connecting to", url);

      const conn = new HubConnectionBuilder()
        .withUrl(url, {
          accessTokenFactory: () => token,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      conn.on("ReceiveNotification", (notification: NotificationApiItem) => {
        const notifId = notification.id ?? `${notification.type}-${notification.createdAt || Date.now()}`;
        // console.log("SignalR ReceiveNotification:", notification, "id:", notifId);

        setItems((prevItems) => {
          if (prevItems.some((n) => n.id === notifId)) {
            console.info("SignalR: duplicate notification ignored", notifId);
            return prevItems;
          }

          return [
            mapApiToUi({
              ...notification,
              id: notifId,
              type: notification.type ?? "system",
              isRead: notification.isRead ?? false,
              createdAt: notification.createdAt ?? new Date().toISOString(),
            }),
            ...prevItems,
          ];
        });
      });

      conn.onreconnecting((err) => {
        console.warn("SignalR reconnecting", err);
      });

      conn.onreconnected((connId) => {
        console.info("SignalR reconnected", connId);
      });

      conn.onclose((err) => {
        console.warn("SignalR closed", err);
      });

      await conn.start();
      console.info("Connected SignalR hub at", url);
      return conn;
    };

    const connectHub = async () => {
      const token = localStorage.getItem("accessToken");
    //   console.log("NotificationContext: Checking accessToken for SignalR", !!token);
      if (!token) {
        console.warn("NotificationContext: accessToken missing, skip SignalR connection");
        return;
      }

      try {
        connection = await startSignalR(token);
        // console.log("NotificationContext: SignalR connected successfully");
      } catch (error) {
        console.error("NotificationContext: Không thể kết nối SignalR notification hub:", error);
      }
    };

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        // console.log("NotificationContext: accessToken changed, reconnecting SignalR");
        if (connection) {
          connection.stop().catch(console.error);
          connection = null;
        }
        connectHub();
      }
    };

    // Also check periodically for token changes (for programmatic changes)
    const checkTokenChange = () => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken !== lastTokenRef.current) {
        // console.log("NotificationContext: Token changed, reconnecting SignalR");
        if (connection) {
          connection.stop().catch(console.error);
          connection = null;
        }
        lastTokenRef.current = currentToken;
        connectHub();
      }
    };

    const lastTokenRef = { current: localStorage.getItem("accessToken") };
    const intervalId = setInterval(checkTokenChange, 1000); // Check every second

    window.addEventListener("storage", handleStorageChange);
    connectHub();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
      if (connection) {
        connection.stop().catch((error) => {
          console.debug("Lỗi khi dừng SignalR notification hub:", error);
        });
      }
    };
  }, []);

  const value: NotificationContextType = {
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

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Backward compatibility hook
export const useMyNotifications = () => {
  return useNotificationContext();
};