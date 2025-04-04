import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/bg1.png";
import GameQuiz from "../components/game/GameQuiz";
import GameResult from "../components/game/GameResult";
import { useUserInfo } from "../hooks/useUserInfo";
import { CharacterType } from "../components/game/constants/animations";
import { usePreventNavigation } from "../hooks/usePreventNavigation";
import useQuizResult from "../hooks/useQuizResult";
import { useShuffledQuiz, ShuffledQuizItem } from "../hooks/useShuffledQuiz"; // useShuffledQuiz 사용

type GameState = "quiz" | "goodResult" | "badResult" | "finalResult";

const AiQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60초 타이머
  const [gameState, setGameState] = useState<GameState>("quiz");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [randomCat, setRandomCat] = useState<CharacterType>("classic");
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizzes, setQuizzes] = useState<ShuffledQuizItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [answeredQuestions, setAnsweredQuestions] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  
  // 새로 수정된 useShuffledQuiz 훅 사용
  const { loading, error, shuffledQuizzes, createAndGetShuffledQuizzes, submitShuffledQuizAnswer } = useShuffledQuiz();
  const { saveQuizResult } = useQuizResult();

  usePreventNavigation({
    roomId: null,
    gameType: "AiQuiz",
  });

  // 랜덤 고양이 캐릭터 선택
  const selectRandomCat = useCallback(() => {
    const catTypes: CharacterType[] = ["classic", "batman", "slave", "master", "unique_rabbit"];
    const userMainCat = (user?.mainCat as unknown as CharacterType) || "classic";
    const availableCats = catTypes.filter((cat) => cat !== userMainCat);
    const randomIndex = Math.floor(Math.random() * availableCats.length);
    return availableCats[randomIndex];
  }, [user]);

  // 퀴즈 데이터 가져오기 - 새 API 함수 사용
  const fetchQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      // 새로운 퀴즈 생성 및 가져오기 함수 사용
      const response = await createAndGetShuffledQuizzes();
      console.log("새로 생성된 퀴즈 데이터 응답:", response);
      
      if (response && response.isSuccess && Array.isArray(response.result)) {
        // 타입 단언을 사용하여 response.result를 ShuffledQuizItem[] 타입으로 처리
        setQuizzes(response.result as ShuffledQuizItem[]);
        setTimeLeft(60);
        setIsTimeUp(false);
        setSelectedOption(null);
        setCurrentQuizIndex(0);
        setAnsweredQuestions(0);
        setCorrectAnswers(0);
        setScore(0);
        setLastAnswerCorrect(null);
      } else {
        console.error("퀴즈를 가져오는데 실패했습니다:", response?.message || "알 수 없는 오류");
      }
    } catch (error) {
      console.error("퀴즈 API 호출 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }, [createAndGetShuffledQuizzes]);

  // 정답 제출 처리 - 섞인 옵션에 맞게 수정
  const handleSubmitAnswer = useCallback(async () => {
    if (selectedOption === null || quizzes.length === 0) return;
    
    const currentQuiz = quizzes[currentQuizIndex];
    
    try {
      // 섞인 퀴즈에 맞는 정답 제출 함수 사용
      const response = await submitShuffledQuizAnswer(currentQuiz.quizId, selectedOption);
      console.log("정답 제출 응답:", response);
      
      // 서버에서 확인한 정답 여부
      const isCorrect = response.result === true;
      
      setLastAnswerCorrect(isCorrect);
      setAnsweredQuestions(prev => prev + 1);
      
      if (isCorrect) {
        // 정답인 경우 점수 증가
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + 50);
        setGameState("goodResult");
      } else {
        // 오답인 경우
        setGameState("badResult");
      }
    } catch (error) {
      console.error("정답 제출 중 오류 발생:", error);
      // 오류 발생 시에도 정답 여부를 로컬에서 판단
      const isCorrect = selectedOption === currentQuiz.correctOptionIndex;
      
      setLastAnswerCorrect(isCorrect);
      setAnsweredQuestions(prev => prev + 1);
      
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + 50);
        setGameState("goodResult");
      } else {
        setGameState("badResult");
      }
    }
  }, [selectedOption, quizzes, currentQuizIndex, submitShuffledQuizAnswer]);

  // 시간 초과 시 강제로 오답 제출
  const handleTimeUp = useCallback(async () => {
    if (quizzes.length === 0) return;
    
    const currentQuiz = quizzes[currentQuizIndex];
    
    try {
      // 시간 초과 시 임의의 오답 인덱스 찾기
      let wrongOptionIndex = 0;
      for (let i = 0; i < currentQuiz.options.length; i++) {
        if (i !== currentQuiz.correctOptionIndex) {
          wrongOptionIndex = i;
          break;
        }
      }
      
      // 시간 초과 시 자동으로 오답 제출
      await submitShuffledQuizAnswer(currentQuiz.quizId, wrongOptionIndex);
      
      // 오답 처리
      setLastAnswerCorrect(false);
      setAnsweredQuestions(prev => prev + 1);
      setGameState("badResult");
    } catch (error) {
      console.error("시간 초과 처리 중 오류 발생:", error);
      // 오류 발생 시에도 오답 처리
      setLastAnswerCorrect(false);
      setAnsweredQuestions(prev => prev + 1);
      setGameState("badResult");
    }
  }, [quizzes, currentQuizIndex, submitShuffledQuizAnswer]);

  // 다음 문제로 이동
  const moveToNextQuestion = useCallback(() => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prevIndex => prevIndex + 1);
      setSelectedOption(null);
      setTimeLeft(60);
      setIsTimeUp(false);
      setGameState("quiz");
      setLastAnswerCorrect(null);
    } else {
      // 모든 문제 완료
      setGameState("finalResult");
    }
  }, [currentQuizIndex, quizzes.length]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    setRandomCat(selectRandomCat());
    fetchQuizzes();
  }, [selectRandomCat, fetchQuizzes]);

  // 타이머 설정
  useEffect(() => {
    if (isLoading || gameState !== "quiz") return;

    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isLoading, gameState]);

  // 현재 퀴즈 가져오기
  const getCurrentQuiz = () => {
    if (quizzes.length === 0 || currentQuizIndex >= quizzes.length) {
      return { question: "퀴즈를 불러오는 중입니다...", options: [] };
    }
    return quizzes[currentQuizIndex];
  };

  const currentQuiz = getCurrentQuiz();
  const options = currentQuiz.options ? currentQuiz.options.map((opt) => opt.optionText) : [];

  // 결과 화면에서 계속하기 버튼 클릭 시 처리
  const handleContinue = () => {
    if (gameState === "goodResult" || gameState === "badResult") {
      moveToNextQuestion();
    } else if (gameState === "finalResult") {
      // 훅을 사용하여 결과 저장
      saveQuizResult({
        totalProblems: quizzes.length,
        correctAnswers: correctAnswers,
        finalScore: score
      });
      
      // 메인 페이지로 이동
      navigate("/main");
    }
  };

  // 시간 초과 시 결과 확인 버튼 클릭 처리
  const handleShowResults = useCallback(() => {
    if (isTimeUp && selectedOption === null) {
      handleTimeUp();
    } else {
      handleSubmitAnswer();
    }
  }, [isTimeUp, selectedOption, handleTimeUp, handleSubmitAnswer]);

  return (
    <div
      className="w-full flex flex-col items-center bg-cover h-screen overflow-y-auto"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* 퀴즈 진행 상태 표시 */}
      <div className="w-[85%] mt-4 mb-2 bg-white bg-opacity-75 rounded-lg p-2 flex justify-between items-center z-10">
        <div className="text-gray-700 font-semibold">
          문제 {currentQuizIndex + 1} / {quizzes.length}
        </div>
        <div className="text-blue-600 font-semibold">
          점수: {score}점
        </div>
        <div className="text-green-600 font-semibold">
          정답: {correctAnswers} / {answeredQuestions}
        </div>
      </div>
      
      {gameState === "quiz" ? (
        <GameQuiz
          timeLeft={timeLeft}
          isTimeUp={isTimeUp}
          onShowResults={handleShowResults}
          playerCat={(user?.mainCat as unknown as CharacterType) || "classic"}
          opponentCat={randomCat}
          quiz={currentQuiz.question || ""}
          answer=""
          selectedOption={selectedOption}
          onOptionSelect={setSelectedOption}
          options={options}
        />
      ) : gameState === "finalResult" ? (
        <div className="w-[85.5%] relative z-10 md:w-[76.5%] lg:w-[72%] mx-auto pb-7">
          <div className="w-full py-4 text-center">
            <h1 className="text-[1.75rem] font-bold text-white shadow-md bg-black bg-opacity-30 inline-block px-6 py-1 rounded-2xl">
              모든 퀴즈 완료!
            </h1>
          </div>

          <div className="w-[50%] mx-auto bg-white p-5 mt-4 border-2 border-primary border-opacity-40 rounded-2xl shadow-xl max-h-[72vh] overflow-y-auto lg:w-[60%] md:w-[70%] sm:w-[85%]">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">퀴즈 결과</h2>
              
              <div className="w-full bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-lg font-medium">총 문제: <span className="font-bold">{quizzes.length}문제</span></p>
                <p className="text-lg font-medium">맞힌 문제: <span className="font-bold text-green-600">{correctAnswers}문제</span></p>
                <p className="text-lg font-medium">정답률: <span className="font-bold text-blue-600">{Math.round((correctAnswers / quizzes.length) * 100)}%</span></p>
                <p className="text-lg font-medium mt-2">최종 점수: <span className="font-bold text-purple-600">{score}점</span></p>
              </div>
              
              <button 
                onClick={handleContinue} 
                className="bg-primary text-white px-8 py-3 text-[1.1rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary hover:bg-opacity-90 rounded-lg shadow-lg hover:-translate-y-1"
                style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      ) : (
        <GameResult
          type={gameState === "goodResult" ? "good" : "bad"}
          score={gameState === "goodResult" ? 50 : 0}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default AiQuizPage;