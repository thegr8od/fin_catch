import React from "react";
import SlotMachine from "./SlotMachine";
import { CustomAlert } from "../layout/CustomAlert";

interface SlotMachineSectionProps {
  isSpinning: boolean;
  onPurchase: (amount: number) => void;
  disabled: boolean;
  userCoins: number;
}

const SlotMachineSection: React.FC<SlotMachineSectionProps> = ({ isSpinning, onPurchase, disabled, userCoins }) => {
  const handlePurchase = (amount: number) => {
    const cost = amount === 1 ? 500 : 5000;
    if (userCoins < cost) {
      CustomAlert({ message: "코인이 부족합니다!", onClose: () => {} });
      return;
    }
    onPurchase(amount);
  };

  return (
    <div className="w-full max-w-4xl px-6 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg">SHOP</h1>

      {/* 슬롯 머신 */}
      <SlotMachine isSpinning={isSpinning} onPurchase={handlePurchase} disabled={disabled} />
    </div>
  );
};

export default SlotMachineSection;
