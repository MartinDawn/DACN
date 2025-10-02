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
    role: 'Student' | 'Instructor';
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
}

export interface RegisterResponse {
    id: string;
    userName: string;
    role: string;
}

export interface User {
    role: string;
}