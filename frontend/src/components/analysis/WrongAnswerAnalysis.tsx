import React, { useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend, ChartOptions, Scale, CoreScaleOptions } from "chart.js";
import { useAnalyze } from "../../hooks/useAnalyze";
import { Problem, Category, AnalysisProps } from "../../types/analysis/Problem";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ArcElement, Tooltip, Legend);

const WrongAnswerAnalysis: React.FC<AnalysisProps> = ({ categories, onStartGame, onDetailView }) => {
  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<number>(categories[0]?.id);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [analyzingProblemId, setAnalyzingProblemId] = useState<number | null>(null);

  // 분석 훅 사용
  const { analyzeWrongAnswer, loading, error } = useAnalyze();

  // 현재 선택된 카테고리
  const currentCategory = categories.find((cat) => cat.id === selectedCategory);
  const hasProblems = currentCategory?.problems && currentCategory.problems.length > 0;

  // 문제 선택 및 분석 핸들러
  const handleProblemSelect = async (problem: Problem) => {
    setSelectedProblem(problem);
    setAnalyzingProblemId(problem.id);

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
    } finally {
      setAnalyzingProblemId(null);
    }
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

  // 문제 목록 렌더링
  const renderProblemList = () => (
    <div className="space-y-3">
      {currentCategory?.problems.map((problem) => (
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
    </div>
  );

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">📝 오답노트 분석</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
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
      </div>

      {!hasProblems ? (
        renderNoDataSection()
      ) : (
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
      )}
    </div>
  );
};

export default WrongAnswerAnalysis;
