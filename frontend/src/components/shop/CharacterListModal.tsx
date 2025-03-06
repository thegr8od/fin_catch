import React from "react";
import smokeCatImg from "../../assets/smoke_cat.png";

interface Character {
  id: number;
  name: string;
  image: string;
  rarity: number; // 1-5 (별 개수)
}

interface CharacterListModalProps {
  characters: Character[];
  onClose: () => void;
}

const CharacterListModal: React.FC<CharacterListModalProps> = ({ characters, onClose }) => {
  // 희귀도 별 표시 생성
  const renderRarityStars = (rarity: number) => {
    return "★".repeat(rarity) + "☆".repeat(5 - rarity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl flex flex-col items-center relative">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 모달 제목 */}
        <h2 className="text-2xl text-white font-korean-pixel mb-6">획득한 캐릭터</h2>

        {/* 캐릭터 목록 */}
        <div className="grid grid-cols-5 gap-4 w-full">
          {characters.map((character) => (
            <div key={character.id} className="bg-gray-700 rounded-lg p-3 flex flex-col items-center">
              <div className="w-full aspect-square mb-2 flex justify-center items-center">
                <img src={character.image} alt={character.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-white text-sm font-korean-pixel truncate w-full text-center">{character.name}</p>
              <p className="text-yellow-400 text-xs font-korean-pixel">{renderRarityStars(character.rarity)}</p>
              <div className="flex items-center justify-center mt-1">
                <div className="bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center">
                  <span className="text-white text-xs">+1</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 확인 버튼 */}
        <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-korean-pixel mt-6">
          확인
        </button>
      </div>
    </div>
  );
};

export default CharacterListModal;
