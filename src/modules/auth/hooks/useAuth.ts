import { useState, useEffect } from 'react';
import type { 
    LoginRequest, 
    RegisterRequest, 
    ForgetPasswordRequest, 
    User, 
    ApiResponse, 
    RegisterResponse, 
    LoginResponse,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    ServiceResponse
} from '../models/auth';
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
            // If we have token but no user, try to load profile
            if (!user) {
                getProfile(token).catch(err => console.error('Failed to load profile on mount:', err));
            }
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
                const userData: User = {
                    role: response.data.role,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    avatarUrl: response.data.avatarUrl,
                };
                
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                authService.setAuthToken(response.data.accessToken);
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
            setError(null);
            
            // Call API to logout on server (remove refresh token from cookie)
            await authService.logout();
            
            // Clear client-side data
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            authService.setAuthToken('');
            
            // Redirect to homepage (guest route)
            window.location.href = '/homepage';
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
            setError(errorMessage);
            // Still clear client-side data even if API fails
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            authService.setAuthToken('');
            // Redirect anyway
            window.location.href = '/homepage';
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendOTP = async (data: SendOTPRequest) => {
        try {
            setLoading(true);
            setError(null);
            // console.log(data.email);
            const response = await authService.sendOTP(data);
            
            if (!response.success) {
                setError(response.message);
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(apiError.message || 'Đã xảy ra lỗi khi gửi mã OTP');
            } else {
                setError('Đã xảy ra lỗi khi gửi mã OTP');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async (data: VerifyOTPRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.verifyOTP(data);
            
            if (!response.success) {
                setError(response.message);
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(apiError.message || 'Đã xảy ra lỗi khi xác thực mã OTP');
            } else {
                setError('Đã xảy ra lỗi khi xác thực mã OTP');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (data: ResetPasswordRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.resetPassword(data);
            
            if (!response.success) {
                setError(response.message);
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(apiError.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
            } else {
                setError('Đã xảy ra lỗi khi đặt lại mật khẩu');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getGoogleAuthUrl = async (returnUrl: string): Promise<string | null> => {
        try {
            setLoading(true);
            setError(null);
            const res = await authService.getGoogleAuthUrl(returnUrl);

            // Normalize possible shapes into a single absolute URL:
            let url: string | null = null;
            if (res) {
                if (res.url && typeof res.url === 'string') {
                    url = res.url;
                } else if (typeof res.data === 'string') {
                    url = res.data;
                } else if (res.data && typeof (res.data as any).url === 'string') {
                    url = (res.data as any).url;
                }
            }

            // If url is relative, prefix with current origin
            if (url && url.startsWith('/')) {
                url = (typeof window !== 'undefined' ? window.location.origin : '') + url;
            }

            if (!url) {
                const msg = res?.message || 'Không nhận được đường dẫn Google từ server';
                setError(msg);
                return null;
            }

            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi khi lấy Google auth url';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getProfile = async (token?: string) => {
        try {
            setLoading(true);
            setError(null);

            // If token provided (from Google redirect), persist and set header so subsequent calls use it
            if (token) {
                try { localStorage.setItem('accessToken', token); } catch (e) { /* ignore */ }
                authService.setAuthToken(token);
            }

            const res = await authService.getProfile(token);

            // If successful and contains user info, update local user state
            if (res?.success && res.data) {
                // Merge with existing user or create new
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userData: User = {
                    role: res.data.role || existingUser.role || 'Student',
                    email: res.data.email || existingUser.email,
                    fullName: res.data.fullName || existingUser.fullName,
                    avatarUrl: res.data.avatarUrl || existingUser.avatarUrl,
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            return res;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi khi lấy thông tin user';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const exchangeGoogleCode = async (code: string, state?: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await authService.exchangeGoogleCode(code, state);

            if (!res.success) {
                setError(res.message || 'Không thể xử lý Google callback');
                return null;
            }

            const token = res.data?.accessToken;
            if (!token) {
                setError('Backend không trả access token');
                return null;
            }

            // persist token & set header
            try { localStorage.setItem('accessToken', token); } catch (e) {}
            authService.setAuthToken(token);

            // fetch profile after exchange
            const profileRes = await getProfile(token);
            return { exchange: res, profile: profileRes };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xử lý Google callback';
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
        isAuthenticated: !!user,
        sendOTP,
        verifyOTP,
        resetPassword,
        getGoogleAuthUrl,
        getProfile,
        exchangeGoogleCode
    };
};