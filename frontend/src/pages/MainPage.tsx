import React, { useState } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import { CharacterType } from "../components/game/constants/animations";
import AccountLinkModal from "../components/mainpage/AccountLinkModal";
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
import { Category } from "../components/analysis/WrongAnswerAnalysis";
import QuizResultSection from "../components/quiz/QuizResultSection";

const MainPage = () => {
  const navigate = useNavigate();
  const { user, loading, fetchUserInfo } = useUserInfo();
  const { characters, selectedCharacter, handleCharacterSelect, changeMyCat } = useCharacterManagement();
  const { showNicknameModal, showCharacterInfoModal, handleModalOpen, handleModalClose } = useModalManagement(user);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [mainAccount, setMainAccount] = useState<Account | null>(null);

  const { analyzeWrongAnswer, loading: analyzeLoading, error } = useAnalyze();

  const handleAccountLink = (account: Account) => {
    setMainAccount(account);
    setIsAccountModalOpen(false);
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

  // 더미 오답 분석 데이터
  const wrongAnswerCategories: Category[] = [
    {
      id: 1,
      name: "금융통화위원회의 역할",
      totalProblems: 5,
      problems: [
        {
          id: 151, // API 호출에 사용할 ID
          title: "금융통화위원회의 역할",
          type: "객관식" as const,
          wrongCount: 3,
          correctCount: 2,
          analysis: "",
          attemptHistory: [
            { date: "2024-02-01", isCorrect: false },
            { date: "2024-02-03", isCorrect: true },
            { date: "2024-02-05", isCorrect: false },
          ],
          weakPoints: [],
          recommendations: [],
        },
      ],
    },
    {
      id: 2,
      name: "금융 범죄",
      totalProblems: 30,
      problems: [],
    },
    {
      id: 3,
      name: "금융 상품",
      totalProblems: 30,
      problems: [],
    },
    {
      id: 4,
      name: "투자",
      totalProblems: 30,
      problems: [],
    },
    {
      id: 5,
      name: "금융 지식",
      totalProblems: 30,
      problems: [],
    },
  ];

  return (
    <Background backgroundImage={myPageBg}>
      <div className="absolute inset-0 overflow-auto">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-6 mt-10">
              {/* 프로필 섹션 */}
              <ProfileSection profileData={profileData} onNicknameChange={() => handleModalOpen("nickname")} onCharacterClick={handleCharacterClick} />

              {/* 계좌 연동 섹션 */}
              <AccountLinkSection
                onAccountLink={() => setIsAccountModalOpen(true)}
                mainAccount={
                  mainAccount
                    ? {
                        bankCode: mainAccount.bankCode,
                        accountNumber: mainAccount.accountNumber,
                        productName: mainAccount.productName,
                        balance: mainAccount.accountBalance,
                      }
                    : null
                }
              />

              {/* 오답 분석 */}
              <WrongAnswerAnalysis categories={wrongAnswerCategories} onDetailView={() => {}} onStartGame={() => navigate("/lobby")} />

              {/* 소비패턴 분석 */}
              <SpendingAnalysis />

              {/* AI 문제 풀기 */}
              <QuizResultSection
                scores={{
                  average: 85,
                  totalAttempts: 10,
                  consecutiveDays: 3,
                }}
                weakPoints={[
                  {
                    id: 1,
                    topic: "금융상품의 위험성 이해",
                    level: "high",
                  },
                  {
                    id: 2,
                    topic: "투자 수익률 계산",
                    level: "medium",
                  },
                  {
                    id: 3,
                    topic: "시장 위험 분석",
                    level: "low",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showNicknameModal && <NicknameChangeModal onClose={() => handleModalClose("nickname")} currentNickname={profileData.nickname} onUpdateNickname={handleUpdateNickname} />}

      {isAccountModalOpen && <AccountLinkModal onClose={() => setIsAccountModalOpen(false)} onLinkAccount={handleAccountLink} />}

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
