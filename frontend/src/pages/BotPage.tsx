import React, { useState, useEffect, useCallback, useRef } from "react";
import Background from "../components/layout/Background";
import BotBg from "../assets/bot_bg.gif";
import { useNavigate } from "react-router-dom";
import Carousel, { CarouselItem } from "../components/carousel/Carousel";
import DifficultySelector, { Difficulty } from "../components/difficulty/DifficultySelector";

// 주제 이미지 import
import financeImg from "../assets/topics/finance.svg";
import investmentImg from "../assets/topics/investment.svg";
import { CustomAlert } from "../components/layout/CustomAlert";

const BotPage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<CarouselItem | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [mounted, setMounted] = useState(true);
  const isMounted = useRef(true);

  // 주제 데이터
  const topicItems: CarouselItem[] = [
    {
      id: "finance",
      title: "금융기관 및 상품",
      description: "투자 전 올바른 학습은 필수! FinCatch와 함께 해요!",
      image: financeImg,
    },
    {
      id: "investment",
      title: "투자",
      description: "투자의 전문가가 되는 길! FinCatch에서 함께 해보세요!",
      image: investmentImg,
    },
    {
      id: "policy",
      title: "금융정책",
      description: "금융정책을 통한 투자 전략 수립! FinCatch에서 함께 해보세요!",
      image: investmentImg,
    },
    {
      id: "crime",
      title: "금융범죄",
      description: "금융범죄 방지를 위한 투자 전략! FinCatch에서 함께 해보세요!",
      image: investmentImg,
    },
  ];

  // 로그인 상태 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 컴포넌트 마운트/언마운트 관리
  useEffect(() => {
    isMounted.current = true;
    setMounted(true);

    // beforePageChange 이벤트 리스너 등록
    const handleBeforePageChange = () => {
      isMounted.current = false;
      setMounted(false);
      setSelectedTopic(null);
      setSelectedDifficulty(null);
      setGameReady(false);
    };

    window.addEventListener("beforePageChange", handleBeforePageChange);

    return () => {
      isMounted.current = false;
      setMounted(false);
      // 컴포넌트 언마운트 시 상태 초기화
      setSelectedTopic(null);
      setSelectedDifficulty(null);
      setGameReady(false);

      // 이벤트 리스너 제거
      window.removeEventListener("beforePageChange", handleBeforePageChange);
    };
  }, []);

  // 주제나 난이도가 변경될 때마다 게임 준비 상태 확인
  useEffect(() => {
    if (selectedTopic && selectedDifficulty) {
      setGameReady(true);
    } else {
      setGameReady(false);
    }
  }, [selectedTopic, selectedDifficulty]);

  const handleTopicSelect = useCallback((topic: CarouselItem) => {
    if (isMounted.current) {
      setSelectedTopic(topic);
    }
  }, []);

  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    if (isMounted.current) {
      setSelectedDifficulty(difficulty);
    }
  }, []);

  const handleStartGame = () => {
    if (gameReady && isMounted.current) {
      // 게임 시작 로직 - 선택된 주제와 난이도를 이용해 게임 시작
      console.log(`게임 시작: 주제 - ${selectedTopic?.title}, 난이도 - ${selectedDifficulty}`);
      // 여기에 게임 시작 페이지로 이동하는 로직 추가
      // navigate(`/bot/game?topic=${selectedTopic?.id}&difficulty=${selectedDifficulty}`);

      // 임시로 알림만 표시
      CustomAlert({ message: `게임 시작: 주제 - ${selectedTopic?.title}, 난이도 - ${selectedDifficulty}`, onClose: () => {} });
    }
  };

  const handleBack = () => {
    // 페이지 이동 전에 마운트 상태 변경
    setMounted(false);
    isMounted.current = false;

    // 상태 초기화
    setSelectedTopic(null);
    setSelectedDifficulty(null);
    setGameReady(false);

    // 페이지 이동
    navigate("/main", { replace: true });
  };

  // 마운트 상태가 아니면 렌더링하지 않음
  if (!mounted) return null;

  return (
    <Background backgroundImage={BotBg}>
      <div className="flex flex-col items-center justify-center h-full w-full relative z-10 pt-16">
        <div className="p-8 rounded-lg text-white w-full max-w-6xl">
          {/* 헤더 */}

          {/* 주제 선택 섹션 */}
          <div className="mb-12 flex flex-col items-center">
            <div className="w-full flex justify-center">{mounted && <Carousel items={topicItems} onSelect={handleTopicSelect} />}</div>
          </div>

          {/* 난이도 선택 섹션 */}
          <div className="mb-8">
            <h2 className="text-center mb-4 font-medium font-korean-pixel">난이도 선택</h2>
            {mounted && <DifficultySelector selectedDifficulty={selectedDifficulty} onSelectDifficulty={handleDifficultySelect} />}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-center mt-12">
            <button onClick={handleBack} className="bg-gray-600 text-white px-8 py-2 rounded-md mr-4 font-korean-pixel">
              모드 선택으로 돌아가기
            </button>

            <button
              onClick={handleStartGame}
              className={`px-8 py-2 rounded-md ${gameReady ? "bg-[#3490dc] text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"} font-korean-pixel`}
              disabled={!gameReady}
            >
              게임 시작하기
            </button>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default BotPage;
