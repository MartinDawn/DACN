import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://dacn.runasp.net/api';
// const API_URL = 'http://localhost:5223/api';

/**
 * Tạo instance axios trung tâm
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept-Language': 'vi',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi cookie (refresh token)
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Chỉ lấy token từ localStorage khi request
    const token = localStorage.getItem('accessToken');
    
    // Không gắn token cho request refresh
    if (token && !config.url?.includes('/Account/refresh-token')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
/**
 * --- Biến quản lý refresh token ---
 */
let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

/**
 * Xử lý hàng đợi các request bị 401 trong lúc refresh token
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedRequestsQueue.forEach(pending => {
    if (error) {
      pending.reject(error);
    } else if (token) {
      if (!pending.config.headers) pending.config.headers = {};
      pending.config.headers['Authorization'] = `Bearer ${token}`;
      pending.resolve(apiClient(pending.config));
    }
  });
  failedRequestsQueue = [];
};

/**
 * --- Interceptor Response ---
 */
apiClient.interceptors.response.use(
  response => response, // Thành công thì trả về luôn
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Nếu không phải lỗi 401 thì trả về luôn
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Nếu request là refresh-token thì logout luôn
    if (originalRequest.url?.includes('/Account/refresh-token')) {
      console.error('Refresh token failed or expired. Cleaning up client session.');
      // local cleanup (don't import authService)
      try {
        localStorage.removeItem('accessToken');
      } catch (e) {
        // ignore
      }
      delete apiClient.defaults.headers.common['Authorization'];
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô hạn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    // Nếu đang refresh -> xếp hàng đợi
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    // --- Bắt đầu refresh token ---
    isRefreshing = true;

    try {
      const response = await apiClient.post<{ data: { accessToken: string } }>(
        '/Account/refresh-token'
      );

      const newAccessToken = response.data.data.accessToken;

      // 1. Lưu token mới
      localStorage.setItem('accessToken', newAccessToken);

      // 2. Cập nhật header mặc định
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      // 3. Gọi lại các request trong hàng đợi
      processQueue(null, newAccessToken);

      // 4. Gọi lại request gốc
      if (!originalRequest.headers) originalRequest.headers = {};
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error('Failed to refresh token', refreshError);

      processQueue(refreshError as Error, null);

      try {
        localStorage.removeItem('accessToken');
      } catch (e) {
        // ignore
      }
      delete apiClient.defaults.headers.common['Authorization'];

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
