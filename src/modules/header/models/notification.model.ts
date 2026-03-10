export type NotificationCategory =
  | "courses"
  | "achievements"
  | "social"
  | "offers"
  | "system"
  | "reminders";

export type NotificationFilter =
  | "all"
  | "unread"
  | "courses"
  | "achievements"
  | "social"
  | "offers";

export type NotificationStatus = "read" | "unread";

export interface NotificationApiItem {
  id: string;
  title?: string;
  message?: string;
  content?: string;
  type: string;
  sender?: string;
  courseName?: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface NotificationUiItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  tag: string;
  status: NotificationStatus;
  timeAgo: string;
  isThisWeek: boolean;
}
