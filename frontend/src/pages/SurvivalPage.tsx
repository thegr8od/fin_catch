import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Background from "../assets/survival.gif";
import CatGray from "../assets/AIcat2.png";
import CatWhite from "../assets/AIcat3.png";
import CoinImage from "../assets/coin.png";

interface Cat {
  id: number;
  name: string;
  image: string;
  points: number;
}

interface Message {
  type: string;
  text: string;
}

// 게임 상태를 관리하는 타입
type GameState = "subjective" | "objective" | "result";

const SurvivalPage = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<GameState>("subjective");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [cats, setCats] = useState<Cat[]>([
    { id: 1, name: "닉네임1", image: CatGray, points: 100 },
    { id: 2, name: "닉네임2", image: CatGray, points: 100 },
    { id: 3, name: "닉네임3", image: CatGray, points: 100 },
    { id: 4, name: "닉네임4", image: CatWhite, points: 100 },
    { id: 5, name: "닉네임5", image: CatWhite, points: 100 },
    { id: 6, name: "닉네임6", image: CatWhite, points: 100 },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { type: "system", text: "김땡년: 뭐하노 ㅋㅋ" },
    { type: "system", text: "김세현: 아 개어렵네 ㅋㅋ" },
  ]);
  const [newMessage, setNewMessage] = useState<string>("");

  // 결과 화면 단계를 관리 (0: 결과표, 1: 우승자, 2: 내 결과)
  const [resultStep, setResultStep] = useState<number>(0);

  // 내 캐릭터 정보 (닉네임3을 내 캐릭터로 가정)
  const myCharacter = cats[2]; // 닉네임3

  // 우승자 정보 (점수가 가장 높은 캐릭터)
  const [winner, setWinner] = useState<Cat | null>(null);

  // 내가 우승자인지 여부
  const [isWinner, setIsWinner] = useState<boolean>(false);

  // 획득한 경험치와 코인
  const [expGained, setExpGained] = useState<number>(0);
  const [coinsGained, setCoinsGained] = useState<number>(0);

  // 객관식 문제 선택지
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // 타이머 카운트다운 효과
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // 객관식 선택 핸들러 - 선택 시 색상 변경 확인
  const handleOptionSelect = (index: number) => {
    console.log(`Option clicked: ${index}`);

    // 선택된 옵션 상태 업데이트
    setSelectedOption(index);

    // 콘솔에 상태 변경 로그
    console.log(`Selected option changed to: ${index}`);
  };

  // 서술형 문제 종료 후 객관식 문제로 이동
  const goToObjectiveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeLeft(10);
    setIsTimeUp(false);
    setGameState("objective");
    setMessages([
      { type: "system", text: "김땡년: 객관식 문제 나왔다!" },
      { type: "system", text: "김세현: 이건 더 쉬울 것 같아~" },
    ]);
  };

  // 게임 종료 함수 - 결과 확인 버튼을 눌렀을 때 호출됨
  const showResults = () => {
    // 랜덤한 점수 부여 (실제로는 게임 로직에 맞게 조정)
    const updatedCats = cats.map((cat) => ({
      ...cat,
      points: Math.floor(Math.random() * 100) + 100,
    }));

    // 닉네임3에게 더 높은 점수 부여 (예시를 위해)
    updatedCats[2].points = 180;

    setCats(updatedCats);

    // 우승자 결정 (가장 높은 점수를 가진 사람)
    const highestScore = Math.max(...updatedCats.map((cat) => cat.points));
    const winnerCat = updatedCats.find((cat) => cat.points === highestScore) || updatedCats[0];
    setWinner(winnerCat);

    // 내가 우승자인지 확인 (닉네임3이 내 캐릭터라고 가정)
    const amIWinner = winnerCat.id === 3;
    setIsWinner(amIWinner);

    // 획득한 경험치와 코인 설정 (우승자는 더 많이 획득)
    setExpGained(amIWinner ? 100 : 50);
    setCoinsGained(amIWinner ? 500 : 100);

    // 결과 화면으로 전환
    setGameState("result");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages([...messages, { type: "user", text: `김태호(나) : ${newMessage}` }]);
    setNewMessage("");
  };

  // 다음 단계로 이동
  const goToNextStep = () => {
    if (resultStep === 0) {
      setResultStep(1); // 우승자 화면으로
    } else if (resultStep === 1 && !isWinner) {
      setResultStep(2); // 내가 우승자가 아니면 내 결과 화면으로
    } else {
      // 메인으로 이동
      navigate("/main");
    }
  };

  // 메인 페이지로 이동
  const goToMainPage = () => {
    navigate("/main");
  };

  // 1. 서술형 문제 화면
  const renderSubjectiveQuestionScreen = () => (
    <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full z-10 relative">
      <div className="w-full py-4 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-black bg-opacity-30 inline-block px-6 py-2 rounded-lg">
          {isTimeUp ? "시간이 종료되었습니다!" : `남은시간 : ${String(timeLeft).padStart(2, "0")}초`}
        </h1>
      </div>

      {/* 게임 정보 박스 */}
      <div className="w-10/12 mx-auto bg-white p-5 rounded-lg shadow-lg min-h-32 mt-4 border-2 border-blue-400">
        <p className="text-lg font-medium text-gray-800">
          당신이 100만원을 가지고 있고, 연간 5%의 복리로 투자할 수 있다고 가정해보세요. 이 돈을 10년 동안 투자했을 때, 최종적으로 얼마의 금액이 될지 계산하고, 이러한 복리 투자가 단리 투자와 비교했을
          때 어떤 장점이 있는지 설명해보세요.
        </p>
      </div>

      {/* 고양이 캐릭터 그리드 */}
      <div className="w-10/12 mx-auto bg-white p-3 grid grid-cols-3 sm:grid-cols-6 gap-3 overflow-visible min-h-[130px] sm:min-h-[160px] relative z-10 -mt-1 rounded-b-lg shadow-md border-x-2 border-b-2 border-blue-400">
        {cats.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center overflow-visible p-1 transition-transform hover:scale-105">
            <h3 className="text-xs font-medium mb-1 text-center">{cat.name}</h3>
            <div className="w-full h-full max-w-[85px] max-h-[85px] bg-blue-50 rounded-full p-1 shadow-sm overflow-hidden border border-blue-200">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-center text-sm font-semibold mt-1 bg-blue-100 px-2 py-1 rounded-full">{cat.points}</p>
          </div>
        ))}
      </div>

      {/* 채팅 섹션 (살구색 배경) */}
      <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 flex flex-col">
        {/* 채팅 메시지 영역 (흰색 배경) */}
        <div className="bg-white p-3 rounded h-[180px] overflow-y-auto mb-2">
          {messages.map((msg, index) => (
            <p key={index} className="mb-1">
              {msg.text}
            </p>
          ))}
        </div>

        {/* 채팅 입력 */}
        <form onSubmit={isTimeUp ? goToObjectiveQuestion : handleSendMessage} className="flex items-center gap-2 mt-2 z-10 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-grow border border-gray-300 p-2 rounded cursor-text"
            disabled={isTimeUp}
          />
          {isTimeUp ? (
            <button type="button" onClick={goToObjectiveQuestion} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded flex items-center cursor-pointer animate-pulse z-20 relative">
              다음 문제
            </button>
          ) : (
            <button type="submit" className="bg-yellow-200 hover:bg-yellow-300 px-6 py-3 rounded flex items-center cursor-pointer z-20 relative">
              전송
              <span role="img" aria-label="send" className="ml-1">
                🐤
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );

  // 2. 객관식 문제 화면 - 클릭 문제 완전 수정
  const renderObjectiveQuestionScreen = () => (
    <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full z-10">
      <div className="w-full py-4 text-center">
        <h1 className="text-4xl font-bold">{isTimeUp ? "시간이 종료되었습니다!" : `남은시간 : ${String(timeLeft).padStart(2, "0")}초`}</h1>
      </div>

      {/* 게임 정보 박스 */}
      <div className="w-10/12 mx-auto bg-white p-5 rounded-lg shadow-lg min-h-32 mt-4 border-2 border-blue-400">
        <p className="text-lg mb-4 font-medium text-gray-800">철수는 200만 원을 연 4%의 복리로 은행에 예금했습니다. 3년 후 철수가 받을 수 있는 예상 금액은 얼마일까요? (소수점 이하 반올림)</p>

        {/* 객관식 선택지 - 커서 표시 문제 해결 */}
        <div className="flex flex-wrap justify-between mt-3">
          <button
            type="button"
            onClick={() => handleOptionSelect(0)}
            className={`px-4 py-2 text-lg transition-all cursor-pointer ${selectedOption === 0 ? "text-red-600 font-bold underline scale-110" : "text-blue-700 hover:text-blue-500"}`}
            style={{
              transform: selectedOption === 0 ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            1. 212만 원
          </button>
          <button
            type="button"
            onClick={() => handleOptionSelect(1)}
            className={`px-4 py-2 text-lg transition-all cursor-pointer ${selectedOption === 1 ? "text-red-600 font-bold underline scale-110" : "text-blue-700 hover:text-blue-500"}`}
            style={{
              transform: selectedOption === 1 ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            2. 224만 원
          </button>
          <button
            type="button"
            onClick={() => handleOptionSelect(2)}
            className={`px-4 py-2 text-lg transition-all cursor-pointer ${selectedOption === 2 ? "text-red-600 font-bold underline scale-110" : "text-blue-700 hover:text-blue-500"}`}
            style={{
              transform: selectedOption === 2 ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            3. 225만 원
          </button>
          <button
            type="button"
            onClick={() => handleOptionSelect(3)}
            className={`px-4 py-2 text-lg transition-all cursor-pointer ${selectedOption === 3 ? "text-red-600 font-bold underline scale-110" : "text-blue-700 hover:text-blue-500"}`}
            style={{
              transform: selectedOption === 3 ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s ease",
            }}
          >
            4. 249만 원
          </button>
        </div>
      </div>

      {/* 고양이 캐릭터 그리드 */}
      <div className="w-10/12 mx-auto bg-white p-2 grid grid-cols-3 sm:grid-cols-6 gap-2 overflow-visible min-h-[130px] sm:min-h-[160px] relative z-10 -mt-1">
        {cats.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center overflow-visible p-1">
            <h3 className="text-xs font-medium mb-1">{cat.name}</h3>
            <div className="w-full h-full max-w-[85px] max-h-[85px] bg-white p-0">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
            </div>
            <p className="text-center text-sm mt-1">{cat.points}</p>
          </div>
        ))}
      </div>

      {/* 채팅 섹션 (살구색 배경) */}
      <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 flex flex-col">
        {/* 채팅 메시지 영역 (흰색 배경) */}
        <div className="bg-white p-3 rounded h-[180px] overflow-y-auto mb-2">
          {messages.map((msg, index) => (
            <p key={index} className="mb-1">
              {msg.text}
            </p>
          ))}
        </div>

        {/* 채팅 입력 */}
        <form onSubmit={isTimeUp ? showResults : handleSendMessage} className="flex items-center gap-2 mt-2 z-10 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-grow border border-gray-300 p-2 rounded cursor-text"
            disabled={isTimeUp}
          />
          {isTimeUp ? (
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded flex items-center cursor-pointer animate-pulse z-20 relative">
              결과 확인하기
            </button>
          ) : (
            <button type="submit" className="bg-yellow-200 hover:bg-yellow-300 px-6 py-3 rounded flex items-center cursor-pointer z-20 relative">
              전송
              <span role="img" aria-label="send" className="ml-1">
                🐤
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );

  // 3. 결과 화면
  const renderResultScreen = () => {
    // 점수 결과 화면
    if (resultStep === 0) {
      return (
        <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full z-10 relative">
          <div className="w-full py-4 text-center">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-black bg-opacity-30 inline-block px-6 py-2 rounded-lg">최종 결과</h1>
          </div>

          {/* 게임 정보 박스 - 최종 결과 표시 */}
          <div className="w-10/12 mx-auto bg-white p-6 rounded-lg shadow-lg min-h-32 mt-4 border-2 border-blue-400">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cats.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    cat.id === (winner?.id || 0) ? "bg-yellow-100 border-2 border-yellow-400 shadow-md transform scale-105" : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-full mr-3 overflow-hidden border border-blue-200">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{cat.name}</h3>
                    <p className="text-lg font-bold text-blue-600">{cat.points}점</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 채팅 기록 섹션 */}
          <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 flex flex-col -mt-1 rounded-b-lg shadow-md border-x-2 border-b-2 border-blue-400">
            {/* 채팅 메시지 영역만 표시 */}
            <div className="bg-white p-3 rounded h-[180px] overflow-y-auto mb-2 border border-pink-200">
              {messages.map((msg, index) => (
                <p key={index} className="mb-1">
                  {msg.text}
                </p>
              ))}
            </div>

            {/* 다음 단계 버튼 */}
            <div className="flex justify-end mt-2">
              <button
                onClick={goToNextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg z-30 relative"
              >
                우승자 확인하기
              </button>
            </div>
          </div>
        </div>
      );
    }
    // 우승자 화면
    else if (resultStep === 1) {
      return (
        <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full z-10 relative">
          <div className="w-full py-4 text-center">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-black bg-opacity-30 inline-block px-6 py-2 rounded-lg">우승자</h1>
          </div>

          {/* 중앙 정렬된 우승자 박스 */}
          <div className="w-10/12 mx-auto flex justify-center mt-4">
            <div className="bg-white p-6 rounded-xl shadow-xl border-4 border-blue-400 max-w-xs w-4/5 transform hover:scale-[1.02] transition-all">
              <div className="flex flex-col items-center">
                {/* 고양이 이미지 */}
                <div className="w-32 h-32 mb-4 bg-blue-50 rounded-full p-3 shadow-lg border-4 border-blue-300 overflow-hidden transform hover:rotate-3 transition-all">
                  {winner && <img src={winner.image} alt={winner.name} className="w-full h-full object-contain" />}
                </div>

                {/* 우승 메시지 */}
                <h2 className="text-2xl font-bold mb-4 text-center">우승을 축하합니다!! {winner?.name}님</h2>

                {/* 경험치 및 코인 획득 정보 */}
                <div className="text-center text-black text-xl mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200 w-full shadow-inner">
                  <p className="text-2xl font-bold text-blue-600 mb-2">EXP + {expGained}</p>
                  <div className="flex items-center justify-center">
                    <img src={CoinImage} alt="코인" className="w-8 h-8 mr-2 animate-pulse" />
                    <span className="text-2xl font-bold text-yellow-500">× {coinsGained}</span>
                  </div>
                </div>

                {/* 다음 단계 버튼 */}
                <button
                  onClick={goToNextStep}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg cursor-pointer transition-all hover:-translate-y-1 mt-2"
                >
                  {isWinner ? "메인으로" : "내 결과 보기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // 내 결과 화면
    else if (resultStep === 2) {
      return (
        <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full z-10 relative">
          <div className="w-full py-4 text-center">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg bg-black bg-opacity-30 inline-block px-6 py-2 rounded-lg">내 결과</h1>
          </div>

          {/* 중앙 정렬된 결과 박스 */}
          <div className="w-10/12 mx-auto flex justify-center mt-4">
            <div className="bg-white p-6 rounded-xl shadow-xl border-4 border-blue-400 max-w-xs w-4/5 transform hover:scale-[1.02] transition-all">
              <div className="flex flex-col items-center">
                {/* 고양이 이미지 */}
                <div className="w-32 h-32 mb-4 bg-gray-100 rounded-full p-3 shadow-lg border-4 border-gray-300 overflow-hidden transform hover:rotate-3 transition-all">
                  <img src={myCharacter.image} alt={myCharacter.name} className="w-full h-full object-contain opacity-90" />
                </div>

                {/* 결과 메시지 */}
                <div className="flex items-center space-x-2 mb-4">
                  <h2 className="text-2xl font-bold text-center">패배 ㅋ</h2>
                  <span className="text-3xl">😿</span>
                </div>

                {/* 점수 정보 */}
                <div className="bg-blue-100 px-6 py-2 rounded-full mb-4 border border-blue-200">
                  <p className="text-xl font-bold text-blue-700">{myCharacter.points}점</p>
                </div>

                {/* 경험치 및 코인 획득 정보 */}
                <div className="text-center text-black text-xl mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200 w-full shadow-inner">
                  <p className="text-2xl font-bold text-blue-600 mb-2">EXP + {expGained}</p>
                  <div className="flex items-center justify-center">
                    <img src={CoinImage} alt="코인" className="w-8 h-8 mr-2 animate-pulse" />
                    <span className="text-2xl font-bold text-yellow-500">× {coinsGained}</span>
                  </div>
                </div>

                {/* 메인으로 버튼 */}
                <button
                  onClick={goToMainPage}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-bold shadow-lg cursor-pointer transition-all hover:-translate-y-1 mt-2"
                >
                  메인으로
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      {gameState === "subjective" && renderSubjectiveQuestionScreen()}
      {gameState === "objective" && renderObjectiveQuestionScreen()}
      {gameState === "result" && renderResultScreen()}
    </div>
  );
};

export default SurvivalPage;
