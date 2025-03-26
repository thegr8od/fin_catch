import React, { useState } from "react";
import { getCharacterById } from "../../data/characters";

interface CharacterImageProps {
  characterId: number;
  size?: "small" | "medium" | "large";
}

const CharacterImage: React.FC<CharacterImageProps> = ({ characterId, size = "medium" }) => {
  const [imageError, setImageError] = useState(false);
  const character = getCharacterById(characterId);

  // 크기에 따른 너비와 높이 설정
  let width = "100px";
  let height = "100px";

  switch (size) {
    case "small":
      width = "64px";
      height = "64px";
      break;
    case "medium":
      width = "128px";
      height = "128px";
      break;
    case "large":
      width = "200px";
      height = "200px";
      break;
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <div className="bg-gray-200 w-full h-full rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-xs">캐릭터 없음</span>
        </div>
      </div>
    );
  }

  // 이미지 오류 처리
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="flex items-center justify-center" style={{ width, height }}>
      {imageError ? (
        <div className="bg-gray-200 w-full h-full rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-xs">이미지 오류</span>
        </div>
      ) : (
        <img src={character.imagePath} alt={character.name} className="w-full h-full object-contain" onError={handleImageError} />
      )}
    </div>
  );
};

export default CharacterImage;
