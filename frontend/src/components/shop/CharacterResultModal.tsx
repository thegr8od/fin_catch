import React, { useState, useEffect } from "react";
import CharacterListModal from "./CharacterListModal";
import coinImg from "../../assets/coin.png";
import { changeCatNameToKorean } from "../../utils/ChangeCatName";

interface Character {
  catId: number;
  catName: string;
  description: string;
  grade: string;
  isDuplicate?: boolean;
}

interface CharacterResultModalProps {
  onClose: () => void;
  amount: number;
  characters: Character[];
}

const CharacterResultModal: React.FC<CharacterResultModalProps> = ({ onClose, amount, characters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [showRefundEffect, setShowRefundEffect] = useState(false);

  useEffect(() => {
    if (currentCharacter?.isDuplicate) {
      setShowRefundEffect(true);
      const timer = setTimeout(() => {
        setShowRefundEffect(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

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

  // 희귀도 표시 변환
  const getGradeStars = (grade: string) => {
    switch (grade) {
      case "COMMON":
        return "★";
      case "RARE":
        return "★★";
      case "EPIC":
        return "★★★";
      case "UNIQUE":
        return "★★★★";
      case "LEGENDARY":
        return "★★★★★";
      default:
        return "★";
    }
  };

  // 등급별 색상 및 효과 클래스
  const getGradeClass = (grade: string) => {
    switch (grade) {
      case "LEGENDARY":
        return "animate-pulse text-yellow-400 font-bold text-3xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]";
      case "EPIC":
        return "animate-pulse text-purple-400 font-bold text-2xl drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
      default:
        return "text-white text-2xl";
    }
  };

  // 등급별 설명 텍스트 스타일
  const getDescriptionClass = (grade: string) => {
    switch (grade) {
      case "LEGENDARY":
        return "text-yellow-300 animate-pulse";
      case "EPIC":
        return "text-purple-300 animate-pulse";
      default:
        return "text-gray-300";
    }
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

        {/* 캐릭터 정보 */}
        <div className={`flex flex-col items-center ${currentCharacter.grade === "LEGENDARY" ? "animate-bounce" : ""}`}>
          {/* 캐릭터 이미지 */}
          <div className={`w-64 h-64 mb-4 relative ${currentCharacter.grade === "LEGENDARY" ? "animate-pulse" : ""}`}>
            <img
              src={`/cats_assets/${currentCharacter.catName}/${currentCharacter.catName}_cat_static.png`}
              alt={changeCatNameToKorean(currentCharacter.catName)}
              className={`w-full h-full object-contain ${
                currentCharacter.grade === "LEGENDARY" ? "drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" : currentCharacter.grade === "EPIC" ? "drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" : ""
              }`}
            />
          </div>

          <h3 className={`font-korean-pixel mb-2 ${getGradeClass(currentCharacter.grade)}`}>{changeCatNameToKorean(currentCharacter.catName)}</h3>
          <p className={`text-center font-korean-pixel mb-2 ${getDescriptionClass(currentCharacter.grade)}`}>{currentCharacter.description}</p>
          <p className="text-yellow-400 text-center font-korean-pixel mb-2 text-xl">{getGradeStars(currentCharacter.grade)}</p>

          {/* 중복 캐릭터 환급 효과 */}
          {currentCharacter.isDuplicate && (
            <div className={`flex flex-col items-center transition-all duration-500 ${showRefundEffect ? "scale-110" : "scale-100"}`}>
              <div className="flex items-center bg-green-900 bg-opacity-50 rounded-lg px-4 py-2 mb-4">
                <p className="text-green-400 font-korean-pixel mr-2">보유 중인 고양이</p>
                <div className="flex items-center animate-bounce">
                  <img src={coinImg} alt="코인" className="w-5 h-5 mr-1" />
                  <span className="text-yellow-400 font-bold">+50</span>
                </div>
              </div>
            </div>
          )}
        </div>

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

export default CharacterResultModal;
