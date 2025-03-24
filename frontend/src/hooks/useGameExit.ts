import React from "react";
import { CustomConfirm } from "../components/layout/CustomConfirm";
import { createRoot } from "react-dom/client";

interface GameStateType {
  isInGame: boolean;
  gameType: "1vs1" | null;
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
      const modalRoot = document.createElement("div");
      modalRoot.setAttribute("id", "modal-root");
      document.body.appendChild(modalRoot);

      const root = createRoot(modalRoot);

      const handleConfirm = () => {
        root.unmount();
        document.body.removeChild(modalRoot);
        resolve(true);
      };

      const handleCancel = () => {
        root.unmount();
        document.body.removeChild(modalRoot);
        resolve(false);
      };

      root.render(
        React.createElement(
          "div",
          { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]" },
          React.createElement(CustomConfirm, {
            message: "게임을 나가시겠습니까?\n게임을 나가면 패배 처리됩니다.",
            onConfirm: handleConfirm,
            onCancel: handleCancel,
          })
        )
      );
    });
  };

  return { showExitWarning };
};
