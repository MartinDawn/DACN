import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (Nếu bạn dùng React)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Giữ nguyên các plugin cũ của bạn
  server: {
    proxy: {
      // Bất kỳ request nào bắt đầu bằng '/api' sẽ được chuyển hướng qua proxy
      '/api': {
        // target: 'http://dacn.runasp.net', // ĐIỀN URL BACKEND CỦA BẠN VÀO ĐÂY
        target: 'http://localhost:5223',
        changeOrigin: true,
        secure: false, // Thêm dòng này nếu backend dùng https self-signed hoặc http thường để tránh lỗi SSL
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Giữ nguyên '/api' trong path
        // Fallback khi backend không chạy
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('Backend proxy error:', err.message);
            res.writeHead(503, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
              error: 'Backend server is not available',
              message: 'Please start the backend server at http://localhost:5223'
            }));
          });
        }
      }
    }
  }
})