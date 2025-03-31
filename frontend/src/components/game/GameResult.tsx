import CoinImage from "../../assets/coin.png";
import WinCat from "../../assets/Wincat.gif";
import SadCat from "../../assets/sadcat.png";
import { useUserInfo } from "../../hooks/useUserInfo";
import { CharacterType } from "../game/constants/animations";

interface GameResultProps {
  type: "good" | "bad";
  score: number;
  onContinue: () => void;
}

const GameResult = ({ type, score, onContinue }: GameResultProps) => {
  const isGoodResult = type === "good";
  const { user } = useUserInfo();
  const userCat = user?.mainCat as unknown as CharacterType || "classic";

  return (
    <div className="w-[85.5%] relative z-10 md:w-[76.5%] lg:w-[72%] mx-auto pb-7">
      <div className="w-full py-4 text-center">
        <h1 className="text-[1.75rem] font-bold text-white shadow-md bg-black bg-opacity-30 inline-block px-6 py-1 rounded-2xl">
          분석 결과
        </h1>
      </div>

      <div className="w-[30%] mx-auto bg-white p-5 mt-4 border-2 border-primary border-opacity-40 rounded-2xl shadow-xl max-h-[72vh] overflow-y-auto lg:w-[45%] md:w-[60%] sm:w-[76.5%]">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <img 
              src={isGoodResult ? WinCat : SadCat} 
              alt={`${isGoodResult ? '좋은' : '나쁜'} 결과 캐릭터`} 
              className="w-36 h-36 mb-4 object-contain drop-shadow-lg" 
            />
          </div>

          <div className="mb-5 text-center w-full">
            <h2 className={`text-[1.6rem] font-bold mb-4 ${isGoodResult ? 'text-[#1e40af] animate-pulse' : 'text-[#991b1b]'} drop-shadow-sm`}>
              {isGoodResult ? "이런 점은 좋아요!!" : "이런 점은 아쉬워요"}
            </h2>
            {isGoodResult ? (
              <>
                <p className="text-[1.1rem] text-[#374151] mb-2 text-left pl-4">- 꾸준히 저축을 하고 있군요</p>
                <p className="text-[1.1rem] text-[#374151] mb-2 text-left pl-4">- 대중교통을 열심히 이용 하고 있어요</p>
              </>
            ) : (
              <>
                <p className="text-[1.1rem] text-[#374151] mb-2 text-left pl-4">- 편의점을 자주 이용하는군요</p>
                <p className="text-[1.1rem] text-[#374151] mb-2 text-left pl-4">- 신용카드 사용한도에 도달 직전이에요</p>
              </>
            )}
          </div>

          <div className="text-center bg-blue-50 p-4 w-full mb-4 rounded-xl border border-blue-200 border-opacity-80 shadow-sm">
            <p className="text-xl font-bold text-blue-600 mb-2">EXP + 100</p>
            <div className="flex items-center justify-center">
              <img src={CoinImage} alt="코인" className="w-8 h-8 mr-2 drop-shadow-sm" />
              <span className="text-xl font-bold text-amber-500">× {score}</span>
            </div>
          </div>

          <button 
            onClick={onContinue} 
            className="bg-primary text-white px-8 py-3 text-[1.1rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:bg-opacity-90 rounded-lg shadow-lg hover:-translate-y-1"
            style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
          >
            {isGoodResult ? "계속하기" : "메인으로"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;