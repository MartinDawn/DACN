import apiClient from "../../auth/services/apiClient"; 
import type { UserProfile, UpdateProfilePayload } from "../models/userProfile.model.ts";


type InternalApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Lấy thông tin profile của user
 */
const getProfile = async (): Promise<UserProfile> => {
  // 4. DÙNG 'apiClient'
  const response = await apiClient.get<InternalApiResponse<UserProfile>>('/Account/profile');
  
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
  // 4. DÙNG 'apiClient'
  const response = await apiClient.put<InternalApiResponse<UserProfile>>(
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

  // 4. DÙNG 'apiClient'
  const response = await apiClient.post<InternalApiResponse<{ avatarUrl: string }>>(
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