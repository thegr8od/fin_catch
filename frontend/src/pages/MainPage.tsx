import React, { useState } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import { CharacterType } from "../components/game/constants/animations";
import AccountLinkModal from "../components/account/AccountLinkModal";
import NicknameChangeModal from "../components/mainpage/NicknameChangeModal";
import { useCharacterManagement } from "../hooks/useCharacterManagement";
import { useModalManagement } from "../hooks/useModalManagement";
import { Account } from "../types/Accounts/Account";
import ProfileSection from "../components/profile/ProfileSection";
import AccountLinkSection from "../components/account/AccountLinkSection";
import SpendingAnalysis from "../components/analysis/SpendingAnalysis";
import WrongAnswerAnalysis from "../components/analysis/WrongAnswerAnalysis";
import CharacterChangeModal from "../components/profile/CharacterChangeModal";
import { useNavigate } from "react-router-dom";
import { useAnalyze } from "../hooks/useAnalyze";
import QuizResultSection from "../components/quiz/QuizResultSection";
import { dummyWeakPoints } from "../data/dummyData";
import useQuizResult from "../hooks/useQuizResult";
import { useLoadAccounts } from "../hooks/useLoadAccounts";

const MainPage = () => {
  const navigate = useNavigate();
  const { user, loading, fetchUserInfo } = useUserInfo();
  const { characters, selectedCharacter, handleCharacterSelect, changeMyCat } = useCharacterManagement();
  const { showNicknameModal, showCharacterInfoModal, handleModalOpen, handleModalClose } = useModalManagement(user);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // useLoadAccounts 훅 사용
  const { accounts, error: accountError, loadAccounts } = useLoadAccounts();
  const { categories } = useAnalyze();
  const { quizScores } = useQuizResult();

  // 계좌 연동 후 정보 갱신
  const handleAccountLink = async (account: Account) => {
    setIsAccountModalOpen(false);
    try {
      await fetchUserInfo(); // 사용자 정보만 갱신
      await loadAccounts(); // 계좌 정보 다시 불러오기
    } catch (error) {
      console.error("계좌 연동 후 정보 갱신 실패:", error);
    }
  };

  const handleUpdateNickname = async (newNickname: string) => {
    try {
      await fetchUserInfo();
      handleModalClose("nickname");
    } catch (error) {
      console.error("닉네임 변경 후 사용자 정보 갱신 실패:", error);
    }
  };

  const handleCharacterClick = () => {
    handleModalOpen("character");
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
    mainCat: user.mainCat as unknown as CharacterType,
  };

  return (
    <Background backgroundImage={myPageBg}>
      <div className="absolute inset-0 overflow-auto">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-6 mt-10">
              {/* 프로필 섹션 */}
              <ProfileSection profileData={profileData} onNicknameChange={() => handleModalOpen("nickname")} onCharacterClick={handleCharacterClick} />

              {/* 계좌 연동 섹션 */}
              <AccountLinkSection onAccountLink={() => setIsAccountModalOpen(true)} error={accountError} accounts={accounts} fetchAllAccount={loadAccounts} />

              {/* 소비패턴 분석 */}
              <SpendingAnalysis />

              {/* 오답 분석 */}
              <WrongAnswerAnalysis categories={categories} onDetailView={() => {}} onStartGame={() => navigate("/lobby")} />

              {/* AI 문제 풀기 - 훅에서 가져온 데이터 사용 */}
              <QuizResultSection scores={quizScores} weakPoints={dummyWeakPoints} />
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showNicknameModal && <NicknameChangeModal onClose={() => handleModalClose("nickname")} currentNickname={profileData.nickname} onUpdateNickname={handleUpdateNickname} />}

      <AccountLinkModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onLinkAccount={handleAccountLink} accounts={accounts} fetchAllAccount={loadAccounts} />

      {showCharacterInfoModal && (
        <CharacterChangeModal
          onClose={() => handleModalClose("character")}
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelect={handleCharacterSelect}
          mainCat={profileData.mainCat}
          onSetMainCharacter={changeMyCat}
        />
      )}
    </Background>
  );
};

export default MainPage;
