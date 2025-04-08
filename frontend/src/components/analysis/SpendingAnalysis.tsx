import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useSpendingAnalysis } from "../../hooks/useSpendingAnalysis";
import { CATEGORY_COLORS, CATEGORY_NAMES, SpendingCategory } from "../../types/analysis/SpendingAnalysis";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingAnalysisProps {
  className?: string;
}

const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({ className = "" }) => {
  const { data, loading, error, fetchAnalysis } = useSpendingAnalysis();
  const [analysisFilter, setAnalysisFilter] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
  });
  const [showType, setShowType] = useState<"expense" | "income">("expense");

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const handleFilterChange = (name: string, value: string) => {
    // 월 입력값 검증 및 보정
    if (name === "month") {
      const monthNum = parseInt(value);
      if (monthNum < 1) value = "01";
      if (monthNum > 12) value = "12";
      value = value.padStart(2, "0");
    }

    setAnalysisFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 연월 변경 시 자동으로 분석 데이터 조회
  useEffect(() => {
    fetchAnalysis(parseInt(analysisFilter.year), parseInt(analysisFilter.month));
  }, [analysisFilter.year, analysisFilter.month]);

  const renderDateSelector = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => {
          const prevMonth = parseInt(analysisFilter.month) - 1;
          const prevYear = parseInt(analysisFilter.year);
          if (prevMonth < 1) {
            handleFilterChange("year", (prevYear - 1).toString());
            handleFilterChange("month", "12");
          } else {
            handleFilterChange("month", prevMonth.toString().padStart(2, "0"));
          }
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-all"
      >
        ←
      </button>
      <div className="flex items-center space-x-2">
        <select
          value={analysisFilter.year}
          onChange={(e) => handleFilterChange("year", e.target.value)}
          className="px-2 py-1 border rounded-lg font-korean-pixel text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
        <select
          value={analysisFilter.month}
          onChange={(e) => handleFilterChange("month", e.target.value)}
          className="px-2 py-1 border rounded-lg font-korean-pixel text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month.toString().padStart(2, "0")}>
              {month}월
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={() => {
          const nextMonth = parseInt(analysisFilter.month) + 1;
          const nextYear = parseInt(analysisFilter.year);
          if (nextMonth > 12) {
            handleFilterChange("year", (nextYear + 1).toString());
            handleFilterChange("month", "01");
          } else {
            handleFilterChange("month", nextMonth.toString().padStart(2, "0"));
          }
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-all"
      >
        →
      </button>
    </div>
  );

  // 총 지출액과 수입액 계산
  const { totalExpense, totalIncome, expenseCategories, incomeCategories } = React.useMemo(() => {
    if (!data) return { totalExpense: 0, totalIncome: 0, expenseCategories: [], incomeCategories: [] };

    const expenses: [SpendingCategory, number][] = [];
    const incomes: [SpendingCategory, number][] = [];
    let totalExp = 0;
    let totalInc = 0;

    Object.entries(data).forEach(([category, amount]) => {
      if (!amount || amount === 0) return;

      if (category === "INCOME") {
        totalInc += amount;
        incomes.push([category as SpendingCategory, amount]);
      } else {
        totalExp += amount;
        expenses.push([category as SpendingCategory, amount]);
      }
    });

    return {
      totalExpense: totalExp,
      totalIncome: totalInc,
      expenseCategories: expenses,
      incomeCategories: incomes,
    };
  }, [data]);

  // 현재 선택된 타입에 따른 데이터
  const currentTotal = showType === "expense" ? totalExpense : totalIncome;
  const currentCategories = showType === "expense" ? expenseCategories : incomeCategories;

  // 분석할 데이터가 없는 경우
  if (!data || (totalExpense === 0 && totalIncome === 0)) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💰 소비/수입 분석</h3>
          {renderDateSelector()}
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 font-korean-pixel">
          <p>
            선택하신 {analysisFilter.year}년 {parseInt(analysisFilter.month)}월에는
          </p>
          <p>분석할 내역이 없어요 😅</p>
        </div>
      </div>
    );
  }

  const pieChartData = {
    labels: currentCategories.map(([category]) => CATEGORY_NAMES[category] || "수입"),
    datasets: [
      {
        data: currentCategories.map(([_, amount]) => amount),
        backgroundColor: currentCategories.map(([category]) => CATEGORY_COLORS[category] || "#34D399"),
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
            const percentage = ((value / currentTotal) * 100).toFixed(1);
            return `${context.label}: ${formatAmount(value)}원 (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    radius: "90%",
    maintainAspectRatio: false,
  };

  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💰 소비/수입 분석</h3>
        {renderDateSelector()}
      </div>

      {/* 타입 선택 버튼 */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setShowType("expense")}
          className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${showType === "expense" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          지출 분석
        </button>
        <button
          onClick={() => setShowType("income")}
          className={`px-4 py-2 rounded-lg font-korean-pixel transition-colors ${showType === "income" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          수입 분석
        </button>
      </div>

      <div className="flex flex-col">
        {/* 파이 차트와 카테고리 목록 */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* 파이 차트 */}
          <div className="relative w-full md:w-1/2 h-[300px]">
            <Pie data={pieChartData} options={pieChartOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-sm text-gray-600 font-korean-pixel">{showType === "expense" ? "총 지출" : "총 수입"}</div>
                <div className="text-xl font-bold text-gray-800 font-korean-pixel">{formatAmount(currentTotal)}원</div>
              </div>
            </div>
          </div>

          {/* 카테고리 목록 */}
          <div className="w-full md:w-1/2">
            {currentCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] || "#34D399" }} />
                  <span className="font-korean-pixel text-gray-700">{CATEGORY_NAMES[category] || "수입"}</span>
                </div>
                <div className="text-right">
                  <div className="font-korean-pixel text-gray-800">{formatAmount(amount)}원</div>
                  <div className="text-sm font-korean-pixel text-gray-500">{((amount / currentTotal) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 총계 요약 */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-gray-600 font-korean-pixel">이번 달 총 지출</div>
            <div className="text-lg font-bold text-red-600 font-korean-pixel">{formatAmount(totalExpense)}원</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600 font-korean-pixel">이번 달 총 수입</div>
            <div className="text-lg font-bold text-blue-600 font-korean-pixel">{formatAmount(totalIncome)}원</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysis;
