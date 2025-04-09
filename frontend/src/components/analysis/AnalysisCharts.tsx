import React, { useEffect, useState } from 'react';
import { Doughnut, Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  ArcElement, 
  Tooltip, 
  Legend,
  ChartOptions, 
  Scale, 
  CoreScaleOptions 
} from "chart.js";
import { Problem } from '../../types/analysis/Problem';
import { useApi } from '../../hooks/useApi';

// Chart.js에 필요한 컴포넌트들을 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

interface AnalysisChartsProps {
  problem: Problem;
}

interface QuizLogItem {
  quizLogId: number;
  memberId: number;
  userAnswer: string;
  isCorrect: boolean;
  createdAt: string;
}

interface QuizLogsResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: QuizLogItem[];
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ problem }) => {
  const [allUserStats, setAllUserStats] = useState({
    correctRate: 0,
    wrongRate: 100
  });
  const [loading, setLoading] = useState(false);
  
  const { execute: fetchQuizLogs } = useApi<QuizLogsResponse>('', 'GET');

  // 전체 유저 퀴즈 로그 가져오기
  useEffect(() => {
    const getQuizLogs = async () => {
      if (!problem.id) return;
      
      setLoading(true);
      try {
        const response = await fetchQuizLogs(undefined, {
          url: `/api/quiz/logs/${problem.id}`
        });

        if (response.isSuccess && Array.isArray(response.result)) {
          const logs = response.result;
          
          // 모든 시도 횟수
          const totalAttempts = logs.length;
          
          // 정답 시도 횟수
          const correctAttempts = logs.filter(log => log.isCorrect).length;
          
          // 정답률과 오답률 계산
          const correctRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
          const wrongRate = 100 - correctRate;
          
          setAllUserStats({
            correctRate,
            wrongRate
          });
        }
      } catch (error) {
        console.error("퀴즈 로그 조회 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    getQuizLogs();
  }, [problem.id, fetchQuizLogs]);

  // 도넛 차트 데이터 (전체 유저 정답률)
  const doughnutData = {
    labels: ["정답", "오답"],
    datasets: [
      {
        data: [allUserStats.correctRate, allUserStats.wrongRate],
        backgroundColor: ["#4CAF50", "#FF5252"],
        borderWidth: 0,
      },
    ],
  };

  // 히스토리 데이터
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
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Doughnut data={doughnutData} options={{ cutout: "70%" }} />
            )}
          </div>
          <div className="text-center mt-4">
            <span className="font-korean-pixel text-2xl font-bold text-blue-600">{allUserStats.correctRate.toFixed(1)}%</span>
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

export default AnalysisCharts;