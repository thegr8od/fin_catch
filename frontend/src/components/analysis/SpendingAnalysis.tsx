import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Category {
  name: string;
  amount: number;
  color: string;
}

interface MonthlyTrend {
  category: string;
  previousMonth: number;
  currentMonth: number;
}

interface SpendingAnalysisProps {
  className?: string;
}

const dummyCategories: Category[] = [
  { name: "식비", amount: 350000, color: "#4F46E5" },
  { name: "쇼핑", amount: 250000, color: "#7C3AED" },
  { name: "교통", amount: 120000, color: "#10B981" },
  { name: "문화/여가", amount: 180000, color: "#F59E0B" },
  { name: "기타", amount: 100000, color: "#6B7280" },
];

const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({ className = "" }) => {
  const totalSpending = useMemo(() => {
    return dummyCategories.reduce((sum, category) => sum + category.amount, 0);
  }, []);

  const pieChartData = {
    labels: dummyCategories.map((cat) => cat.name),
    datasets: [
      {
        data: dummyCategories.map((cat) => cat.amount),
        backgroundColor: dummyCategories.map((cat) => cat.color),
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / totalSpending) * 100).toFixed(1);
            return `${context.label}: ${new Intl.NumberFormat("ko-KR").format(value)}원 (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    radius: "90%",
    maintainAspectRatio: false,
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 font-korean-pixel mb-6">💰 소비패턴 분석</h3>

      <div className="flex flex-col">
        {/* 파이 차트와 카테고리 목록 */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 파이 차트 */}
          <div className="relative w-full md:w-1/2 h-[300px]">
            <Pie data={pieChartData} options={pieChartOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-sm text-gray-600 font-korean-pixel">총 지출</div>
                <div className="text-xl font-bold text-gray-800 font-korean-pixel">{formatAmount(totalSpending)}원</div>
              </div>
            </div>
          </div>

          {/* 카테고리 목록 */}
          <div className="w-full md:w-1/2">
            {dummyCategories.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="font-korean-pixel text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-korean-pixel text-gray-800">{formatAmount(category.amount)}원</div>
                  <div className="text-sm font-korean-pixel text-gray-500">{((category.amount / totalSpending) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이번 달 소비 트렌드 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            {dummyCategories.slice(0, 3).map((category, index) => {
              const prevAmount = index === 0 ? 320000 : index === 1 ? 200000 : 150000;
              const diff = ((category.amount - prevAmount) / prevAmount) * 100;
              const isIncrease = diff > 0;

              return (
                <div key={category.name} className="flex-1 p-3 bg-gray-50 rounded-lg mx-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-korean-pixel text-gray-700">{category.name}</span>
                    <span className={`font-korean-pixel ${isIncrease ? "text-red-500" : "text-green-500"}`}>
                      {isIncrease ? "+" : ""}
                      {diff.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm font-korean-pixel text-gray-600">
                    {formatAmount(category.amount)}원<span className="text-gray-400 ml-2">(전월 {formatAmount(prevAmount)}원)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysis;
