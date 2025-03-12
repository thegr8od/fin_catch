import React, { useState, useEffect } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import catProfile from "../assets/characters/smoke_cat.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { AccountInfo } from "../components/mypage/AccountLinkModal";

// 컴포넌트 임포트
import ProfileSection from "../components/mypage/ProfileSection";
import CharacterDisplaySection from "../components/mypage/CharacterDisplaySection";
import AccountLinkModal from "../components/mypage/AccountLinkModal";
import AccountAnalysisModal from "../components/mypage/AccountAnalysisModal";
import NicknameChangeModal from "../components/mypage/NicknameChangeModal";

// 임시 캐릭터 데이터
const characters = [
  { id: 1, name: "연기 고양이", image: catProfile, selected: true },
  { id: 2, name: "불꽃 고양이", image: catProfile, selected: false },
  { id: 3, name: "물방울 고양이", image: catProfile, selected: false },
  { id: 4, name: "바람 고양이", image: catProfile, selected: false },
];

const MainPage = () => {
  const { user, loading, fetchUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  useEffect(() => {
    // 로컬 스토리지에서 계좌 연동 여부 확인
    const hasShownAccountModal = localStorage.getItem("hasShownAccountModal");
    if (!hasShownAccountModal && user) {
      setShowAccountLinkModal(true);
      localStorage.setItem("hasShownAccountModal", "true");
    }
  }, [user]);

  // 계좌 연동 처리
  const handleAccountLink = (accountInfo: AccountInfo) => {
    console.log("계좌 연동 완료:", accountInfo);
    setShowAccountLinkModal(false);
  };

  // 미구현 기능 접근 시 모달 표시 함수
  const handleFeatureClick = (message: string) => {
    setFeatureMessage(message);
    setShowFeatureModal(true);
  };

  // 닉네임 변경 처리
  const handleUpdateNickname = async (newNickname: string) => {
    console.log("닉네임 변경 시작:", newNickname);
    try {
      await fetchUserInfo();
      console.log("사용자 정보 갱신 완료");
      setShowNicknameModal(false);
    } catch (error) {
      console.error("닉네임 변경 후 사용자 정보 갱신 실패:", error);
    }
  };

  const handleLobbyClick = () => {
    navigate("/lobby");
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
      <div className="w-full h-screen overflow-y-auto">
        <div className="w-full py-8 px-4">
          <div className="max-w-[1800px] mx-auto pb-24">
            {/* 상단 프로필 섹션 */}
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <img src={catProfile} alt="프로필" className="w-24 h-24 rounded-full border-4 border-yellow-400" />
                  <div>
                    <h2 className="text-2xl font-bold font-korean-pixel mb-2">{user.nickname}님, 환영합니다!</h2>
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-korean-pixel">Lv. {profileData.level}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-korean-pixel">🪙 {profileData.coins}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLobbyClick}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-korean-pixel text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🎮 게임 시작하기
                </button>
              </div>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* 계좌 연동 카드 */}
              <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💳 계좌 연동</h3>
                  <button
                    onClick={() => setShowAccountLinkModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                  >
                    연동하기
                  </button>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl text-center">
                  <p className="text-gray-600 font-korean-pixel text-lg mb-2">계좌를 연동하고</p>
                  <p className="text-gray-800 font-korean-pixel text-xl font-bold">더 많은 기능을 사용해보세요!</p>
                </div>
              </div>

              {/* 캐릭터 디스플레이 */}
              <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">🎭 나의 캐릭터</h3>
                <div className="flex items-center justify-center h-[300px]">
                  <div className="relative w-48 h-48">
                    <img src={selectedCharacter.image} alt={selectedCharacter.name} className="w-full h-full object-contain animate-bounce" />
                  </div>
                </div>
              </div>

              {/* 캐릭터 목록 */}
              <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">🎨 보유 캐릭터</h3>
                <div className="grid grid-cols-2 gap-4">
                  {characters.map((character) => (
                    <div
                      key={character.id}
                      onClick={() => setSelectedCharacter(character)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedCharacter.id === character.id ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <img src={character.image} alt={character.name} className="w-20 h-20 object-contain mb-2" />
                        <span className="font-korean-pixel text-sm text-center">{character.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 소비패턴 분석 및 문제 풀이 결과 섹션 */}
            <div className="mb-24">
              {" "}
              {/* 푸터와의 여백 */}
              <div className="grid grid-cols-2 gap-8">
                {/* 소비패턴 분석 */}
                <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📊 소비패턴 분석</h3>
                    <button
                      onClick={() => setShowAccountLinkModal(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                    >
                      자세히 보기
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* 소비 카테고리 차트 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">주요 소비 카테고리</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">식비</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">65%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">쇼핑</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: "20%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">20%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">교통</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: "15%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">15%</div>
                        </div>
                      </div>
                    </div>
                    {/* 소비 트렌드 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">이번 달 소비 트렌드</h4>
                      <p className="text-gray-700 font-korean-pixel mb-2">
                        전월 대비 식비가 <span className="text-red-500 font-bold">15% 증가</span>했어요.
                      </p>
                      <p className="text-gray-700 font-korean-pixel">배달음식 주문이 잦아진 것이 주요 원인으로 보여요.</p>
                    </div>
                  </div>
                </div>

                {/* 소비패턴 기반 문제 풀이 결과 */}
                <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📝 AI 문제 풀이 결과</h3>
                    <button
                      onClick={() => navigate("/ai-quiz")}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                    >
                      다시 풀기
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* 최근 퀴즈 결과 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">최근 퀴즈 성적</h4>
                      <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 font-korean-pixel">85점</div>
                          <div className="text-gray-600 font-korean-pixel">평균 점수</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 font-korean-pixel">12회</div>
                          <div className="text-gray-600 font-korean-pixel">총 응시 횟수</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 font-korean-pixel">3일</div>
                          <div className="text-gray-600 font-korean-pixel">연속 학습</div>
                        </div>
                      </div>
                    </div>
                    {/* 취약 분야 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">집중 학습이 필요한 분야</h4>
                      <div className="space-y-3">
                        <div className="flex items-center bg-red-50 p-3 rounded-lg">
                          <span className="text-red-500 font-bold font-korean-pixel mr-2">1</span>
                          <span className="font-korean-pixel">투자 위험 관리</span>
                        </div>
                        <div className="flex items-center bg-orange-50 p-3 rounded-lg">
                          <span className="text-orange-500 font-bold font-korean-pixel mr-2">2</span>
                          <span className="font-korean-pixel">세금 계산</span>
                        </div>
                        <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
                          <span className="text-yellow-600 font-bold font-korean-pixel mr-2">3</span>
                          <span className="font-korean-pixel">금융 상품 이해</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
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

      {showNicknameModal && <NicknameChangeModal onClose={() => setShowNicknameModal(false)} currentNickname={user.nickname} onUpdateNickname={handleUpdateNickname} />}
      {showAccountLinkModal && <AccountLinkModal onClose={() => setShowAccountLinkModal(false)} onLinkAccount={handleAccountLink} />}
    </Background>
  );
};

export default MainPage;
