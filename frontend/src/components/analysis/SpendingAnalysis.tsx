import React from "react";

interface SpendingCategory {
  name: string;
  percentage: number;
  color: string;
}

interface SpendingAnalysisProps {
  onDetailView: () => void;
  categories: SpendingCategory[];
  monthlyTrend: {
    category: string;
    percentage: number;
    reason: string;
  };
}

const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({ onDetailView, categories, monthlyTrend }) => {
  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📊 소비패턴 분석</h3>
        <button onClick={onDetailView} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300">
          자세히 보기
        </button>
      </div>
      <div className="space-y-6">
        {/* 소비 카테고리 차트 */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-korean-pixel text-lg font-bold mb-4">주요 소비 카테고리</h4>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center">
                <div className="w-32 font-korean-pixel">{category.name}</div>
                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${category.color} rounded-full`} style={{ width: `${category.percentage}%` }}></div>
                </div>
                <div className="w-16 text-right font-korean-pixel">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
        {/* 소비 트렌드 */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h4 className="font-korean-pixel text-lg font-bold mb-4">이번 달 소비 트렌드</h4>
          <p className="text-gray-700 font-korean-pixel mb-2">
            전월 대비 {monthlyTrend.category}가 <span className="text-red-500 font-bold">{monthlyTrend.percentage}% 증가</span>했어요.
          </p>
          <p className="text-gray-700 font-korean-pixel">{monthlyTrend.reason}</p>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysis;
