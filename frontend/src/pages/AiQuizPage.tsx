import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/bg1.png";
import GameQuiz from "../components/game/GameQuiz";
import GameResult from "../components/game/GameResult";
import { useUserInfo } from "../hooks/useUserInfo";
import { CharacterType } from "../components/game/constants/animations";
import { usePreventNavigation } from "../hooks/usePreventNavigation";
import { useShuffledQuiz, ShuffledQuizItem } from "../hooks/useShuffledQuiz";
import axiosInstance from "../api/axios";

type GameState = "quiz" | "goodResult" | "badResult" | "finalResult";

const AiQuizPage = () => {
  const navigate = useNavigate();
  const { user, fetchUserInfo } = useUserInfo();
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
  const [currentQuestionScore, setCurrentQuestionScore] = useState<number>(0);
  
  // 추가: 퀴즈 초기화 및 진행 상태 관리
  const isQuizInitialized = useRef<boolean>(false);
  const isQuizInProgress = useRef<boolean>(false);
  
  // 새로 수정된 useShuffledQuiz 훅 사용
  const { loading, error, shuffledQuizzes, createAndGetShuffledQuizzes, submitShuffledQuizAnswer } = useShuffledQuiz();

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
    // 이미 퀴즈가 초기화되고 진행 중이면 다시 불러오지 않음
    if (isQuizInitialized.current && isQuizInProgress.current && quizzes.length > 0) {
      console.log("퀴즈가 이미 진행 중입니다. 다시 불러오지 않습니다.");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("새 퀴즈 데이터를 불러오는 중...");
      // 새로운 퀴즈 생성 및 가져오기 함수 사용
      const response = await createAndGetShuffledQuizzes();
      
      if (response && response.isSuccess && Array.isArray(response.result) && response.result.length > 0) {
        // 타입 단언을 사용하여 response.result를 ShuffledQuizItem[] 타입으로 처리
        const fetchedQuizzes = response.result as ShuffledQuizItem[];
        console.log(`${fetchedQuizzes.length}개의 퀴즈를 성공적으로 불러왔습니다.`);
        
        setQuizzes(fetchedQuizzes);
        setTimeLeft(60);
        setIsTimeUp(false);
        setSelectedOption(null);
        setCurrentQuizIndex(0);
        setAnsweredQuestions(0);
        setCorrectAnswers(0);
        setScore(0);
        setLastAnswerCorrect(null);
        setCurrentQuestionScore(0);
        
        // 퀴즈 초기화 및 진행 상태 설정
        isQuizInitialized.current = true;
        isQuizInProgress.current = true;
      } else {
        console.error("퀴즈를 가져오는데 실패했습니다:", response?.message || "알 수 없는 오류");
      }
    } catch (error) {
      console.error("퀴즈 API 호출 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }, [createAndGetShuffledQuizzes, quizzes.length]);
  
  // 정답 제출 처리 - 섞인 옵션에 맞게 수정
  const handleSubmitAnswer = useCallback(async () => {
    if (selectedOption === null || quizzes.length === 0 || !isQuizInProgress.current) return;
    
    const currentQuiz = quizzes[currentQuizIndex];
    
    try {
      // 섞인 퀴즈에 맞는 정답 제출 함수 사용
      const response = await submitShuffledQuizAnswer(currentQuiz.quizId, selectedOption);
      
      // 서버에서 확인한 정답 여부
      const isCorrect = response.result === true;
      
      setLastAnswerCorrect(isCorrect);
      setAnsweredQuestions(prev => prev + 1);
      
      if (isCorrect) {
        // 정답인 경우 점수 증가 - 각 문제별 점수를 50으로 설정
        const questionScore = 50;
        setCurrentQuestionScore(questionScore);
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + questionScore);
        setGameState("goodResult");
      } else {
        // 오답인 경우
        setCurrentQuestionScore(0);
        setGameState("badResult");
      }
    } catch (error) {
      console.error("정답 제출 중 오류 발생:", error);
      // 오류 발생 시에도 정답 여부를 로컬에서 판단
      const isCorrect = selectedOption === currentQuiz.correctOptionIndex;
      
      setLastAnswerCorrect(isCorrect);
      setAnsweredQuestions(prev => prev + 1);
      
      if (isCorrect) {
        const questionScore = 50;
        setCurrentQuestionScore(questionScore);
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + questionScore);
        setGameState("goodResult");
      } else {
        setCurrentQuestionScore(0);
        setGameState("badResult");
      }
    }
  }, [selectedOption, quizzes, currentQuizIndex, submitShuffledQuizAnswer]);

  // 시간 초과 시 강제로 오답 제출
  const handleTimeUp = useCallback(async () => {
    if (quizzes.length === 0 || !isQuizInProgress.current) return;
    
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
      setCurrentQuestionScore(0);
      setLastAnswerCorrect(false);
      setAnsweredQuestions(prev => prev + 1);
      setGameState("badResult");
    } catch (error) {
      console.error("시간 초과 처리 중 오류 발생:", error);
      // 오류 발생 시에도 오답 처리
      setCurrentQuestionScore(0);
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
      setCurrentQuestionScore(0);
    } else {
      // 모든 문제 완료
      setGameState("finalResult");
    }
  }, [currentQuizIndex, quizzes.length]);
  
  // 서버에 경험치와 포인트 업데이트 함수
  const updateExpAndPoint = async (exp: number, point: number) => {
    try {
      const response = await axiosInstance.patch('/api/member/exp-point', {
        exp: exp,
        point: point
      });
      
      if (response.data.isSuccess) {
        console.log("경험치와 포인트 업데이트 성공:", response.data.result);
        // 사용자 정보 갱신
        await fetchUserInfo();
        return true;
      } else {
        console.error("경험치와 포인트 업데이트 실패:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      return false;
    }
  };
  
  // 컴포넌트 마운트 시 초기화 - 의존성 배열 수정
  useEffect(() => {
    console.log("컴포넌트 마운트: 초기 설정");
    setRandomCat(selectRandomCat());
    
    // 초기화 및 데이터 불러오기는 한 번만 실행
    if (!isQuizInitialized.current) {
      fetchQuizzes();
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log("컴포넌트 언마운트: 상태 초기화");
      isQuizInitialized.current = false;
      isQuizInProgress.current = false;
    };
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // fetchQuizzes와 selectRandomCat이 변경되었을 때 실행할 추가 useEffect
  useEffect(() => {
    // fetchQuizzes 함수가 변경되었을 때만 실행하고, 
    // 이미 초기화되지 않은 경우에만 실행
    if (!isQuizInitialized.current && !isLoading) {
      console.log("추가 검사: 퀴즈 데이터 초기화 필요");
      fetchQuizzes();
    }
  }, [fetchQuizzes, isLoading]);
  
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

    // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 정리
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
  const handleContinue = async () => {
    if (gameState === "goodResult") {
      // 정답일 경우 경험치 및 포인트 업데이트
      await updateExpAndPoint(100, currentQuestionScore); // 정답 하나당 100 경험치, 점수는 currentQuestionScore
      moveToNextQuestion();
    } else if (gameState === "badResult") {
      moveToNextQuestion();
    } else if (gameState === "finalResult") {
      // 퀴즈 완료 시 상태 초기화
      isQuizInProgress.current = false;
      
      // 퀴즈 결과를 서버에 저장
      try {
        // 결과 저장 API를 호출
        await axiosInstance.post('/api/ai/consumption/result', {
          totalProblems: quizzes.length,
          correctAnswers: correctAnswers,
          finalScore: score
        });
        
        // 메인 페이지로 이동
        navigate("/main");
      } catch (error) {
        console.error("퀴즈 결과 저장 오류:", error);
        // 오류가 있어도 메인 페이지로 이동
        navigate("/main");
      }
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

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div
        className="w-full flex flex-col items-center bg-cover h-screen overflow-y-auto"
        style={{
          backgroundImage: `url(${Background})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="w-full h-screen flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-medium text-gray-700">퀴즈를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  // 로딩이 완료된 후 게임 화면 표시
  return (
    <div
      className="w-full flex flex-col items-center bg-cover h-screen overflow-y-auto"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      {/* 퀴즈 진행 상태 표시 */}
      <div className="w-[85%] mt-20 mb-4 bg-white bg-opacity-90 rounded-lg p-3 flex justify-between items-center relative z-50 shadow-md">
        <div className="text-gray-700 font-bold text-lg">
          문제 {currentQuizIndex + 1} / {quizzes.length || 10}
        </div>
        <div className="text-blue-600 font-bold text-lg">
          점수: {score}점
        </div>
        <div className="text-green-600 font-bold text-lg">
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
          score={currentQuestionScore}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default AiQuizPage;