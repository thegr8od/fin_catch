import React, { useEffect } from "react";
import coinImg from "../../assets/coin.png";

interface PaymentResultModalProps {
  success: boolean;
  coinAmount?: number;
  errorMessage?: string;
  onClose: () => void;
  autoCloseDelay?: number;
}

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({ success, coinAmount = 0, errorMessage = "결제 처리 중 오류가 발생했습니다.", onClose, autoCloseDelay = 3000 }) => {
  // 자동 닫기 타이머
  useEffect(() => {
    if (success && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [success, autoCloseDelay, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center relative">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 모달 제목 */}
        <h2 className="text-2xl text-white font-korean-pixel mb-6">{success ? "결제 완료" : "결제 실패"}</h2>

        {success ? (
          // 결제 성공 내용
          <div className="w-full text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-900 bg-opacity-30 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <p className="text-green-400 text-xl mb-4 font-korean-pixel">결제가 성공적으로 완료되었습니다!</p>

            <div className="bg-gray-700 rounded-lg p-4 mb-6 flex items-center justify-center">
              <img src={coinImg} alt="코인" className="w-8 h-8 mr-3" />
              <span className="text-yellow-400 font-bold text-xl font-korean-pixel">+{coinAmount.toLocaleString()}</span>
            </div>

            <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-korean-pixel">
              확인
            </button>
          </div>
        ) : (
          // 결제 실패 내용
          <div className="w-full text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-900 bg-opacity-30 rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            <p className="text-red-400 text-lg mb-6 font-korean-pixel">{errorMessage}</p>

            <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-korean-pixel">
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultModal;
