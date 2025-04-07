import React from 'react';
import { Problem } from '../../types/analysis/Problem';
import AnalysisCharts from './AnalysisCharts';

interface AnalysisDetailsProps {
  problem: Problem;
  loading: boolean;
  error: boolean;  // 명확한 boolean 타입으로 정의
}

const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ problem, loading, error }) => {
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

  // 소비 퀴즈 오답인지 확인 (문제 분석에 "소비 퀴즈"라는 문구가 포함되어 있는지 확인)
  const isConsumptionQuiz = problem.analysis.includes('소비 퀴즈') || 
                           problem.weakPoints.some(point => point.includes('소비 퀴즈'));

  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-korean-pixel text-lg text-gray-800 mb-4">{problem.title}</h4>
        <AnalysisCharts problem={problem} />
      </div>
      <div className="mt-6">
        <h5 className="font-korean-pixel text-gray-800 mb-2">📊 분석 내용</h5>
        <p className="font-korean-pixel text-gray-600 whitespace-pre-line">{problem.analysis}</p>
      </div>
      <div>
        {/* <h5 className="font-korean-pixel text-gray-800 mb-2">💡 취약점</h5> */}
        <ul className="list-disc pl-5 space-y-1">
        </ul>
      </div>
      <div>
        {/* <h5 className="font-korean-pixel text-gray-800 mb-2">✨ 추천 학습</h5> */}
        <ul className="list-disc pl-5 space-y-1">
        </ul>
      </div>
      
      {/* 금융 공부 조언 섹션 - 소비 퀴즈 오답일 때만 표시 */}
      {isConsumptionQuiz && (
        <div className="mt-4">
          <p className="font-korean-pixel text-gray-700 mb-2">
            금융 공부는 기초 개념부터 차근차근 이해하는 것이 중요하므로 경제 용어와 금융 구조를 먼저 익히세요.
          </p>
          <p className="font-korean-pixel text-gray-700 mb-2">
            뉴스나 유튜브, 책 등을 통해 실제 사례와 시사 이슈를 접하면서 흥미를 높이고 실전 감각을 키우세요.
          </p>
          <p className="font-korean-pixel text-gray-700">
            마지막으로 가계부 작성이나 모의투자 등 실생활에 적용해보며 배운 내용을 꾸준히 반복하세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisDetails;