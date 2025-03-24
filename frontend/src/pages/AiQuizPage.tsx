import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../assets/survival.gif";
import GameQuiz from "../components/game/GameQuiz";
import GameResult from "../components/game/GameResult";
import { useUserInfo } from "../hooks/useUserInfo";
import { CharacterType } from "../components/game/constants/animations";

type GameState = "quiz" | "goodResult" | "badResult";

const AiQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameState, setGameState] = useState<GameState>("quiz");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [score] = useState<number>(50);
  const [randomCat, setRandomCat] = useState<CharacterType>("classic");

  // 랜덤 고양이 캐릭터 선택
  const selectRandomCat = useCallback(() => {
    const catTypes: CharacterType[] = ["classic", "tabby", "tuxedo", "siamese", "persian"];
    // 현재 유저의 메인 캣이 아닌 다른 캣을 선택
    const userMainCat = user?.mainCat as unknown as CharacterType || "classic";
    const availableCats = catTypes.filter(cat => cat !== userMainCat);
    const randomIndex = Math.floor(Math.random() * availableCats.length);
    return availableCats[randomIndex];
  }, [user]);

  useEffect(() => {
    // 컴포넌트 마운트 시 랜덤 고양이 선택
    setRandomCat(selectRandomCat());
  }, [selectRandomCat]);

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
      className="w-full flex flex-col items-center bg-cover h-screen overflow-y-auto"
      style={{
        backgroundImage: `url(${Background})`
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      {gameState === "quiz" ? (
        <GameQuiz 
          timeLeft={timeLeft}
          isTimeUp={isTimeUp}
          onShowResults={() => setGameState("goodResult")}
          playerCat={user?.mainCat as unknown as CharacterType || "classic"}
          opponentCat={randomCat}
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