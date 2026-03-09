import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';
import type { Notification } from '../models/dashboard';

const READ_NOTIFICATIONS_KEY = 'admin_read_notifications';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [readIds, setReadIds] = useState<Set<string>>(() => {
        const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    });

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getNotifications();
                setNotifications(data);
            } catch (err: any) {
                console.error("Error fetching notifications:", err);
                setError(err.message || 'Có lỗi xảy ra khi tải thông báo.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAllAsRead = useCallback(() => {
        const allIds = notifications.map(n => n.id);
        const newReadIds = new Set([...Array.from(readIds), ...allIds]);
        setReadIds(newReadIds);
        localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(Array.from(newReadIds)));
    }, [notifications, readIds]);

    const notificationsWithReadStatus = notifications.map(n => ({
        ...n,
        isRead: readIds.has(n.id),
    }));

    const unreadCount = notificationsWithReadStatus.filter(n => !n.isRead).length;

    return { notifications: notificationsWithReadStatus, unreadCount, loading, error, markAllAsRead };
};
