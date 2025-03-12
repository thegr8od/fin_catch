import React, { useState } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import catProfile from "../assets/characters/smoke_cat.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";

// 컴포넌트 임포트
import ProfileSection from "../components/mypage/ProfileSection";
import NewsSection from "../components/mypage/NewsSection";
import StatsSection from "../components/mypage/StatsSection";
import BattleStatsSection from "../components/mypage/BattleStatsSection";
import RecentActivitiesSection from "../components/mypage/RecentActivitiesSection";
import WrongAnswerNoteModal from "../components/mypage/WrongAnswerNoteModal";
import AccountLinkModal from "../components/mypage/AccountLinkModal";
import AccountAnalysisModal from "../components/mypage/AccountAnalysisModal";
import NicknameChangeModal from "../components/mypage/NicknameChangeModal";

const MyPage = () => {
  const { user, loading, fetchUserInfo } = useUserInfo();
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState("");

  // 미구현 기능 접근 시 모달 표시 함수
  const handleFeatureClick = (message: string) => {
    setFeatureMessage(message);
    setShowFeatureModal(true);
  };

  // 닉네임 변경 처리
  const handleUpdateNickname = async (newNickname: string) => {
    console.log("닉네임 변경 시작:", newNickname);
    try {
      // 사용자 정보 갱신
      await fetchUserInfo();
      console.log("사용자 정보 갱신 완료");
      // 모달 닫기
      setShowNicknameModal(false);
    } catch (error) {
      console.error("닉네임 변경 후 사용자 정보 갱신 실패:", error);
    }
  };

  if (loading || !user) {
    return <LoadingScreen />;
  }

  const profileData = {
    nickname: user.nickname,
    level: Math.floor(user.exp / 1000) + 1,
    exp: user.exp,
    maxExp: 1000,
    coins: user.point,
    profileImage: catProfile,
  };

  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full max-w-[1800px] h-[900px] bg-white/95 rounded-2xl shadow-2xl p-8">
        <div className="flex h-full gap-6">
          {/* 왼쪽 섹션 - 프로필 */}
          <div className="w-1/3 h-full flex flex-col gap-6">
            {/* 프로필 섹션 */}
            <div className="flex-grow">
              <ProfileSection userData={profileData} onNicknameChangeClick={() => setShowNicknameModal(true)} />
            </div>

            {/* 계좌 정보 섹션 */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">연결된 계좌</h3>
                <button
                  onClick={() => handleFeatureClick("계좌 연동 기능은 추후 업데이트 될 예정입니다.")}
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-form-color to-button-color text-gray-700 hover:opacity-90 text-sm font-korean-pixel"
                >
                  계좌 연동하기
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 font-korean-pixel text-lg">연결된 계좌가 없습니다</p>
                <p className="text-gray-500 font-korean-pixel mt-1">계좌를 연동하여 서비스를 이용해보세요</p>
              </div>
            </div>
          </div>

          {/* 중앙 섹션 - 뉴스 및 최근 활동 */}
          <div className="w-1/3 border-l border-r border-gray-200 h-full flex flex-col gap-6 px-6">
            <div className="flex-1">
              <NewsSection newsItems={[]} />
            </div>
            <div className="flex-1">
              <RecentActivitiesSection activities={[]} />
            </div>
          </div>

          {/* 오른쪽 섹션 - AI 배틀 현황 및 PVP 전적 */}
          <div className="w-1/3 h-full flex flex-col gap-6">
            <div className="flex-1">
              <BattleStatsSection categoryStats={[]} />
            </div>
            <div className="flex-1">
              <StatsSection pvpStats={{ wins: 0, losses: 0 }} soloStats={{ wins: 0, losses: 0 }} onOpenWrongAnswerNote={() => handleFeatureClick("오답 노트 기능은 추후 업데이트 될 예정입니다.")} />
            </div>
          </div>
        </div>
      </div>

      {/* 미구현 기능 안내 모달 */}
      {showFeatureModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md">
            <h2 className="text-xl font-bold mb-3 font-korean-pixel">안내</h2>
            <p className="mb-4 font-korean-pixel">{featureMessage}</p>
            <button onClick={() => setShowFeatureModal(false)} className="w-full py-2 bg-blue-500 text-white rounded-lg font-korean-pixel hover:bg-blue-600 transition-colors">
              확인
            </button>
          </div>
        </div>
      )}

      {/* 닉네임 변경 모달 */}
      {showNicknameModal && <NicknameChangeModal onClose={() => setShowNicknameModal(false)} currentNickname={user.nickname} onUpdateNickname={handleUpdateNickname} />}
    </Background>
  );
};

export default MyPage;
