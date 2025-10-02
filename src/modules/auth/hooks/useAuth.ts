import { useState, useEffect } from 'react';
import type { LoginRequest, RegisterRequest, ForgetPasswordRequest, User, ApiResponse, RegisterResponse, LoginResponse } from '../models/auth';
import { authService } from '../services/auth.service';
import axios from 'axios';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            authService.setAuthToken(token);
        }
    }, []);

    const login = async (data: LoginRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(data);
            
            if (!response.success) {
                setError(response.message);
                return null;
            }

            if (response.data) {
                const { accessToken, role } = response.data;
                const userData: User = { role };
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                authService.setAuthToken(accessToken);
                setUser(userData);
            }
            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(apiError.message || 'Đã xảy ra lỗi khi đăng nhập');
            } else {
                setError('Đã xảy ra lỗi khi đăng nhập');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(data);
            
            if (!response.success) {
                setError(response.message);
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(apiError.message || 'Đã xảy ra lỗi khi đăng ký');
            } else {
                setError('Đã xảy ra lỗi khi đăng ký');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (data: ForgetPasswordRequest) => {
        try {
            setLoading(true);
            setError(null);
            await authService.forgotPassword(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during password reset';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            localStorage.removeItem('accessToken');
            authService.setAuthToken('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        login,
        register,
        forgotPassword,
        logout,
        isAuthenticated: !!user
    };
};