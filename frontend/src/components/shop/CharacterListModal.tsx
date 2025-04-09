import React from "react";
import coinImg from "../../assets/coin.png";
import { changeCatNameToKorean } from "../../utils/ChangeCatName";

interface Character {
  catId: number;
  catName: string;
  description: string;
  grade: string;
  isDuplicate?: boolean;
}

interface CharacterListModalProps {
  characters: Character[];
  onClose: () => void;
}

const CharacterListModal: React.FC<CharacterListModalProps> = ({ characters, onClose }) => {
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
        return "animate-pulse bg-gradient-to-r from-yellow-900 to-yellow-700 border-2 border-yellow-400";
      case "EPIC":
        return "animate-pulse bg-gradient-to-r from-purple-900 to-purple-700 border-2 border-purple-400";
      default:
        return "bg-gray-700";
    }
  };

  // 등급별 이름 텍스트 스타일
  const getNameClass = (grade: string) => {
    switch (grade) {
      case "LEGENDARY":
        return "text-yellow-300 font-bold";
      case "EPIC":
        return "text-purple-300 font-bold";
      default:
        return "text-white";
    }
  };

  // 등급별 설명 텍스트 스타일
  const getDescriptionClass = (grade: string) => {
    switch (grade) {
      case "LEGENDARY":
        return "text-yellow-200";
      case "EPIC":
        return "text-purple-200";
      default:
        return "text-gray-300";
    }
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

        {/* 환급 총액 표시 */}
        {characters.some((char) => char.isDuplicate) && (
          <div className="bg-green-900 bg-opacity-50 rounded-lg px-6 py-3 mb-6 animate-pulse">
            <div className="flex items-center justify-center">
              <p className="text-green-400 font-korean-pixel mr-3">총 환급 코인</p>
              <div className="flex items-center">
                <img src={coinImg} alt="코인" className="w-6 h-6 mr-1" />
                <span className="text-yellow-400 font-bold text-xl">+{characters.filter((char) => char.isDuplicate).length * 50}</span>
              </div>
            </div>
          </div>
        )}

        {/* 캐릭터 목록 */}
        <div className="grid grid-cols-5 gap-4 w-full">
          {characters.map((character) => (
            <div key={character.catId} className={`rounded-lg p-3 flex flex-col items-center ${getGradeClass(character.grade)} relative`}>
              {/* 중복 표시 뱃지 */}
              {character.isDuplicate && (
                <div className="absolute -top-2 -right-2 bg-green-600 rounded-full px-2 py-1 flex items-center animate-bounce">
                  <img src={coinImg} alt="코인" className="w-3 h-3 mr-1" />
                  <span className="text-white text-xs font-bold">+50</span>
                </div>
              )}

              {/* 캐릭터 이미지 */}
              <div className="w-full aspect-square mb-2">
                <img src={`/cats_assets/${character.catName}/${character.catName}_cat_static.png`} alt={changeCatNameToKorean(character.catName)} className="w-full h-full object-contain" />
              </div>

              <p className={`text-sm font-korean-pixel truncate w-full text-center mb-2 ${getNameClass(character.grade)}`}>{changeCatNameToKorean(character.catName)}</p>
              <p className={`text-xs font-korean-pixel mb-2 ${getDescriptionClass(character.grade)}`}>{character.description}</p>
              <p className="text-yellow-400 text-xs font-korean-pixel">{getGradeStars(character.grade)}</p>
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
