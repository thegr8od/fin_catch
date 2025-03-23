import React from "react";
import { Character } from "../../types/Character";
import { CharacterType } from "../../components/game/constants/animations";

interface CharacterListProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
  mainCat: CharacterType;
}

const CharacterList: React.FC<CharacterListProps> = React.memo(({ characters, selectedCharacter, onSelect, mainCat }) => {
  return (
    <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[320px] pr-2 hover:overflow-auto">
      {characters.map((character) => (
        <div
          key={character.catId}
          onClick={() => onSelect(character)}
          className={`p-2 rounded-xl cursor-pointer transition-all duration-300 ${
            selectedCharacter?.catId === character.catId ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center relative overflow-hidden">
              <img
                src={`/cats_assets/${character.catName}/${character.catName}_cat_static.png`}
                alt={character.catName}
                className="object-contain max-w-full max-h-full"
                style={{ imageRendering: "pixelated", position: "relative", zIndex: 10 }}
              />
            </div>
            <div className="flex flex-col items-center gap-1 mt-1 w-full">
              <span className="font-korean-pixel text-xs text-center truncate w-full">{character.catName}</span>
              <div className="flex flex-wrap gap-1 justify-center">
                <span
                  className={`font-korean-pixel text-[10px] px-1 py-0.5 rounded-full ${
                    character.grade === "RARE"
                      ? "bg-blue-100 text-blue-800"
                      : character.grade === "EPIC"
                      ? "bg-purple-100 text-purple-800"
                      : character.grade === "LEGENDARY"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {character.grade}
                </span>
                {character.catName === mainCat && <span className="font-korean-pixel text-[10px] px-1 py-0.5 rounded-full bg-green-100 text-green-800">주인공</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default CharacterList;
