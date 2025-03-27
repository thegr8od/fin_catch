import React from "react";
import { Cat } from "../../types/profile/Cat";

interface CharacterInfoModalProps {
  character: Cat | null;
  onClose: () => void;
}

const CharacterInfoModal: React.FC<CharacterInfoModalProps> = ({ character, onClose }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-korean-pixel">{character.catName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4">
                <h5 className="font-korean-pixel text-lg font-bold text-amber-900 mb-2">캐릭터 설명</h5>
                <p className="font-korean-pixel text-amber-800">{character.description}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <h5 className="font-korean-pixel text-lg font-bold text-amber-900 mb-2">등급</h5>
                <p className="font-korean-pixel text-amber-800">{character.grade}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfoModal;
