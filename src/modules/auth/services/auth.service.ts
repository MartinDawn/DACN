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
    ResetPasswordRequest
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
        // Dùng apiClient ngay cả khi logout
        try {
          await apiClient.post('/Account/logout');
        } catch (error) {
          console.error("Logout failed on server, logging out client-side anyway.", error);
        }
        
        localStorage.removeItem('accessToken');
        // 4. XÓA TOKEN KHỎI CLIENT INSTANCE
        delete apiClient.defaults.headers.common['Authorization'];
    },

    setAuthToken(token: string) {
        // 5. SET TOKEN TRÊN CLIENT INSTANCE
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
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