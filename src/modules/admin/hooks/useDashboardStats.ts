import { useState, useEffect, useRef } from 'react';
import dashboardService from '../services/dashboardService';
import { useRefreshOnLanguageChange } from '../../../hooks/useRefreshOnLanguageChange';
import type { DashboardData } from '../models/dashboard';

export const useDashboardStats = () => {
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Track if stats have been loaded for language refresh
    const statsLoaded = useRef(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getStats();
            setStats(data);
            statsLoaded.current = true;
        } catch (err: any) {
            console.error("Error fetching dashboard stats:", err);
            setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê.');
        } finally {
            setLoading(false);
        }
    };

    // Auto refresh on language change
    useRefreshOnLanguageChange(() => {
        if (statsLoaded.current) {
            fetchStats();
        }
    });

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error };
};
