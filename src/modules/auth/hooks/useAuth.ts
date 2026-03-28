import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type {
    LoginRequest,
    RegisterRequest,
    ForgetPasswordRequest,
    User,
    ApiResponse,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest
} from '../models/auth';
import { authService } from '../services/auth.service';
import { mapAuthErrorToTranslation } from '../utils/auth.utils';
import axios from 'axios';

// Function to get default route based on user role
const getDefaultRoute = (user: User | null): string => {
    if (!user) return '/login';

    if (user.role?.includes('Admin') || user.role?.includes('Administrator')) {
        return '/admin/dashboard';
    } else if (user.role?.includes('Instructor')) {
        return '/instructor/dashboard';
    } else {
        return '/user/home';
    }
};

// Function to decode JWT payload
const decodeJWT = (token: string) => {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
};

export const useAuth = () => {
    const { t } = useTranslation();
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
                setError(mapAuthErrorToTranslation(response.message, t));
                return null;
            }

            if (response.data) {
                const token = response.data.accessToken;
                const decoded = decodeJWT(token);
                
                const userData: User = {
                    role: decoded?.role || [],
                    email: response.data.email || decoded?.email,
                    fullName: response.data.fullName || decoded?.fullName,
                    avatarUrl: response.data.avatarUrl,
                };
                
                localStorage.setItem('accessToken', token);
                localStorage.setItem('user', JSON.stringify(userData));
                authService.setAuthToken(token);
                setUser(userData);
            }
            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(mapAuthErrorToTranslation(apiError.message, t));
            } else {
                setError(t('errors.auth.loginFailed'));
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
                setError(mapAuthErrorToTranslation(response.message, t));
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(mapAuthErrorToTranslation(apiError.message, t));
            } else {
                setError(t('errors.auth.registerFailed'));
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
            const errorMessage = err instanceof Error ? err.message : t('errors.auth.passwordResetFailed');
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
            const errorMessage = err instanceof Error ? err.message : t('errors.auth.logoutFailed');
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
                setError(mapAuthErrorToTranslation(response.message, t));
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(mapAuthErrorToTranslation(apiError.message, t));
            } else {
                setError(t('errors.auth.otpSendFailed'));
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
                setError(mapAuthErrorToTranslation(response.message, t));
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(mapAuthErrorToTranslation(apiError.message, t));
            } else {
                setError(t('errors.auth.otpVerifyFailed'));
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
                setError(mapAuthErrorToTranslation(response.message, t));
                return null;
            }

            return response;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const apiError = err.response.data as ApiResponse<null>;
                setError(mapAuthErrorToTranslation(apiError.message, t));
            } else {
                setError(t('errors.auth.passwordResetError'));
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
                const msg = res?.message || t('errors.auth.googleUrlNotFound');
                setError(msg);
                return null;
            }

            return url;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('errors.auth.googleUrlError');
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
                // Decode JWT to get role if not in profile response
                const tokenToDecode = token || localStorage.getItem('accessToken');
                const decoded = tokenToDecode ? decodeJWT(tokenToDecode) : null;
                
                // Merge with existing user or create new
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const userData: User = {
                    role: Array.isArray(res.data.role) ? res.data.role : (decoded?.role || existingUser.role || []),
                    email: res.data.email || existingUser.email,
                    fullName: res.data.fullName || existingUser.fullName,
                    avatarUrl: res.data.avatarUrl || existingUser.avatarUrl,
                };
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            return res;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('errors.auth.profileError');
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
                setError(res.message || t('errors.auth.exchangeGoogleError'));
                return null;
            }

            const token = res.data?.accessToken;
            if (!token) {
                setError(t('errors.auth.noAccessToken'));
                return null;
            }

            // persist token & set header
            try { localStorage.setItem('accessToken', token); } catch (e) {}
            authService.setAuthToken(token);

            // Decode JWT to get role
            const decoded = decodeJWT(token);
            const role = decoded?.role || [];

            // fetch profile after exchange for additional info
            const profileRes = await getProfile(token);

            // Set user data
            const userData: User = {
                role: role,
                email: profileRes?.data?.email,
                fullName: profileRes?.data?.fullName,
                avatarUrl: profileRes?.data?.avatarUrl,
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return { exchange: res, profile: profileRes };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('errors.auth.exchangeGoogleError');
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
        exchangeGoogleCode,
        getDefaultRoute: () => getDefaultRoute(user)
    };
};