import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import battleBackground from "/assets/battlebg.png";
import BattleScreen from "../components/game/BattleScreen";
import { useGameResources } from "../hooks/useGameResources";
import { usePreventNavigation } from "../hooks/usePreventNavigation";
import GameLayout from "../components/layout/GameLayout";
import { GameProvider, useGame, GameMember } from "../contexts/GameContext";

// 게임 화면을 렌더링하는 컴포넌트
const GameContent: React.FC = () => {
  const { gameState, playerStatus, opponentStatus, handleAnimationComplete, handleAnswerSubmit, loading } = useGame();

  const { resourcesLoaded } = useGameResources([playerStatus.characterType, opponentStatus.characterType]);

  // 디버깅 - 게임 상태 로깅
  useEffect(() => {
    console.log("GameContent - 게임 상태:", gameState);
    console.log("GameContent - 리소스 로딩:", resourcesLoaded);
    console.log("GameContent - 로딩 상태:", loading);
    console.log("GameContent - 현재 문제:", gameState.currentQuestion);
    console.log("GameContent - 타이머:", gameState.remainingTime);
  }, [gameState, resourcesLoaded, loading]);

  // 백엔드 타이밍 이슈를 위한 안전장치 - 5초 후에도 여전히 로딩 중이면 강제로 진행
  useEffect(() => {
    if (loading && resourcesLoaded) {
      const timer = setTimeout(() => {
        console.log("GameContent - 5초 타임아웃: 로딩 지연으로 강제 진행");

        // BattleScreen 컴포넌트로 강제 진행
        const battleScreen = document.createElement("div");
        battleScreen.id = "battlescreen-forced";
        document.getElementById("game-content-wrapper")?.appendChild(battleScreen);

        // 콘솔에 강제 진행 메시지 출력
        console.log("강제 진행: 백엔드에서 START 이벤트가 오지 않아 타임아웃으로 진행합니다");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loading, resourcesLoaded]);

  usePreventNavigation({
    roomId: gameState.roomId || null,
    gameType: "1vs1",
  });

  // 리소스 또는 게임 상태 로딩 중인 경우 로딩 화면 표시
  if (loading || !resourcesLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-3xl text-white font-bold">{!resourcesLoaded ? "캐릭터 리소스 로딩 중..." : "게임 초기화 중..."}</div>
      </div>
    );
  }

  // 배틀스크린에 전달되는 props 디버깅
  console.log("BattleScreen props:", {
    timer: gameState.remainingTime,
    questionText: gameState.currentQuestion,
    playerStatus,
    opponentStatus,
  });

  return (
    <BattleScreen
      resourcesLoaded={resourcesLoaded}
      playerStatus={playerStatus}
      opponentStatus={opponentStatus}
      timer={gameState.remainingTime}
      questionText={gameState.currentQuestion}
      onPlayerAnimationComplete={(state) => handleAnimationComplete(playerStatus.id, state)}
      onOpponentAnimationComplete={(state) => handleAnimationComplete(opponentStatus.id, state)}
      onAnswerSubmit={handleAnswerSubmit}
    />
  );
};

// 메인 페이지 컴포넌트
const OneToOnePage: React.FC = () => {
  const { roomId: urlRoomId, category } = useParams<{ roomId: string; category: string }>();
  const location = useLocation();

  // RoomPreparePage에서 전달된 정보
  const players = (location.state?.players as GameMember[]) || [];

  // URL 파라미터와 상태에서 roomId 가져오기
  const roomId = urlRoomId || location.state?.roomId?.toString() || "";

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log("OneToOnePage 마운트 - 게임 화면 렌더링");
    console.log("게임 시작 - 플레이어 정보:", players);
    console.log("게임 시작 - 룸 ID:", roomId, "타입:", typeof roomId, "카테고리:", category);

    return () => {
      console.log("OneToOnePage 언마운트 - 게임 화면 정리");
    };
  }, [roomId, category, players]);

  // roomId가 없으면 에러 메시지 표시
  if (!roomId) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-3xl text-white font-bold">
          유효하지 않은 방 ID입니다.
          <div className="mt-4">
            <button className="px-4 py-2 bg-blue-600 rounded-md text-xl" onClick={() => window.history.back()}>
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameProvider roomId={roomId} players={players}>
      <GameLayout background={battleBackground}>
        <div className="w-full h-full" id="game-content-wrapper">
          <GameContent />
        </div>
      </GameLayout>
    </GameProvider>
  );
};

export default OneToOnePage;
