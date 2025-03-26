import React, { useState } from "react";
import { CharacterType } from "../game/constants/animations";
import { useCharacterAnimation } from "../../hooks/useCharacterAnimation";
import { CharacterState } from "../game/types/character";

interface Character {
  catId: number;
  catName: CharacterType;
  description: string;
  grade: string;
}

interface CharacterChangeModalProps {
  onClose: () => void;
  characters: Character[];
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
  mainCat: CharacterType;
  onSetMainCharacter: () => void;
}

const CharacterChangeModal: React.FC<CharacterChangeModalProps> = ({ onClose, characters, selectedCharacter, onSelect, mainCat, onSetMainCharacter }) => {
  const [currentAnimation, setCurrentAnimation] = useState<CharacterState>("idle");

  // 애니메이션 상태 관리
  const { containerRef, isReady } = useCharacterAnimation({
    state: currentAnimation,
    characterType: selectedCharacter?.catName || "classic",
    direction: true,
    scale: 3,
    size: "small",
  });

  // 모션 버튼 데이터
  const motionButtons: { state: CharacterState; label: string }[] = [
    { state: "idle", label: "기본" },
    { state: "attack", label: "공격" },
    { state: "damage", label: "피격" },
    { state: "dead", label: "사망" },
    { state: "victory", label: "승리" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[800px] h-[600px] relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 font-korean-pixel">캐릭터 변경</h2>
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 mt-16 h-[calc(100%-4rem)] overflow-y-auto">
          {/* 애니메이션 미리보기 */}
          <div className="mb-6 flex flex-col items-center">
            <div ref={containerRef} className="w-[150px] h-[150px] relative">
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {/* 모션 버튼들 */}
            <div className="flex gap-2 mt-4">
              {motionButtons.map((button) => (
                <button
                  key={button.state}
                  onClick={() => setCurrentAnimation(button.state)}
                  className={`px-3 py-1 rounded font-korean-pixel text-sm transition-colors ${
                    currentAnimation === button.state ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {characters.map((character) => (
              <div
                key={character.catId}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedCharacter?.catId === character.catId ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                }`}
                onClick={() => onSelect(character)}
              >
                <div className="flex flex-col items-center">
                  <img src={`/cats_assets/${character.catName}/${character.catName}_cat_static.png`} alt={character.catName} className="w-24 h-24" style={{ imageRendering: "pixelated" }} />
                  <div className="mt-4 text-center">
                    <h3 className="font-korean-pixel text-lg font-bold text-gray-800">{character.catName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{character.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{character.grade}</p>
                    {character.catName === mainCat && <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-korean-pixel">현재 대표 캐릭터</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCharacter && selectedCharacter.catName !== mainCat && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={onSetMainCharacter}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300"
              >
                대표 캐릭터로 설정
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterChangeModal;
