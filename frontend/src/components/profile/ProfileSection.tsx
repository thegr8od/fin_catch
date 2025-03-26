import React from "react";
import { useNavigate } from "react-router-dom";
import { CharacterType } from "../../components/game/constants/animations";

interface ProfileData {
  nickname: string;
  level: number;
  exp: number;
  maxExp: number;
  coins: number;
  mainCat: CharacterType;
}

interface ProfileSectionProps {
  profileData: ProfileData;
  onNicknameChange: () => void;
  onCharacterClick: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profileData, onNicknameChange, onCharacterClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src={`/cats_assets/${profileData.mainCat}/${profileData.mainCat}_cat_static.png`}
            alt="프로필"
            className="w-24 h-24 rounded-full border-4 border-yellow-400 cursor-pointer hover:border-blue-400 transition-colors"
            style={{ imageRendering: "pixelated" }}
            onClick={onCharacterClick}
          />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold font-korean-pixel">{profileData.nickname}님, 환영합니다!</h2>
              <button onClick={onNicknameChange} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-korean-pixel text-gray-600 transition-colors">
                ✏️ 닉네임 변경
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-korean-pixel">Lv. {profileData.level}</span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-korean-pixel">🪙 {profileData.coins}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/lobby")}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-korean-pixel text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🎮 게임 시작하기
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
