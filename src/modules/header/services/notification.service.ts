import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../auth/models/auth";
import type { NotificationApiItem } from "../models/notification.model";

export const notificationService = {
  async getMyNotifications(): Promise<NotificationApiItem[]> {
    const response = await apiClient.get<ApiResponse<NotificationApiItem[]>>(
      "/Notification/my-notifications",
    );
    return response.data.data ?? [];
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/Notification/mark-as-read/${id}`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post("/Notification/mark-all-as-read");
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/Notification/${id}`);
  },
};
