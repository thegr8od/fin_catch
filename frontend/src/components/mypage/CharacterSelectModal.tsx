import React, { useState } from "react";
import { getCharacterById, characters, getCharactersByCategory } from "../../data/characters";
import CharacterAnimation from "./CharacterAnimation";

interface CharacterSelectModalProps {
  onClose: () => void;
  onSelectCharacter: (characterId: number) => void;
  currentCharacterId?: number;
}

const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({ onClose, onSelectCharacter, currentCharacterId = 1 }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<number>(currentCharacterId);
  const [previewCharacter, setPreviewCharacter] = useState<number>(currentCharacterId);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  // 현재 선택된 캐릭터 정보 가져오기
  const currentCharacter = getCharacterById(previewCharacter);

  // 희귀도에 따른 배경색 클래스 가져오기
  const getRarityColorClass = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "from-green-200 to-green-300";
      case "rare":
        return "from-blue-200 to-blue-300";
      case "epic":
        return "from-purple-200 to-purple-300";
      case "legendary":
        return "from-yellow-300 to-yellow-400";
      default:
        return "from-gray-200 to-gray-300";
    }
  };

  // 희귀도에 따른 텍스트 색상 클래스 가져오기
  const getRarityTextClass = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "text-green-600";
      case "rare":
        return "text-blue-600";
      case "epic":
        return "text-purple-600";
      case "legendary":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  // 희귀도에 따른 라벨 가져오기
  const getRarityLabel = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "일반";
      case "rare":
        return "희귀";
      case "epic":
        return "영웅";
      case "legendary":
        return "전설";
      default:
        return "기본";
    }
  };

  // 카테고리 필터링
  const getFilteredCharacters = () => {
    if (selectedCategory === "전체") {
      return characters.filter((character) => character.unlocked);
    } else {
      return getCharactersByCategory(selectedCategory).filter((character) => character.unlocked);
    }
  };

  const handleSelect = () => {
    onSelectCharacter(selectedCharacter);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[1100px] p-10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 제목 부분 */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">캐릭터 선택</h2>

          {/* 닫기 버튼 */}
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="mt-20 mb-8 flex space-x-4 overflow-x-auto pb-2 px-6">
          <button
            className={`px-6 py-2.5 rounded-full text-base font-medium font-korean-pixel transition-all duration-300 ${
              selectedCategory === "전체" ? "bg-gradient-to-r from-form-color to-button-color text-gray-800 shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
            onClick={() => setSelectedCategory("전체")}
          >
            전체 보기
          </button>
          {["기본", "투자", "금융", "정책", "범죄", "상품"].map((category) => (
            <button
              key={category}
              className={`px-6 py-2.5 rounded-full text-base font-korean-pixel font-medium transition-all duration-300 ${
                selectedCategory === category ? "bg-gradient-to-r from-form-color to-button-color text-gray-800 shadow-md" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 선택된 캐릭터 정보 */}
        {currentCharacter && (
          <div className="mb-10 flex bg-character-section-bg rounded-2xl p-8 shadow-md relative overflow-hidden mx-6">
            {/* 캐릭터 이미지 */}
            <div className="relative">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-white border-2 border-gray-200 shadow-md">
                <CharacterAnimation characterId={previewCharacter} size="medium" />
              </div>
              <div
                className={`absolute -top-3 -left-3 px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getRarityColorClass(
                  currentCharacter.rarity
                )} text-gray-700 shadow-md font-korean-pixel`}
              >
                {getRarityLabel(currentCharacter.rarity)}
              </div>
            </div>

            {/* 캐릭터 정보 */}
            <div className="ml-8 flex-1">
              <h3 className={`text-2xl font-bold ${getRarityTextClass(currentCharacter.rarity)} font-korean-pixel`}>{currentCharacter.name}</h3>
              <p className="text-gray-600 mt-3 text-lg font-korean-pixel">{currentCharacter.description}</p>

              {/* 캐릭터 스탯 */}
              <div className="mt-6 grid grid-cols-4 gap-6">
                {currentCharacter.stats &&
                  Object.entries(currentCharacter.stats).map(([key, value]) => (
                    <div key={key} className="bg-character-stats-bg rounded-lg p-4 shadow-sm">
                      <div className="text-sm text-gray-600 uppercase tracking-wider mb-2 font-korean-pixel">{key}</div>
                      <div className="flex items-center">
                        <div className="w-full h-3 bg-gray-200 rounded-full">
                          <div className="h-full rounded-full bg-gradient-to-r from-form-color to-button-color" style={{ width: `${value * 10}%` }}></div>
                        </div>
                        <span className="ml-3 text-gray-700 font-medium text-lg font-korean-pixel">{value}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* 캐릭터 선택 그리드 */}
        <div className="mb-10 grid grid-cols-8 gap-5 max-h-[350px] overflow-y-auto pr-2 pb-4 px-6">
          {getFilteredCharacters().map((character) => (
            <div
              key={character.id}
              className={`group relative transition-all duration-300 ${selectedCharacter === character.id ? "scale-110 z-10" : "hover:scale-105"}`}
              onClick={() => setSelectedCharacter(character.id)}
              onMouseEnter={() => setPreviewCharacter(character.id)}
              onMouseLeave={() => setPreviewCharacter(selectedCharacter)}
            >
              {/* 캐릭터 카드 */}
              <div
                className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-2xl overflow-hidden p-3 bg-character-grid-bg border-2 ${
                  selectedCharacter === character.id ? "border-primary shadow-md" : "border-gray-200 group-hover:border-gray-300"
                } transition-all duration-300`}
              >
                {/* 캐릭터 이미지 */}
                <div className="w-full h-full flex items-center justify-center">
                  <CharacterAnimation characterId={character.id} size="small" useStaticImage={true} />
                </div>

                {/* 캐릭터 이름 배경 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent h-12"></div>

                {/* 캐릭터 이름 */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <p className="text-sm text-gray-700 font-medium truncate px-2 font-korean-pixel">{character.name}</p>
                </div>

                {/* 희귀도 표시 */}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-gradient-to-r ${getRarityColorClass(character.rarity)} shadow-sm`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택 완료 버튼 */}
        <div className="flex justify-center">
          <button
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-form-color to-button-color text-gray-700 hover:opacity-90 transition-all duration-300 shadow-md font-korean-pixel text-lg"
            onClick={handleSelect}
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectModal;
