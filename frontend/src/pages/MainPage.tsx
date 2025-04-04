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
import { useAccount } from "../hooks/useAccount";
import useQuizResult from "../hooks/useQuizResult";

const MainPage = () => {
  const navigate = useNavigate();
  const { user, loading, fetchUserInfo } = useUserInfo();
  const { characters, selectedCharacter, handleCharacterSelect, changeMyCat } = useCharacterManagement();
  const { showNicknameModal, showCharacterInfoModal, handleModalOpen, handleModalClose } = useModalManagement(user);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { accounts, error: accountError, fetchAllAccount } = useAccount();
  const { categories } = useAnalyze();
  const { quizScores } = useQuizResult();

  // 계좌 연동 후 정보 갱신
  const handleAccountLink = async (account: Account) => {
    setIsAccountModalOpen(false);
    try {
      await Promise.all([
        fetchAllAccount(),
        fetchUserInfo(), // user 정보도 함께 갱신
      ]);
    } catch (error) {
      console.error("계좌 연동 후 정보 갱신 실패:", error);
    }
  };

  // 주 계좌 정보 찾기
  const mainAccountInfo = React.useMemo(() => {
    if (!user?.main_account || !accounts) return null;
    return accounts.find((account) => account.accountNo === user.main_account) || null;
  }, [accounts, user?.main_account]);

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
              <ProfileSection profileData={profileData} onNicknameChange={() => handleModalOpen("nickname")} onCharacterClick={handleCharacterClick} />

              <AccountLinkSection onAccountLink={() => setIsAccountModalOpen(true)} mainAccount={mainAccountInfo} error={accountError} accounts={accounts} fetchAllAccount={fetchAllAccount} />

              <SpendingAnalysis />
              <WrongAnswerAnalysis categories={categories} onDetailView={() => {}} onStartGame={() => navigate("/lobby")} />
              <QuizResultSection scores={quizScores} weakPoints={dummyWeakPoints} />
            </div>
          </div>
        </div>
      </div>

      <AccountLinkModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onLinkAccount={handleAccountLink} accounts={accounts} fetchAllAccount={fetchAllAccount} />

      {showNicknameModal && <NicknameChangeModal onClose={() => handleModalClose("nickname")} currentNickname={profileData.nickname} onUpdateNickname={handleUpdateNickname} />}

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
