import React from 'react';
import { Problem } from '../../types/analysis/Problem';
import AnalysisCharts from './AnalysisCharts';

// 확장된 Problem 인터페이스 정의
interface ExtendedProblem extends Problem {
  userAnswer?: string;
  correctAnswer?: string;
  isAnalyzed?: boolean;
}

interface AnalysisDetailsProps {
  problem: ExtendedProblem;
  loading: boolean;
  error: boolean;
  onRequestAnalysis: (problem: ExtendedProblem) => void;
}

const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ problem, loading, error, onRequestAnalysis }) => {
  // 로딩 상태 컴포넌트
  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 font-korean-pixel">분석 중...</span>
    </div>
  );

  // 에러 상태 컴포넌트
  const renderErrorState = () => (
    <div className="text-red-500 p-4 text-center font-korean-pixel">
      분석 중 오류가 발생했습니다. 다시 시도해주세요.
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-korean-pixel text-xl text-gray-800 mb-4">{problem.title}</h4>
        
        {/* 사용자 답변과 정답 정보 */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 gap-3">
            <div className="border-l-4 border-red-400 pl-3">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">내 답변</p>
              <p className="text-red-500 font-korean-pixel">{problem.userAnswer || '미입력'}</p>
            </div>
            
            <div className="border-l-4 border-green-400 pl-3">
              <p className="text-gray-500 text-sm mb-1 font-korean-pixel">정답</p>
              <p className="text-green-600 font-korean-pixel">{problem.correctAnswer || '정보 없음'}</p>
            </div>
          </div>
        </div>
        
        <AnalysisCharts problem={problem} />
      </div>
      
      {/* 분석 내용은 사용자가 명시적으로 AI 분석을 요청했을 때만 표시 */}
      {problem.isAnalyzed && problem.analysis ? (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h5 className="font-korean-pixel text-lg text-blue-700 mb-3">📊 AI 분석 결과</h5>
          <p className="font-korean-pixel text-gray-600 whitespace-pre-line">{problem.analysis}</p>
          
          {problem.weakPoints && problem.weakPoints.length > 0 && (
            <div className="mt-4">
              <h6 className="font-korean-pixel text-red-600 mb-2">⚠️ 취약점</h6>
              <div className="bg-red-50 p-3 rounded-md">
                <p className="font-korean-pixel text-gray-700">{problem.weakPoints[0]}</p>
              </div>
            </div>
          )}
          
          {problem.recommendations && problem.recommendations.length > 0 && (
            <div className="mt-4">
              <h6 className="font-korean-pixel text-green-600 mb-2">💡 학습 추천</h6>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="font-korean-pixel text-gray-700">{problem.recommendations[0]}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
          <p className="font-korean-pixel text-blue-700 mb-4">
            AI가 이 문제의 오답 원인과 개선 방법을 분석할 수 있습니다.
          </p>
          <button
            onClick={() => onRequestAnalysis(problem)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md font-korean-pixel hover:bg-blue-600 transition-colors w-full md:w-auto"
          >
            AI 분석 요청하기
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetails;