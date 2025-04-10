import axiosInstance from "./axios";

// 결제 요청 인터페이스
interface PaymentRequest {
  amount: number;
  coinAmount: number;
  paymentMethod: string;
}

// 결제 응답 인터페이스
interface PaymentResponse {
  orderId: string;
  paymentUrl: string;
  amount: number;
  coinAmount: number;
}

// 결제 완료 요청 인터페이스
interface PaymentCompleteRequest {
  orderId: string;
  paymentKey: string;
}

// 결제 완료 응답 인터페이스
interface PaymentCompleteResponse {
  success: boolean;
  coinAmount: number;
  message: string;
}

/**
 * 결제 요청을 생성하고 결제 페이지 URL을 반환합니다.
 * @param data 결제 요청 데이터
 * @returns 결제 응답 데이터
 */
export const requestPayment = async (data: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await axiosInstance.post<PaymentResponse>("/payments/request", data);
    return response.data;
  } catch (error) {
    console.error("결제 요청 실패:", error);
    throw error;
  }
};

/**
 * 결제 완료 후 서버에 결제 완료 정보를 전송합니다.
 * @param data 결제 완료 요청 데이터
 * @returns 결제 완료 응답 데이터
 */
export const completePayment = async (data: PaymentCompleteRequest): Promise<PaymentCompleteResponse> => {
  try {
    const response = await axiosInstance.post<PaymentCompleteResponse>("/payments/complete", data);
    return response.data;
  } catch (error) {
    console.error("결제 완료 처리 실패:", error);
    throw error;
  }
};

/**
 * 사용자의 코인 잔액을 조회합니다.
 * @returns 코인 잔액
 */
export const getUserBalance = async (): Promise<number> => {
  try {
    const response = await axiosInstance.get<{ balance: number }>("/users/balance");
    return response.data.balance;
  } catch (error) {
    console.error("잔액 조회 실패:", error);
    throw error;
  }
};

/**
 * 결제 내역을 조회합니다.
 * @returns 결제 내역 목록
 */
export const getPaymentHistory = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get<any[]>("/payments/history");
    return response.data;
  } catch (error) {
    console.error("결제 내역 조회 실패:", error);
    throw error;
  }
};
