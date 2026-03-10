import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/user.service';
import type { UserResponse, InstructorRequest } from '../models/user.model';

export const useUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersResponse, instructorsResponse] = await Promise.all([
        userService.getUsers(),
        userService.getInstructors(),
      ]);

      const combined: UserResponse[] = [];

      if (usersResponse.success) {
        combined.push(...(usersResponse.data || []));
      } else {
        setError(usersResponse.message || 'Không thể tải danh sách người dùng');
      }

      if (instructorsResponse.success) {
        combined.push(...(instructorsResponse.data || []));
      } else {
        setError(instructorsResponse.message || 'Không thể tải danh sách giảng viên');
      }

      const unique = Array.from(new Map(combined.map(u => [u.id, u])).values());
      setUsers(unique);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const banUser = async (userId: string, isBanned: boolean): Promise<boolean> => {
    try {
      const response = await userService.banUser(userId, isBanned);
      if (response.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned } : u));
        return true;
      } else {
        setError(response.message || 'Thao tác thất bại');
        return false;
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      return false;
    }
  };

  return { users, isLoading, error, refetch: fetchUsers, banUser };
};

export const useInstructorRequests = () => {
  const [requests, setRequests] = useState<InstructorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getInstructorRequests();
      if (response.success) {
        setRequests(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách yêu cầu giảng viên');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const approveRequest = async (id: number, isApproved: boolean, title: string, message: string): Promise<boolean> => {
    try {
      setError(null);
      setSuccessMessage(null);
      const result = await userService.approveInstructorRequest(id, isApproved, title, message);
      setRequests(prev => prev.filter(r => (r.requestId || r.id) !== (result?.requestId || id)));
      setSuccessMessage(result?.message || (isApproved ? 'Đã duyệt yêu cầu thành công' : 'Đã từ chối yêu cầu thành công'));
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.title || 'Lỗi kết nối. Vui lòng thử lại.';
      setError(msg);
      return false;
    }
  };

  return { requests, isLoading, error, successMessage, refetch: fetchRequests, approveRequest };
};
