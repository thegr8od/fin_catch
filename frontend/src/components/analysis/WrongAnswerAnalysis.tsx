import React, { useState, useEffect, useCallback } from "react";
import { useAnalyze } from "../../hooks/useAnalyze";
import { Problem, Category, AnalysisProps } from "../../types/analysis/Problem";
import { useApi } from "../../hooks/useApi";
import CategoryButtons from "../common/CategoryButtons";
import WrongQuizList from "../quiz/WrongQuizList";
import AnalysisDetails from "../analysis/AnalysisDetails";

// 오답 인터페이스 정의
interface WrongAnswer {
  quizId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
  quizMode?: string;
  quizSubject?: string;
}

interface GroupedAnswer {
  quizId: number;
  question: string;
  correctAnswer: string;
  quizMode?: string;
  quizSubject?: string;
  wrongCount: number;
  attempts: {
    userAnswer: string;
    createdAt: string;
  }[];
}

const WrongAnswerAnalysis: React.FC<AnalysisProps> = ({ categories, onStartGame }) => {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<number | string>(categories.length > 0 ? categories[0]?.tag : "consumption");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [analyzingProblemId, setAnalyzingProblemId] = useState<number | null>(null);
  const [consumptionCategory, setConsumptionCategory] = useState<Category | null>(null);
  const [regularCategory, setRegularCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // 훅 사용
  const { analyzeWrongAnswer, loading, error } = useAnalyze();
  const { loading: consumptionLoading, execute: fetchConsumptionWrong } = useApi<WrongAnswer[]>("/api/ai/consumption/wrong", "GET");
  const { loading: regularLoading, execute: fetchRegularWrong } = useApi<WrongAnswer[]>("/api/ai/analysis/regular/wrong", "GET");

  // 오답을 그룹화하는 함수
  const groupAnswersByQuiz = useCallback((answers: WrongAnswer[], isRegular = false) => {
    const grouped: Record<number, GroupedAnswer> = {};
    
    answers.forEach(item => {
      if (!grouped[item.quizId]) {
        grouped[item.quizId] = {
          quizId: item.quizId,
          question: item.question,
          correctAnswer: item.correctAnswer,
          quizMode: item.quizMode,
          quizSubject: item.quizSubject,
          wrongCount: 1,
          attempts: [{
            userAnswer: item.userAnswer,
            createdAt: item.createdAt
          }]
        };
      } else {
        grouped[item.quizId].wrongCount += 1;
        grouped[item.quizId].attempts.push({
          userAnswer: item.userAnswer,
          createdAt: item.createdAt
        });
      }
    });
    
    return Object.values(grouped).map((item) => ({
      id: item.quizId,
      title: item.question,
      type: (isRegular && item.quizMode === "MULTIPLE_CHOICE" ? "객관식" : 
             isRegular && item.quizMode !== "MULTIPLE_CHOICE" ? "주관식" : 
             "객관식") as "객관식" | "주관식" | "서술형",
      wrongCount: item.wrongCount,
      correctCount: 0,
      analysis: isRegular 
        ? `주제: ${item.quizSubject}, 정답: ${item.correctAnswer}, 최근 제출한 답: ${item.attempts[item.attempts.length - 1].userAnswer}`
        : `정답: ${item.correctAnswer}, 최근 제출한 답: ${item.attempts[item.attempts.length - 1].userAnswer}`,
      weakPoints: [isRegular ? "일반 퀴즈에서 오답 발생" : "AI 소비 퀴즈에서 오답 발생"],
      recommendations: [isRegular ? "관련 금융 개념 학습하기" : "소비 패턴 복습하기", "관련 금융 개념 학습하기"],
      attemptHistory: item.attempts.map((attempt) => ({
        date: attempt.createdAt.substring(0, 10),
        isCorrect: false
      }))
    }));
  }, []);

  // 오답 데이터 로드 함수
  const loadWrongAnswers = useCallback(async () => {
    try {
      // AI 소비 퀴즈 오답 데이터 로드
      const consumptionResponse = await fetchConsumptionWrong();
      if (consumptionResponse?.isSuccess) {
        const mergedProblems = groupAnswersByQuiz(consumptionResponse.result || []);
        setConsumptionCategory({
          id: 0,
          tag: "consumption",
          name: "소비 퀴즈 오답",
          totalProblems: mergedProblems.length,
          problems: mergedProblems
        });
      }
      
      // 일반 퀴즈 오답 데이터 로드
      const regularResponse = await fetchRegularWrong();
      if (regularResponse?.isSuccess) {
        const mergedProblems = groupAnswersByQuiz(regularResponse.result || [], true);
        setRegularCategory({
          id: 1,
          tag: "regular",
          name: "문제 오답",
          totalProblems: mergedProblems.length,
          problems: mergedProblems
        });
      }
    } catch (err) {
      console.error("오답 데이터 로드 실패:", err);
      
      // 오류 시 빈 카테고리 생성
      setRegularCategory({
        id: 1,
        tag: "regular",
        name: "문제 오답",
        totalProblems: 0,
        problems: []
      });
      
      setConsumptionCategory({
        id: 0,
        tag: "consumption",
        name: "소비 퀴즈 오답",
        totalProblems: 0,
        problems: []
      });
    }
  }, [fetchConsumptionWrong, fetchRegularWrong, groupAnswersByQuiz]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWrongAnswers();
  }, [loadWrongAnswers]);
  
  // 카테고리 변경 시 상태 초기화
  useEffect(() => {
    setSelectedProblem(null);
    setCurrentPage(1);
  }, [selectedCategory]);

  // 메모이제이션된 계산 값들
  const allCategories = React.useMemo(() => {
    const result = [...categories];
    if (regularCategory) result.push(regularCategory);
    if (consumptionCategory) result.push(consumptionCategory);
    return result;
  }, [categories, regularCategory, consumptionCategory]);

  const currentCategory = React.useMemo(() => {
    if (selectedCategory === "consumption") return consumptionCategory;
    if (selectedCategory === "regular") return regularCategory;
    return allCategories.find((cat) => cat.tag === selectedCategory);
  }, [allCategories, selectedCategory, consumptionCategory, regularCategory]);
  
  const currentProblems = React.useMemo(() => {
    if (!currentCategory?.problems) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return currentCategory.problems.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentCategory, currentPage, itemsPerPage]);
  
  const totalPages = React.useMemo(() => {
    if (!currentCategory?.problems) return 1;
    return Math.ceil(currentCategory.problems.length / itemsPerPage);
  }, [currentCategory, itemsPerPage]);
  
  // 이벤트 핸들러
  const handleCategorySelect = (categoryId: number | string) => {
    setSelectedCategory(categoryId);
    setSelectedProblem(null);
  };
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedProblem(null);
  };

  const handleProblemSelect = async (problem: Problem) => {
    setSelectedProblem(problem);
    setAnalyzingProblemId(problem.id);

    if (selectedCategory !== "consumption") {
      try {
        const result = await analyzeWrongAnswer(problem.id);
        if (result?.isSuccess && result.result) {
          const analysisData = result.result;
          setSelectedProblem((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              analysis: analysisData.analysis,
              weakPoints: [analysisData.weakness],
              recommendations: [analysisData.recommendation],
            };
          });
        }
      } catch (err) {
        console.error("분석 오류:", err);
      }
    }
    
    setAnalyzingProblemId(null);
  };

  // 데이터가 없을 때 표시할 컴포넌트
  const renderNoDataSection = () => (
    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg p-8">
      <img src="/cats_assets/classic/classic_cat_static.png" alt="퀴즈 캐릭터" className="w-32 h-32 mb-6" />
      <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">오답이 하나도 없어요!</h3>
      <p className="text-gray-600 font-korean-pixel text-center mb-6">
        정말 대단해요! 모든 문제를 맞추셨네요.<br />계속해서 금융 지식을 쌓아보세요!
      </p>
      {onStartGame && (
        <button onClick={onStartGame} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300">
          1:1 게임 시작하기
        </button>
      )}
    </div>
  );

  // 로딩 상태 확인
  const isLoading = (consumptionLoading && selectedCategory === "consumption") || 
                   (regularLoading && selectedCategory === "regular");
  
  // 데이터 존재 여부 확인
  const hasData = currentCategory?.problems && currentCategory.problems.length > 0;

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">📝 오답노트 분석</h3>
      </div>

      <CategoryButtons 
        categories={categories}
        selectedCategory={selectedCategory}
        regularCategory={regularCategory}
        consumptionCategory={consumptionCategory}
        onCategorySelect={handleCategorySelect}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 font-korean-pixel">분석 중...</span>
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <WrongQuizList 
              problems={currentProblems}
              selectedProblemId={selectedProblem?.id || null}
              analyzingProblemId={analyzingProblemId}
              currentPage={currentPage}
              totalPages={totalPages}
              onProblemSelect={handleProblemSelect}
              onPageChange={handlePageChange}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 font-korean-pixel">분석 중...</span>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 text-center font-korean-pixel">분석 중 오류가 발생했습니다. 다시 시도해주세요.</div>
            ) : selectedProblem ? (
              <AnalysisDetails problem={selectedProblem} loading={!!loading} error={!!error} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 font-korean-pixel">문제를 선택하면 분석 내용이 표시됩니다</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        renderNoDataSection()
      )}
    </div>
  );
};

export default WrongAnswerAnalysis;