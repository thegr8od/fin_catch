import { useEffect, useRef } from "react";
import { CharacterType } from "../game/constants/animations";
import CharacterAnimation from "./CharacterAnimation";

interface GameQuizProps {
  timeLeft: number;
  isTimeUp: boolean;
  onShowResults: () => void;
  playerCat?: CharacterType;
  opponentCat?: CharacterType;
  quiz: string;
  // answer prop 제거
  selectedOption: number | null;
  onOptionSelect: (index: number) => void;
  options: string[];
}

const GameQuiz = ({ 
  timeLeft, 
  isTimeUp, 
  onShowResults, 
  // playerCat, opponentCat, answer은 사용되지 않음
  quiz, 
  selectedOption,
  onOptionSelect,
  options = []
}: GameQuizProps) => {
  const mountedRef = useRef<boolean>(true);

  // 컴포넌트 마운트/언마운트 관리
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div className="w-[95%] relative z-10 md:w-[85%] lg:w-[80%] mx-auto pb-8">
        <div className="w-full py-4 text-center">
          <h1 className="text-[1.75rem] font-bold text-white shadow-md bg-black bg-opacity-30 inline-block px-6 py-1 rounded-2xl">남은시간 : {String(timeLeft).padStart(2, "0")}초</h1>
        </div>

        <div className="w-full flex flex-col items-center">
          {/* 고양이 대결 영역 - 고양이를 지면에 배치 */}
          <div className="w-full flex justify-between items-end mb-4">
            {/* 플레이어 고양이 (왼쪽) - 발판에 P1 표시 추가 */}
            <div className="relative flex flex-col items-center">              
              {/* 고양이 캐릭터 */}
              <div className="relative">
                <CharacterAnimation state={"idle"} direction={true} scale={3} size="large" />
                
                {/* 원형 발판 (P1 표시 포함) */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-lg border-[3px] border-white -z-10">
                  <span className="text-white font-bold text-sm z-10">P1</span>
                </div>
              </div>
            </div>

            {/* 중앙 VS 텍스트 */}
            <div className="flex-grow flex justify-center items-center mb-16">
              <div className="bg-transparent px-6 py-3 rounded-full border-4 border-white text-white font-extrabold text-2xl shadow-lg">VS</div>
            </div>

            {/* 상대방 고양이 (오른쪽 끝) - 발판에 P2 표시 추가 */}
            <div className="relative flex flex-col items-center">
              
              {/* 고양이 캐릭터 */}
              <div className="relative">
                <CharacterAnimation state={"idle"} direction={false} scale={3} size="large" />
                
                {/* 원형 발판 (P2 표시 포함) */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 flex items-center justify-center bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-lg border-[3px] border-white -z-10">
                  <span className="text-white font-bold text-sm z-10">P2</span>
                </div>
              </div>
            </div>
          </div>

          {/* 퀴즈 내용 영역 - shadow-md와 shadow-xl의 충돌 해결 */}
          <div className="w-full flex mt-4 overflow-hidden shadow-xl bg-[#f8f5ff] bg-opacity-80 border-2 border-purple-300 rounded-2xl min-h-[200px]">
            {/* 문제 박스 */}
            <div className="w-[60%] flex items-center justify-start border-r-2 border-purple-300 p-7 bg-[#ffffff] bg-opacity-75">
              <p className="text-xl text-[#333333] leading-relaxed font-medium drop-shadow-sm text-left">{quiz || "퀴즈를 불러오는 중입니다..."}</p>
            </div>

            {/* 선택지 영역 */}
            <div className="w-[40%] flex flex-col bg-[#f0e9ff] bg-opacity-75">
              {options.length > 0 ? (
                <>
                  <div className="flex flex-1 border-b border-purple-200">
                    <button
                      type="button"
                      onClick={() => onOptionSelect(0)}
                      className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 border-r border-purple-200 pl-5 text-left hover:bg-purple-100 hover:bg-opacity-60 transition-colors ${
                        selectedOption === 0 ? "bg-purple-200 bg-opacity-70 font-semibold" : ""
                      }`}
                      disabled={isTimeUp}
                    >
                      1. {options[0] || ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOptionSelect(1)}
                      className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 pl-5 text-left hover:bg-purple-100 hover:bg-opacity-60 transition-colors ${
                        selectedOption === 1 ? "bg-purple-200 bg-opacity-70 font-semibold" : ""
                      }`}
                      disabled={isTimeUp}
                    >
                      2. {options[1] || ""}
                    </button>
                  </div>
                  <div className="flex flex-1">
                    <button
                      type="button"
                      onClick={() => onOptionSelect(2)}
                      className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 border-r border-purple-200 pl-5 text-left hover:bg-purple-100 transition-colors ${
                        selectedOption === 2 ? "bg-purple-200 font-semibold" : ""
                      }`}
                      disabled={isTimeUp}
                    >
                      3. {options[2] || ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOptionSelect(3)}
                      className={`w-1/2 h-full flex items-center font-medium text-[1.3rem] text-gray-700 pl-5 text-left hover:bg-purple-100 transition-colors ${
                        selectedOption === 3 ? "bg-purple-200 font-semibold" : ""
                      }`}
                      disabled={isTimeUp}
                    >
                      4. {options[3] || ""}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">선택지를 불러오는 중입니다...</p>
                </div>
              )}
            </div>
          </div>

          {/* 결과 버튼 */}
          {selectedOption !== null && (
            <div className="w-full flex justify-end mt-5 mb-5">
              <button
                onClick={onShowResults}
                className="bg-primary text-white px-8 py-3 rounded-lg flex items-center cursor-pointer hover:bg-primary shadow-lg text-[1.1rem] font-semibold transition-all duration-300 hover:-translate-y-[3px]"
                style={{ boxShadow: "0 4px 12px rgba(59, 130, 246, 0.5)" }}
              >
                정답 확인하기
              </button>
            </div>
          )}
          
          {/* 시간 초과 시 버튼 */}
          {isTimeUp && selectedOption === null && (
            <div className="w-full flex justify-end mt-5 mb-5">
              <button
                onClick={onShowResults}
                className="bg-red-500 text-white px-8 py-3 rounded-lg flex items-center cursor-pointer hover:bg-red-600 shadow-lg text-[1.1rem] font-semibold transition-all duration-300 hover:-translate-y-[3px]"
                style={{ boxShadow: "0 4px 12px rgba(239, 68, 68, 0.5)" }}
              >
                시간 초과! 다음 문제로
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameQuiz;