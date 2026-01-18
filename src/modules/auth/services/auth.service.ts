import apiClient from './apiClient'; 
import type { 
    LoginRequest, 
    RegisterRequest, 
    ForgetPasswordRequest, 
    ApiResponse,
    RegisterResponse,
    LoginResponse,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    ServiceResponse
} from '../models/auth';

export const authService = {
    async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/Account/login', data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
        const response = await apiClient.post<ApiResponse<RegisterResponse>>('/Account/register', data);
        return response.data;
    },

    async forgotPassword(data: ForgetPasswordRequest): Promise<ApiResponse<null>> {
        const response = await apiClient.post<ApiResponse<null>>('/Account/forgot-password', data);
        return response.data;
    },

    async logout(): Promise<void> {
        try {
          await apiClient.post('/Account/logout');
        } catch (error) {
          console.error("Logout failed on server, logging out client-side anyway.", error);
        }
        
        localStorage.removeItem('accessToken');
        delete apiClient.defaults.headers.common['Authorization'];
    },

    setAuthToken(token: string) {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
    },

    // NEW: Get Google auth URL (backend will return a redirect URL)
    async getGoogleAuthUrl(returnUrl?: string): Promise<ServiceResponse<{ url: string }>> {
        try {
            // Only send returnUrl when explicitly provided by caller.
            const config = returnUrl ? { params: { returnUrl } } : undefined;

            const response = await apiClient.get<any>(
                '/Account/google-auth-url',
                config
            );

            const payload = response.data;

            // Try many possible locations where the backend might put the URL.
            let foundUrl: string | null = null;

            // 1) payload itself is a direct string or relative path
            if (typeof payload === 'string' && (payload.startsWith('http') || payload.startsWith('/'))) {
                foundUrl = payload;
            }

            // 2) payload is an object
            if (!foundUrl && payload && typeof payload === 'object') {
                if (typeof payload.url === 'string' && (payload.url.startsWith('http') || payload.url.startsWith('/'))) {
                    foundUrl = payload.url;
                }
                else if (typeof payload.data === 'string' && (payload.data.startsWith('http') || payload.data.startsWith('/'))) {
                    foundUrl = payload.data;
                }
                else if (payload.data && typeof payload.data === 'object') {
                    if (typeof payload.data.url === 'string' && (payload.data.url.startsWith('http') || payload.data.url.startsWith('/'))) {
                        foundUrl = payload.data.url;
                    } else if (payload.data.data && typeof payload.data.data === 'string' && (payload.data.data.startsWith('http') || payload.data.data.startsWith('/'))) {
                        foundUrl = payload.data.data;
                    } else if (payload.data.data && typeof payload.data.data === 'object' && typeof payload.data.data.url === 'string' && (payload.data.data.url.startsWith('http') || payload.data.data.url.startsWith('/'))) {
                        foundUrl = payload.data.data.url;
                    }
                }
            }

            // 3) fallback to headers location or axios final request URL
            const headerLocation = (response && (response as any).headers && (response as any).headers.location) || null;
            const finalResponseUrl = (response && (response as any).request && (response as any).request.responseURL) || null;

            let finalUrl: string | null = foundUrl || headerLocation || finalResponseUrl || null;

            // If finalUrl is relative (starts with '/'), try to prefix with apiClient baseURL or window origin
            if (finalUrl && finalUrl.startsWith('/')) {
                const base = (apiClient && (apiClient as any).defaults && (apiClient as any).defaults.baseURL) || (typeof window !== 'undefined' ? window.location.origin : '');
                if (base) {
                    finalUrl = `${String(base).replace(/\/$/, '')}${finalUrl}`;
                } else {
                    finalUrl = (typeof window !== 'undefined' ? window.location.origin : '') + finalUrl;
                }
            }

            if (finalUrl) {
                return {
                    success: true,
                    message: payload?.message || null,
                    data: { url: finalUrl },
                    url: finalUrl
                };
            }

            return {
                success: false,
                message: 'Không tìm thấy đường dẫn Google từ server',
            };
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Lỗi khi lấy đường dẫn Google';
            return {
                success: false,
                message
            };
        }
    },

    // NEW: Exchange Google callback code (call backend callback endpoint directly)
    async exchangeGoogleCode(code: string, state?: string): Promise<ServiceResponse<{ accessToken?: string }>> {
        try {
            // Use GET since OAuth callback on backend often is GET with code/state
            const response = await apiClient.get<any>('/Account/google-callback', {
                params: {
                    code,
                    state
                }
            });

            const payload = response.data;

            // Try to find token in common places
            let accessToken: string | undefined = undefined;
            if (payload && typeof payload === 'object') {
                if (typeof payload.data === 'string' && payload.data) {
                    // payload.data might be token string
                    accessToken = payload.data;
                } else if (payload.data && typeof payload.data.accessToken === 'string') {
                    accessToken = payload.data.accessToken;
                } else if (typeof payload.accessToken === 'string') {
                    accessToken = payload.accessToken;
                } else if (payload.data && payload.data.token) {
                    accessToken = payload.data.token;
                }
            } else if (typeof payload === 'string' && payload) {
                accessToken = payload;
            }

            if (accessToken) {
                return { success: true, message: payload?.message || null, data: { accessToken } };
            }

            // Fallback: maybe backend included token in headers or final response url
            const headerToken = (response && (response as any).headers && ((response as any).headers['x-access-token'] || (response as any).headers['authorization'])) || null;
            if (headerToken && typeof headerToken === 'string') {
                const t = headerToken.replace(/^Bearer\s*/i, '');
                return { success: true, message: payload?.message || null, data: { accessToken: t } };
            }

            return { success: false, message: 'Không nhận được access token từ callback backend' };
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Lỗi khi gọi callback Google trên server';
            return { success: false, message };
        }
    },

    // NEW: Fetch profile optionally using a provided token (used after Google redirect)
    async getProfile(token?: string): Promise<ApiResponse<any>> {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const response = await apiClient.get<ApiResponse<any>>('/Account/profile', { headers });
        return response.data;
    },

    async sendOTP(data: SendOTPRequest): Promise<ApiResponse<null>> {
        const response = await apiClient.post<ApiResponse<null>>(
            '/Account/send-otp', 
            null, 
            {
                params: {
                    email: data.email
                }
            }
        );
        return response.data;
    },

    async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<null>> {
        const response = await apiClient.post<ApiResponse<null>>('/Account/verify-otp', data);
        return response.data;
    },

    async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
        const response = await apiClient.post<ApiResponse<null>>('/Account/reset-password', data);
        return response.data;
    }
};