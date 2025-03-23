import React from "react";
import { useNavigate } from "react-router-dom";

interface QuizScore {
  average: number;
  totalAttempts: number;
  consecutiveDays: number;
}

interface WeakPoint {
  id: number;
  topic: string;
  level: "high" | "medium" | "low";
}

interface QuizResultSectionProps {
  scores: QuizScore;
  weakPoints: WeakPoint[];
}

const QuizResultSection: React.FC<QuizResultSectionProps> = ({ scores, weakPoints }) => {
  const navigate = useNavigate();

  const getLevelStyle = (level: WeakPoint["level"]) => {
    switch (level) {
      case "high":
        return "bg-red-50 text-red-500";
      case "medium":
        return "bg-orange-50 text-orange-500";
      case "low":
        return "bg-yellow-50 text-yellow-600";
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📝 AI 문제 풀이 결과</h3>
        <button
          onClick={() => navigate("/ai-quiz-lobby")}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
        >
          다시 풀기
        </button>
      </div>
      <div className="space-y-6">
        {/* 최근 퀴즈 결과 */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-korean-pixel text-lg font-bold mb-4">최근 퀴즈 성적</h4>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 font-korean-pixel">{scores.average}점</div>
              <div className="text-gray-600 font-korean-pixel">평균 점수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 font-korean-pixel">{scores.totalAttempts}회</div>
              <div className="text-gray-600 font-korean-pixel">총 응시 횟수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 font-korean-pixel">{scores.consecutiveDays}일</div>
              <div className="text-gray-600 font-korean-pixel">연속 학습</div>
            </div>
          </div>
        </div>
        {/* 취약 분야 */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-korean-pixel text-lg font-bold mb-4">집중 학습이 필요한 분야</h4>
          <div className="space-y-3">
            {weakPoints.map((point) => (
              <div key={point.id} className={`flex items-center p-3 rounded-lg ${getLevelStyle(point.level)}`}>
                <span className="font-bold font-korean-pixel mr-2">{point.id}</span>
                <span className="font-korean-pixel">{point.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultSection;
