import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Background from "../assets/survival.gif";
import CoinImage from "../assets/coin.png";
import SsrCat1 from "../assets/ssrcat1.gif";
import Cat3 from "../assets/cat3.gif";
import WinCat from "../assets/Wincat.gif";
import SadCat from "../assets/sadcat.png";
import styles from "./SurvivalPage.module.css";

// 게임 상태를 관리하는 타입
type GameState = "quiz" | "goodResult" | "badResult";

const SurvivalPage = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<GameState>("quiz");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score] = useState<number>(50); // 코인 갯수 항상 50으로 고정
  
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
    // 선택된 옵션 상태 업데이트
    setSelectedOption(index);
  };

  // 좋은 점 결과 화면으로 이동
  const showGoodResults = () => {
    // 좋은 점 결과 화면으로 전환
    setGameState("goodResult");
  };
  
  // 나쁜 점 결과 화면으로 이동
  const showBadResults = () => {
    // 나쁜 점 결과 화면으로 전환
    setGameState("badResult");
  };

  // 메인 페이지로 이동
  const goToMainPage = () => {
    navigate("/main");
  };

  // 객관식 문제 화면 - 디자인 개선
  const renderQuizScreen = () => (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>남은시간 : {String(timeLeft).padStart(2, "0")}초</h1>
      </div>

      {/* 퀴즈 게임 UI */}
      <div className={styles.quizContainer}>
        {/* 고양이 대결 이미지 영역 */}
        <div className={styles.catBattleArea}>
          <img src={SsrCat1} alt="Player Cat" className={styles.playerCat} />
          <img src={Cat3} alt="Boss Cat" className={styles.bossCat} />
        </div>

        {/* 문제와 선지를 포함하는 개선된 컨테이너 */}
        <div className={styles.quizContentContainer}>
          {/* 문제 영역 - 디자인 개선 */}
          <div className={styles.questionBox}>
            <p className={styles.questionText}>
              지난달, 당신은 얼마나 저축했을까요? 당신의 재정 건강 상태를 확인할 시간입니다. 아래의 선택지 중에서 지난달 당신이 저축한 금액과 가장 가까운 답을 골라보세요
            </p>
          </div>

          {/* 객관식 선택지 영역 - 디자인 개선 */}
          <div className={styles.optionsArea}>
            <div className={styles.optionsRow}>
              <button
                type="button"
                onClick={() => handleOptionSelect(0)}
                className={`${styles.optionButton} ${selectedOption === 0 ? styles.selectedOption : ""}`}
              >
                1. 1000원
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect(1)}
                className={`${styles.optionButton} ${selectedOption === 1 ? styles.selectedOption : ""}`}
              >
                2. 1만원
              </button>
            </div>
            <div className={styles.optionsRow}>
              <button
                type="button"
                onClick={() => handleOptionSelect(2)}
                className={`${styles.optionButton} ${selectedOption === 2 ? styles.selectedOption : ""}`}
              >
                3. 10만원
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect(3)}
                className={`${styles.optionButton} ${selectedOption === 3 ? styles.selectedOption : ""}`}
              >
                4. 1000만원
              </button>
            </div>
          </div>
        </div>
        
        {/* 시간이 다 되었을 때 결과 화면으로 이동 버튼 표시 */}
        {isTimeUp && (
          <div className={styles.timeUpButtonContainer}>
            <button 
              onClick={showGoodResults} 
              className={styles.nextButton}
            >
              결과 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 좋은 점 결과 화면
  const renderGoodResultScreen = () => (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>분석 결과</h1>
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultContent}>
          {/* 좋은 점 결과 보여주기 */}
          <img 
            src={WinCat} 
            alt="좋은 결과 캐릭터" 
            className={styles.resultImage} 
          />

          <div className={styles.resultMessage}>
            <h2 className={styles.victoryText}>이런 점은 좋아요!!</h2>
            <p className={styles.goodHabitText}>- 꾸준히 저축을 하고 있군요</p>
            <p className={styles.goodHabitText}>- 대중교통을 열심히 이용 하고 있어요</p>
          </div>

          {/* 보상 정보 */}
          <div className={styles.rewardBox}>
            <p className={styles.expText}>EXP + 100</p>
            <div className={styles.coinContainer}>
              <img src={CoinImage} alt="코인" className={styles.coinImage} />
              <span className={styles.coinText}>× {score}</span>
            </div>
          </div>

          {/* 계속하기 버튼 */}
          <button 
            onClick={showBadResults} 
            className={styles.mainButton}
          >
            계속하기
          </button>
        </div>
      </div>
    </div>
  );
  
  // 나쁜 점 결과 화면
  const renderBadResultScreen = () => (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>분석 결과</h1>
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultContent}>
          {/* 나쁜 점 결과 보여주기 */}
          <img 
            src={SadCat} 
            alt="나쁜 결과 캐릭터" 
            className={styles.resultImage} 
          />

          <div className={styles.resultMessage}>
            <h2 className={styles.defeatText}>이런 점은 아쉬워요</h2>
            <p className={styles.badHabitText}>- 편의점을 자주 이용하는군요</p>
            <p className={styles.badHabitText}>- 신용카드 사용한도에 도달 직전이에요</p>
          </div>

          {/* 보상 정보 */}
          <div className={styles.rewardBox}>
            <p className={styles.expText}>EXP + 100</p>
            <div className={styles.coinContainer}>
              <img src={CoinImage} alt="코인" className={styles.coinImage} />
              <span className={styles.coinText}>× {score}</span>
            </div>
          </div>

          {/* 메인으로 버튼 */}
          <button 
            onClick={goToMainPage} 
            className={styles.mainButton}
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={styles.background}
      style={{
        backgroundImage: `url(${Background})`,
        height: "100vh",
        overflowY: "auto"
      }}
    >
      <div className={styles.overlay}></div>
      {gameState === "quiz" 
        ? renderQuizScreen() 
        : gameState === "goodResult" 
          ? renderGoodResultScreen() 
          : renderBadResultScreen()
      }
    </div>
  );
};

export default SurvivalPage;