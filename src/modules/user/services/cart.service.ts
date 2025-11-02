// src/services/cart.service.ts

import axios from 'axios';
// Giả sử ApiResponse được định nghĩa trong course.model.ts
import type { ApiResponse } from '../../course/models/course.ts'; 
import type { Cart } from '../models/cart.ts';

const API_URL = 'http://dacn.runasp.net/api';

// Tạo một axios instance để tự động đính kèm token
const axiosInstance = axios.create({
  headers: {
    'Accept-Language': 'vi',
    'Content-Type': 'application/json',
  }
});

// Interceptor để thêm token vào mỗi request 
axiosInstance.interceptors.request.use((config) => {
  const userDataString = localStorage.getItem('user_data');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    const token = userData?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const cartService = {
  // Hàm để lấy tất cả các sản phẩm trong giỏ hàng
  async getCartItems(): Promise<ApiResponse<Cart>> {
    const response = await axiosInstance.get<ApiResponse<Cart>>(
      `${API_URL}/Cart/cart-items`
    );
    return response.data;
  },
  async addCourseToCart(courseId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `${API_URL}/Cart/add-course`,
      { courseId } // Body của request
    );
    return response.data;
  },
  async removeCourseFromCart(courseId: string): Promise<ApiResponse<any>> {
    const response = await axiosInstance.delete<ApiResponse<any>>(
      `${API_URL}/Cart/remove-course/${courseId}`
    );
    return response.data;
  }
};