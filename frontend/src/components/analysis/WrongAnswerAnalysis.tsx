import React, { useState, useEffect, useCallback } from "react";
import { useAnalyze } from "../../hooks/useAnalyze";
import { useConsumptionAnalyze } from "../../hooks/useConsumptionAnalyze";
import { Problem, Category, AnalysisProps } from "../../types/analysis/Problem";
import { useApi } from "../../hooks/useApi";
import CategoryButtons from "../common/CategoryButtons";
import WrongQuizList from "../quiz/WrongQuizList";
import AnalysisCharts from "./AnalysisCharts";

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

interface ApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: WrongAnswer[];
}

interface AnalysisData {
  analysis: string;
  weakness: string;
  recommendation: string;
}

// Problem 타입 확장
interface ExtendedProblem extends Problem {
  userAnswer?: string;
  correctAnswer?: string;
  isAnalyzed?: boolean;
}

const WrongAnswerAnalysis: React.FC<AnalysisProps> = ({ categories, onStartGame }) => {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<number | string>(categories.length > 0 ? categories[0]?.tag : "consumption");
  const [selectedProblem, setSelectedProblem] = useState<ExtendedProblem | null>(null);
  const [analyzingProblemId, setAnalyzingProblemId] = useState<number | null>(null);
  const [consumptionCategory, setConsumptionCategory] = useState<Category | null>(null);
  const [regularCategory, setRegularCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  // 훅 사용
  const { analyzeWrongAnswer, loading: regularLoading, error: regularError } = useAnalyze();
  const { analyzeConsumptionWrongAnswer, loading: consumptionLoading, error: consumptionError } = useConsumptionAnalyze();
  
  const { loading: apiConsumptionLoading, execute: fetchConsumptionWrong } = useApi<ApiResponse>("/api/ai/consumption/wrong", "GET");
  const { loading: apiRegularLoading, execute: fetchRegularWrong } = useApi<ApiResponse>("/api/ai/analysis/regular/wrong", "GET");

  // 현재 분석 로딩 상태 및 에러 계산
  const loading = regularLoading || consumptionLoading;
  const error = regularError || consumptionError;

  // 오답을 그룹화하는 함수
  const groupAnswersByQuiz = useCallback((answers: WrongAnswer[], isRegular = false): ExtendedProblem[] => {
    const grouped: Record<number, {
      quizId: number;
      question: string;
      correctAnswer: string;
      userAnswer: string;
      quizMode?: string;
      quizSubject?: string;
      wrongCount: number;
      attempts: {
        userAnswer: string;
        createdAt: string;
      }[];
    }> = {};
    
    answers.forEach(item => {
      if (!grouped[item.quizId]) {
        grouped[item.quizId] = {
          quizId: item.quizId,
          question: item.question,
          correctAnswer: item.correctAnswer,
          userAnswer: item.userAnswer,
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
    
    // 그룹화된 데이터를 Problem 형식으로 변환
    return Object.values(grouped).map((item) => {
      // 문제 유형 매핑
      let problemType: "객관식" | "주관식" | "서술형" = "객관식";
      
      if (isRegular && item.quizMode) {
        if (item.quizMode === "MULTIPLE_CHOICE") {
          problemType = "객관식";
        } else if (item.quizMode === "SHORT_ANSWER") {
          problemType = "주관식";
        } else if (item.quizMode === "ESSAY") {
          problemType = "서술형";
        }
      }
      
      return {
        id: item.quizId,
        title: item.question,
        type: problemType,
        wrongCount: item.wrongCount,
        correctCount: 0,
        analysis: "",
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        isAnalyzed: false,
        weakPoints: [],
        recommendations: [],
        attemptHistory: item.attempts.map((attempt) => ({
          date: attempt.createdAt.substring(0, 10),
          isCorrect: false
        }))
      };
    });
  }, []);

  // 오답 데이터 로드 함수
  const loadWrongAnswers = useCallback(async () => {
    try {
      // AI 소비 퀴즈 오답 데이터 로드
      const consumptionResponse = await fetchConsumptionWrong();
      if (consumptionResponse?.isSuccess && Array.isArray(consumptionResponse?.result)) {
        const mergedProblems = groupAnswersByQuiz(consumptionResponse.result);
        setConsumptionCategory({
          id: 900, // 임의의 ID 할당
          tag: "consumption",
          name: "소비 퀴즈 오답",
          totalProblems: mergedProblems.length,
          problems: mergedProblems
        });
      }
      
      // 일반 퀴즈 오답 데이터 로드
      const regularResponse = await fetchRegularWrong();
      if (regularResponse?.isSuccess && Array.isArray(regularResponse?.result)) {
        const mergedProblems = groupAnswersByQuiz(regularResponse.result, true);
        setRegularCategory({
          id: 901, // 임의의 ID 할당
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
        id: 901, // 임의의 ID 할당
        tag: "regular",
        name: "문제 오답",
        totalProblems: 0,
        problems: []
      });
      
      setConsumptionCategory({
        id: 900, // 임의의 ID 할당
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

  // 문제 선택 핸들러
  const handleProblemSelect = (problem: ExtendedProblem) => {
    setSelectedProblem(problem);
  };
  
  // AI 분석 요청 핸들러
  const handleRequestAnalysis = async (problem: ExtendedProblem) => {
    setAnalyzingProblemId(problem.id);

    try {
      let result;
      // 카테고리에 따라 다른 분석 API 호출
      if (selectedCategory === "consumption") {
        result = await analyzeConsumptionWrongAnswer(problem.id);
      } else {
        result = await analyzeWrongAnswer(problem.id);
      }
      
      if (result?.isSuccess && result.result) {
        // 타입 안전하게 처리: unknown으로 변환 후 타입 가드 사용
        const analysisResult = result.result as unknown;
        
        // 타입 가드로 필수 필드 확인
        if (
          analysisResult && 
          typeof analysisResult === 'object' && 
          'analysis' in analysisResult && 
          'weakness' in analysisResult && 
          'recommendation' in analysisResult
        ) {
          const analysisData = analysisResult as AnalysisData;
          
          // 분석 결과로 문제 업데이트
          const analyzedProblem: ExtendedProblem = {
            ...problem,
            analysis: analysisData.analysis,
            weakPoints: [analysisData.weakness],
            recommendations: [analysisData.recommendation],
            isAnalyzed: true
          };

          // 카테고리 내에서 해당 문제 업데이트
          if (currentCategory) {
            const updatedProblems = currentCategory.problems.map(p => 
              p.id === problem.id ? analyzedProblem : p
            );

            if (selectedCategory === "consumption" && consumptionCategory) {
              setConsumptionCategory({
                ...consumptionCategory,
                problems: updatedProblems
              });
            } else if (selectedCategory === "regular" && regularCategory) {
              setRegularCategory({
                ...regularCategory,
                problems: updatedProblems
              });
            }
          }

          setSelectedProblem(analyzedProblem);
        }
      }
    } catch (err) {
      console.error("분석 오류:", err);
    } finally {
      setAnalyzingProblemId(null);
    }
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
  const isLoading = apiConsumptionLoading || apiRegularLoading;
  
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
            {selectedProblem ? (
              <div>
                <h4 className="font-korean-pixel text-xl text-gray-800 mb-4">{selectedProblem.title}</h4>
                
                {/* AnalysisCharts 컴포넌트 - 소비 퀴즈 여부를 전달 */}
                <AnalysisCharts 
                  problem={selectedProblem} 
                  isConsumption={selectedCategory === "consumption"}
                />
                
                {/* 분석 중 상태 */}
                {analyzingProblemId === selectedProblem.id ? (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg text-center flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                    <span className="font-korean-pixel text-blue-700">AI 분석 중...</span>
                  </div>
                ) : error ? (
                  <div className="mt-4 text-red-500 p-4 text-center font-korean-pixel">분석 중 오류가 발생했습니다. 다시 시도해주세요.</div>
                ) : (
                  <>
                    {/* 분석 내용은 사용자가 명시적으로 AI 분석을 요청했을 때만 표시 */}
                    {selectedProblem.isAnalyzed && selectedProblem.analysis ? (
                      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                        <h5 className="font-korean-pixel text-lg text-blue-700 mb-3">📊 AI 분석 결과</h5>
                        <p className="font-korean-pixel text-gray-600 whitespace-pre-line">{selectedProblem.analysis}</p>
                        
                        {/* 취약점 및 추천사항 추가 */}
                        {selectedProblem.weakPoints && selectedProblem.weakPoints.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-korean-pixel text-red-600 mb-2">⚠️ 취약점</h6>
                            <div className="bg-red-50 p-3 rounded-md">
                              <p className="font-korean-pixel text-gray-700">{selectedProblem.weakPoints[0]}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedProblem.recommendations && selectedProblem.recommendations.length > 0 && (
                          <div className="mt-4">
                            <h6 className="font-korean-pixel text-green-600 mb-2">💡 학습 추천</h6>
                            <div className="bg-green-50 p-3 rounded-md">
                              <p className="font-korean-pixel text-gray-700">{selectedProblem.recommendations[0]}</p>
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
                          onClick={() => handleRequestAnalysis(selectedProblem)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md font-korean-pixel hover:bg-blue-600 transition-colors w-full md:w-auto"
                        >
                          AI 분석 요청하기
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 font-korean-pixel">왼쪽에서 문제를 선택하면 상세 정보가 표시됩니다</p>
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