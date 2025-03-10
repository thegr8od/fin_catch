import { useState } from "react";
// import { requestPayment, completePayment } from "../api/paymentService";

interface PaymentHookResult {
  showPaymentModal: boolean;
  selectedAmount: number | null;
  showPaymentMethodModal: boolean;
  showProcessingPayment: boolean;
  paymentMethod: string | null;
  showPaymentResult: boolean;
  paymentSuccess: boolean;
  paymentErrorMessage: string;
  resultCoinAmount: number;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  selectAmount: (amount: number, coinAmount: number) => void;
  processPayment: (method: string, selectedAmount: number | null) => void;
  closePaymentResult: () => void;
  chargeCoin: (amount: number) => void;
}

export const usePayment = (initialBalance: number, setBalance: React.Dispatch<React.SetStateAction<number>>): PaymentHookResult => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showProcessingPayment, setShowProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState<number | null>(null);

  // 결제 결과 관련 상태
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");
  const [resultCoinAmount, setResultCoinAmount] = useState(0);

  // 결제 모달 열기
  const openPaymentModal = () => {
    setShowPaymentModal(true);
    setSelectedAmount(null);
    setCoinAmount(null);
    setShowPaymentMethodModal(false);
    setShowProcessingPayment(false);
    setPaymentMethod(null);
    setShowPaymentResult(false);
  };

  // 결제 모달 닫기
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAmount(null);
    setCoinAmount(null);
    setShowPaymentMethodModal(false);
    setShowProcessingPayment(false);
    setPaymentMethod(null);
    setShowPaymentResult(false);
  };

  // 결제 결과 모달 닫기
  const closePaymentResult = () => {
    setShowPaymentResult(false);
  };

  // 금액 선택 처리
  const selectAmount = (amount: number, coinAmt: number) => {
    setSelectedAmount(amount);
    setCoinAmount(coinAmt);
    setShowPaymentMethodModal(true);
  };

  // 코인 충전 처리
  const chargeCoin = (amount: number) => {
    if (selectedAmount) {
      setBalance((prevBalance) => prevBalance + amount);
      setShowPaymentModal(false);
      setSelectedAmount(null);
      setCoinAmount(null);
      setShowPaymentMethodModal(false);
      setShowProcessingPayment(false);
      setPaymentMethod(null);
    }
  };

  // 결제 처리 (토스페이 또는 카카오페이)
  const processPayment = async (method: string, selectedAmount: number | null) => {
    if (!selectedAmount || !coinAmount) return;

    // 결제 방법 저장
    setPaymentMethod(method);

    // 결제 처리 중 화면 표시
    setShowProcessingPayment(true);

    try {
      // 실제 서비스에서는 서버에 결제 요청을 보내고 응답으로 받은 URL로 이동
      // 현재는 데모 목적으로 시뮬레이션

      // 서버 연동 시 아래 코드 사용
      /*
      const response = await requestPayment({
        amount: selectedAmount,
        coinAmount: coinAmount,
        paymentMethod: method
      });
      
      // 결제 페이지로 이동
      window.location.href = response.paymentUrl;
      */

      // 데모 목적으로 3초 후 결제 완료 처리
      setTimeout(() => {
        // 잔액 업데이트
        setBalance((prevBalance) => prevBalance + coinAmount);

        // 결제 처리 중 화면 숨기기
        setShowProcessingPayment(false);

        // 결제 결과 표시
        setPaymentSuccess(true);
        setResultCoinAmount(coinAmount);
        setShowPaymentResult(true);

        // 결제 모달 상태 초기화
        setSelectedAmount(null);
        setCoinAmount(null);
        setShowPaymentMethodModal(false);
        setPaymentMethod(null);
        setShowPaymentModal(false);
      }, 3000);
    } catch (error) {
      console.error("결제 요청 실패:", error);

      // 결제 처리 중 화면 숨기기
      setShowProcessingPayment(false);

      // 결제 실패 결과 표시
      setPaymentSuccess(false);
      setPaymentErrorMessage("결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowPaymentResult(true);
    }
  };

  return {
    showPaymentModal,
    selectedAmount,
    showPaymentMethodModal,
    showProcessingPayment,
    paymentMethod,
    showPaymentResult,
    paymentSuccess,
    paymentErrorMessage,
    resultCoinAmount,
    openPaymentModal,
    closePaymentModal,
    selectAmount,
    processPayment,
    closePaymentResult,
    chargeCoin,
  };
};
