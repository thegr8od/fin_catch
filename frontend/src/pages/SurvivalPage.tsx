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
type GameState = "quiz" | "result";

// 게임 결과 타입
type GameResult = "victory" | "defeat";

const SurvivalPage = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<GameState>("quiz");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult>("defeat");
  
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

  // 결과 화면으로 이동
  const showResults = () => {
    // 랜덤하게 승리/패배 결정
    const randomResult = Math.random() < 0.5 ? "victory" : "defeat";
    
    // 랜덤 결과에 따라 점수 설정
    if (randomResult === "victory") {
      setScore(100);
    } else {
      setScore(30);
    }
    
    // 게임 결과 설정
    setGameResult(randomResult);
    
    // 결과 화면으로 전환
    setGameState("result");
  };

  // 메인 페이지로 이동
  const goToMainPage = () => {
    navigate("/main");
  };

  // 객관식 문제 화면 - 수정된 레이아웃
  const renderQuizScreen = () => (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>남은시간 : {String(timeLeft).padStart(2, "0")}초</h1>
      </div>

      {/* 퀴즈 게임 UI */}
      <div className={styles.quizContainer}>
        {/* 고양이 대결 이미지 영역 - 변경된 부분 */}
        <div className={styles.catBattleArea}>
          <img src={SsrCat1} alt="Player Cat" className={styles.playerCat} />
          <img src={Cat3} alt="Boss Cat" className={styles.bossCat} />
        </div>

        {/* 문제와 선지를 포함하는 새로운 컨테이너 */}
        <div className={styles.quizContentContainer}>
          {/* 문제 영역 - 하단 좌측 */}
          <div className={styles.questionBox}>
            <p className={styles.questionText}>
              철수는 200만 원을 연 4%의 복리로 은행에 예금했습니다. 3년 후 철수가 받을 수 있는 예상 금액은 얼마일까요? (소수점 이하 반올림)
            </p>
          </div>

          {/* 객관식 선택지 영역 - 하단 우측 */}
          <div className={styles.optionsArea}>
            <div className={styles.optionsRow}>
              <button
                type="button"
                onClick={() => handleOptionSelect(0)}
                className={`${styles.optionButton} ${selectedOption === 0 ? styles.selectedOption : ""}`}
              >
                1번
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect(1)}
                className={`${styles.optionButton} ${selectedOption === 1 ? styles.selectedOption : ""}`}
              >
                2번
              </button>
            </div>
            <div className={styles.optionsRow}>
              <button
                type="button"
                onClick={() => handleOptionSelect(2)}
                className={`${styles.optionButton} ${selectedOption === 2 ? styles.selectedOption : ""}`}
              >
                3번
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect(3)}
                className={`${styles.optionButton} ${selectedOption === 3 ? styles.selectedOption : ""}`}
              >
                4번
              </button>
            </div>
          </div>
        </div>
        
        {/* 시간이 다 되었을 때 결과 화면으로 이동 버튼 표시 - 선택지 아래로 이동 */}
        {isTimeUp && (
          <div className={styles.timeUpButtonContainer}>
            <button onClick={showResults} className={styles.nextButton}>
              결과 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 간단한 결과 화면
  const renderResultScreen = () => (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>결과</h1>
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultContent}>
          {/* 플레이어 캐릭터 - 승리/패배에 따라 다른 이미지 표시 */}
          <img 
            src={gameResult === "victory" ? WinCat : SadCat} 
            alt={gameResult === "victory" ? "승리 캐릭터" : "패배 캐릭터"} 
            className={styles.resultImage} 
          />

          {/* 승패 메시지 */}
          <div className={styles.resultMessage}>
            {gameResult === "victory" ? (
              <h2 className={styles.victoryText}>승리했습니다!</h2>
            ) : (
              <h2 className={styles.defeatText}>패배했습니다...</h2>
            )}
          </div>

          {/* 점수 정보 */}
          <div className={styles.scoreInfo}>
            <h2 className={styles.scoreTitle}>오늘의 점수</h2>
            <p className={styles.scoreValue}>{score}점</p>
          </div>

          {/* 보상 정보 */}
          <div className={styles.rewardBox}>
            <p className={styles.expText}>EXP + {gameResult === "victory" ? 100 : 50}</p>
            <div className={styles.coinContainer}>
              <img src={CoinImage} alt="코인" className={styles.coinImage} />
              <span className={styles.coinText}>× {score}</span>
            </div>
          </div>

          {/* 메인으로 버튼 */}
          <button onClick={goToMainPage} className={styles.mainButton}>
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
      }}
    >
      <div className={styles.overlay}></div>
      {gameState === "quiz" ? renderQuizScreen() : renderResultScreen()}
    </div>
  );
};

export default SurvivalPage;