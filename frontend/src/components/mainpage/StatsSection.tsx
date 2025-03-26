import React from "react";

interface StatsSectionProps {
  pvpStats: {
    wins: number;
    losses: number;
  };
  soloStats: {
    wins: number;
    losses: number;
  };
  onOpenWrongAnswerNote: () => void;
}

const StatsSection: React.FC<StatsSectionProps> = ({ pvpStats, soloStats, onOpenWrongAnswerNote }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        PVP 전적
      </h3>
      <div className="space-y-3">
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex justify-between items-center hover:shadow-lg transition-shadow duration-300">
          <span className="font-medium text-sm text-gray-800">1:1 대전</span>
          <span className="bg-white px-3 py-1 rounded-lg text-gray-700 text-sm font-medium border border-gray-200">
            <span className="text-green-600 font-korean-pixel">{pvpStats.wins}승</span> <span className="text-red-500 font-korean-pixel">{pvpStats.losses}패</span>
          </span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex justify-between items-center hover:shadow-lg transition-shadow duration-300">
          <span className="font-medium text-sm font-korean-pixel text-gray-800">다인 대전</span>
          <span className="bg-white px-3 py-1 rounded-lg text-gray-700 text-sm font-medium border border-gray-200">
            <span className="text-green-600">{soloStats.wins}승</span> <span className="text-red-500">{soloStats.losses}패</span>
          </span>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex justify-center items-center hover:shadow-lg transition-shadow duration-300">
          <button
            className="w-full font-korean-pixel text-center font-medium text-gray-700 hover:text-amber-600 transition-colors duration-200 py-1 flex items-center justify-center"
            onClick={onOpenWrongAnswerNote}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            오답 노트
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
