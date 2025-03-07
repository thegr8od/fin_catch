import React, { useState, useEffect } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import catProfile from "../assets/characters/smoke_cat.png";
import financeCat from "../assets/finance_cat.png";
import productCat from "../assets/product_cat.png";
import policyCat from "../assets/policy_cat.png";
import crimeCat from "../assets/crime_cat.png";

// 컴포넌트 임포트
import ProfileSection from "../components/mypage/ProfileSection";
import NewsSection from "../components/mypage/NewsSection";
import StatsSection from "../components/mypage/StatsSection";
import BattleStatsSection from "../components/mypage/BattleStatsSection";
import RecentActivitiesSection from "../components/mypage/RecentActivitiesSection";
import WrongAnswerNoteModal from "../components/mypage/WrongAnswerNoteModal";
import AccountLinkModal from "../components/mypage/AccountLinkModal";
import AccountAnalysisModal from "../components/mypage/AccountAnalysisModal";
import { AccountInfo } from "../components/mypage/AccountLinkModal";

// 타입 정의
interface Problem {
  id: number;
  title: string;
  correctRate?: number;
  keywords?: string[];
}

interface WrongAnswers {
  [category: string]: Problem[];
}

// 로컬 스토리지에서 계좌 정보 가져오기
const getAccountInfoFromStorage = (): AccountInfo | null => {
  try {
    const savedAccountInfo = localStorage.getItem("accountInfo");
    if (savedAccountInfo) {
      const parsedInfo = JSON.parse(savedAccountInfo);
      console.log("로컬 스토리지에서 계좌 정보 로드:", parsedInfo);
      return parsedInfo;
    }
  } catch (error) {
    console.error("계좌 정보 파싱 오류:", error);
    localStorage.removeItem("accountInfo");
  }
  console.log("로컬 스토리지에 계좌 정보 없음");
  return null;
};

const MyPage = () => {
  // 상태 관리
  const [showWrongAnswerNote, setShowWrongAnswerNote] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showAccountAnalysisModal, setShowAccountAnalysisModal] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(() => {
    // 컴포넌트 초기화 시 로컬 스토리지에서 계좌 정보 로드
    return getAccountInfoFromStorage();
  });

  // 컴포넌트 마운트 시 계좌 연동 상태 확인
  useEffect(() => {
    // 계좌 정보가 없으면 3초 후 모달 표시
    if (!accountInfo) {
      const timer = setTimeout(() => {
        setShowAccountLinkModal(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  // 계좌 연동 처리
  const handleLinkAccount = (info: AccountInfo) => {
    console.log("계좌 연동 처리:", info);

    // 계좌 정보 상태 업데이트
    setAccountInfo(info);

    // 로컬 스토리지에 계좌 정보 저장
    try {
      localStorage.setItem("accountInfo", JSON.stringify(info));
      console.log("계좌 정보 로컬 스토리지에 저장 완료");
    } catch (error) {
      console.error("계좌 정보 저장 오류:", error);
    }

    // 모달 닫기
    setShowAccountLinkModal(false);
  };

  // 계좌 연동 해제 처리
  const handleUnlinkAccount = () => {
    // 계좌 정보 상태 초기화
    setAccountInfo(null);

    // 로컬 스토리지에서 계좌 정보 삭제
    try {
      localStorage.removeItem("accountInfo");
      console.log("계좌 정보 로컬 스토리지에서 삭제 완료");
    } catch (error) {
      console.error("계좌 정보 삭제 오류:", error);
    }
  };

  // 계좌 분석 모달 열기
  const handleOpenAccountAnalysis = () => {
    if (accountInfo) {
      setShowAccountAnalysisModal(true);
    }
  };

  // 임시 데이터
  const userData = {
    nickname: "김냥냥",
    level: 7,
    exp: 3250,
    maxExp: 5000,
    coins: 155000,
    profileImage: catProfile,
    recentActivities: [
      { id: 1, title: "퀴즈 게임에서 승리했습니다. 코인을 획득했습니다.", date: "2023-03-05" },
      { id: 2, title: "새로운 아이템을 구매했습니다. 코인이 차감되었습니다.", date: "2023-03-04" },
    ],
    pvpStats: {
      wins: 8,
      losses: 1,
    },
    soloStats: {
      wins: 5,
      losses: 2,
    },
    newsItems: [
      {
        id: 1,
        title: "홈플러스 CP 인수대회 1천940억원...투자자 손실 우려(종합)",
        content: "신세계그룹과 이마트가 2,000% 하락...기사내용 자세히 보기는 홈플러스가 인수...",
        time: "14시간전",
      },
      {
        id: 2,
        title: "삼성생명, 3년 더 유일한 이사회 의장 재임 이어진다",
        content: "삼성생명(032830)이 유일호 이사회 의장 재임 3년 더 이어가기로 결정...",
        time: "14시간전",
      },
      {
        id: 3,
        title: "신한, 연 최고 8% 금리 '올인원적금상품' 출시",
        content: "신한은행이 신한카드와 협력해 연 최고 8%의 금리를 제공하는 '올인원적금상품'...",
        time: "14시간전",
      },
    ],
    categories: [
      { id: 1, name: "투자", image: financeCat },
      { id: 2, name: "상품", image: productCat },
      { id: 3, name: "정책", image: policyCat },
      { id: 4, name: "범죄", image: crimeCat },
    ],
    wrongAnswers: {
      범죄: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 2번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 3번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 4, title: "문제 4번", correctRate: 45, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 5, title: "문제 5번", correctRate: 38, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 6, title: "문제 6번", correctRate: 25, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 7, title: "문제 7번", correctRate: 18, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 8, title: "문제 8번", correctRate: 10, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      투자: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 2번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 3번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 4, title: "문제 4번", correctRate: 45, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      상품: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 2번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      정책: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 2번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 3번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
    } as WrongAnswers,
  };

  // AI 배틀 현황 데이터
  const categoryStats = [
    { name: "투자", percentage: 30, color: "from-pink-200 to-pink-300" },
    { name: "상품", percentage: 60, color: "from-yellow-300 to-yellow-400" },
    { name: "정책", percentage: 25, color: "from-green-200 to-green-300" },
    { name: "범죄", percentage: 80, color: "from-purple-200 to-purple-300" },
  ];

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full max-w-[1800px] h-[900px] bg-white/95 rounded-2xl shadow-2xl p-8">
        {/* 전체 레이아웃을 가로로 변경 */}
        <div className="flex h-full gap-6">
          {/* 왼쪽 섹션 - 프로필 */}
          <div className="w-1/3 h-full flex flex-col gap-6">
            {/* 프로필 섹션 */}
            <div className="flex-grow">
              <ProfileSection userData={userData} />
            </div>

            {/* 계좌 정보 섹션 */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">연결된 계좌</h3>
                <div className="flex gap-2">
                  {accountInfo && (
                    <button className="px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-sm font-korean-pixel" onClick={handleUnlinkAccount}>
                      연동 해제
                    </button>
                  )}
                  <button
                    className={`${
                      accountInfo ? "text-sm text-primary hover:text-primary/80" : "px-3 py-1.5 rounded-full bg-gradient-to-r from-form-color to-button-color text-gray-700 hover:opacity-90 text-sm"
                    } font-korean-pixel`}
                    onClick={() => setShowAccountLinkModal(true)}
                  >
                    {accountInfo ? "변경하기" : "계좌 연동하기"}
                  </button>
                </div>
              </div>

              {accountInfo ? (
                <div className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg" onClick={handleOpenAccountAnalysis}>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium font-korean-pixel text-lg">{accountInfo.bankName}</p>
                      <p className="text-gray-500 font-korean-pixel">{accountInfo.accountNumber}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600 font-korean-pixel">잔액</p>
                      <p className="text-gray-800 font-bold font-korean-pixel text-xl">{formatNumber(accountInfo.balance)}원</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-primary text-sm font-korean-pixel">클릭하여 소비 분석 보기</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 font-korean-pixel text-lg">연결된 계좌가 없습니다</p>
                  <p className="text-gray-500 font-korean-pixel mt-1">계좌를 연동하여 서비스를 이용해보세요</p>
                </div>
              )}
            </div>
          </div>

          {/* 중앙 섹션 - 뉴스 및 최근 활동 */}
          <div className="w-1/3 border-l border-r border-gray-200 h-full flex flex-col gap-6 px-6">
            {/* 뉴스 섹션 */}
            <div className="flex-1">
              <NewsSection newsItems={userData.newsItems} />
            </div>

            {/* 최근 활동 */}
            <div className="flex-1">
              <RecentActivitiesSection activities={userData.recentActivities} />
            </div>
          </div>

          {/* 오른쪽 섹션 - AI 배틀 현황 및 PVP 전적 */}
          <div className="w-1/3 h-full flex flex-col gap-6">
            {/* AI 배틀 현황 */}
            <div className="flex-1">
              <BattleStatsSection categoryStats={categoryStats} />
            </div>

            {/* PVP 전적 */}
            <div className="flex-1">
              <StatsSection pvpStats={userData.pvpStats} soloStats={userData.soloStats} onOpenWrongAnswerNote={() => setShowWrongAnswerNote(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* 오답 노트 모달 */}
      {showWrongAnswerNote && <WrongAnswerNoteModal onClose={() => setShowWrongAnswerNote(false)} userData={userData} />}

      {/* 계좌 연동 모달 */}
      {showAccountLinkModal && <AccountLinkModal onClose={() => setShowAccountLinkModal(false)} onLinkAccount={handleLinkAccount} />}

      {/* 계좌 분석 모달 */}
      {showAccountAnalysisModal && accountInfo && <AccountAnalysisModal onClose={() => setShowAccountAnalysisModal(false)} accountInfo={accountInfo} />}
    </Background>
  );
};

export default MyPage;
