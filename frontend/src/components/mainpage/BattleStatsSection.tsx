import React from "react";

interface CategoryStat {
  name: string;
  percentage: number;
  color: string;
}

interface BattleStatsSectionProps {
  categoryStats: CategoryStat[];
}

const BattleStatsSection: React.FC<BattleStatsSectionProps> = ({ categoryStats }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        AI 배틀 현황
      </h3>
      <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 shadow-md border border-gray-100 h-[200px] flex flex-col">
        <div className="flex-1 flex items-end justify-around">
          {categoryStats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-12 bg-gradient-to-t ${stat.color} rounded-t-lg shadow-md`} style={{ height: `${stat.percentage}%` }}></div>
              <span className="text-xs mt-2 text-gray-600 font-medium">{stat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BattleStatsSection;
