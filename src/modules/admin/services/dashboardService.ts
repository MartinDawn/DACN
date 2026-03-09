import axios from 'axios';
import type { DashboardData, DashboardResponse, Notification, NotificationsResponse } from '../models/dashboard';

// const API_URL = 'http://dacn.runasp.net/api';
const API_URL = '/api';


const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': 'vi'
    };
};

const dashboardService = {
    getStats: async (): Promise<DashboardData> => {
        const response = await axios.get<DashboardResponse>(`${API_URL}/Dashboard/stats`, {
            headers: getAuthHeaders()
        });
        return response.data.data;
    },

    getNotifications: async (): Promise<Notification[]> => {
        const response = await axios.get<NotificationsResponse>(`${API_URL}/Dashboard/notifications`, {
            headers: getAuthHeaders()
        });
        return response.data.data.notifications;
    },
};

export default dashboardService;
