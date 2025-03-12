import React from "react";
import catProfile from "../../assets/characters/smoke_cat.png";

const CharacterDisplaySection: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">캐릭터 디스플레이</h3>
      <div className="flex items-center justify-center h-[calc(100%-2rem)]">
        <div className="relative w-48 h-48">
          <img src={catProfile} alt="캐릭터" className="w-full h-full object-contain animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplaySection;
