import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import battleBackground from "../assets/battlebg.png";
import BattleScreen from "../components/game/BattleScreen";
// import { getMotionImages } from "../utils/motionLoader"
import { useLoading } from "../contexts/LoadingContext";
import { CharacterState, PlayerStatus } from "../components/game/types/character";
import { useGameExit, setCurrentGameState } from "../hooks/useGameExit";

/**
 * 채팅 메시지 인터페이스
 * @property {string} sender - 메시지 발신자 이름
 * @property {string} message - 메시지 내용
 * @property {Date} timestamp - 메시지 전송 시간
 * @property {boolean} isVisible - 메시지 표시 여부 (선택적)
 */
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  isVisible?: boolean;
}

/**
 * 게임 스테이터스
 */
interface GameState {
  roomId: string;
  currentQuestion: string;
  remainingTime: number;
  gameStatus: "waiting" | "playing" | "finished";
  correctAnswer?: string; //정답
  lastAnsweredId?: number; //마지막으로 정답을 맞춘 사람
}

/**
 * 플레이어 스테이터스
 */

/**
 * 1:1 대결 페이지 컴포넌트
 * 사용자와 상대방 간의 1:1 대결을 진행하는 페이지
 */
const OneToOnePage: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading, setProgress, completeLoading } = useLoading();
  const { showExitWarning } = useGameExit();
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerBubble, setPlayerBubble] = useState<ChatMessage | null>(null);
  const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false);

  const resourcesLoadedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);

  const [gameState, setGameState] = useState<GameState>({
    roomId: "",
    currentQuestion: "",
    remainingTime: 60,
    gameStatus: "playing",
  });

  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    id: 1,
    name: localStorage.getItem("host") || "방장",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  });

  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>({
    id: 1,
    name: "참가자",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  });

  const gameEventHandlers = {
    onGameStart: () => {
      setGameState((prev) => ({
        ...prev,
        gameStatus: "playing",
      }));
    },

    onQuestionReceived: (question: string) => {
      setGameState((prev) => ({
        ...prev,
        currentQuestion: question,
        lastAnsweredId: undefined, // 문제 나오면 정답 초기화
      }));
    },

    onTimeUpdate: (time: number) => {
      setGameState((prev) => ({
        ...prev,
        remainingTime: time,
      }));
    },

    // 정답 처리
    onAnswerSubmit: (playerId: number, answer: string, isCorrect: boolean) => {
      if (isCorrect) {
        if (playerId === playerStatus.id) {
          // 내가 맞췄을 때
          setPlayerStatus((prev) => ({
            ...prev,
            state: "attack",
            score: prev.score + 1,
          }));
          setOpponentStatus((prev) => ({
            ...prev,
            state: "damage",
            health: Math.max(0, prev.health - 1),
          }));
        } else {
          // 상대가 맞췄을 때
          setOpponentStatus((prev) => ({
            ...prev,
            state: "attack",
            score: prev.score + 1,
          }));
          setPlayerStatus((prev) => ({
            ...prev,
            state: "damage",
            health: Math.max(0, prev.health - 1),
          }));
        }

        setGameState((prev) => ({
          ...prev,
          lastAnsweredId: playerId,
        }));
      }
    },

    // 나중에 소켓으로 대체될 부분
    onDamage: (targetId: number) => {
      // 피격 대상의 상태를 damage로 변경
      if (targetId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: "damage",
          health: Math.max(0, prev.health - 1),
        }));
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: "damage",
          health: Math.max(0, prev.health - 1),
        }));
      }
    },
  };

  const handleAnimationComplete = (playerId: number, currentState: CharacterState) => {
    if (currentState === "attack" || currentState === "damage") {
      if (playerId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }));
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: prev.health <= 0 ? "dead" : "idle",
        }));
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      setLoading(false);
    };
  }, [setLoading, setProgress]);

  useEffect(() => {
    let isComponentMounted = true;
    setLoading(true);
    setProgress(0);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;

        const timeoutId = setTimeout(() => {
          reject(new Error(`이미지 로드 타임아웃: ${src}`));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(img);
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error(`이미지 로드 실패: ${src}`));
        };
      });
    };

    const loadResources = async () => {
      try {
        setProgress(10);

        // 필요한 캐릭터 타입들 수집
        const characterTypes = new Set([playerStatus.characterType, opponentStatus.characterType]);
        const stateFiles = ["idle", "attack", "damage", "dead", "victory"];

        // 모든 필요한 이미지 경로 생성
        const imagesToLoad = [battleBackground, ...Array.from(characterTypes).flatMap((charType) => stateFiles.map((state) => `/cats_assets/${charType}/${charType}_cat_${state}.png`))];

        const totalImages = imagesToLoad.length;
        let loadedCount = 0;

        await Promise.all(
          imagesToLoad.map(async (src) => {
            try {
              await loadImage(src);
              if (isComponentMounted) {
                loadedCount++;
                setProgress(Math.floor(10 + (loadedCount / totalImages) * 90));
              }
            } catch (error) {
              console.error(`이미지 로드 실패: ${src}`, error);
              throw error; // 실패 시 상위로 에러 전파
            }
          })
        );

        if (isComponentMounted) {
          setResourcesLoaded(true);
          setProgress(100);
          completeLoading();
        }
      } catch (error) {
        console.error("리소스 로드 중 오류 발생:", error);
        if (isComponentMounted) {
          // 로딩 실패 시 사용자에게 알림
          alert("게임 리소스 로드에 실패했습니다. 페이지를 새로고침해주세요.");
          setLoading(false);
        }
      }
    };

    loadResources();

    return () => {
      isComponentMounted = false;
    };
  }, [setLoading, setProgress, completeLoading, playerStatus.characterType, opponentStatus.characterType]);

  useEffect(() => {
    if (playerBubble) {
      const timer = setTimeout(() => {
        setPlayerBubble(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [playerBubble]);

  useEffect(() => {
    // 페이지 진입 시 게임 상태 설정
    setCurrentGameState({
      isInGame: true, // 무조건 게임 중 상태로 설정
      gameType: "1vs1",
      roomId: gameState.roomId || null,
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
  }, [navigate, showExitWarning]);

  const handleBackClick = async () => {
    const shouldExit = await showExitWarning();
    if (shouldExit) {
      setLoading(true);
      setTimeout(() => {
        navigate("/main");
      }, 300);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;

    const newMessage: ChatMessage = {
      sender: playerStatus.name,
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setPlayerBubble(newMessage);
    setChatInput("");
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* 배경 이미지 레이어 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${battleBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 게임 컨텐츠 레이어 */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* 상단 네비게이션 영역 */}
        <div className="absolute top-4 left-4">
          <button className="bg-white bg-opacity-70 text-black py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors" onClick={handleBackClick}>
            ← 뒤로 가기
          </button>
        </div>

        {/* 메인 게임 영역 - 수직/수평 중앙 정렬 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full py-8">
            <BattleScreen
              resourcesLoaded={resourcesLoaded}
              playerStatus={playerStatus}
              opponentStatus={opponentStatus}
              playerBubble={playerBubble}
              timer={gameState.remainingTime}
              questionText={gameState.currentQuestion}
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChatSubmit={handleChatSubmit}
              onChatInputChange={handleChatInputChange}
              onPlayerAnimationComplete={(state) => handleAnimationComplete(playerStatus.id, state)}
              onOpponentAnimationComplete={(state) => handleAnimationComplete(opponentStatus.id, state)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneToOnePage;
