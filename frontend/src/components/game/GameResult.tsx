import CoinImage from "../../assets/coin.png";
import WinCat from "../../assets/Wincat.gif";
import SadCat from "../../assets/sadcat.png";
import styles from "../../pages/AiQuizPage.module.css"

interface GameResultProps {
  type: "good" | "bad";
  score: number;
  onContinue: () => void;
}

const GameResult = ({ type, score, onContinue }: GameResultProps) => {
  const isGoodResult = type === "good";

  return (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>분석 결과</h1>
      </div>

      <div className={styles.resultBox}>
        <div className={styles.resultContent}>
          <img 
            src={isGoodResult ? WinCat : SadCat} 
            alt={`${isGoodResult ? '좋은' : '나쁜'} 결과 캐릭터`} 
            className={styles.resultImage} 
          />

          <div className={styles.resultMessage}>
            <h2 className={isGoodResult ? styles.victoryText : styles.defeatText}>
              {isGoodResult ? "이런 점은 좋아요!!" : "이런 점은 아쉬워요"}
            </h2>
            {isGoodResult ? (
              <>
                <p className={styles.goodHabitText}>- 꾸준히 저축을 하고 있군요</p>
                <p className={styles.goodHabitText}>- 대중교통을 열심히 이용 하고 있어요</p>
              </>
            ) : (
              <>
                <p className={styles.badHabitText}>- 편의점을 자주 이용하는군요</p>
                <p className={styles.badHabitText}>- 신용카드 사용한도에 도달 직전이에요</p>
              </>
            )}
          </div>

          <div className={styles.rewardBox}>
            <p className={styles.expText}>EXP + 100</p>
            <div className={styles.coinContainer}>
              <img src={CoinImage} alt="코인" className={styles.coinImage} />
              <span className={styles.coinText}>× {score}</span>
            </div>
          </div>

          <button 
            onClick={onContinue} 
            className={styles.mainButton}
          >
            {isGoodResult ? "계속하기" : "메인으로"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;