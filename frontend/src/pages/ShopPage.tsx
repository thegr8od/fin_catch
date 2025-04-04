import React, { useEffect, useState } from "react";
import shopBg from "../assets/shop_bg.png";
import CoinDisplay from "../components/shop/CoinDisplay";
import SlotMachineSection from "../components/shop/SlotMachineSection";
import CharacterResultModal from "../components/shop/CharacterResultModal";
import { useUserInfo } from "../hooks/useUserInfo";
import { useCharacterPurchase } from "../hooks/useCharacterPurchase";
import Background from "../components/layout/Background";
import { CustomAlert } from "../components/layout/CustomAlert";

const ShopPage: React.FC = () => {
  const { user } = useUserInfo();
  const { isSpinning, showModal, pickedCharacters, purchaseAmount, handlePurchase, closeModal } = useCharacterPurchase();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
  }, [showModal, pickedCharacters, purchaseAmount]);

  const shouldShowModal = showModal && pickedCharacters && pickedCharacters.length > 0;

  const handlePurchaseWithValidation = (amount: number) => {
    if ((user?.point || 0) < amount) {
      setAlertMessage("코인이 부족합니다!");
      setShowAlert(true);
      return;
    }
    handlePurchase(amount);
  };

  return (
    <div className="relative w-full h-screen">
      <Background backgroundImage={shopBg}>
        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
          {/* 코인 표시 */}
          <CoinDisplay coins={user?.point || 0} onChargeClick={() => {}} />

          {/* 슬롯 머신 섹션 */}
          <SlotMachineSection isSpinning={isSpinning} onPurchase={handlePurchaseWithValidation} disabled={isSpinning} userCoins={user?.point || 0} />
        </div>
      </Background>

      {/* 뽑기 결과 모달 */}
      {shouldShowModal && (
        <div className="fixed inset-0 z-50">
          <CharacterResultModal onClose={closeModal} amount={purchaseAmount} characters={pickedCharacters} />
        </div>
      )}

      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default ShopPage;
