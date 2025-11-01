// src/hooks/useCart.ts

import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service';
import type { Cart } from '../models/cart.ts';

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dùng useCallback để tránh tạo lại hàm fetchCart mỗi lần render
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCartItems();
      // Luôn set data, dù giỏ hàng trống hay không
      setCart(response.data);
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      setError('Không thể tải thông tin giỏ hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động gọi API khi hook được sử dụng lần đầu
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { 
    cart,           // Dữ liệu giỏ hàng (hoặc null)
    loading,        // Trạng thái đang tải
    error,          // Thông báo lỗi nếu có
    refreshCart: fetchCart // Hàm để làm mới giỏ hàng từ component khác
  };
};