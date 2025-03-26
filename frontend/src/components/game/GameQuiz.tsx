import { useState, useEffect, useRef } from "react";
import { CharacterType } from "../game/constants/animations";
import CharacterAnimation from "./CharacterAnimation";

interface GameQuizProps {
  timeLeft: number;
  isTimeUp: boolean;
  onShowResults: () => void;
  playerCat: CharacterType;
  opponentCat: CharacterType;
  // quiz: string;
  // answer: string;
}

const GameQuiz = ({ timeLeft, isTimeUp, onShowResults, playerCat, opponentCat, quiz, answer }: GameQuizProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const mountedRef = useRef<boolean>(true);

  // 컴포넌트 마운트/언마운트 관리
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  return (
    <div className="w-full h-full relative">      
      <div className="w-[95%] relative z-10 md:w-[85%] lg:w-[80%] mx-auto pb-8">
        <div className="w-full py-4 text-center">
          <h1 className="text-[1.75rem] font-bold text-white shadow-md bg-black bg-opacity-30 inline-block px-6 py-1 rounded-2xl">
            남은시간 : {String(timeLeft).padStart(2, "0")}초
          </h1>
        </div>

        <div className="w-full flex flex-col items-center">
          {/* 고양이 대결 영역 - 고양이를 지면에 배치 */}
          <div className="w-full flex justify-between items-end mb-4">
            {/* 플레이어 고양이 (왼쪽) - 배경과 어울리는 그림자 추가 */}
            <div className="relative">
              {/* 고양이 그림자 */}
              <div className="pb-4 pl-4">
                <CharacterAnimation state={'idle'} direction={true} scale={3} size="large" />
              </div>
            </div>

            {/* 중앙 VS 텍스트 */}
            <div className="flex-grow flex justify-center items-center mb-16">
              <div className="bg-transparent px-6 py-3 rounded-full border-4 border-white text-white font-extrabold text-2xl">
                VS
              </div>
            </div>
            
            {/* 상대방 고양이 (오른쪽 끝) - 배경과 어울리는 그림자 추가 */}
            <div className="relative">
              <div className="pb-4 pr-4">
                <CharacterAnimation state={'idle'} direction={false} scale={3} size="large" />
              </div>
            </div>
          </div>

          {/* 퀴즈 내용 영역 */}
          <div className="w-full flex mt-4 overflow-hidden shadow-md bg-[#f8f5ff] bg-opacity-80 border-2 border-purple-300 rounded-2xl shadow-xl min-h-[200px]">
            {/* 문제 박스 */}
            <div className="w-[60%] flex items-center justify-start border-r-2 border-purple-300 p-7 bg-[#ffffff] bg-opacity-75">
              <p className="text-xl text-[#333333] leading-relaxed font-medium drop-shadow-sm text-left">
                {quiz || "1만원씩 12개월을 저축했을 때 모을 수 있는 돈은 몇 원일까요?"}
              </p>
            </div>

            {/* 선택지 영역 - 추후 socket 연결 후 수정 */}
            <div className="w-[40%] flex flex-col bg-[#f0e9ff] bg-opacity-75">
              <div className="flex flex-1 border-b border-purple-200">
                <button 
                  type="button" 
                  onClick={() => handleOptionSelect(0)} 
                  className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 border-r border-purple-200 pl-5 text-left hover:bg-purple-100 hover:bg-opacity-60 transition-colors ${selectedOption === 0 ? 'bg-purple-200 bg-opacity-70 font-semibold' : ''}`}
                >
                  1. 1000원
                </button>
                <button 
                  type="button" 
                  onClick={() => handleOptionSelect(1)} 
                  className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 pl-5 text-left hover:bg-purple-100 hover:bg-opacity-60 transition-colors ${selectedOption === 1 ? 'bg-purple-200 bg-opacity-70 font-semibold' : ''}`}
                >
                  2. 1만원
                </button>
              </div>
              <div className="flex flex-1">
                <button 
                  type="button" 
                  onClick={() => handleOptionSelect(2)} 
                  className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 border-r border-purple-200 pl-5 text-left hover:bg-purple-100 transition-colors ${selectedOption === 2 ? 'bg-purple-200 font-semibold' : ''}`}
                >
                  3. 10만원
                </button>
                <button 
                  type="button" 
                  onClick={() => handleOptionSelect(3)} 
                  className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 pl-5 text-left hover:bg-purple-100 transition-colors ${selectedOption === 3 ? 'bg-purple-200 font-semibold' : ''}`}
                >
                  4. 1000만원
                </button>
              </div>
            </div>
          </div>

          {/* 결과 버튼 */}
          {isTimeUp && (
            <div className="w-full flex justify-end mt-5 mb-5">
              <button 
                onClick={onShowResults} 
                className="bg-primary text-white px-8 py-3 rounded-lg flex items-center cursor-pointer hover:bg-primary shadow-lg text-[1.1rem] font-semibold transition-all duration-300 hover:-translate-y-[3px]"
                style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)' }}
              >
                결과 확인하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameQuiz;