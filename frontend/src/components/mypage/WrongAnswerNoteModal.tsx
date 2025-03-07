import React, { useState } from "react";

interface Problem {
  id: number;
  title: string;
  correctRate?: number;
  keywords?: string[];
}

interface ProblemDetail {
  id: number;
  title: string;
  correctRate: number;
  keywords?: string[];
}

interface WrongAnswers {
  [category: string]: Problem[];
}

interface WrongAnswerNoteModalProps {
  onClose: () => void;
  userData: {
    categories: {
      id: number;
      name: string;
      image: string;
    }[];
    wrongAnswers: WrongAnswers;
    profileImage: string;
  };
}

const WrongAnswerNoteModal: React.FC<WrongAnswerNoteModalProps> = ({ onClose, userData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedProblem(null);
  };

  // 카테고리 선택 취소 핸들러
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedProblem(null);
  };

  // 문제 선택 핸들러
  const handleProblemSelect = (problem: any) => {
    setSelectedProblem(problem);
  };

  // 문제 선택 취소 핸들러
  const handleBackToProblems = () => {
    setSelectedProblem(null);
  };

  // 카테고리별 색상 가져오기
  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      투자: "from-pink-200 to-pink-300",
      금융: "from-blue-200 to-blue-300",
      정책: "from-green-200 to-green-300",
      범죄: "from-purple-200 to-purple-300",
      상품: "from-yellow-300 to-yellow-400",
      기본: "from-gray-200 to-gray-300",
    };

    return colorMap[categoryName] || "from-form-color to-button-color";
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white/95 rounded-2xl shadow-2xl w-[1100px] p-10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* 제목 부분 */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-form-color to-button-color py-5 rounded-t-2xl text-center shadow-md">
          {/* 뒤로가기 버튼 */}
          {(selectedCategory || selectedProblem) && (
            <button
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              onClick={selectedProblem ? handleBackToProblems : handleBackToCategories}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <h2 className="text-2xl font-bold font-korean-pixel text-gray-800">
            {selectedProblem ? `${selectedCategory} - ${selectedProblem.title}` : selectedCategory ? selectedCategory : "오답 노트"}
          </h2>

          {/* 닫기 버튼 */}
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors duration-200" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 부분 */}
        <div className="mt-20 mb-8">
          {selectedProblem ? (
            // 선택된 문제 상세 정보
            <div className="px-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* 왼쪽 - 고양이 이미지와 메시지 */}
                <div className="w-full md:w-1/3">
                  <div className="bg-character-section-bg rounded-2xl p-8 shadow-md mb-6">
                    <div className="flex items-start mb-8">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-gray-200 mr-4">
                        <img src={userData.profileImage} alt="고양이" className="w-full h-full object-cover" />
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm relative">
                        <p className="text-gray-700 text-base font-korean-pixel">냥냥이가 오답을 분석했다냥</p>
                        <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                      </div>
                    </div>

                    {/* 정답률 파이 차트 */}
                    <div className="relative w-56 h-56 mx-auto">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="20" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="url(#gradient)"
                            strokeWidth="20"
                            strokeDasharray={`${selectedProblem.correctRate * 2.51} 251`}
                            transform="rotate(-90 50 50)"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#FAD0C4" />
                              <stop offset="100%" stopColor="#FFB6B9" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-gray-700 text-base font-medium font-korean-pixel">정답률</p>
                          <p className="text-3xl font-bold text-gray-800 font-korean-pixel">{selectedProblem.correctRate}%</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-base mt-6 text-center font-korean-pixel">이 문제의 평균 정답률이다냥</p>
                  </div>
                </div>

                {/* 오른쪽 - 문제 상세 정보 */}
                <div className="w-full md:w-2/3 bg-character-stats-bg rounded-2xl p-8 shadow-md relative overflow-hidden">
                  <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center font-korean-pixel">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    문제의 핵심 포인트다냥
                  </h3>

                  <div className="mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h4 className="text-primary text-lg font-medium mb-4 font-korean-pixel">키워드</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedProblem.keywords?.map((keyword, index) => (
                          <span key={index} className="px-4 py-2 bg-form-color text-gray-700 text-sm rounded-full shadow-sm font-korean-pixel">
                            {keyword}
                          </span>
                        )) || <span className="px-4 py-2 bg-form-color text-gray-700 text-sm rounded-full shadow-sm font-korean-pixel">FT 분석 내용 어쩌구</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-gradient-to-r from-form-color/70 to-button-color/70 p-6 rounded-xl shadow-sm">
                      <p className="text-gray-700 text-lg font-korean-pixel">이 문제의 핵심은 금융 용어를 정확히 이해하는 것이다냥!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedCategory ? (
            // 선택된 카테고리의 문제 목록
            <div className="px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCategory &&
                  userData.wrongAnswers[selectedCategory]?.map((problem: any) => (
                    <button
                      key={problem.id}
                      className="bg-character-grid-bg py-6 px-8 rounded-xl shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all duration-200 text-left group"
                      onClick={() => handleProblemSelect(problem)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium group-hover:text-primary transition-colors duration-300 font-korean-pixel">{problem.title}</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {problem.correctRate && (
                        <div className="mt-4 flex items-center">
                          <div className="w-full h-2 bg-gray-200 rounded-full">
                            <div className="h-full rounded-full bg-gradient-to-r from-form-color to-button-color" style={{ width: `${problem.correctRate}%` }}></div>
                          </div>
                          <span className="ml-3 text-gray-500 text-sm font-korean-pixel">{problem.correctRate}%</span>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            // 카테고리 선택 화면
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
              {userData.categories.map((category) => {
                const categoryColor = getCategoryColor(category.name);
                const problemCount = userData.wrongAnswers[category.name]?.length || 0;

                return (
                  <div
                    key={category.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    <div className="h-64 rounded-t-xl overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-5 bg-character-grid-bg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">{category.name}</h3>
                        <div className="flex items-center">
                          <span className="text-base text-gray-600 font-korean-pixel mr-2">{problemCount}개의 오답</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors duration-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrongAnswerNoteModal;
