import React, { useState } from "react";
import { CharacterType } from "../game/constants/animations";
import { useCharacterAnimation } from "../../hooks/useCharacterAnimation";
import { CharacterState } from "../game/types/character";
import { changeCatNameToKorean } from "../../utils/ChangeCatName";

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
  // 등급에 따른 테두리 색상 반환 함수
  const getBorderColorByGrade = (grade: string): { border: string; bg: string; text: string; shadow: string; glow: string; special: boolean } => {
    switch (grade.toLowerCase()) {
      case "common":
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          text: "text-gray-500",
          shadow: "shadow-gray-200",
          glow: "shadow-[0_0_5px_rgba(156,163,175,0.5)]",
          special: false,
        };
      case "rare":
        return {
          border: "border-blue-300",
          bg: "bg-blue-50",
          text: "text-blue-500",
          shadow: "shadow-blue-200",
          glow: "shadow-[0_0_5px_rgba(59,130,246,0.5)]",
          special: false,
        };
      case "epic":
        return {
          border: "border-purple-400",
          bg: "bg-purple-100",
          text: "text-purple-600",
          shadow: "shadow-purple-300",
          glow: "shadow-[0_0_8px_rgba(147,51,234,0.7)]",
          special: true,
        };
      case "legendary":
        return {
          border: "border-amber-400",
          bg: "bg-amber-100",
          text: "text-amber-600",
          shadow: "shadow-amber-300",
          glow: "shadow-[0_0_10px_rgba(245,158,11,0.8)]",
          special: true,
        };
      default:
        return {
          border: "border-gray-300",
          bg: "bg-gray-50",
          text: "text-gray-500",
          shadow: "shadow-gray-200",
          glow: "shadow-[0_0_5px_rgba(156,163,175,0.5)]",
          special: false,
        };
    }
  };

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
          <div className="mb-6 flex justify-between items-start bg-gray-50 p-6 rounded-xl">
            <div className="flex flex-col items-center">
              <div ref={containerRef} className="w-[200px] h-[200px] relative">
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

            {/* 선택된 캐릭터 정보 */}
            <div className="flex-1 ml-8 p-4">
              {selectedCharacter ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-korean-pixel text-2xl font-bold text-gray-800">{changeCatNameToKorean(selectedCharacter.catName)}</h3>
                    {selectedCharacter.catName === mainCat && <div className="bg-amber-400 text-white px-2 py-0.5 rounded-md text-sm font-bold">MAIN</div>}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-lg text-gray-600 font-korean-pixel">{selectedCharacter.description}</p>
                  </div>
                  {(() => {
                    const gradeStyle = getBorderColorByGrade(selectedCharacter.grade);
                    return (
                      <div
                        className={`px-4 py-2 ${gradeStyle.special ? "rounded-lg scale-105" : "rounded-md"} 
                      ${gradeStyle.bg} ${gradeStyle.border} border ${gradeStyle.shadow} ${gradeStyle.glow} 
                      inline-flex items-center transition-all duration-300 
                      ${gradeStyle.special ? "animate-pulse" : ""}`}
                      >
                        <span className={`font-bold tracking-wider ${gradeStyle.text} ${gradeStyle.special ? "text-base" : "text-sm"}`}>{selectedCharacter.grade.toUpperCase()}</span>
                      </div>
                    );
                  })()}
                  {selectedCharacter.catName !== mainCat && (
                    <button
                      onClick={onSetMainCharacter}
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300 w-full shadow-md"
                    >
                      대표 캐릭터로 설정
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 font-korean-pixel">캐릭터를 선택해주세요</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {characters.map((character) => {
              const gradeStyle = getBorderColorByGrade(character.grade);
              return (
                <div
                  key={character.catId}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative ${
                    selectedCharacter?.catId === character.catId ? `${gradeStyle.bg} bg-opacity-20 ${gradeStyle.border} border-2` : `bg-gray-50 hover:bg-gray-100 ${gradeStyle.border} border-2`
                  }`}
                  onClick={() => onSelect(character)}
                >
                  <div className="flex flex-col items-center">
                    {character.catName === mainCat && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 text-white px-2 py-0.5 rounded-md text-xs font-bold z-10 transform rotate-12 origin-center">MAIN</div>
                    )}
                    <img src={`/cats_assets/${character.catName}/${character.catName}_cat_static.png`} alt={character.catName} className="w-24 h-24" style={{ imageRendering: "pixelated" }} />
                    <div className="mt-4 text-center w-full">
                      <h3 className="font-korean-pixel text-lg font-bold text-gray-800 mb-2">{changeCatNameToKorean(character.catName)}</h3>
                      <div className={`w-full flex justify-center ${gradeStyle.special ? "scale-110" : ""}`}>
                        <div
                          className={`px-4 py-1.5 ${gradeStyle.special ? "rounded-lg" : "rounded-md"} 
                          ${gradeStyle.bg} ${gradeStyle.border} border ${gradeStyle.shadow} ${gradeStyle.glow} 
                          inline-flex items-center justify-center transition-all duration-300 
                          ${gradeStyle.special ? "animate-pulse" : ""} 
                          ${gradeStyle.special ? "min-w-[120px]" : "min-w-[100px]"}`}
                        >
                          <span className={`text-xs font-bold tracking-wider ${gradeStyle.text} ${gradeStyle.special ? "text-sm" : ""}`}>{character.grade.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterChangeModal;
