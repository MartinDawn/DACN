import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../auth/models/auth";
import type { UserResponse, InstructorRequest } from "../models/user.model";

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
  async getInstructorRequests(): Promise<ApiResponse<InstructorRequest[]>> {
    const response = await apiClient.get<ApiResponse<InstructorRequest[]>>('/Account/instructor-requests');
    return response.data;
  },
  async approveInstructorRequest(requestId: number, isApproved: boolean): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/Account/approve-instructor-request', { requestId, isApproved });
    return response.data;
  },
};
