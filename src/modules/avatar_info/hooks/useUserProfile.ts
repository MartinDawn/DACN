// src/hooks/useUserProfile.ts (ĐÃ SỬA LỖI)

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { profileService } from "../services/profile.service";
import type { UserProfile, UpdateProfilePayload } from "../models/userProfile.model";

// --- Helpers (Giữ nguyên, không đổi) ---

/**
 * Chuyển đổi ngày ISO từ API (VD: "2000-06-15T00:00:00")
 * sang dạng "DD/MM/YYYY" (VD: "15/06/2000")
 */
export const formatBirthDateToInput = (isoDate: string): string => {
  if (!isoDate) return "Chưa cập nhật";
  try {
    const date = new Date(isoDate);
    // Kiểm tra năm không hợp lệ (như 1363 trong ví dụ)
    if (isNaN(date.getTime()) || date.getFullYear() < 1900) {
      return "Chưa cập nhật";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Chưa cập nhật";
  }
};

/**
 * Chuyển đổi ngày "DD/MM/YYYY" từ input
 * sang dạng ISO "YYYY-MM-DDTHH:mm:ss"
 */
export const formatBirthDateToApi = (inputDate: string): string => {
  if (!inputDate || inputDate === "Chưa cập nhật") {
    // Trả về null hoặc một ngày default
    return new Date().toISOString();
  }
  try {
    const parts = inputDate.split("/"); // [DD, MM, YYYY]
    if (parts.length !== 3) return new Date().toISOString();
    // new Date(YYYY, MM - 1, DD)
    const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    if (isNaN(date.getTime())) return new Date().toISOString();
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};

/**
 * Hook để lấy dữ liệu profile (giống useQuery)
 */
export const useUserProfileData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // --- SỬA ĐỔI ---
      // Service (getProfile) bây giờ trả về UserProfile trực tiếp
      // hoặc ném ra lỗi (mà khối catch sẽ bắt)
      const data = await profileService.getProfile();
      setProfileData(data); // Gán data trực tiếp
      
      // Bỏ toàn bộ phần check response.data.success

    } catch (err: any) {
      // Khối catch này sẽ bắt lỗi từ service
      console.error("Failed to fetch profile", err);
      const msg = err.message || "Không thể tải thông tin cá nhân.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { profileData, isLoading, error, fetchProfile };
};

/**
 * Hook để cập nhật profile (giống useMutation)
 */
export const useUpdateProfile = () => {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Hàm lưu trữ, bao gồm cả upload avatar và cập nhật thông tin
   */
  const saveProfile = useCallback(
    async (
      currentState: {
        personalInfo: any; // Dùng kiểu PersonalInfo từ component
        about: string;
        website: string;
      },
      avatarFile: File | null
    ): Promise<{
      success: boolean;
      newProfile: UserProfile | null;
      newAvatarUrl: string | null;
    }> => {
      setIsSaving(true);
      let newAvatarUrl: string | null = null;

      // 1. Tải avatar lên (nếu có)
      if (avatarFile) {
        try {
          // --- PHẦN NÀY ĐÃ ĐÚNG ---
          // Service (uploadAvatar) trả về { avatarUrl: string }
          // hoặc ném ra lỗi (mà khối catch sẽ bắt)
          const uploadResponse = await profileService.uploadAvatar(avatarFile);
          newAvatarUrl = uploadResponse.avatarUrl;
          toast.success("Tải lên ảnh đại diện thành công!");
        } catch (err: any) {
          console.error("Avatar upload failed", err);
          toast.error(err.message || "Tải lên ảnh đại diện thất bại.");
          setIsSaving(false);
          return { success: false, newProfile: null, newAvatarUrl: null };
        }
      }

      // 2. Cập nhật thông tin profile
      try {
        // Map từ state component sang payload API (Giữ nguyên)
        const payload: UpdateProfilePayload = {
          fullName: currentState.personalInfo.fullName,
          jobPosition: currentState.personalInfo.jobTitle,
          phoneNumber: currentState.personalInfo.phone,
          location: currentState.personalInfo.address,
          organization: currentState.personalInfo.company,
          birthDate: formatBirthDateToApi(currentState.personalInfo.birthday),
          gender: currentState.personalInfo.gender,
          experience: currentState.personalInfo.experience,
          description: currentState.about,
          website: currentState.website,
        };

        // --- SỬA ĐỔI ---
        // Service (updateProfile) bây giờ trả về UserProfile trực tiếp
        // hoặc ném ra lỗi (mà khối catch sẽ bắt)
        const updatedProfile = await profileService.updateProfile(payload);

        toast.success("Cập nhật thông tin thành công!");
        return {
          success: true,
          newProfile: updatedProfile, // Gán profile mới
          newAvatarUrl: newAvatarUrl,
        };
        // Bỏ toàn bộ phần check response.data.success

      } catch (err: any) {
        // Khối catch này sẽ bắt lỗi từ service
        console.error("Failed to save profile", err);
        toast.error(err.message || "Lưu thông tin thất bại.");
        return { success: false, newProfile: null, newAvatarUrl: newAvatarUrl };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { saveProfile, isSaving };
};