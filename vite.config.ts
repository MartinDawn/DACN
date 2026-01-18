import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (Nếu bạn dùng React)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Giữ nguyên các plugin cũ của bạn
  server: {
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api' sẽ được chuyển hướng qua proxy
      '/api': {
        target: 'http://dacn.runasp.net', // ĐIỀN URL BACKEND CỦA BẠN VÀO ĐÂY
        changeOrigin: true,
        secure: false, // Thêm dòng này nếu backend dùng https self-signed hoặc http thường để tránh lỗi SSL
        rewrite: (path) => path.replace(/^\/api/, '') // Xóa tiền tố '/api' trước khi gửi đến Backend
      }
    }
  }
})