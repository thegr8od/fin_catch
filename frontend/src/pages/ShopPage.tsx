import React, { useState } from "react";
import Background from "../components/layout/Background";
import SlotMachine from "../components/shop/SlotMachine";
import CharacterModal from "../components/shop/CharacterModal";
import PaymentResultModal from "../components/shop/PaymentResultModal";
import coinImg from "../assets/coin.png";
import shopBg from "../assets/shop_bg.png";
import { usePayment } from "../hooks/usePayment";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosInstance from "../api/axios";

const ShopPage: React.FC = () => {
  const { user, loading } = useUserInfo();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);
  const [pickedCharacters, setPickedCharacters] = useState<any[]>([]);

  // 결제 관련 로직을 usePayment 훅으로 분리
  const {
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
  } = usePayment(user?.point || 0, () => {});

  // 슬롯 구매 처리
  const handlePurchase = async (amount: number) => {
    const cost = amount === 1 ? 500 : 5000;
    console.log("구매 시도:", { amount, cost });
    console.log("현재 보유 코인:", user?.point);

    // 코인이 부족하면 알림창 띄우기
    if (user && user.point >= cost) {
      setPurchaseAmount(amount);
      setIsSpinning(true);

      try {
        console.log("뽑기 API 요청:", { count: amount === 1 ? 1 : 10 });
        // 뽑기 API 호출
        const response = await axiosInstance.get(`/api/member/pick/cat`, {
          params: {
            count: amount === 1 ? 1 : 10,
          },
        });

        console.log("뽑기 API 응답:", response.data);

        if (response.data.isSuccess && response.data.result) {
          setPickedCharacters(response.data.result);
        }

        // 슬롯 애니메이션이 끝난 후 모달 표시
        setTimeout(() => {
          setIsSpinning(false);
          setShowModal(true);
        }, 3000);
      } catch (error: any) {
        console.error("뽑기 실패 상세:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setIsSpinning(false);
        alert("뽑기에 실패했습니다. 다시 시도해주세요.");
      }
    } else {
      console.log("코인 부족:", {
        필요한_코인: cost,
        보유_코인: user?.point,
      });
      alert("코인이 부족합니다!");
    }
  };

  const handlePickCharacter = async () => {
    const response = await axiosInstance.get(`/api/member/pick/cat`);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setPurchaseAmount(null);
    setPickedCharacters([]);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Background backgroundImage={shopBg}>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg">SHOP</h1>

          {/* 잔액 표시 */}
          <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 flex items-center">
            <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
            <span className="text-yellow-400 font-bold font-korean-pixel">{user?.point?.toLocaleString() || 0}</span>
            <button onClick={openPaymentModal} className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
              +
            </button>
          </div>

          {/* 슬롯 머신 */}
          <SlotMachine isSpinning={isSpinning} onPurchase={handlePurchase} disabled={isSpinning || showModal} />

          {/* 캐릭터 획득 모달 */}
          {showModal && <CharacterModal onClose={handleCloseModal} amount={purchaseAmount || 1} characters={pickedCharacters} />}

          {/* 코인 충전 모달 */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center relative">
                {/* 닫기 버튼 */}
                <button onClick={closePaymentModal} className="absolute top-2 right-2 text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* 모달 제목 */}
                <h2 className="text-2xl text-white font-korean-pixel mb-6">코인 결제</h2>

                {showProcessingPayment ? (
                  // 결제 처리 중 화면
                  <div className="w-full flex flex-col items-center">
                    <div className="mb-6 text-center">
                      <p className="text-white font-korean-pixel mb-4">결제 처리 중...</p>
                      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4 w-full mb-6">
                      <p className="text-white font-korean-pixel mb-2">결제 정보</p>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">결제 방법:</span>
                        <span className="text-white">{paymentMethod === "toss" ? "토스페이" : "카카오페이"}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">결제 금액:</span>
                        <span className="text-white">{selectedAmount?.toLocaleString()} 원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">충전 코인:</span>
                        <span className="text-yellow-400">{selectedAmount === 5000 ? "5,000" : selectedAmount === 10000 ? "12,000" : selectedAmount === 50000 ? "65,000" : "100,000"} 코인</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm text-center">결제가 완료될 때까지 잠시만 기다려주세요.</p>
                  </div>
                ) : !showPaymentMethodModal ? (
                  // 코인 충전 옵션
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div onClick={() => selectAmount(5000, 5000)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 flex flex-col items-center cursor-pointer">
                      <div className="flex items-center mb-2">
                        <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
                        <span className="text-white">× 5000</span>
                      </div>
                      <span className="text-white font-korean-pixel">5000 원</span>
                    </div>

                    <div onClick={() => selectAmount(10000, 12000)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 flex flex-col items-center cursor-pointer">
                      <div className="flex items-center mb-2">
                        <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
                        <span className="text-white">× 12000</span>
                      </div>
                      <span className="text-white font-korean-pixel">10000 원</span>
                    </div>

                    <div onClick={() => selectAmount(50000, 65000)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 flex flex-col items-center cursor-pointer">
                      <div className="flex items-center mb-2">
                        <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
                        <span className="text-white">× 65000</span>
                      </div>
                      <span className="text-white font-korean-pixel">50000 원</span>
                    </div>

                    <div onClick={() => selectAmount(80000, 100000)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 flex flex-col items-center cursor-pointer">
                      <div className="flex items-center mb-2">
                        <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
                        <span className="text-white">× 100000</span>
                      </div>
                      <span className="text-white font-korean-pixel">80000 원</span>
                    </div>
                  </div>
                ) : (
                  // 결제 방법 선택
                  <div className="w-full">
                    <div className="mb-6 text-center">
                      <p className="text-white font-korean-pixel mb-2">선택한 금액</p>
                      <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-center">
                        <span className="text-yellow-400 font-bold font-korean-pixel">{selectedAmount?.toLocaleString()} 원</span>
                      </div>
                    </div>

                    <p className="text-white font-korean-pixel mb-4 text-center">결제 방법 선택</p>

                    <div className="flex flex-col w-full gap-4">
                      <button onClick={() => processPayment("toss", selectedAmount)} className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center">
                        <span className="font-korean-pixel">토스페이</span>
                      </button>
                      <button onClick={() => processPayment("kakao", selectedAmount)} className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-4 rounded-lg flex items-center justify-center">
                        <span className="font-korean-pixel">카카오페이</span>
                      </button>

                      <button onClick={() => selectAmount(0, 0)} className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg flex items-center justify-center mt-2">
                        <span className="font-korean-pixel">뒤로 가기</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 결제 결과 모달 */}
          {showPaymentResult && <PaymentResultModal success={paymentSuccess} coinAmount={resultCoinAmount} errorMessage={paymentErrorMessage} onClose={closePaymentResult} />}
        </div>
      </div>
    </Background>
  );
};

export default ShopPage;
