import React, { useEffect } from "react";
import shopBg from "../assets/shop_bg.png";
import CoinDisplay from "../components/shop/CoinDisplay";
import SlotMachineSection from "../components/shop/SlotMachineSection";
import CharacterResultModal from "../components/shop/CharacterResultModal";
import { useUserInfo } from "../hooks/useUserInfo";
import { useCharacterPurchase } from "../hooks/useCharacterPurchase";
import Background from "../components/layout/Background";

const ShopPage: React.FC = () => {
  const { user } = useUserInfo();
  const { isSpinning, showModal, pickedCharacters, purchaseAmount, handlePurchase, closeModal } = useCharacterPurchase();

  useEffect(() => {
    console.log("ShopPage 상태 변경:", {
      showModal,
      pickedCharacters,
      pickedCharactersLength: pickedCharacters?.length ?? 0,
      purchaseAmount,
      renderCondition: showModal && pickedCharacters && pickedCharacters.length > 0,
    });
  }, [showModal, pickedCharacters, purchaseAmount]);

  const shouldShowModal = showModal && pickedCharacters && pickedCharacters.length > 0;

  return (
    <div className="relative w-full h-screen">
      <Background backgroundImage={shopBg}>
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
          {/* 코인 표시 */}
          <CoinDisplay coins={user?.point || 0} onChargeClick={() => {}} />

          {/* 슬롯 머신 섹션 */}
          <SlotMachineSection isSpinning={isSpinning} onPurchase={handlePurchase} disabled={isSpinning} userCoins={user?.point || 0} />
        </div>
      </Background>

      {/* 뽑기 결과 모달 */}
      {shouldShowModal && (
        <div className="fixed inset-0 z-50">
          <CharacterResultModal onClose={closeModal} amount={purchaseAmount} characters={pickedCharacters} />
        </div>
      )}
    </div>
  );
};

export default ShopPage;
