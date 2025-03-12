import React from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";

const AiQuizPage: React.FC = () => {
  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full min-h-screen py-8 px-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-8 mb-24">
            <h1 className="text-3xl font-bold text-gray-800 font-korean-pixel mb-8">🤖 AI 맞춤형 금융 퀴즈</h1>

            <div className="space-y-8">
              {/* 퀴즈 설명 섹션 */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold text-gray-800 font-korean-pixel mb-4">소비패턴 기반 맞춤형 학습</h2>
                <p className="text-gray-700 font-korean-pixel">회원님의 소비패턴을 분석하여 가장 필요한 금융 지식을 학습할 수 있도록 맞춤형 문제를 제공합니다.</p>
              </div>

              {/* 퀴즈 시작 섹션 */}
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel mb-4">준비되셨나요?</h3>
                <p className="text-gray-600 font-korean-pixel mb-8">총 10문제가 출제되며, 약 15분이 소요됩니다.</p>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-korean-pixel text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  퀴즈 시작하기
                </button>
              </div>

              {/* 학습 가이드 */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 font-korean-pixel mb-3">💡 맞춤형 학습</h4>
                  <p className="text-gray-600 font-korean-pixel">소비패턴 분석을 통해 필요한 금융 지식을 집중적으로 학습합니다.</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 font-korean-pixel mb-3">📊 실시간 피드백</h4>
                  <p className="text-gray-600 font-korean-pixel">문제 풀이 후 즉각적인 해설과 피드백을 제공합니다.</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 font-korean-pixel mb-3">🎯 취약점 분석</h4>
                  <p className="text-gray-600 font-korean-pixel">취약한 부분을 파악하고 집중 학습을 추천합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default AiQuizPage;
