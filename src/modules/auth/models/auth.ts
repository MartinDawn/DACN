export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    role: 'Student' | 'Instructor' | string;
}

export interface ForgetPasswordRequest {
    email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T | null;
}

export interface LoginResponse {
    accessToken: string;
    role: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface RegisterResponse {
    id: string;
    userName: string;
    role: string;
}

export interface User {
    role: string[];
    email?: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface SendOTPRequest {
    email: string;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
    type: 'Register' | 'ForgotPassword';
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    otp: string;
}

export type ServiceResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
    // for google auth url
    url?: string;
};
