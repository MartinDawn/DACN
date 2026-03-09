import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../auth/models/auth";
import type { UserResponse } from "../models/user.model";

export const userService = {
  async getUsers(): Promise<ApiResponse<UserResponse[]>> {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/Account/users');
    return response.data;
  },
  async getInstructors(): Promise<ApiResponse<UserResponse[]>> {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/Account/instructors');
    return response.data;
  },
  async banUser(userId: string, isBanned: boolean): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/Account/ban-user', { userId, isBanned });
    return response.data;
  },
};
