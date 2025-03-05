import React, { useState } from "react";
import Background from "../components/layout/Background";
import SlotMachine from "../components/shop/SlotMachine";
import CharacterModal from "../components/shop/CharacterModal";
import coinImg from "../assets/coin.png";
import shopBg from "../assets/shop_bg.png";

const ShopPage: React.FC = () => {
  const [balance, setBalance] = useState(55000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState<number | null>(null);

  // 슬롯 구매 처리
  const handlePurchase = (amount: number) => {
    const cost = amount === 1 ? 500 : 5000;

    if (balance >= cost) {
      setBalance((prevBalance) => prevBalance - cost);
      setPurchaseAmount(amount);
      setIsSpinning(true);

      // 슬롯 애니메이션이 끝난 후 모달 표시
      setTimeout(() => {
        setIsSpinning(false);
        setShowModal(true);
      }, 3000); // 슬롯 애니메이션 시간에 맞게 조정
    } else {
      alert("코인이 부족합니다!");
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setPurchaseAmount(null);
  };

  return (
    <Background backgroundImage={shopBg} overlayOpacity={0.3} enableScanline={true}>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg">SHOP</h1>

          {/* 잔액 표시 */}
          <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 flex items-center">
            <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
            <span className="text-yellow-400 font-bold font-korean-pixel">{balance.toLocaleString()}</span>
          </div>

          {/* 슬롯 머신 */}
          <SlotMachine isSpinning={isSpinning} onPurchase={handlePurchase} disabled={isSpinning || showModal} />

          {/* 캐릭터 획득 모달 */}
          {showModal && <CharacterModal onClose={handleCloseModal} amount={purchaseAmount || 1} />}
        </div>
      </div>
    </Background>
  );
};

export default ShopPage;
