import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerSection from "./PlayerSection";
import BattleStatus from "./BattleStatus";
import ChatSection from "./ChatSection";
import QuizOptions from "./QuizOptions";
import HintDisplay from "./HintDisplay";
import { useGame } from "../../contexts/GameContext";
import { CharacterState, PlayerStatus } from "./types/character";

// BattleScreen 컴포넌트의 props 타입 정의
interface BattleScreenProps {
  resourcesLoaded: boolean;
  playerStatus: PlayerStatus;
  opponentStatus: PlayerStatus;
  timer: number;
  questionText: string;
  onPlayerAnimationComplete: (state: CharacterState) => void;
  onOpponentAnimationComplete: (state: CharacterState) => void;
  onAnswerSubmit: (message: string) => boolean;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerStatus, opponentStatus, timer, questionText, onPlayerAnimationComplete, onOpponentAnimationComplete, onAnswerSubmit }) => {
  const [chatInput, setChatInput] = useState("");
  const { chatMessages, gameState, quizType } = useGame();
  const navigate = useNavigate();

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;

    console.log("BattleScreen - 답변 제출:", chatInput);
    // 수정된 코드: 정답 체크만 수행 (handleAnswerSubmit이 서버로 메시지도 전송함)
    onAnswerSubmit(chatInput);

    // 입력창 초기화
    setChatInput("");
  };

  const playerShouldLoop = playerStatus.state === "idle" || playerStatus.state === "victory";
  const opponentShouldLoop = opponentStatus.state === "idle" || opponentStatus.state === "victory";

  // 게임 결과 메시지 생성
  const getGameResultMessage = () => {
    if (playerStatus.state === "dead" && opponentStatus.state === "dead") {
      return "비겼습니다.";
    } else if (playerStatus.state === "dead") {
      return "패배했습니다...";
    } else if (playerStatus.state === "victory") {
      return "승리했습니다!";
    }
    return "비겼습니다.";
  };

  // 획득한 코인 수량 계산
  const getEarnedCoins = () => {
    if (playerStatus.state === "victory") {
      return 300; // 승리 시 300 코인
    } else {
      return 100; // 패배 또는 비김 시 100 코인
    }
  };

  const isGameFinished = gameState.gameStatus === "finished";
  console.log("게임 종료 여부:", isGameFinished, "결과 메시지:", getGameResultMessage());

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 상단 VS 및 문제 영역 */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="w-3/4 max-w-3xl mx-auto">
          {!isGameFinished ? (
            <>
              <BattleStatus timer={timer} question={questionText || "문제 로딩 중..."} quizType={quizType} />
              <HintDisplay />
              <QuizOptions />
            </>
          ) : (
            <div className="bg-white bg-opacity-90 rounded-lg p-6 text-center shadow-2xl border-4 border-yellow-500">
              <h2 className="text-3xl font-bold mb-4 text-blue-800">게임 결과</h2>
              <div className="text-2xl font-bold mb-2">{getGameResultMessage()}</div>
              <div className="mt-4 flex justify-around">
                <div className="text-center">
                  <div className="font-semibold">{playerStatus.name}</div>
                  <div className="text-xl">{playerStatus.state === "victory" ? "🏆" : playerStatus.state === "dead" ? "💀" : "🤝"}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{opponentStatus.name}</div>
                  <div className="text-xl">{opponentStatus.state === "victory" ? "🏆" : opponentStatus.state === "dead" ? "💀" : "🤝"}</div>
                </div>
              </div>
              <div className="mt-4 mb-4 flex items-center justify-center">
                <img src="/assets/coin.png" alt="코인" className="w-8 h-8 mr-2" />
                <span className="text-xl font-bold text-yellow-600">× {getEarnedCoins()} 획득!</span>
              </div>
              <div className="mt-6">
                <button onClick={() => navigate("/main")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300">
                  메인으로 가기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 중앙 플레이어 영역 */}
      <div className="flex-1 w-full flex justify-between items-center px-8 pt-20">
        {/* 왼쪽 플레이어 */}
        <div className="w-1/3">
          <PlayerSection
            characterType={playerStatus.characterType}
            characterState={playerStatus.state}
            name={playerStatus.name}
            health={playerStatus.health}
            maxHealth={5}
            bubble={null}
            direction={true}
            onAnimationComplete={onPlayerAnimationComplete}
            shouldLoop={playerShouldLoop}
          />
        </div>

        {/* 오른쪽 플레이어 */}
        <div className="w-1/3">
          <PlayerSection
            characterType={opponentStatus.characterType}
            characterState={opponentStatus.state}
            name={opponentStatus.name}
            health={opponentStatus.health}
            maxHealth={5}
            bubble={null}
            direction={false}
            onAnimationComplete={onOpponentAnimationComplete}
            shouldLoop={opponentShouldLoop}
          />
        </div>
      </div>

      {/* 채팅 영역 - 중앙 하단에 배치 */}
      <div id="battle-chat-container" className="fixed left-1/2 transform -translate-x-1/2 bottom-4 z-30" style={{ width: "33%" }}>
        <ChatSection chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} handleSubmit={handleSubmit} showInput={!isGameFinished} showMessages={true} />
      </div>
    </div>
  );
};

BattleScreen.displayName = "BattleScreen";

export default BattleScreen;
