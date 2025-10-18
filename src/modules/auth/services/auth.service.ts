import axios from 'axios';
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

const API_URL = 'http://dacn.runasp.net/api';

const axiosInstance = axios.create({
    headers: {
        'Accept-Language': 'vi',
        'Content-Type': 'application/json',
    }
});

export const authService = {
    async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const response = await axiosInstance.post<ApiResponse<LoginResponse>>(`${API_URL}/Account/login`, data);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
        const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(`${API_URL}/Account/register`, data);
        return response.data;
    },

    async forgotPassword(data: ForgetPasswordRequest): Promise<ApiResponse<null>> {
        const response = await axios.post<ApiResponse<null>>(`${API_URL}/Account/forgot-password`, data);
        return response.data;
    },

    async logout(): Promise<void> {
        await axios.post(`${API_URL}/Account/logout`);
        localStorage.removeItem('accessToken');
    },

    setAuthToken(token: string) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    async sendOTP(data: SendOTPRequest): Promise<ApiResponse<null>> {
        const response = await axiosInstance.post<ApiResponse<null>>(
            `${API_URL}/Account/send-otp`, 
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
        const response = await axiosInstance.post<ApiResponse<null>>(`${API_URL}/Account/verify-otp`, data);
        return response.data;
    },

    async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<null>> {
        const response = await axiosInstance.post<ApiResponse<null>>(`${API_URL}/Account/reset-password`, data);
        return response.data;
    }
};