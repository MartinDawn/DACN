// src/user/services/payment.service.ts

import apiClient from "../../auth/services/apiClient";
import type { ApiResponse } from "../../course/models/course";
import type { PaymentRequest, VnPayResponse } from "../models/payment";

export const paymentService = {
  async createVnPayPayment(courseIds: string[]): Promise<VnPayResponse> {
    const response = await apiClient.post<VnPayResponse>(
      '/Payment/vnpay/checkout', 
      { courseIds } // Body của request
    );
    return response.data;
  },
};