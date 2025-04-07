import React from "react";
import { useGame } from "../../contexts/GameContext";

// 힌트 표시용 컴포넌트
const HintDisplay = () => {
  const { firstHint, secondHint } = useGame();

  console.log("HintDisplay 렌더링 - 힌트:", { firstHint, secondHint });

  if (!firstHint && !secondHint) {
    console.log("HintDisplay: 힌트 없음 - null 반환");
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

export default HintDisplay;
