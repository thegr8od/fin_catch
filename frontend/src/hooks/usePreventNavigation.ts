// hooks/usePreventNavigation.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameExit, setCurrentGameState } from "./useGameExit";

interface UsePreventNavigationProps {
  roomId: string | null;
  gameType: "1vs1" | "AiQuiz";
}

export const usePreventNavigation = ({ roomId, gameType }: UsePreventNavigationProps) => {
  const navigate = useNavigate();
  const { showExitWarning } = useGameExit();

  useEffect(() => {
    // 페이지 진입 시 게임 상태 설정
    setCurrentGameState({
      isInGame: true,
      gameType,
      roomId,
    });

    // 브라우저 뒤로가기 방지
    const preventGoBack = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
      showExitWarning().then((shouldExit) => {
        if (shouldExit) {
          navigate("/main");
        }
      });
    };

    // 새로고침 방지
    const preventRefresh = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // 히스토리 스택에 현재 페이지 추가
    window.history.pushState(null, "", window.location.pathname);

    // 이벤트 리스너 등록
    window.addEventListener("popstate", preventGoBack);
    window.addEventListener("beforeunload", preventRefresh);

    return () => {
      // 이벤트 리스너 제거 및 게임 상태 초기화
      window.removeEventListener("popstate", preventGoBack);
      window.removeEventListener("beforeunload", preventRefresh);
      setCurrentGameState({
        isInGame: false,
        gameType: null,
        roomId: null,
      });
    };
  }, [navigate, showExitWarning, roomId, gameType]);
};