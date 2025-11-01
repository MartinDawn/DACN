// src/models/cart.model.ts

// Định nghĩa cho một sản phẩm (khóa học) trong giỏ hàng
export interface CartItem {
  id: string; // ID của khóa học
  name: string;
  price: number;
  imageUrl: string;
  instructorName: string;
}

// Định nghĩa cấu trúc của toàn bộ giỏ hàng, khớp với trường 'data' của API
export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}