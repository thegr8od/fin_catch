import React from "react";
import { useGame } from "../../contexts/GameContext";

// 객관식 선택지 UI 컴포넌트 (클릭 액션 없음)
const QuizOptions = () => {
  const { quizOptions } = useGame();

  console.log("QuizOptions 렌더링 - 선택지 데이터:", quizOptions);

  if (!quizOptions || quizOptions.length === 0) {
    console.log("QuizOptions: 선택지 없음 - null 반환");
    return null;
  }

  return (
    <div className="bg-white bg-opacity-80 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-1 gap-2">
        {quizOptions.map((option) => {
          console.log("QuizOptions - 옵션 렌더링:", option);
          return (
            <div key={option.quizOptionId} className="bg-blue-100 p-2 rounded-md border border-blue-300">
              <span className="font-bold">{option.optionNumber}. </span>
              {option.optionText}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizOptions;
