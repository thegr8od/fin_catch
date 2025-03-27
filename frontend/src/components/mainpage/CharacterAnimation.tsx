import React, { useState } from "react";
import { CharacterType } from "../game/constants/animations";
import smokeCatGif from "../../assets/characters/smoke_cat.gif";

interface Character {
  id: number;
  name: string;
  imagePath: string;
  animationPath: string;
  type: CharacterType;
}

interface CharacterAnimationProps {
  characterId: number;
  size?: "small" | "medium" | "large";
  useStaticImage?: boolean; // 정적 이미지 사용 여부
}

// 임시 캐릭터 데이터
const characters: Character[] = [
  {
    id: 1,
    name: "스모크 캣",
    imagePath: "/cats_assets/classic/classic_cat_static.png",
    animationPath: smokeCatGif,
    type: "classic",
  },
  // 다른 캐릭터들도 필요하다면 여기에 추가
];

const getCharacterById = (id: number): Character | undefined => {
  return characters.find((char) => char.id === id);
};

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({ characterId, size = "medium", useStaticImage = false }) => {
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

  // 캐릭터 GIF 매핑 (애니메이션)
  const characterGifs: { [key: number]: string } = {
    1: smokeCatGif,
    2: smokeCatGif, // 임시로 같은 GIF 사용
    3: smokeCatGif, // 임시로 같은 GIF 사용
    4: smokeCatGif, // 임시로 같은 GIF 사용
    5: smokeCatGif, // 임시로 같은 GIF 사용
    6: smokeCatGif, // 임시로 같은 GIF 사용
    7: smokeCatGif, // 임시로 같은 GIF 사용
    8: smokeCatGif, // 임시로 같은 GIF 사용
    9: smokeCatGif, // 임시로 같은 GIF 사용
    10: smokeCatGif, // 임시로 같은 GIF 사용
    11: smokeCatGif, // 임시로 같은 GIF 사용
    12: smokeCatGif, // 임시로 같은 GIF 사용
  };

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
      {imageError || useStaticImage ? (
        // 정적 이미지 표시 (오류 발생 시 또는 useStaticImage가 true일 때)
        <img src={character.imagePath} alt={character.name} className="w-full h-full object-contain" onError={() => console.error("정적 이미지 로드 실패:", character.imagePath)} />
      ) : (
        // GIF 애니메이션 표시
        <img src={characterGifs[characterId] || character.animationPath} alt={`${character.name} 애니메이션`} className="w-full h-full object-contain" onError={handleImageError} />
      )}
    </div>
  );
};

export default CharacterAnimation;
