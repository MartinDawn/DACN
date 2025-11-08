import apiClient from "../../auth/services/apiClient"; 

// 3. Import các 'type'
import type { ApiResponse } from '../../course/models/course.ts'; 
import type { Cart } from '../models/cart.ts';


export const cartService = {
  /**
   * Hàm để lấy tất cả các sản phẩm trong giỏ hàng
   */
  async getCartItems(): Promise<ApiResponse<Cart>> {
    // 5. DÙNG apiClient VÀ ĐƯỜNG DẪN TƯƠNG ĐỐI
    const response = await apiClient.get<ApiResponse<Cart>>(
      '/Cart/cart-items'
    );
    return response.data;
  },

  /**
   * Thêm khóa học vào giỏ hàng
   */
  async addCourseToCart(courseId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/Cart/add-course',
      { courseId } 
    );
    return response.data;
  },

  /**
   * Xóa khóa học khỏi giỏ hàng
   */
  async removeCourseFromCart(courseId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/Cart/remove-course/${courseId}` 
    );
    return response.data;
  }
};