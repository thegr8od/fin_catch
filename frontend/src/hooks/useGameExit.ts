import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../contexts/LoadingContext";

interface GameStateType {
  isInGame: boolean;
  gameType: "1vs1" | "battle-royale" | null;
  roomId: string | null;
}

let currentGameState: GameStateType = {
  isInGame: false,
  gameType: null,
  roomId: null,
};

export const setCurrentGameState = (state: GameStateType) => {
  currentGameState = state;
};

export const getCurrentGameState = () => currentGameState;

export const useGameExit = () => {
  const showExitWarning = async (): Promise<boolean> => {
    if (!currentGameState.isInGame) return true;

    return new Promise((resolve) => {
      const result = window.confirm("게임을 나가시겠습니까?\n게임을 나가면 패배 처리됩니다.");
      resolve(result);
    });
  };

  return { showExitWarning };
};
