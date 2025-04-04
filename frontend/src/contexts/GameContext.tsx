import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from "react";
import { IMessage } from "@stomp/stompjs";
import { CharacterState, PlayerStatus } from "../components/game/types/character";
import { GameState } from "../components/game/types/game";
import { CharacterType } from "../components/game/constants/animations";
import { useUserInfo } from "../hooks/useUserInfo";
import { useWebSocket } from "../hooks/useWebSocket";

// 퀴즈 옵션 인터페이스
interface QuizOption {
  quizOptionId: number;
  quizId: number;
  optionNumber: number;
  optionText: string;
  correct: boolean;
}

// 힌트 인터페이스
interface Hint {
  hint: string;
  type: number;
}

// 게임 멤버 인터페이스 정의
export interface GameMember {
  memberId: number;
  mainCat: string;
  nickname: string;
  life: number;
}

// ONE_ATTACK 이벤트 타입
interface OneAttackData {
  attackedMemberId: number;
  memberList: Array<{
    memberId: number;
    nickname: string;
    life: number;
  }>;
}

// TWO_ATTACK 이벤트 타입
type TwoAttackData = Array<{
  memberId: number;
  nickname: string;
  life: number;
}>;

// 게임 컨텍스트 인터페이스
interface GameContextType {
  gameState: GameState;
  playerStatus: PlayerStatus;
  opponentStatus: PlayerStatus;
  loading: boolean;
  quizOptions: QuizOption[] | null;
  firstHint: Hint | null;
  secondHint: Hint | null;
  handleAnimationComplete: (playerId: number, currentState: CharacterState) => void;
  handleAttack: (playerId: number) => void;
  handleAnswerSubmit: (message: string) => boolean;
  chatMessages: Array<{ sender: string; message: string; timestamp: Date }>;
  sendChatMessage: (message: string, sender: string) => boolean;
}

// 게임 프로바이더 Props 인터페이스
interface GameProviderProps {
  children: ReactNode;
  roomId: string;
  players: GameMember[];
}

// 기본값으로 초기화된 게임 컨텍스트
const GameContext = createContext<GameContextType>({
  gameState: {
    roomId: null,
    currentQuestion: "",
    remainingTime: 0,
    gameStatus: "waiting",
  },
  playerStatus: {
    id: 0,
    name: "",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  },
  opponentStatus: {
    id: 0,
    name: "",
    characterType: "classic",
    health: 5,
    state: "idle",
    score: 0,
  },
  loading: true,
  quizOptions: null,
  firstHint: null,
  secondHint: null,
  handleAnimationComplete: () => {},
  handleAttack: () => {},
  handleAnswerSubmit: () => false,
  chatMessages: [],
  sendChatMessage: () => false,
});

// 게임 컨텍스트 훅
export const useGame = () => useContext(GameContext);

// 게임 프로바이더 컴포넌트
export const GameProvider: React.FC<GameProviderProps> = ({ children, roomId, players }) => {
  const { user } = useUserInfo();
  const [loading, setLoading] = useState(true);

  // useWebSocket 훅 사용
  const { connected, subscribe, unsubscribe, send, topics } = useWebSocket();

  // 현재 멤버 정보 찾기 (닉네임으로 비교)
  const currentPlayer = players.find((p) => p.nickname === user?.nickname);
  const opponentPlayer = players.find((p) => p.nickname !== user?.nickname);

  // 게임 상태 관리
  const [gameState, setGameState] = useState<GameState>({
    roomId: roomId || null,
    currentQuestion: "",
    remainingTime: 0,
    gameStatus: "waiting",
  });

  // 퀴즈 관련 상태 추가
  const [quizOptions, setQuizOptions] = useState<QuizOption[] | null>(null);
  const [firstHint, setFirstHint] = useState<Hint | null>(null);
  const [secondHint, setSecondHint] = useState<Hint | null>(null);

  // 컴포넌트 마운트 시 roomId 설정 확인
  useEffect(() => {
    if (roomId && gameState.roomId !== roomId) {
      setGameState((prev) => ({
        ...prev,
        roomId,
      }));
    }
  }, [roomId, gameState.roomId]);

  // 플레이어 상태 관리
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>({
    id: currentPlayer?.memberId || 0,
    name: currentPlayer?.nickname || user?.nickname || "플레이어",
    characterType: (currentPlayer?.mainCat || user?.mainCat?.catName || "classic") as CharacterType,
    health: currentPlayer?.life || 5,
    state: "idle",
    score: 0,
  });

  // 상대 플레이어 상태 관리
  const [opponentStatus, setOpponentStatus] = useState<PlayerStatus>({
    id: opponentPlayer?.memberId || 0,
    name: opponentPlayer?.nickname || "상대방",
    characterType: (opponentPlayer?.mainCat || "classic") as CharacterType,
    health: opponentPlayer?.life || 5,
    state: "idle",
    score: 0,
  });

  // 현재 퀴즈 ID
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);

  // 최근 메시지 전송 시간을 추적하기 위한 상태
  const [lastMessageTime, setLastMessageTime] = useState<Record<string, number>>({});

  // 채팅 메시지를 위한 상태
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string; timestamp: Date }>>([]);

  // 에러 메시지 알림 함수
  const showError = (message: string) => {
    // 실제 애플리케이션에서는 토스트나 알림 UI를 표시
  };

  // 애니메이션 완료 핸들러
  const handleAnimationComplete = useCallback(
    (playerId: number, currentState: CharacterState) => {
      if (playerId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: "idle",
        }));
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: "idle",
        }));
      }
    },
    [playerStatus.id]
  );

  // 공격 처리
  const handleAttack = useCallback(
    (playerId: number) => {
      if (playerId === playerStatus.id) {
        setPlayerStatus((prev) => ({
          ...prev,
          state: "attack",
        }));

        setOpponentStatus((prev) => ({
          ...prev,
          state: "damage",
          health: Math.max(0, prev.health - 1),
        }));
      } else {
        setOpponentStatus((prev) => ({
          ...prev,
          state: "attack",
        }));

        setPlayerStatus((prev) => ({
          ...prev,
          state: "damage",
          health: Math.max(0, prev.health - 1),
        }));
      }
    },
    [playerStatus.id]
  );

  // 정답 제출 핸들러
  const handleAnswerSubmit = useCallback(
    (message: string): boolean => {
      if (!connected) {
        showError("서버 연결이 끊어졌습니다. 게임을 다시 시작해주세요.");
        return false;
      }

      if (!message.trim()) {
        showError("정답을 입력해주세요.");
        return false;
      }

      try {
        // 중복 전송 방지
        const currentTime = new Date().getTime();
        const messageKey = `${playerStatus.name}-${message.trim()}`;
        const lastSent = lastMessageTime[messageKey] || 0;

        if (currentTime - lastSent < 2000) {
          return false;
        }

        // 마지막 전송 시간 업데이트
        setLastMessageTime((prev) => ({
          ...prev,
          [messageKey]: currentTime,
        }));

        // 요청 데이터 구성
        const messageData = {
          userAnswer: message.trim(),
          memberId: playerStatus.id,
          sender: playerStatus.name,
        };

        // 메시지 전송
        send(`/app/game/${roomId}/checkAnswer`, messageData as any);

        // 내가 보낸 메시지를 로컬 채팅창에 즉시 표시
        setChatMessages((prev) => [
          ...prev,
          {
            sender: playerStatus.name,
            message: message.trim(),
            timestamp: new Date(),
          },
        ]);

        return true;
      } catch (error) {
        showError("정답 제출 중 오류가 발생했습니다.");
        return false;
      }
    },
    [connected, roomId, playerStatus.id, playerStatus.name, showError, send, lastMessageTime]
  );

  // WebSocket 메시지 핸들러
  const handleMessage = useCallback(
    (message: IMessage) => {
      try {
        // JSON 파싱
        let payload;
        try {
          payload = JSON.parse(message.body);
          if (typeof payload === "string") {
            payload = JSON.parse(payload);
          }
        } catch (parseError) {
          return;
        }

        // 일반 채팅 메시지 처리
        if (!payload.event && payload.data) {
          const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;

          if (data && (data.userAnswer || data.message || data.content)) {
            const memberId = data.memberId || payload.memberId || 0;
            const sender = data.sender || data.nickname || (memberId === playerStatus.id ? playerStatus.name : opponentStatus.name) || "알 수 없음";
            const content = data.userAnswer || data.message || data.content || "";

            // 내가 보낸 메시지는 이미 로컬에 표시했으므로 제외
            if (memberId !== playerStatus.id) {
              // 중복 메시지 체크
              const messageKey = `${sender}-${content}`;
              const currentTime = new Date().getTime();
              const lastReceived = lastMessageTime[messageKey] || 0;

              if (currentTime - lastReceived < 2000) {
                return;
              }

              // 마지막 메시지 시간 업데이트
              setLastMessageTime((prev) => ({
                ...prev,
                [messageKey]: currentTime,
              }));

              // 채팅 메시지 추가
              setChatMessages((prev) => [
                ...prev,
                {
                  sender,
                  message: content,
                  timestamp: new Date(),
                },
              ]);
            }
            return;
          }
        }

        // 퀴즈 결과 처리
        if (payload.event === "QUIZ_RESULT" && payload.data) {
          const resultData = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;

          const result = resultData.result || "";
          const memberId = resultData.memberId || 0;
          const answer = resultData.userAnswer || resultData.answer || "";

          // 발신자 식별
          let sender = resultData.sender || resultData.nickname || "";
          if (!sender) {
            sender = memberId === playerStatus.id ? playerStatus.name : memberId === opponentStatus.id ? opponentStatus.name : "알 수 없음";
          }

          // 내가 보낸 메시지가 아닐 경우만 처리
          if (memberId !== playerStatus.id && sender !== playerStatus.name) {
            // 중복 메시지 체크
            const messageKey = `${sender}-${answer}`;
            const currentTime = new Date().getTime();
            const lastReceived = lastMessageTime[messageKey] || 0;

            if (currentTime - lastReceived < 2000) {
              return;
            }

            // 마지막 메시지 시간 업데이트
            setLastMessageTime((prev) => ({
              ...prev,
              [messageKey]: currentTime,
            }));

            // 채팅 메시지에 추가
            if (answer) {
              setChatMessages((prev) => [
                ...prev,
                {
                  sender,
                  message: answer,
                  timestamp: new Date(),
                },
              ]);
            }

            // 정답 처리 애니메이션
            if (result === "정답입니다") {
              setOpponentStatus((prev) => ({ ...prev, state: "attack" }));
              setPlayerStatus((prev) => ({ ...prev, state: "damage" }));
            }
          }
        }

        // 게임 이벤트 처리 로직 복원
        else if (payload.event === "START") {
          setLoading(false);
          setGameState((prev) => ({
            ...prev,
            gameStatus: "playing",
          }));
        } else if (payload.event === "MULTIPLE_QUIZ") {
          setLoading(false);
          setGameState((prev) => ({
            ...prev,
            gameStatus: "playing",
            currentQuestion: payload.data.multipleQuestion || payload.data.question,
            remainingTime: payload.data.timer || 10,
          }));

          // 퀴즈 ID 저장
          if (payload.data.quizId) {
            setCurrentQuizId(payload.data.quizId);
          }

          // 객관식 옵션 저장
          setQuizOptions(payload.data.options);

          // 힌트 초기화
          setFirstHint(null);
          setSecondHint(null);
        } else if (payload.event === "SHORT_QUIZ") {
          setLoading(false);
          setGameState((prev) => ({
            ...prev,
            gameStatus: "playing",
            currentQuestion: payload.data.shortQuestion || payload.data.question,
            remainingTime: payload.data.timer || 20,
          }));

          // 퀴즈 ID 저장
          if (payload.data.quizId) {
            setCurrentQuizId(payload.data.quizId);
          }

          // 객관식 옵션 초기화
          setQuizOptions(null);

          // 힌트 초기화
          setFirstHint(null);
          setSecondHint(null);
        } else if (payload.event === "FIRST_HINT") {
          setFirstHint(payload.data);
        } else if (payload.event === "SECOND_HINT") {
          setSecondHint(payload.data);
        } else if (payload.event === "ONE_ATTACK") {
          const data = payload.data as OneAttackData;

          // 멤버 목록에서 내 정보와 상대방 정보 찾기
          const myInfo = data.memberList.find((m) => m.memberId === playerStatus.id);
          const opponentInfo = data.memberList.find((m) => m.memberId !== playerStatus.id);

          // 체력 업데이트
          if (myInfo) {
            setPlayerStatus((prev) => ({
              ...prev,
              health: myInfo.life,
            }));
          }

          if (opponentInfo) {
            setOpponentStatus((prev) => ({
              ...prev,
              health: opponentInfo.life,
            }));
          }

          // 공격받은 사람 확인하여 애니메이션 상태 업데이트
          const attackedId = data.attackedMemberId;
          if (attackedId === playerStatus.id) {
            // 내가 공격받음
            setOpponentStatus((prev) => ({ ...prev, state: "attack" }));
            setPlayerStatus((prev) => ({ ...prev, state: "damage" }));
          } else {
            // 상대방이 공격받음
            setPlayerStatus((prev) => ({ ...prev, state: "attack" }));
            setOpponentStatus((prev) => ({ ...prev, state: "damage" }));
          }
        } else if (payload.event === "TWO_ATTACK") {
          const data = payload.data as TwoAttackData;

          // 체력 업데이트
          const myInfo = data.find((m) => m.memberId === playerStatus.id);
          const opponentInfo = data.find((m) => m.memberId !== playerStatus.id);

          if (myInfo) {
            setPlayerStatus((prev) => ({
              ...prev,
              health: myInfo.life,
              state: "damage",
            }));
          }

          if (opponentInfo) {
            setOpponentStatus((prev) => ({
              ...prev,
              health: opponentInfo.life,
              state: "damage",
            }));
          }
        } else if (payload.event === "REWARD" || payload.event === "END") {
          setGameState((prev) => ({
            ...prev,
            gameStatus: "finished",
          }));

          // 승부 결과 처리
          const winnerId = payload.data?.winner;

          if (winnerId === -1) {
            // 무승부
            setPlayerStatus((prev) => ({ ...prev, state: "idle" }));
            setOpponentStatus((prev) => ({ ...prev, state: "idle" }));
          } else if (winnerId === playerStatus.id) {
            // 내가 승리
            setPlayerStatus((prev) => ({ ...prev, state: "victory" }));
            setOpponentStatus((prev) => ({ ...prev, state: "dead" }));
          } else {
            // 상대방 승리
            setPlayerStatus((prev) => ({ ...prev, state: "dead" }));
            setOpponentStatus((prev) => ({ ...prev, state: "victory" }));
          }
        }
      } catch (error) {
        // 오류 처리
      }
    },
    [playerStatus.id, playerStatus.name, opponentStatus.id, opponentStatus.name, lastMessageTime]
  );

  // 타이머 감소 로직
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (gameState.remainingTime > 0) {
      timerInterval = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          remainingTime: Math.max(0, prev.remainingTime - 1),
        }));
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [gameState.currentQuestion, currentQuizId]);

  // WebSocket 구독 설정
  useEffect(() => {
    if (!connected || !roomId) {
      return;
    }

    // 게임 토픽 구독
    const gameTopic = topics.GAME(roomId);
    setChatMessages([]);
    const gameSubscription = subscribe(gameTopic, handleMessage);

    return () => {
      if (gameSubscription) {
        unsubscribe(gameSubscription);
      }
    };
  }, [connected, roomId, topics.GAME, subscribe, unsubscribe, handleMessage]);

  // 채팅 메시지 전송 함수
  const sendChatMessage = useCallback(
    (message: string, sender: string) => {
      if (!connected || !roomId) {
        return false;
      }

      try {
        // 중복 전송 방지
        const currentTime = new Date().getTime();
        const messageKey = `${sender}-${message}`;
        const lastSent = lastMessageTime[messageKey] || 0;

        if (currentTime - lastSent < 2000) {
          return false;
        }

        // 마지막 전송 시간 업데이트
        setLastMessageTime((prev) => ({
          ...prev,
          [messageKey]: currentTime,
        }));

        // 채팅 메시지 데이터 구성
        const chatData = {
          userAnswer: message,
          memberId: playerStatus.id,
          sender: sender,
        };

        // 채팅 메시지 전송
        send(`/app/game/${roomId}/checkAnswer`, chatData as any);

        // 내가 보낸 메시지를 로컬에 추가
        setChatMessages((prev) => [
          ...prev,
          {
            sender,
            message,
            timestamp: new Date(),
          },
        ]);

        return true;
      } catch (error) {
        return false;
      }
    },
    [connected, roomId, playerStatus.id, send, lastMessageTime]
  );

  // 컨텍스트 값
  const value = useMemo(
    () => ({
      gameState,
      playerStatus,
      opponentStatus,
      loading,
      quizOptions,
      firstHint,
      secondHint,
      chatMessages,
      sendChatMessage,
      handleAnimationComplete,
      handleAttack,
      handleAnswerSubmit,
    }),
    [gameState, playerStatus, opponentStatus, loading, quizOptions, firstHint, secondHint, chatMessages, sendChatMessage, handleAnimationComplete, handleAttack, handleAnswerSubmit]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
