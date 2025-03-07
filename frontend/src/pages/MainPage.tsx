import Background from "../components/layout/Background";
import { useState } from "react";
import ModeCard from "../components/ModeCard";
// 모드 이미지 import
import botImg from "../assets/Bot.png";
import oneVsOneImg from "../assets/one_vs_one.png";
import multiImg from "../assets/multi.png";
import { useNavigate } from "react-router-dom";

// 게임 모드 타입 정의
type GameMode = "Bot" | "oneVsOne" | "Survival" | null;

const MainPage = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const navigate = useNavigate();

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    
    // 선택한 모드에 따른 페이지 이동 처리
    if (mode === "oneVsOne") {
      navigate("/one-to-one");
    } else if (mode === "Bot") {
      // AI 모드 페이지로 이동 (구현 필요)
      console.log("AI 모드 선택");
    } else if (mode === "Survival") {
      // 멀티 모드 페이지로 이동 (구현 필요)
      console.log("멀티 모드 선택");
    }
    console.log(`선택한 모드: ${mode}`);
    navigate(`/game/${mode}`);
  };

  // 모드 데이터 정의
  const modeData = [
    {
      id: "Bot",
      title: "Bot",
      description: "인공지능이랑 맞짱 뒤지게 까셈 ㅋㅋㅋ",
      imageSrc: botImg,
    },
    {
      id: "oneVsOne",
      title: "PVP",
      description: "마 좀 치나 한 다이 할래?",
      imageSrc: oneVsOneImg,
    },
    {
      id: "Survival",
      title: "Survival",
      description: "이새기 ㅈ밥이네 ㅋㅋ",
      imageSrc: multiImg,
    },
  ];

  return (
    <Background>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg">MODE</h1>

          {/* 모드 선택 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {modeData.map((mode) => (
              <ModeCard
                key={mode.id}
                title={mode.title}
                description={mode.description}
                imageSrc={mode.imageSrc}
                isSelected={selectedMode === (mode.id as GameMode)}
                onClick={() => handleModeSelect(mode.id as GameMode)}
              />
            ))}
          </div>
        </div>
      </div>
    </Background>
  );
};

export default MainPage;
