import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/survival.gif";
import GameQuiz from "../components/game/GameQuiz";
import GameResult from "../components/game/GameResult";
import styles from "./AiQuizPage.module.css";

type GameState = "quiz" | "goodResult" | "badResult";

const AiQuizPage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<GameState>("quiz");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score] = useState<number>(50);

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
      {gameState === "quiz" ? (
        <GameQuiz 
          timeLeft={timeLeft}
          isTimeUp={isTimeUp}
          onShowResults={() => setGameState("goodResult")}
        />
      ) : (
        <GameResult
          type={gameState === "goodResult" ? "good" : "bad"}
          score={score}
          onContinue={() => {
            if (gameState === "goodResult") {
              setGameState("badResult");
            } else {
              navigate("/main");
            }
          }}
        />
      )}
    </div>
  );
};

export default AiQuizPage;