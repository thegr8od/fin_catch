import React from "react";
import { Link } from "react-router-dom";
import { WeakPoint } from "../../data/dummyData";
import { QuizScores } from "../../hooks/useQuizResult";

// 퀴즈 결과 인터페이스 정의
interface QuizResultProps {
  scores: QuizScores;
  weakPoints: WeakPoint[];
}

const QuizResultSection: React.FC<QuizResultProps> = ({ scores, weakPoints }) => {
  // 정답률 계산
  const correctRate = scores.totalProblems > 0 
    ? Math.round((scores.correctAnswers / scores.totalProblems) * 100) 
    : 0;
    
  // 데이터가 없는 경우 표시할 컴포넌트
  if (scores.totalProblems === 0) {
    return (
      <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🤖 AI 퀴즈 결과</h3>
          <Link
            to="/ai-quiz"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-korean-pixel text-sm hover:opacity-90 transition-all duration-300"
          >
            AI 퀴즈 풀기
          </Link>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <img src="/cats_assets/classic/classic_cat_static.png" alt="퀴즈 캐릭터" className="w-24 h-24 mb-4" />
          <p className="text-lg font-korean-pixel text-gray-600 mb-4">아직 퀴즈 결과가 없어요!</p>
          <p className="text-sm font-korean-pixel text-gray-500 mb-6">AI 퀴즈를 풀고 결과를 확인해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🤖 AI 퀴즈 결과</h3>
        <Link
          to="/ai-quiz"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-korean-pixel text-sm hover:opacity-90 transition-all duration-300"
        >
          AI 퀴즈 풀기
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 퀴즈 결과 요약 */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h4 className="text-lg font-bold text-blue-700 mb-4 font-korean-pixel">최근 퀴즈 결과</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">총 문제</p>
              <p className="text-2xl font-bold text-blue-600">{scores.totalProblems}</p>
              <p className="text-xs text-gray-400">문제</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">정답률</p>
              <p className="text-2xl font-bold text-green-600">{correctRate}%</p>
              <p className="text-xs text-gray-400">
                {scores.correctAnswers}/{scores.totalProblems}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">최종 점수</p>
              <p className="text-2xl font-bold text-purple-600">{scores.finalScore}</p>
              <p className="text-xs text-gray-400">점</p>
            </div>
          </div>
        </div>

        {/* 집중 학습 필요 분야 */}
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <h4 className="text-lg font-bold text-purple-700 mb-4 font-korean-pixel">집중 학습이 필요한 분야</h4>
          
          <div className="space-y-3">
            {weakPoints.map((point) => (
              <div key={point.id} className="flex items-center">
                <div className="relative flex-shrink-0 mr-3">
                  <div 
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: point.level === "high" 
                        ? "#EF4444" 
                        : point.level === "medium" 
                          ? "#EAB308" 
                          : "#22C55E"
                    }}
                  ></div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 font-korean-pixel">{point.topic}</p>
                </div>
                <div className="ml-2 px-2 py-1 rounded-full text-xs font-korean-pixel bg-white shadow-sm">
                  {point.level === "high" 
                    ? "높음" 
                    : point.level === "medium" 
                      ? "중간" 
                      : "낮음"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultSection;