import React, { useState } from "react";
import PlayerSection from "./PlayerSection";
import BattleStatus from "./BattleStatus";
import ChatSection from "./ChatSection";
import { useGame } from "../../contexts/GameContext";
import { CharacterState } from "./types/character";

// 객관식 선택지 UI 컴포넌트 (클릭 액션 없음)
const QuizOptions = () => {
  const { quizOptions } = useGame();

  if (!quizOptions || quizOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white bg-opacity-80 rounded-lg p-3 mb-4">
      <div className="text-center text-blue-800 font-bold mb-2">※ 채팅창에 번호만 입력하세요 (예: 1, 2, 3, 4)</div>
      <div className="grid grid-cols-1 gap-2">
        {quizOptions.map((option) => (
          <div key={option.quizOptionId} className="bg-blue-100 p-2 rounded-md border border-blue-300">
            <span className="font-bold">{option.optionNumber}. </span>
            {option.optionText}
          </div>
        ))}
      </div>
    </div>
  );
};

const HintDisplay = () => {
  const { firstHint, secondHint } = useGame();

  if (!firstHint && !secondHint) {
    return null;
  }

  return (
    <div className="bg-yellow-100 bg-opacity-90 rounded-lg p-3 mb-4 border-2 border-yellow-400">
      <div className="font-bold text-center mb-1">힌트</div>
      {firstHint && (
        <div className="mb-1">
          <span className="font-semibold">힌트 1: </span>
          {firstHint.hint}
        </div>
      )}
      {secondHint && (
        <div>
          <span className="font-semibold">힌트 2: </span>
          {secondHint.hint}
        </div>
      )}
    </div>
  );
};

const BattleScreen = () => {
  const [chatInput, setChatInput] = useState("");
  const { playerStatus, opponentStatus, chatMessages, sendChatMessage, handleAnswerSubmit, handleAnimationComplete, gameState, quizOptions } = useGame();

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;

    // 채팅 메시지 전송
    sendChatMessage(chatInput, playerStatus.name || "나");

    // 정답 체크 수행
    handleAnswerSubmit(chatInput);

    // 입력창 초기화
    setChatInput("");
  };

  const playerShouldLoop = playerStatus.state === "idle" || playerStatus.state === "victory";
  const opponentShouldLoop = opponentStatus.state === "idle" || opponentStatus.state === "victory";

  // 플레이어 애니메이션 완료 처리
  const onPlayerAnimationComplete = (state: CharacterState) => {
    if (playerStatus.id) {
      handleAnimationComplete(playerStatus.id, state);
    }
  };

  // 상대방 애니메이션 완료 처리
  const onOpponentAnimationComplete = (state: CharacterState) => {
    if (opponentStatus.id) {
      handleAnimationComplete(opponentStatus.id, state);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 상단 VS 및 문제 영역 */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="w-3/4 max-w-3xl mx-auto">
          <BattleStatus timer={gameState.remainingTime} question={gameState.currentQuestion} />
          <HintDisplay />
          {/* 객관식 선택지 UI 표시 (클릭 불가) */}
          <QuizOptions />
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
        <ChatSection chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} handleSubmit={handleSubmit} showInput={true} showMessages={true} />
      </div>
    </div>
  );
};

BattleScreen.displayName = "BattleScreen";

export default BattleScreen;
