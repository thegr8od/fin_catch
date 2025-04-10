import React from "react";
import coinImg from "../../assets/coin.png";

interface CoinDisplayProps {
  coins: number;
  onChargeClick: () => void;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({ coins, onChargeClick }) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 flex items-center">
      <img src={coinImg} alt="코인" className="w-6 h-6 mr-2" />
      <span className="text-yellow-400 font-bold font-korean-pixel">{coins?.toLocaleString() || 0}</span>
      <button onClick={onChargeClick} className="ml-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">
        +
      </button>
    </div>
  );
};

export default CoinDisplay;
