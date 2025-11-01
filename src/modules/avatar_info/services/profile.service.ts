// src/services/profile.service.ts

import axios, { type InternalAxiosRequestConfig } from "axios";
// Bỏ import 'api' từ interceptor
// import api from "../../auth/services/apiClient"; 
import type { UserProfile, UpdateProfilePayload } from "../models/userProfile.model.ts";

// Thay vì import 'api', chúng ta tạo một instance axios đơn giản MỚI
const simpleApiClient = axios.create({
  baseURL: 'http://dacn.runasp.net/api', // Đặt baseURL ở đây
  headers: {
    'Accept-Language': 'vi',
    'Content-Type': 'application/json',
  },
});

/**
 * Thêm một interceptor REQUEST đơn giản
 * để tự động gắn token vào MỌI request
 */
simpleApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // if (!config.headers) {
      //   config.headers = {};
      // }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Kiểu dữ liệu giả định mà API trả về
 */
type InternalApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Lấy thông tin profile của user
 */
const getProfile = async (): Promise<UserProfile> => {
  // Dùng 'simpleApiClient' và đường dẫn tương đối (vì đã có baseURL)
  const response = await simpleApiClient.get<InternalApiResponse<UserProfile>>('/Account/profile');
  
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Không thể tải thông tin cá nhân.");
};

/**
 * Cập nhật thông tin profile
 */
const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  // Dùng 'simpleApiClient' và đường dẫn tương đối
  const response = await simpleApiClient.put<InternalApiResponse<UserProfile>>(
    '/Account/profile',
    payload
  );
  
  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Không thể cập nhật thông tin.");
};

/**
 * Tải lên avatar mới
 */
const uploadAvatar = async (
  avatarFile: File
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("file", avatarFile);

  // Dùng 'simpleApiClient' và đường dẫn tương đối
  const response = await simpleApiClient.post<InternalApiResponse<{ avatarUrl: string }>>(
    '/Account/avatar',
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (response.data && response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Không thể tải lên ảnh đại diện.");
};

export const profileService = {
  getProfile,
  updateProfile,
  uploadAvatar,
};