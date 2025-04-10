import React from 'react';
import { Problem } from '../../types/analysis/Problem';
import Pagination from '../common/Pagination';

interface WrongQuizListProps {
  problems: Problem[];
  selectedProblemId: number | null;
  analyzingProblemId: number | null;
  currentPage: number;
  totalPages: number;
  onProblemSelect: (problem: Problem) => void;
  onPageChange: (pageNumber: number) => void;
}

const WrongQuizList: React.FC<WrongQuizListProps> = ({
  problems,
  selectedProblemId,
  analyzingProblemId,
  currentPage,
  totalPages,
  onProblemSelect,
  onPageChange
}) => {
  // 날짜 포맷 함수 - 날짜만 표시 (시간 제외)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      {/* 현재 페이지의 문제만 표시 */}
      {problems.map((problem) => (
        <div
          key={problem.id}
          onClick={() => onProblemSelect(problem)}
          className={`p-4 rounded-lg cursor-pointer transition-colors relative ${
            selectedProblemId === problem.id 
              ? "bg-blue-100 border-2 border-blue-500" 
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-korean-pixel text-gray-800">{problem.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-sm font-korean-pixel ${
                problem.type === "객관식" 
                  ? "bg-blue-100 text-blue-700" 
                  : problem.type === "주관식" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-purple-100 text-purple-700"
              }`}
            >
              {problem.type}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            {/* 틀린 날짜 표시 (시간 제외) */}
            {problem.attemptHistory && problem.attemptHistory.length > 0 && (
              <p className="text-sm font-korean-pixel" style={{ color: '#EF4444' }}>
                틀린 날짜: {formatDate(problem.attemptHistory[problem.attemptHistory.length - 1].date)}
              </p>
            )}
          </div>

          {analyzingProblemId === problem.id && (
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
              <div className="flex items-center bg-white px-3 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="font-korean-pixel text-sm">분석 중...</span>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* 페이지네이션 컨트롤 */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
};

export default WrongQuizList;