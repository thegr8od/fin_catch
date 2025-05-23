import React, { useState, useMemo } from 'react';
import { useRegularQuizWrong } from '../../hooks/useRegularQuizWrong';
import Pagination from '../common/Pagination';
import { useAnalyze } from '../../hooks/useAnalyze';

const RegularWrongQuizList: React.FC = () => {
  const { loading, error, groupedLogs } = useRegularQuizWrong();
  const { analyzeWrongAnswer } = useAnalyze();

  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [analyzingProblemId, setAnalyzingProblemId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleProblemAnalyze = async (quizId: number) => {
    if (analyzingProblemId) return;

    setSelectedProblemId(quizId);
    setAnalyzingProblemId(quizId);

    try {
      const result = await analyzeWrongAnswer(quizId);
      console.log("분석 결과:", result);
    } catch (error) {
      console.error("문제 분석 중 오류:", error);
    } finally {
      setAnalyzingProblemId(null);
    }
  };

  // 최신순으로 정렬된 로그
  const sortedLogs = useMemo(() => {
    // 복사본을 만들어 정렬
    return [...groupedLogs].sort((a, b) => {
      // 날짜 비교를 위해 Date 객체로 변환
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      // 내림차순 정렬 (최신 날짜가 먼저 오도록)
      return dateB.getTime() - dateA.getTime();
    });
  }, [groupedLogs]);

  // 페이지네이션 적용
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedLogs.slice(startIndex, endIndex);
  }, [sortedLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  // 날짜 포맷 함수 - 날짜만 표시 (시간 제외)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  if (loading) return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 text-red-500">
      오류 발생: {error}
    </div>
  );

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
      <h3 className="text-xl font-bold mb-4 font-korean-pixel">📝 일반 퀴즈 오답 노트</h3>
      
      {groupedLogs.length === 0 ? (
        <div className="text-center text-gray-500 py-6">
          틀린 문제가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLogs.map((log) => (
            <div
              key={log.quizId}
              onClick={() => handleProblemAnalyze(log.quizId)}
              className={`p-4 rounded-lg cursor-pointer transition-colors relative ${
                selectedProblemId === log.quizId 
                  ? "bg-blue-100 border-2 border-blue-500" 
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              {/* 문제 레이아웃 수정 - 2단 레이아웃 */}
              <div className="flex flex-col mb-2">
                {/* 문제 제목 - 전체 너비 사용 */}
                <h4 className="font-korean-pixel text-gray-800 mb-2 break-words">
                  {log.question}
                </h4>
                
                {/* 문제 유형 태그 - 오른쪽 정렬 */}
                <div className="flex justify-end">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-korean-pixel ${
                      log.quizMode === "MULTIPLE_CHOICE" 
                        ? "bg-blue-100 text-blue-700" 
                        : log.quizMode === "SHORT_ANSWER" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {log.quizMode === "MULTIPLE_CHOICE" 
                      ? "객관식" 
                      : log.quizMode === "SHORT_ANSWER" 
                        ? "주관식" 
                        : "서술형"}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-sm font-korean-pixel text-red-500">
                  내 답변: {log.userAnswer || '미입력'}
                </p>
                {log.correctAnswer && (
                  <p className="text-sm font-korean-pixel text-green-500">
                    정답: {log.correctAnswer}
                  </p>
                )}
              </div>
              {/* 틀린 날짜 표시 (시간 제외) */}
              <div className="text-sm text-red-500 mt-1 font-korean-pixel">
                틀린 날짜: {formatDate(log.createdAt)}
              </div>

              {analyzingProblemId === log.quizId && (
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
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
    </div>
  );
};

export default RegularWrongQuizList;