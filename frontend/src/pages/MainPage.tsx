import React, { useMemo } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import { AccountInfo } from "../components/mypage/AccountLinkModal";
import { CharacterType } from "../components/game/constants/animations";
import AccountLinkModal from "../components/mypage/AccountLinkModal";
import NicknameChangeModal from "../components/mypage/NicknameChangeModal";
import { useCharacterManagement } from "../hooks/useCharacterManagement";
import { useModalManagement } from "../hooks/useModalManagement";
import { Character } from "../types/Character";

// 새로 분리한 컴포넌트들 import
import ProfileSection from "../components/profile/ProfileSection";
import AccountLinkSection from "../components/account/AccountLinkSection";
import SpendingAnalysis from "../components/analysis/SpendingAnalysis";
import QuizResultSection from "../components/quiz/QuizResultSection";
import CharacterInfoModal from "../components/character/CharacterInfoModal";
import CharacterList from "../components/character/CharacterList";
import AnimatedCharacterDisplay from "../components/character/AnimatedCharacterDisplay";

// API 응답의 Cat 타입을 Character 타입으로 변환하는 함수
const convertCatToCharacter = (cat: any): Character => {
  return {
    catId: cat.catId,
    catName: cat.catName as CharacterType,
    description: cat.description,
    grade: cat.grade || "DEFAULT",
  };
};

const MainPage = () => {
  const { user, loading, fetchUserInfo } = useUserInfo();
  const { characters, selectedCharacter, currentAnimationState, isCharacterLoading, resourcesLoaded, handleCharacterSelect, setCurrentAnimationState, changeMyCat } = useCharacterManagement();
  const { showFeatureModal, showNicknameModal, showAccountLinkModal, showCharacterInfoModal, featureMessage, handleModalOpen, handleModalClose, setFeatureMessage } = useModalManagement(user);

  const handleAccountLink = (accountInfo: AccountInfo) => {
    console.log("계좌 연동 완료:", accountInfo);
    handleModalClose("account");
  };

  const handleUpdateNickname = async (newNickname: string) => {
    try {
      await fetchUserInfo();
      handleModalClose("nickname");
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
    mainCat: user.mainCat as unknown as CharacterType,
  };

  const spendingCategories = [
    { name: "식비", percentage: 65, color: "bg-blue-500" },
    { name: "쇼핑", percentage: 20, color: "bg-purple-500" },
    { name: "교통", percentage: 15, color: "bg-green-500" },
  ];

  const monthlyTrend = {
    category: "식비",
    percentage: 15,
    reason: "배달음식 주문이 잦아진 것이 주요 원인으로 보여요.",
  };

  const quizScores = {
    average: 85,
    totalAttempts: 12,
    consecutiveDays: 3,
  };

  const weakPoints = [
    { id: 1, topic: "투자 위험 관리", level: "high" as const },
    { id: 2, topic: "세금 계산", level: "medium" as const },
    { id: 3, topic: "금융 상품 이해", level: "low" as const },
  ];

  // 캐릭터 리스트 정렬: 대표 캐릭터를 맨 앞으로
  const sortedCharacters = useMemo(() => {
    if (!characters || !profileData.mainCat) return characters;

    return [...characters].sort((a, b) => {
      if (a.catName === profileData.mainCat) return -1;
      if (b.catName === profileData.mainCat) return 1;
      return 0;
    });
  }, [characters, profileData.mainCat]);

  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full h-screen overflow-y-auto">
        <div className="w-full py-8 px-4">
          <div className="max-w-[1800px] mx-auto pb-24">
            {/* 프로필 섹션 */}
            <ProfileSection profileData={profileData} onNicknameChange={() => handleModalOpen("nickname")} />

            {/* 캐릭터 디스플레이 섹션 */}
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🎭 나의 캐릭터</h3>
                  {selectedCharacter && (
                    <button onClick={() => handleModalOpen("character")} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-korean-pixel transition-colors">
                      ℹ️ 정보
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 mb-6 relative min-h-[300px]">
                <div className="relative w-[192px] h-[96px] mb-6" style={{ zIndex: 5 }}>
                  {isCharacterLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : selectedCharacter ? (
                    <div className="flex items-center justify-center">
                      <AnimatedCharacterDisplay character={selectedCharacter} state={currentAnimationState} scale={1} resourcesLoaded={resourcesLoaded} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p className="text-gray-500 font-korean-pixel">선택된 캐릭터가 없습니다</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 z-50">
                  {["attack", "damage", "victory"].map((state) => (
                    <button
                      key={state}
                      onClick={() => setCurrentAnimationState(state as typeof currentAnimationState)}
                      className={`px-3 py-2 rounded-lg font-korean-pixel transition-colors ${
                        currentAnimationState === state ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      {state === "attack" ? "공격" : state === "damage" ? "피격" : "승리"}
                    </button>
                  ))}
                </div>

                {selectedCharacter && (
                  <div className="mt-4 z-50">
                    {selectedCharacter.catName === profileData.mainCat ? (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-korean-pixel">현재 주인공 고양이입니다</div>
                    ) : (
                      <button
                        onClick={changeMyCat}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300"
                      >
                        대표 캐릭터로 설정
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🎨 보유 캐릭터</h3>
              </div>

              <CharacterList characters={sortedCharacters} selectedCharacter={selectedCharacter} onSelect={handleCharacterSelect} mainCat={profileData.mainCat} />
            </div>

            {/* 계좌 연동 섹션 */}
            <AccountLinkSection onAccountLink={() => handleModalOpen("account")} />

            {/* 소비패턴 분석 및 문제 풀이 결과 섹션 */}
            <div className="mt-6 mb-24">
              <div className="grid grid-cols-2 gap-8">
                <SpendingAnalysis onDetailView={() => handleModalOpen("account")} categories={spendingCategories} monthlyTrend={monthlyTrend} />
                <QuizResultSection scores={quizScores} weakPoints={weakPoints} />
              </div>
            </div>

            {/* 모달들 */}
            {showFeatureModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-xl max-w-md">
                  <h2 className="text-xl font-bold mb-3 font-korean-pixel">안내</h2>
                  <p className="mb-4 font-korean-pixel">{featureMessage}</p>
                  <button onClick={() => handleModalClose("feature")} className="w-full py-2 bg-blue-500 text-white rounded-lg font-korean-pixel hover:bg-blue-600 transition-colors">
                    확인
                  </button>
                </div>
              </div>
            )}

            {showNicknameModal && <NicknameChangeModal onClose={() => handleModalClose("nickname")} currentNickname={profileData.nickname} onUpdateNickname={handleUpdateNickname} />}

            {showAccountLinkModal && <AccountLinkModal onClose={() => handleModalClose("account")} onLinkAccount={handleAccountLink} />}

            {showCharacterInfoModal && selectedCharacter && <CharacterInfoModal character={selectedCharacter} onClose={() => handleModalClose("character")} />}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default MainPage;
