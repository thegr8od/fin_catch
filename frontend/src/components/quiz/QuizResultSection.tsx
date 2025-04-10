import React from "react";
import { Link } from "react-router-dom";
import { useAiQuizSummary } from "../../hooks/useAiQuizSummary";

const QuizResultSection: React.FC = () => {
  // 새로운 훅 사용
  const { summary, loading, error, refreshData } = useAiQuizSummary();
  
  // 데이터가 없는 경우 표시할 컴포넌트
  if (loading) {
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
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-korean-pixel text-gray-600">퀴즈 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <p className="text-lg font-korean-pixel text-red-500 mb-4">데이터를 불러오는 중 오류가 발생했습니다</p>
          <button 
            onClick={refreshData} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-korean-pixel text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 퀴즈를 아직 풀지 않은 경우
  if (summary.totalQuizzes === 0) {
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
          <img src="/cats_assets/classic/classic_cat_static.png" alt="퀴즈 캐릭터" className="w-24 h-24 mb-4" style={{ imageRendering: "pixelated" }} />
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
          <h4 className="text-lg font-bold text-blue-700 mb-4 font-korean-pixel">퀴즈 현황</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">총 문제</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalQuizzes}</p>
              <p className="text-xs text-gray-400">문제</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">정답률</p>
              <p className="text-2xl font-bold text-green-600">{summary.correctRate.toFixed(0)}%</p>
              <p className="text-xs text-gray-400">
                {summary.totalQuizzes - summary.wrongQuizzes}/{summary.totalQuizzes}
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">틀린 문제</p>
              <p className="text-2xl font-bold text-red-500">{summary.wrongQuizzes}</p>
              <p className="text-xs text-gray-400">개</p>
            </div>
          </div>
        </div>

        {/* 집중 학습 필요 분야 */}
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
          <h4 className="text-lg font-bold text-purple-700 mb-4 font-korean-pixel">집중 학습이 필요한 분야</h4>
          
          {summary.weakPoints.length > 0 ? (
            <div className="space-y-3">
              {summary.weakPoints.map((point) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-gray-600 font-korean-pixel">아직 충분한 데이터가 없습니다</p>
              <p className="text-sm font-korean-pixel text-gray-500 mt-2">더 많은 퀴즈를 풀어보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultSection;