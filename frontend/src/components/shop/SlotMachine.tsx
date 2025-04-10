import React from "react";
import slotImg from "../../assets/slot.png";
import slotGif from "../../assets/slot.gif";
import coinImg from "../../assets/coin.png";

interface SlotMachineProps {
  isSpinning: boolean;
  onPurchase: (amount: number) => void;
  disabled: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ isSpinning, onPurchase, disabled }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center">
      {/* 슬롯 이미지 */}
      <div className="w-full mb-6 flex justify-center">
        {isSpinning ? <img src={slotGif} alt="슬롯 머신 작동 중" className="w-64 h-64 object-contain" /> : <img src={slotImg} alt="슬롯 머신" className="w-64 h-64 object-contain" />}
      </div>

      {/* 멤버십 획득 텍스트 */}

      {/* 구매 버튼 */}
      {!isSpinning && (
        <div className="flex flex-col w-full space-y-4">
          <button
            onClick={() => onPurchase(1)}
            disabled={disabled}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-korean-pixel flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="mr-2">1개 구매</span>
            <div className="flex items-center">
              <img src={coinImg} alt="코인" className="w-5 h-5 mr-1" />
              <span>x 500</span>
            </div>
          </button>

          <button
            onClick={() => onPurchase(10)}
            disabled={disabled}
            className={`bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-korean-pixel flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="mr-2">10개 구매</span>
            <div className="flex items-center">
              <img src={coinImg} alt="코인" className="w-5 h-5 mr-1" />
              <span>x 5,000</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
