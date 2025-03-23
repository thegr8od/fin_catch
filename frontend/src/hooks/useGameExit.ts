import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../contexts/LoadingContext";

interface GameState {
  gameStatus: "waiting" | "playing" | "finished";
}

export const useGameExit = (gameState?: GameState) => {
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const handlePageExit = (path: string) => {
    if (gameState?.gameStatus === "playing") {
      setIntendedPath(path);
      setShowExitWarning(true);
      return false;
    }
    return true;
  };

  const handleExitConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      if (intendedPath) {
        navigate(intendedPath);
      } else {
        navigate("/main");
      }
    }, 300);
  };

  const handleExitCancel = () => {
    setShowExitWarning(false);
    setIntendedPath(null);
  };

  return {
    showExitWarning,
    handlePageExit,
    handleExitConfirm,
    handleExitCancel,
  };
};

// 전역 상태 관리
let currentGameState: GameState | null = null;

export const setCurrentGameState = (state: GameState | null) => {
  currentGameState = state;
};

export const getCurrentGameState = () => currentGameState;
