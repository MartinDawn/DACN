// src/user/hooks/usePayment.ts

import { useState, useCallback } from 'react';
import { paymentService } from '../services/payment.service';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const initiateVnPayPayment = useCallback(async (courseIds: string[]) => {
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const response = await paymentService.createVnPayPayment(courseIds);
      
      if (response.success && response.data.payUrl) {
        // Chuyển hướng người dùng đến trang thanh toán VNPay
        window.location.href = response.data.payUrl;
      } else {
        setPaymentError(response.message || 'Không thể tạo thanh toán VNPay');
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setPaymentError(err.message || 'Lỗi kết nối khi tạo thanh toán');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    initiateVnPayPayment,
    isProcessing,
    paymentError
  };
};