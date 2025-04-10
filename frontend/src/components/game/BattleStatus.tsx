// components/game/BattleStatus.tsx
interface BattleStatusProps {
  timer: number;
  question: string;
  quizType?: string | null;
}

const BattleStatus = ({ timer, question, quizType }: BattleStatusProps) => {
  // 컴포넌트 렌더링시 props 로깅
  console.log("BattleStatus 컴포넌트 렌더링:", { timer, question, quizType });

  return (
    <div className="flex flex-col items-center justify-center px-4 w-full">
      <div className="flex items-center justify-center mb-4">
        <div className="text-4xl font-bold text-white mr-4" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
          VS
        </div>
        <div className={`text-4xl font-bold ${timer <= 10 ? "text-red" : "text-white"}`} style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
          {timer}
        </div>
      </div>
      <div className="w-full bg-white bg-opacity-80 rounded-lg p-4 mb-4">
        <div className="text-base font-medium mb-0 whitespace-pre-wrap break-words">{question || "문제를 불러오는 중..."}</div>

        {/* ESSAY 타입일 때 안내 메시지 표시 */}
        {quizType === "ESSAY" && <div className="mt-2 text-sm font-semibold text-blue-700 bg-blue-100 p-2 rounded">채팅은 점수로 변환됩니다</div>}
      </div>
    </div>
  );
};

export default BattleStatus;
