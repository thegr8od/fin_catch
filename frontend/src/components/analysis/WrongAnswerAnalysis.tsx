import React, { useState, useEffect } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend, ChartOptions, Scale, CoreScaleOptions } from "chart.js";
import { useAnalyze } from "../../hooks/useAnalyze";
import { Problem, Category, AnalysisProps } from "../../types/analysis/Problem";
import { useApi } from "../../hooks/useApi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend);

// AI 소비 퀴즈 오답 인터페이스
interface ConsumptionWrongAnswer {
  quizId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
}

// 일반 퀴즈 오답 인터페이스
interface RegularWrongAnswer {
  quizId: number;
  quizMode: string;
  quizSubject: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  createdAt: string;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T | null;
}

const WrongAnswerAnalysis: React.FC<AnalysisProps> = ({ categories, onStartGame, onDetailView }) => {
  // 기존 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<number | string>(categories.length > 0 ? categories[0]?.id : "consumption");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [analyzingProblemId, setAnalyzingProblemId] = useState<number | null>(null);
  
  // 소비 퀴즈 오답 상태
  const [consumptionWrongAnswers, setConsumptionWrongAnswers] = useState<ConsumptionWrongAnswer[]>([]);
  const [consumptionCategory, setConsumptionCategory] = useState<Category | null>(null);
  
  // 일반 퀴즈 오답 상태
  const [regularWrongAnswers, setRegularWrongAnswers] = useState<RegularWrongAnswer[]>([]);
  const [regularCategory, setRegularCategory] = useState<Category | null>(null);
  
  // 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // 한 페이지당 7개의 오답 표시
  
  // 분석 훅 사용
  const { analyzeWrongAnswer, loading, error } = useAnalyze();
  
  // API 훅
  const { loading: consumptionLoading, error: consumptionError, execute: fetchConsumptionWrong } = useApi<ApiResponse<ConsumptionWrongAnswer[]>>("/api/ai/consumption/wrong", "GET");
  const { loading: regularLoading, error: regularError, execute: fetchRegularWrong } = useApi<ApiResponse<RegularWrongAnswer[]>>("/api/ai/analysis/regular/wrong", "GET");

  // 컴포넌트 마운트 시 오답 데이터 가져오기
  useEffect(() => {
    const loadWrongAnswers = async () => {
      try {
        // 1. AI 소비 퀴즈 오답 데이터 가져오기
        const consumptionResponse = await fetchConsumptionWrong();
        if (consumptionResponse.isSuccess && consumptionResponse.result) {
          const wrongAnswers = consumptionResponse.result as unknown as ConsumptionWrongAnswer[];
          console.log("AI 소비 퀴즈 오답 데이터:", wrongAnswers);
          setConsumptionWrongAnswers(wrongAnswers);
          
          // AI 소비 퀴즈 오답 데이터를 Category 형식으로 변환하고 중복 문제 합치기
          if (wrongAnswers.length > 0) {
            // 중복 문제를 그룹화
            const groupedByQuestion: { [key: number]: {
              quizId: number;
              question: string;
              correctAnswer: string;
              wrongCount: number;
              quizMode?: string;
              quizSubject?: string;
              attempts: Array<{ userAnswer: string; createdAt: string; }>;
            }} = {};
            
            wrongAnswers.forEach((item: ConsumptionWrongAnswer) => {
              if (!groupedByQuestion[item.quizId]) {
                groupedByQuestion[item.quizId] = {
                  quizId: item.quizId,
                  question: item.question,
                  correctAnswer: item.correctAnswer,
                  wrongCount: 1,
                  attempts: [
                    {
                      userAnswer: item.userAnswer,
                      createdAt: item.createdAt
                    }
                  ]
                };
              } else {
                groupedByQuestion[item.quizId].wrongCount += 1;
                groupedByQuestion[item.quizId].attempts.push({
                  userAnswer: item.userAnswer,
                  createdAt: item.createdAt
                });
              }
            });
            
            // 그룹화된 데이터를 배열로 변환
            const mergedProblems = Object.values(groupedByQuestion).map((item: {
              quizId: number;
              question: string;
              correctAnswer: string;
              wrongCount: number;
              attempts: Array<{ userAnswer: string; createdAt: string; }>;
            }) => ({
              id: item.quizId,
              title: item.question,
              type: "객관식" as const,
              wrongCount: item.wrongCount,
              correctCount: 0,
              analysis: `정답: ${item.correctAnswer}, 최근 제출한 답: ${item.attempts[item.attempts.length - 1].userAnswer}`,
              weakPoints: ["AI 소비 퀴즈에서 오답 발생"],
              recommendations: ["소비 패턴 복습하기", "관련 금융 개념 학습하기"],
              attemptHistory: item.attempts.map((attempt: { userAnswer: string; createdAt: string }) => ({
                date: attempt.createdAt.substring(0, 10),
                isCorrect: false
              }))
            }));
            
            const consumptionCat: Category = {
              id: "consumption",
              tag: "consumption",
              name: "소비 퀴즈 오답",
              totalProblems: mergedProblems.length,
              problems: mergedProblems
            };
            
            setConsumptionCategory(consumptionCat);
          } else {
            // 소비 퀴즈 오답이 없는 경우 빈 카테고리 생성
            setConsumptionCategory({
              id: "consumption",
              tag: "consumption",
              name: "소비 퀴즈 오답",
              totalProblems: 0,
              problems: []
            });
          }
          
          // 초기 카테고리를 소비 퀴즈로 설정
          if (selectedCategory !== "regular") {
            setSelectedCategory("consumption");
          }
        }
        
        // 2. 일반 퀴즈 오답 데이터 가져오기
        const regularResponse = await fetchRegularWrong();
        if (regularResponse.isSuccess) {
          console.log("일반 퀴즈 오답 데이터:", regularResponse.result);
          setRegularWrongAnswers(regularResponse.result?.result || []);
          
          // 일반 퀴즈 오답 데이터를 Category 형식으로 변환하고 중복 문제 합치기
          if (regularResponse.result?.result && regularResponse.result?.result.length > 0) {
            // 중복 문제를 그룹화
            const groupedByQuestion: { [key: number]: {
              quizId: number;
              question: string;
              correctAnswer: string;
              wrongCount: number;
              quizMode?: string;
              quizSubject?: string;
              attempts: Array<{ userAnswer: string; createdAt: string; }>;
            }} = {};
            
            regularResponse.result?.result?.forEach((item: RegularWrongAnswer) => {
              if (!groupedByQuestion[item.quizId]) {
                groupedByQuestion[item.quizId] = {
                  quizId: item.quizId,
                  question: item.question,
                  correctAnswer: item.correctAnswer,
                  quizMode: item.quizMode,
                  quizSubject: item.quizSubject,
                  wrongCount: 1,
                  attempts: [
                    {
                      userAnswer: item.userAnswer,
                      createdAt: item.createdAt
                    }
                  ]
                };
              } else {
                groupedByQuestion[item.quizId].wrongCount += 1;
                groupedByQuestion[item.quizId].attempts.push({
                  userAnswer: item.userAnswer,
                  createdAt: item.createdAt
                });
              }
            });
            
            // 그룹화된 데이터를 배열로 변환
            const mergedProblems = Object.values(groupedByQuestion).map((item: {
              quizId: number;
              question: string;
              correctAnswer: string;
              wrongCount: number;
              quizMode?: string;
              quizSubject?: string;
              attempts: Array<{ userAnswer: string; createdAt: string; }>;
            }) => ({
              id: item.quizId,
              title: item.question,
              type: (item.quizMode === "MULTIPLE_CHOICE" ? "객관식" : "주관식") as "객관식" | "주관식" | "서술형",
              wrongCount: item.wrongCount,
              correctCount: 0,
              analysis: `주제: ${item.quizSubject}, 정답: ${item.correctAnswer}, 최근 제출한 답: ${item.attempts[item.attempts.length - 1].userAnswer}`,
              weakPoints: ["일반 퀴즈에서 오답 발생"],
              recommendations: ["관련 금융 개념 학습하기"],
              attemptHistory: item.attempts.map((attempt: { userAnswer: string; createdAt: string }) => ({
                date: attempt.createdAt.substring(0, 10),
                isCorrect: false
              }))
            }));
            
            const regularCat: Category = {
              id: "regular",
              tag: "regular",
              name: "문제 오답",
              totalProblems: mergedProblems.length,
              problems: mergedProblems
            };
            
            setRegularCategory(regularCat);
          } else {
            // 일반 퀴즈 오답이 없는 경우 빈 카테고리 생성
            setRegularCategory({
              id: "regular",
              tag: "regular",
              name: "문제 오답",
              totalProblems: 0,
              problems: []
            });
          }
          
          // 명시적으로 일반 퀴즈를 선택한 경우
          if (selectedCategory === "regular") {
            setSelectedCategory("regular");
          }
        }
        
      } catch (err) {
        console.error("오답 데이터 로드 실패:", err);
        
        // 오류 발생 시에도 빈 카테고리 생성
        setRegularCategory({
          id: "regular",
          tag: "regular",
          name: "문제 오답",
          totalProblems: 0,
          problems: []
        });
        
        setConsumptionCategory({
          id: "consumption",
          tag: "consumption",
          name: "소비 퀴즈 오답",
          totalProblems: 0,
          problems: []
        });
      }
    };
    
    loadWrongAnswers();
  }, [fetchConsumptionWrong, fetchRegularWrong, selectedCategory]);
  
  // 카테고리나 페이지 변경 시 선택된 문제 초기화
  useEffect(() => {
    setSelectedProblem(null);
    setCurrentPage(1); // 카테고리 변경 시 페이지 초기화
  }, [selectedCategory]);

  // 모든 카테고리 (기존 + 일반 퀴즈 + AI 소비 퀴즈)
  const allCategories = React.useMemo(() => {
    const result = [...categories];
    
    // 일반 퀴즈 카테고리 추가
    if (regularCategory) {
      result.push(regularCategory);
    }
    
    // AI 소비 퀴즈 카테고리 추가
    if (consumptionCategory) {
      result.push(consumptionCategory);
    }
    
    return result;
  }, [categories, regularCategory, consumptionCategory]);

  // 현재 선택된 카테고리
  const currentCategory = React.useMemo(() => {
    if (selectedCategory === "consumption") {
      return consumptionCategory;
    } else if (selectedCategory === "regular") {
      return regularCategory;
    }
    return allCategories.find((cat) => cat.id === selectedCategory);
  }, [allCategories, selectedCategory, consumptionCategory, regularCategory]);
  
  const hasProblems = currentCategory?.problems && currentCategory.problems.length > 0;
  
  // 현재 페이지에 표시할 문제 목록 계산
  const currentProblems = React.useMemo(() => {
    if (!currentCategory?.problems) return [];
    
    // 전체 문제에서 현재 페이지에 해당하는 것만 추출
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return currentCategory.problems.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentCategory, currentPage, itemsPerPage]);
  
  // 전체 페이지 수 계산
  const totalPages = React.useMemo(() => {
    if (!currentCategory?.problems) return 1;
    return Math.ceil(currentCategory.problems.length / itemsPerPage);
  }, [currentCategory, itemsPerPage]);
  
  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedProblem(null); // 페이지 변경 시 선택된 문제 초기화
  };

  // 문제 선택 및 분석 핸들러
  const handleProblemSelect = async (problem: Problem) => {
    setSelectedProblem(problem);
    setAnalyzingProblemId(problem.id);

    // 일반 카테고리 문제인 경우에만 API 분석 호출
    if (selectedCategory !== "consumption") {
      try {
        const result = await analyzeWrongAnswer(problem.id);
        console.log("API 응답 데이터:", result);
        if (result.isSuccess && result.result) {
          const analysisData = result.result;
          console.log("분석 데이터:", analysisData);
          // 분석 데이터 업데이트
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

  // 로딩 상태 컴포넌트
  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 font-korean-pixel">분석 중...</span>
    </div>
  );

  // 에러 상태 컴포넌트
  const renderErrorState = () => <div className="text-red-500 p-4 text-center font-korean-pixel">분석 중 오류가 발생했습니다. 다시 시도해주세요.</div>;

  // 데이터가 없을 때 표시할 섹션
  const renderNoDataSection = () => (
    <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg p-8">
      <img src="/cats_assets/classic/classic_cat_static.png" alt="퀴즈 캐릭터" className="w-32 h-32 mb-6" />
      <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">오답이 하나도 없어요!</h3>
      <p className="text-gray-600 font-korean-pixel text-center mb-6">
        정말 대단해요! 모든 문제를 맞추셨네요.
        <br />
        계속해서 금융 지식을 쌓아보세요!
      </p>
      {onStartGame && (
        <button onClick={onStartGame} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300">
          1:1 게임 시작하기
        </button>
      )}
    </div>
  );

  // 분석 차트 렌더링
  const renderAnalysisCharts = (problem: Problem) => {
    const correctRate = (problem.correctCount / (problem.correctCount + problem.wrongCount)) * 100;
    const wrongRate = 100 - correctRate;

    const doughnutData = {
      labels: ["정답", "오답"],
      datasets: [
        {
          data: [correctRate, wrongRate],
          backgroundColor: ["#4CAF50", "#FF5252"],
          borderWidth: 0,
        },
      ],
    };

    const historyData = {
      labels: problem.attemptHistory.map((h) => h.date),
      datasets: [
        {
          label: "문제 풀이 기록",
          data: problem.attemptHistory.map((h) => (h.isCorrect ? 100 : 0)),
          borderColor: "#2196F3",
          tension: 0.1,
        },
      ],
    };

    const lineOptions: ChartOptions<"line"> = {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (this: Scale<CoreScaleOptions>, tickValue: number | string) {
              const value = Number(tickValue);
              return value === 100 ? "정답" : value === 0 ? "오답" : "";
            },
          },
        },
      },
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h5 className="font-korean-pixel text-gray-700 mb-4 text-center">정답률</h5>
            <div className="w-48 h-48 mx-auto">
              <Doughnut data={doughnutData} options={{ cutout: "70%" }} />
            </div>
            <div className="text-center mt-4">
              <span className="font-korean-pixel text-2xl font-bold text-blue-600">{correctRate.toFixed(1)}%</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h5 className="font-korean-pixel text-gray-700 mb-4">풀이 기록</h5>
            <Line data={historyData} options={lineOptions} />
          </div>
        </div>
      </div>
    );
  };

  // 페이지네이션 UI 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded mr-2 ${
            currentPage === 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          이전
        </button>
        
        {/* 페이지 번호 버튼 - 최대 5개 표시 */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // 현재 페이지 주변 페이지들 표시
          let pageNum;
          if (totalPages <= 5) {
            // 전체 페이지가 5개 이하면 1~5 표시
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            // 현재 페이지가 앞쪽이면 1~5 표시
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            // 현재 페이지가 뒤쪽이면 마지막 5개 표시
            pageNum = totalPages - 4 + i;
          } else {
            // 그 외에는 현재 페이지 중심으로 표시
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 mx-1 rounded-full ${
                currentPage === pageNum
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ml-2 ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          다음
        </button>
      </div>
    );
  };

  // 문제 목록 렌더링 (페이지네이션 적용)
  const renderProblemList = () => (
    <div className="space-y-3">
      {/* 현재 페이지의 문제만 표시 */}
      {currentProblems.map((problem) => (
        <div
          key={problem.id}
          onClick={() => handleProblemSelect(problem)}
          className={`p-4 rounded-lg cursor-pointer transition-colors relative ${selectedProblem?.id === problem.id ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"}`}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-korean-pixel text-gray-800">{problem.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-sm font-korean-pixel ${
                problem.type === "객관식" ? "bg-blue-100 text-blue-700" : problem.type === "주관식" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
              }`}
            >
              {problem.type}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-red-500 font-korean-pixel">틀린 횟수: {problem.wrongCount}회</p>
            <p className="text-sm text-green-500 font-korean-pixel">정답 횟수: {problem.correctCount}회</p>
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
      {renderPagination()}
    </div>
  );

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">📝 오답노트 분석</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {/* 기존 카테고리 버튼들 */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setSelectedProblem(null);
            }}
            className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${selectedCategory === category.id ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            {category.name}
            {category.totalProblems && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {category.problems.length}/{category.totalProblems}
              </span>
            )}
          </button>
        ))}
        
        {/* 일반 퀴즈 버튼 - 항상 표시 */}
        <button
          key="regular"
          onClick={() => {
            setSelectedCategory("regular");
            setSelectedProblem(null);
          }}
          className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${selectedCategory === "regular" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
        >
          문제 오답
          {regularCategory && regularCategory.problems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {regularCategory.problems.length}
            </span>
          )}
        </button>
        
        {/* AI 소비 퀴즈 버튼 - 항상 표시 */}
        <button
          key="consumption"
          onClick={() => {
            setSelectedCategory("consumption");
            setSelectedProblem(null);
          }}
          className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${selectedCategory === "consumption" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
        >
          소비 퀴즈 오답
          {consumptionCategory && consumptionCategory.problems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
              {consumptionCategory.problems.length}
            </span>
          )}
        </button>
      </div>

      {(consumptionLoading && selectedCategory === "consumption") || (regularLoading && selectedCategory === "regular") ? (
        renderLoadingState()
      ) : (currentCategory?.problems && currentCategory.problems.length > 0) ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">{renderProblemList()}</div>

          <div className="bg-gray-50 p-4 rounded-lg">
            {loading ? (
              renderLoadingState()
            ) : error ? (
              renderErrorState()
            ) : selectedProblem ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-korean-pixel text-lg text-gray-800 mb-4">{selectedProblem.title}</h4>
                  {renderAnalysisCharts(selectedProblem)}
                </div>
                <div className="mt-6">
                  <h5 className="font-korean-pixel text-gray-800 mb-2">📊 분석 내용</h5>
                  <p className="font-korean-pixel text-gray-600 whitespace-pre-line">{selectedProblem.analysis}</p>
                </div>
                <div>
                  <h5 className="font-korean-pixel text-gray-800 mb-2">💡 취약점</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProblem.weakPoints.map((point, index) => (
                      <li key={index} className="font-korean-pixel text-gray-600">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-korean-pixel text-gray-800 mb-2">✨ 추천 학습</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedProblem.recommendations.map((rec, index) => (
                      <li key={index} className="font-korean-pixel text-gray-600">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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