import React from 'react';
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

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ problem }) => {
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

export default AnalysisCharts;