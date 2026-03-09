export interface DashboardStats {
    totalStudents: number;
    totalInstructors: number;
    approvedCourses: number;
    pendingCourses: number;
}

export interface UserGrowth {
    month: number;
    year: number;
    newStudents: number;
    newInstructors: number;
}

export interface Revenue {
    month: number;
    year: number;
    totalRevenue: number;
}

export interface TrendingCourse {
    id: string;
    name: string;
    salesCount: number;
    revenue: number;
}

export interface TrendingTag {
    id: string;
    name: string;
    usageCount: number;
}

export interface DashboardData {
    stats: DashboardStats;
    userGrowth: UserGrowth[];
    revenue: Revenue[];
    trendingCourses: TrendingCourse[];
    trendingTags: TrendingTag[];
}

export interface DashboardResponse {
    success: boolean;
    code: string;
    message: string;
    data: DashboardData;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead?: boolean;
    createdAt: string;
    type?: string;
}

export interface NotificationsData {
    notifications: Notification[];
}

export interface NotificationsResponse {
    success: boolean;
    code: string;
    message: string;
    data: NotificationsData;
}
