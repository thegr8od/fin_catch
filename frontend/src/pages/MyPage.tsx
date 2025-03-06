import React, { useState } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
import coinIcon from "../assets/coin.png";
import catProfile from "../assets/smoke_cat.png";
import financeCat from "../assets/finance_cat.png";
import productCat from "../assets/product_cat.png";
import policyCat from "../assets/policy_cat.png";
import crimeCat from "../assets/crime_cat.png";

// 타입 정의
interface Problem {
  id: number;
  title: string;
  correctRate?: number;
  keywords?: string[];
}

interface ProblemDetail {
  id: number;
  title: string;
  correctRate: number;
  keywords?: string[];
}

interface WrongAnswers {
  [category: string]: Problem[];
}

const MyPage = () => {
  // 상태 관리
  const [showWrongAnswerNote, setShowWrongAnswerNote] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null);

  // 임시 데이터
  const userData = {
    nickname: "김냥냥",
    level: 7,
    exp: 3250,
    maxExp: 5000,
    coins: 155000,
    recentActivities: [
      { id: 1, title: "퀴즈 게임에서 승리했습니다. 코인을 획득했습니다.", date: "2023-03-05" },
      { id: 2, title: "새로운 아이템을 구매했습니다. 코인이 차감되었습니다.", date: "2023-03-04" },
      { id: 3, title: "일일 출석 체크를 완료했습니다. 코인을 획득했습니다.", date: "2023-03-03" },
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
        { id: 2, title: "문제 1번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 1번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 4, title: "문제 1번", correctRate: 45, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 5, title: "문제 1번", correctRate: 38, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 6, title: "문제 1번", correctRate: 25, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 7, title: "문제 1번", correctRate: 18, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 8, title: "문제 1번", correctRate: 10, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      투자: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 1번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 1번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 4, title: "문제 1번", correctRate: 45, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      상품: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 1번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
      정책: [
        { id: 1, title: "문제 1번", correctRate: 72, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 2, title: "문제 1번", correctRate: 65, keywords: ["FT", "분석", "내용", "어쩌구"] },
        { id: 3, title: "문제 1번", correctRate: 58, keywords: ["FT", "분석", "내용", "어쩌구"] },
      ],
    } as WrongAnswers,
  };

  // 경험치 퍼센트 계산
  const expPercentage = (userData.exp / userData.maxExp) * 100;

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedProblem(null);
  };

  // 카테고리 선택 취소 핸들러
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedProblem(null);
  };

  // 문제 선택 핸들러
  const handleProblemSelect = (problem: any) => {
    setSelectedProblem(problem);
  };

  // 문제 선택 취소 핸들러
  const handleBackToProblems = () => {
    setSelectedProblem(null);
  };

  // 오답노트 렌더링
  const renderWrongAnswerNote = () => {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowWrongAnswerNote(false)}>
        <div
          className="bg-gradient-to-b from-[#e8f3f7] to-[#f0f8ff] rounded-2xl shadow-2xl w-[900px] p-8 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 이벤트 전파 방지
        >
          {/* 제목 부분 */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#ffcad4] to-[#ffd1dc] py-4 rounded-t-2xl text-center shadow-md">
            <h2 className="text-xl font-bold text-gray-800">{selectedProblem ? `${selectedCategory} - ${selectedProblem.title}` : selectedCategory ? selectedCategory : "오답 노트"}</h2>
          </div>

          {/* 내용 부분 */}
          <div className="mt-16 mb-16">
            {selectedProblem ? (
              // 선택된 문제 상세 정보
              <div className="px-4">
                <div className="flex mb-8">
                  {/* 왼쪽 - 고양이 이미지와 메시지 */}
                  <div className="w-1/3 pr-6">
                    <div className="flex items-start mb-4">
                      <img src={catProfile} alt="고양이" className="w-12 h-12 mr-3" />
                      <p className="text-sm text-gray-700">냥냥이가 오답을 분석했다냥</p>
                    </div>

                    {/* 정답률 파이 차트 */}
                    <div className="relative w-48 h-48 mx-auto">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#FFD700"
                            strokeWidth="20"
                            strokeDasharray={`${selectedProblem.correctRate * 2.51} 251`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-lg font-bold">정답률 {selectedProblem.correctRate}%</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 text-center">이 문제의 평균 정답률이다냥</p>
                  </div>

                  {/* 오른쪽 - 문제 상세 정보 */}
                  <div className="w-2/3 bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-bold mb-4">문제의 핵심 포인트다냥</h3>

                    <div className="mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">키워드 : FT 분석 내용 어쩌구</p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <p className="text-sm text-gray-500">이 문제의 핵심은 금융 용어를 정확히 이해하는 것이다냥!</p>
                    </div>
                  </div>
                </div>

                {/* 뒤로 가기 버튼 */}
                <div className="mt-8 flex justify-start">
                  <button
                    className="bg-white text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-md flex items-center border border-gray-200"
                    onClick={handleBackToProblems}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    뒤로 가기
                  </button>
                </div>
              </div>
            ) : selectedCategory ? (
              // 선택된 카테고리의 문제 목록
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {selectedCategory &&
                    userData.wrongAnswers[selectedCategory]?.map((problem: any) => (
                      <button
                        key={problem.id}
                        className="bg-white py-4 px-5 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 text-center border border-gray-100"
                        onClick={() => handleProblemSelect(problem)}
                      >
                        {problem.title}
                      </button>
                    ))}
                </div>

                {/* 뒤로 가기 버튼 */}
                <div className="mt-8 flex justify-start">
                  <button
                    className="bg-white text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-md flex items-center border border-gray-200"
                    onClick={handleBackToCategories}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    뒤로 가기
                  </button>
                </div>
              </div>
            ) : (
              // 카테고리 선택 화면
              <div className="grid grid-cols-2 gap-8">
                {userData.categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="h-52 rounded-t-xl overflow-hidden">
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                    <div className="flex justify-center py-4">
                      <button
                        className="bg-white text-gray-700 px-8 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                        onClick={() => handleCategorySelect(category.name)}
                      >
                        {category.name}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 닫기 버튼 */}
          <div className="absolute bottom-6 right-6">
            <button
              className="bg-white text-gray-700 px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-md border border-gray-200"
              onClick={() => {
                setShowWrongAnswerNote(false);
                setSelectedCategory(null);
                setSelectedProblem(null);
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-white/95 rounded-2xl shadow-2xl w-[1100px] p-8">
          {/* 상단 프로필 섹션 */}
          <div className="flex mb-8">
            {/* 왼쪽 - 프로필 이미지 및 기본 정보 */}
            <div className="flex flex-col items-center mr-10">
              <div className="w-36 h-36 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl overflow-hidden mb-3 border-2 border-amber-300 shadow-lg">
                <img src={catProfile} alt="프로필 이미지" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
              <button className="bg-white text-gray-700 px-4 py-1.5 rounded-full text-sm mb-2 hover:shadow-md transition-all duration-200 border border-gray-200">캐릭터 선택</button>
            </div>

            {/* 중앙 - 사용자 정보 */}
            <div className="flex-1 mr-10">
              {/* 코인 정보 */}
              <div className="flex items-center mb-5">
                <img src={coinIcon} alt="코인" className="w-7 h-7 mr-2" />
                <span className="text-amber-500 font-bold text-xl">보유 코인 {userData.coins.toLocaleString()}</span>
                <button className="ml-4 bg-white text-amber-700 px-4 py-1.5 rounded-full text-xs hover:shadow-md transition-all duration-200 border border-amber-200">소비 패턴 보러 가기</button>
              </div>

              {/* 연결된 계좌가 없다는 메시지 */}
              <div className="mb-5 text-gray-500 text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">연결된 계좌가 없다냥 ㅠㅠ</div>

              {/* 닉네임 및 레벨 */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-gray-800">{userData.nickname}</h2>
                <div className="flex items-center mt-1">
                  <span className="bg-white text-amber-700 px-3 py-1 rounded-lg text-sm mr-3 font-semibold shadow-sm border border-amber-200">Lv. {userData.level}</span>
                  <span className="text-gray-500 text-sm">
                    EXP: {userData.exp} / {userData.maxExp}
                  </span>
                </div>
              </div>

              {/* 경험치 바 */}
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-700 ease-in-out" style={{ width: `${expPercentage}%` }}></div>
              </div>
            </div>

            {/* 오른쪽 - 오늘의 금융 뉴스 */}
            <div className="w-[350px]">
              <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                오늘의 금융 뉴스
              </h3>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 max-h-[220px] overflow-y-auto">
                <ul className="space-y-3">
                  {userData.newsItems.map((news) => (
                    <li key={news.id} className="flex border-b border-gray-100 pb-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg p-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                        <img
                          src={`https://via.placeholder.com/64x64?text=News${news.id}`}
                          alt={`뉴스 ${news.id}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-xs mb-1 text-gray-800">{news.title}</h4>
                        <p className="text-xs text-gray-500 mb-1 line-clamp-1">{news.content}</p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {news.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 하단 섹션 - AI 배틀 현황 및 PVP 전적 */}
          <div className="grid grid-cols-3 gap-8">
            {/* AI 배틀 현황 */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI 배틀 현황
              </h3>
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-5 shadow-lg border border-gray-100 h-64 flex flex-col">
                <div className="flex-1 flex items-end justify-around">
                  <div className="flex flex-col items-center">
                    <div className="w-14 bg-gradient-to-t from-pink-200 to-pink-300 rounded-t-lg shadow-md" style={{ height: "30%" }}></div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">투자</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 bg-gradient-to-t from-yellow-300 to-yellow-400 rounded-t-lg shadow-md" style={{ height: "60%" }}></div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">상품</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 bg-gradient-to-t from-green-200 to-green-300 rounded-t-lg shadow-md" style={{ height: "25%" }}></div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">정책</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-14 bg-gradient-to-t from-purple-200 to-purple-300 rounded-t-lg shadow-md" style={{ height: "80%" }}></div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">법칙</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PVP 전적 */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                PVP 전적
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex justify-between items-center hover:shadow-xl transition-shadow duration-300">
                  <span className="font-medium text-gray-800">1:1 대전</span>
                  <span className="bg-white px-5 py-2 rounded-lg text-gray-700 font-medium border border-gray-200">
                    <span className="text-green-600 font-korean-pixel">{userData.pvpStats.wins}승</span> <span className="text-red-500 font-korean-pixel">{userData.pvpStats.losses}패</span>
                  </span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex justify-between items-center hover:shadow-xl transition-shadow duration-300">
                  <span className="font-medium font-korean-pixel text-gray-800">다인 대전</span>
                  <span className="bg-white px-5 py-2 rounded-lg text-gray-700 font-medium border border-gray-200">
                    <span className="text-green-600">{userData.soloStats.wins}승</span> <span className="text-red-500">{userData.soloStats.losses}패</span>
                  </span>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex justify-center items-center hover:shadow-xl transition-shadow duration-300">
                  <button
                    className="w-full font-korean-pixel text-center font-medium text-gray-700 hover:text-amber-600 transition-colors duration-200 py-1 flex items-center justify-center"
                    onClick={() => setShowWrongAnswerNote(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    오답 노트
                  </button>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center font-korean-pixel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                최근 활동
              </h3>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 h-64 overflow-y-auto">
                <ul className="space-y-3">
                  {userData.recentActivities.map((activity) => (
                    <li key={activity.id} className="border-b border-gray-200 pb-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg p-2">
                      <p className="text-sm text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {activity.date}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-end">
                  <button className="text-xs text-amber-500 hover:text-amber-600 transition-colors duration-200 flex items-center">
                    더 보기
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-end space-x-4">
            <button className="bg-white text-gray-700 font-korean-pixel px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-md flex items-center border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
            <button className="bg-white text-amber-600 font-korean-pixel px-5 py-2.5 rounded-lg hover:bg-amber-50 transition-colors duration-200 shadow-md flex items-center border border-amber-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              정보 수정
            </button>
          </div>
        </div>
      </div>

      {/* 오답 노트 모달 */}
      {showWrongAnswerNote && renderWrongAnswerNote()}
    </Background>
  );
};

export default MyPage;
