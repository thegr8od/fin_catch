import React, { useState, useEffect } from "react";
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
  const { chatMessages, quizOptions } = useGame();

  // 디버깅용 로그 추가
  useEffect(() => {
    console.log("BattleScreen - 타이머 변경:", timer);
    console.log("BattleScreen - 문제 변경:", questionText);
  }, [timer, questionText]);

  // 퀴즈 옵션 변경 감지
  useEffect(() => {
    console.log("BattleScreen - 퀴즈 옵션 변경:", quizOptions);
  }, [quizOptions]);

  // 문제와 타이머 상태 로그 - 컴포넌트 렌더링마다
  console.log("BattleScreen render - 문제:", questionText);
  console.log("BattleScreen render - 타이머:", timer);
  console.log("BattleStatus props:", { timer, question: questionText });

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

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* 상단 VS 및 문제 영역 */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="w-3/4 max-w-3xl mx-auto">
          <BattleStatus timer={timer} question={questionText || "문제 로딩 중..."} />
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
