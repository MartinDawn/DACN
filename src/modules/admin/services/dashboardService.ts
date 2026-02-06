import axios from 'axios';
import type { DashboardData, DashboardResponse } from '../models/dashboard';

const API_URL = 'http://dacn.runasp.net/api';

const dashboardService = {
    getStats: async (): Promise<DashboardData> => {
        const token = localStorage.getItem('accessToken'); 
        const response = await axios.get<DashboardResponse>(`${API_URL}/Dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'vi'
            }
        });
        return response.data.data;
    },
};

export default dashboardService;
