import React, { useState, useEffect } from "react";
import CharacterSelectModal from "./CharacterSelectModal";
import CharacterAnimation from "./CharacterAnimation";
import coinIcon from "../../assets/coin.png";
import { getCharacterById, Character } from "../../data/characters";

interface ProfileSectionProps {
  userData: {
    nickname: string;
    level: number;
    exp: number;
    maxExp: number;
    coins: number;
    profileImage: string;
  };
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userData }) => {
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [currentCharacterId, setCurrentCharacterId] = useState(1);
  const [currentCharacter, setCurrentCharacter] = useState<Character | undefined>(undefined);

  // 경험치 퍼센트 계산
  const expPercentage = (userData.exp / userData.maxExp) * 100;

  // 현재 캐릭터 정보 가져오기
  useEffect(() => {
    const character = getCharacterById(currentCharacterId);
    setCurrentCharacter(character);
  }, [currentCharacterId]);

  const handleSelectCharacter = (characterId: number) => {
    setCurrentCharacterId(characterId);
    // 실제로는 API 호출 등을 통해 캐릭터 이미지를 변경할 것입니다.
  };

  // 희귀도에 따른 배경색 클래스 가져오기
  const getRarityColorClass = (rarity?: Character["rarity"]): string => {
    if (!rarity) return "from-amber-100 to-amber-200 border-amber-300";

    switch (rarity) {
      case "common":
        return "from-gray-100 to-gray-200 border-gray-300";
      case "rare":
        return "from-blue-100 to-blue-200 border-blue-300";
      case "epic":
        return "from-purple-100 to-purple-200 border-purple-300";
      case "legendary":
        return "from-yellow-100 to-yellow-200 border-yellow-300";
      default:
        return "from-amber-100 to-amber-200 border-amber-300";
    }
  };

  return (
    <div className="w-full">
      {/* 캐릭터 이미지 및 기본 정보 */}
      <div className="flex flex-col items-center mb-6">
        <div className={`w-40 h-40 bg-gradient-to-br ${getRarityColorClass(currentCharacter?.rarity)} rounded-2xl overflow-hidden mb-4 border-2 shadow-lg`}>
          <div className="w-full h-full flex items-center justify-center">
            <CharacterAnimation characterId={currentCharacterId} size="large" />
          </div>
        </div>
        <div className="text-center mb-2">
          <h4 className="font-medium text-gray-800">{currentCharacter?.name || "기본 고양이"}</h4>
          <p className="text-xs text-gray-500">{currentCharacter?.category || "기본"}</p>
        </div>
        <button className="bg-white text-gray-700 px-5 py-2 rounded-full text-sm mb-2 hover:shadow-md transition-all duration-200 border border-gray-200" onClick={() => setShowCharacterModal(true)}>
          캐릭터 선택
        </button>
      </div>

      {/* 사용자 정보 */}
      <div className="w-full">
        {/* 닉네임 및 레벨 */}
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{userData.nickname}</h2>
          <div className="flex items-center justify-center mt-2">
            <span className="bg-white text-amber-700 px-4 py-1.5 rounded-lg text-sm mr-3 font-semibold shadow-sm border border-amber-200">Lv. {userData.level}</span>
          </div>
        </div>

        {/* 경험치 바 */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>EXP: {userData.exp}</span>
            <span>{userData.maxExp}</span>
          </div>
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-1">
            <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-700 ease-in-out" style={{ width: `${expPercentage}%` }}></div>
          </div>
          <div className="text-center text-xs text-gray-500">다음 레벨까지 {userData.maxExp - userData.exp} EXP 남음</div>
        </div>

        {/* 코인 정보 */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 shadow-md mb-5">
          <div className="flex items-center justify-center mb-2">
            <img src={coinIcon} alt="코인" className="w-8 h-8 mr-2" />
            <span className="text-amber-600 font-bold text-xl">{userData.coins.toLocaleString()}</span>
          </div>
          <div className="text-center text-sm text-amber-700 font-medium">보유 코인</div>
        </div>
      </div>

      {/* 캐릭터 선택 모달 */}
      {showCharacterModal && <CharacterSelectModal onClose={() => setShowCharacterModal(false)} onSelectCharacter={handleSelectCharacter} currentCharacterId={currentCharacterId} />}
    </div>
  );
};

export default ProfileSection;
