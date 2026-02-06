import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import type { DashboardData } from '../models/dashboard';

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getStats();
                setStats(data);
            } catch (err: any) {
                console.error("Error fetching dashboard stats:", err);
                setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return { stats, loading, error };
};
