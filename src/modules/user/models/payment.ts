// src/user/models/payment.ts

export interface PaymentRequest {
  courseIds: string[];
}

export interface VnPayResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    payUrl: string;
  };
}