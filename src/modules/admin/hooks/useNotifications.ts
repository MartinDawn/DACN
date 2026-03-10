import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../header/services/notification.service';
import type { NotificationApiItem } from '../../header/models/notification.model';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationApiItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
        } catch (err: any) {
            console.error("Error fetching notifications:", err);
            setError(err.message || 'Có lỗi xảy ra khi tải thông báo.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setActionError(null);
        // Optimistic update — giống user side
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await notificationService.markAllAsRead();
        } catch (err: any) {
            console.error("Error marking all as read:", err);
            setActionError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi đánh dấu tất cả đã đọc.');
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        loading,
        error,
        actionError,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
};
