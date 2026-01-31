// src/hooks/useCart.ts

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect, 
  ReactNode 
} from 'react';
import { cartService } from '../services/cart.service.ts';
import type { Cart } from '../models/cart.ts';

// 1. Định nghĩa kiểu dữ liệu cho Context
interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (courseId: string) => Promise<void>; 
}

// 2. Tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 3. Tạo Provider (Component "Kho chứa" state)
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm tải giỏ hàng
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cartService.getCartItems();
      setCart(response.data); // <-- Cập nhật state toàn cục
    } catch (err) {
      console.error("Failed to fetch cart items:", err);
      setError('Không thể tải thông tin giỏ hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động gọi API khi Provider được tải lần đầu
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Hàm thêm vào giỏ hàng
  const addToCart = useCallback(async (courseId: string) => {
    try {
      const response = await cartService.addCourseToCart(courseId); 
      
      if (response.success) {
        setCart(response.data); 
      } else {
        throw new Error(response.message || "Lỗi khi thêm vào giỏ hàng");
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError('Không thể thêm vào giỏ hàng.');
      throw err; // Ném lỗi ra để CourseDetail xử lý
    }
  }, []); 

  const value = {
    cart,
    loading,
    error,
    refreshCart: fetchCart, 
    addToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};