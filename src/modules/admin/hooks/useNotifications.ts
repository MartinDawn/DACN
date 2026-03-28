import { useState, useEffect, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { API_CONFIG } from '../../../config/api.config';
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

    useEffect(() => {
        let connection: HubConnection | null = null;

        const NOTIFICATION_HUB_PATH = '/notificationHub';

        const startSignalR = async (token: string): Promise<HubConnection> => {
            const hubUrl = `${API_CONFIG.baseURL.replace(/\/$/, '')}${NOTIFICATION_HUB_PATH}`;
            console.info('SignalR (admin) connecting to', hubUrl);

            const conn = new HubConnectionBuilder()
                .withUrl(hubUrl, {
                    accessTokenFactory: () => token,
                    transport: HttpTransportType.WebSockets,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            conn.on('ReceiveNotification', (notification: NotificationApiItem) => {
                const notifId = notification.id ?? `${notification.type}-${notification.createdAt || Date.now()}`;
                // console.log('SignalR ReceiveNotification (admin):', notification, 'id:', notifId);

                setNotifications((prev) => {
                    if (prev.some((n) => n.id === notifId)) {
                        console.info('SignalR (admin): duplicate notification ignored', notifId);
                        return prev;
                    }

                    return [
                        {
                            ...notification,
                            id: notifId,
                            type: notification.type ?? 'system',
                            isRead: notification.isRead ?? false,
                            createdAt: notification.createdAt ?? new Date().toISOString(),
                        },
                        ...prev,
                    ];
                });
            });

            conn.onreconnecting((err) => {
                console.warn('SignalR reconnecting (admin):', err);
            });

            conn.onreconnected((connectionId) => {
                console.info('SignalR reconnected (admin) connectionId:', connectionId);
            });

            conn.onclose((err) => {
                console.warn('SignalR closed (admin):', err);
            });

            await conn.start();
            console.info('SignalR connected (admin) at', hubUrl);
            return conn;
        };

        const connectHub = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.warn('SignalR admin: accessToken missing, skip connection');
                return;
            }

            try {
                connection = await startSignalR(token);
            } catch (error) {
                console.error('Không thể kết nối SignalR notification hub (admin):', error);
            }
        };

        connectHub();

        return () => {
            if (connection) {
                connection.stop().catch((error) => {
                    console.debug('Lỗi khi dừng SignalR notification hub (admin):', error);
                });
            }
        };
    }, []);

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
