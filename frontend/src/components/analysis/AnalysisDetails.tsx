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
        <h5 className="font-korean-pixel text-gray-800 mb-2">💡 취약점</h5>
        <ul className="list-disc pl-5 space-y-1">
          {problem.weakPoints.map((point, index) => (
            <li key={index} className="font-korean-pixel text-gray-600">
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-korean-pixel text-gray-800 mb-2">✨ 추천 학습</h5>
        <ul className="list-disc pl-5 space-y-1">
          {problem.recommendations.map((rec, index) => (
            <li key={index} className="font-korean-pixel text-gray-600">
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisDetails;