import React, { useState } from "react";

interface Problem {
  id: number;
  title: string;
  wrongCount: number;
  analysis: string;
}

interface Category {
  id: number;
  name: string;
  problems: Problem[];
}

interface AnalysisProps {
  onDetailView: () => void;
  categories: Category[];
}

const WrongAnswerAnalysis: React.FC<AnalysisProps> = ({ onDetailView, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(categories[0]?.id);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const currentCategory = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">📝 오답노트 분석</h3>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-6">
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
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 문제 목록 */}
        <div className="space-y-3">
          {currentCategory?.problems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => setSelectedProblem(problem)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedProblem?.id === problem.id ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"}`}
            >
              <h4 className="font-korean-pixel text-gray-800">{problem.title}</h4>
              <p className="text-sm text-red-500 font-korean-pixel mt-2">틀린 횟수: {problem.wrongCount}회</p>
            </div>
          ))}
        </div>

        {/* 분석 내용 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectedProblem ? (
            <div>
              <h4 className="font-korean-pixel text-lg text-gray-800 mb-4">{selectedProblem.title}</h4>
              <p className="font-korean-pixel text-gray-600 whitespace-pre-line">{selectedProblem.analysis}</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 font-korean-pixel">문제를 선택하면 분석 내용이 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrongAnswerAnalysis;
