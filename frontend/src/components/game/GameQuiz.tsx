import { useState, useEffect, useRef } from "react";
import { CharacterType } from "../game/constants/animations";
import CharacterAnimation from "./CharacterAnimation";

interface GameQuizProps {
  timeLeft: number;
  isTimeUp: boolean;
  onShowResults: () => void;
  playerCat: CharacterType;
  opponentCat: CharacterType;
}

const GameQuiz = ({ timeLeft, isTimeUp, onShowResults, playerCat, opponentCat }: GameQuizProps) => {
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
    <div className="w-[95%] relative z-10 md:w-[85%] lg:w-[80%] mx-auto pb-8">
      <div className="w-full py-4 text-center">
        <h1 className="text-[1.75rem] font-bold text-white shadow-md bg-black bg-opacity-30 inline-block px-6 py-1 rounded-2xl">
          남은시간 : {String(timeLeft).padStart(2, "0")}초
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        {/* 고양이 대결 영역 */}
        <div className="w-full flex justify-between items-center my-4 bg-white rounded-lg shadow-lg p-4 overflow-hidden relative border-2 border-primary border-opacity-30 shadow-lg" style={{ height: '252px' }}>
          {/* 플레이어 고양이 (왼쪽) */}
          <div className="flex items-center justify-start pl-4">
            <CharacterAnimation state={'idle'} direction={true} scale={3} size="large" />
          </div>
          
          {/* 중앙 VS 텍스트 */}
          <div className="flex-grow flex justify-center items-center">
            <div className="bg-red-100 px-6 py-3 rounded-full border-2 border-red-300 text-red-800 font-bold text-xl">
              VS
            </div>
          </div>
          
          {/* 상대방 고양이 (오른쪽 끝) */}
          <div className="flex items-center justify-end pr-4">
            <CharacterAnimation state={'idle'} direction={false} scale={3} size="large" />
          </div>
        </div>

        {/* 퀴즈 내용 영역 */}
        <div className="w-full flex mt-4 overflow-hidden shadow-md bg-[#3B3243] border-2 border-red rounded-2xl shadow-xl min-h-[200px]">
          {/* 문제 박스 */}
          <div className="w-3/5 flex items-center border-r-2 border-red p-7 bg-[#2b2534]">
            <p className="text-xl text-[#f8f8f8] leading-relaxed font-medium drop-shadow-sm">
              지난달, 당신은 얼마나 저축했을까요? 당신의 재정 건강 상태를 확인할 시간입니다. 아래의 선택지 중에서 지난달 당신이 저축한 금액과 가장 가까운 답을 골라보세요
            </p>
          </div>

          {/* 선택지 영역 */}
          <div className="w-2/5 flex flex-col bg-[#352d49]">
            <div className="flex flex-1 border-b border-red-300 border-opacity-30">
              <button 
                type="button" 
                onClick={() => handleOptionSelect(0)} 
                className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-white border-r border-red-300 border-opacity-30 pl-5 text-left hover:bg-white hover:bg-opacity-15 transition-colors ${selectedOption === 0 ? 'bg-primary bg-opacity-30 font-semibold' : ''}`}
              >
                1. 1000원
              </button>
              <button 
                type="button" 
                onClick={() => handleOptionSelect(1)} 
                className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-white pl-5 text-left hover:bg-white hover:bg-opacity-15 transition-colors ${selectedOption === 1 ? 'bg-primary bg-opacity-30 font-semibold' : ''}`}
              >
                2. 1만원
              </button>
            </div>
            <div className="flex flex-1">
              <button 
                type="button" 
                onClick={() => handleOptionSelect(2)} 
                className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-white border-r border-red-300 border-opacity-30 pl-5 text-left hover:bg-white hover:bg-opacity-15 transition-colors ${selectedOption === 2 ? 'bg-primary bg-opacity-30 font-semibold' : ''}`}
              >
                3. 10만원
              </button>
              <button 
                type="button" 
                onClick={() => handleOptionSelect(3)} 
                className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-white pl-5 text-left hover:bg-white hover:bg-opacity-15 transition-colors ${selectedOption === 3 ? 'bg-primary bg-opacity-30 font-semibold' : ''}`}
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
  );
};

export default GameQuiz;