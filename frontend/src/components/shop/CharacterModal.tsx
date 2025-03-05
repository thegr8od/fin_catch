import React from "react";
import smokeCatImg from "../../assets/smoke_cat.png";

interface CharacterModalProps {
  onClose: () => void;
  amount: number;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ onClose, amount }) => {
  // 여러 개 구매 시 스킵 기능 (현재는 단일 캐릭터만 표시)
  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center relative">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 캐릭터 이미지 */}
        <div className="w-full mb-4 flex justify-center">
          <img src={smokeCatImg} alt="획득한 캐릭터" className="w-64 h-64 object-contain" />
        </div>

        {/* 캐릭터 정보 */}
        <h3 className="text-2xl text-white font-korean-pixel mb-2">멋쟁이 고양이</h3>
        <p className="text-gray-300 text-center font-korean-pixel mb-6">희귀도: ★★★☆☆</p>

        {/* 스킵 버튼 (10개 구매 시에만 표시) */}
        {amount > 1 && (
          <div className="flex justify-between w-full">
            <button onClick={handleSkip} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-korean-pixel">
              다음 ({amount - 1}개 남음)
            </button>
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-korean-pixel">
              모두 스킵
            </button>
          </div>
        )}

        {/* 확인 버튼 (1개 구매 시에만 표시) */}
        {amount === 1 && (
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-korean-pixel w-full">
            확인
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterModal;
