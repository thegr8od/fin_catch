import { useState } from "react";
import SsrCat1 from "../../assets/ssrcat1.gif";
import Cat3 from "../../assets/cat3.gif";
import styles from "../../pages/AiQuizPage.module.css";

interface GameQuizProps {
  timeLeft: number;
  isTimeUp: boolean;
  onShowResults: () => void;
}

const GameQuiz = ({ timeLeft, isTimeUp, onShowResults }: GameQuizProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  return (
    <div className={styles.container}>
      <div className={styles.timerTitle}>
        <h1 className={styles.timerText}>남은시간 : {String(timeLeft).padStart(2, "0")}초</h1>
      </div>

      <div className={styles.quizContainer}>
        <div className={styles.catBattleArea}>
          <img src={SsrCat1} alt="Player Cat" className={styles.playerCat} />
          <img src={Cat3} alt="Boss Cat" className={styles.bossCat} />
        </div>

        <div className={styles.quizContentContainer}>
          <div className={styles.questionBox}>
            <p className={styles.questionText}>
              지난달, 당신은 얼마나 저축했을까요? 당신의 재정 건강 상태를 확인할 시간입니다. 아래의 선택지 중에서 지난달 당신이 저축한 금액과 가장 가까운 답을 골라보세요
            </p>
          </div>

          <div className={styles.optionsArea}>
            <div className={styles.optionsRow}>
              <button type="button" onClick={() => handleOptionSelect(0)} className={`${styles.optionButton} ${selectedOption === 0 ? styles.selectedOption : ""}`}>
                1. 1000원
              </button>
              <button type="button" onClick={() => handleOptionSelect(1)} className={`${styles.optionButton} ${selectedOption === 1 ? styles.selectedOption : ""}`}>
                2. 1만원
              </button>
            </div>
            <div className={styles.optionsRow}>
              <button type="button" onClick={() => handleOptionSelect(2)} className={`${styles.optionButton} ${selectedOption === 2 ? styles.selectedOption : ""}`}>
                3. 10만원
              </button>
              <button type="button" onClick={() => handleOptionSelect(3)} className={`${styles.optionButton} ${selectedOption === 3 ? styles.selectedOption : ""}`}>
                4. 1000만원
              </button>
            </div>
          </div>
        </div>

        {isTimeUp && (
          <div className={styles.timeUpButtonContainer}>
            <button onClick={onShowResults} className={styles.nextButton}>
              결과 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameQuiz;
