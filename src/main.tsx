// Ví dụ: src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CartProvider } from './modules/user/hooks/useCart.tsx' 
import { Toaster } from 'react-hot-toast'; // (Bạn nên có cái này)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <CartProvider> {/* 2. BỌC BÊN NGOÀI APP */}
        <App />
        <Toaster position="top-right" /> {/* Thêm Toaster để thông báo */}
      </CartProvider>
  </StrictMode>,
)