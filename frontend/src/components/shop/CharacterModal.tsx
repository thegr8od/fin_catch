import React, { useState, useEffect } from "react";
import smokeCatImg from "../../assets/smoke_cat.png";
import CharacterListModal from "./CharacterListModal";

// 캐릭터 타입 정의
interface Character {
  id: number;
  name: string;
  image: string;
  rarity: number; // 1-5 (별 개수)
}

interface CharacterModalProps {
  onClose: () => void;
  amount: number;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ onClose, amount }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  // 캐릭터 데이터 생성 (실제로는 API에서 받아와야 함)
  useEffect(() => {
    // 임시 캐릭터 데이터 생성
    const generateCharacters = () => {
      const characterNames = ["멋쟁이 고양이", "불꽃 여우", "전기 쥐", "물방울 거북", "잠자는 곰", "날개 달린 용", "빛나는 별", "그림자 늑대", "꽃 토끼", "무지개 새"];

      const newCharacters: Character[] = [];

      for (let i = 0; i < amount; i++) {
        const randomRarity = Math.floor(Math.random() * 5) + 1; // 1-5 랜덤 희귀도
        const randomNameIndex = Math.floor(Math.random() * characterNames.length);

        newCharacters.push({
          id: i + 1,
          name: characterNames[randomNameIndex],
          image: smokeCatImg, // 모든 캐릭터에 같은 이미지 사용 (실제로는 다른 이미지 사용)
          rarity: randomRarity,
        });
      }

      setCharacters(newCharacters);
    };

    generateCharacters();
  }, [amount]);

  // 다음 캐릭터로 이동
  const handleNext = () => {
    if (currentIndex < amount - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  // 모두 스킵하고 전체 목록 보기
  const handleSkipAll = () => {
    setShowAllCharacters(true);
  };

  // 현재 캐릭터
  const currentCharacter = characters[currentIndex];

  // 희귀도 별 표시 생성
  const renderRarityStars = (rarity: number) => {
    return "★".repeat(rarity) + "☆".repeat(5 - rarity);
  };

  // 전체 캐릭터 목록 모달
  if (showAllCharacters) {
    return <CharacterListModal characters={characters} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center relative">
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {currentCharacter && (
          <>
            {/* 캐릭터 이미지 */}
            <div className="w-full mb-4 flex justify-center">
              <img src={currentCharacter.image} alt={currentCharacter.name} className="w-64 h-64 object-contain" />
            </div>

            {/* 캐릭터 정보 */}
            <h3 className="text-2xl text-white font-korean-pixel mb-2">{currentCharacter.name}</h3>
            <p className="text-gray-300 text-center font-korean-pixel mb-6">희귀도: {renderRarityStars(currentCharacter.rarity)}</p>
          </>
        )}

        {/* 스킵 버튼 (여러 개 구매 시에만 표시) */}
        {amount > 1 && (
          <div className="flex justify-between w-full">
            <button onClick={handleNext} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-korean-pixel">
              다음 ({amount - currentIndex - 1}개 남음)
            </button>
            <button onClick={handleSkipAll} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-korean-pixel">
              모두 보기
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
