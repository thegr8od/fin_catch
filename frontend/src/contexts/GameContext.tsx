import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { IMessage } from "@stomp/stompjs";
import { CharacterState, PlayerStatus } from "../components/game/types/character";
import { GameState } from "../components/game/types/game";
import { CharacterType } from "../components/game/constants/animations";
import { useUserInfo } from "../hooks/useUserInfo";
import { useWebSocket } from "../hooks/useWebSocket";
// 게임 관련 타입들은 현재 직접 정의하여 사용 중입니다.
// 필요시 아래 타입들을 활용할 수 있습니다.
// import { EventType } from "../types/game/eventType";
// import { GameContextState, GameEventData, HintData } from "../types/game/gameTypes";
// import { AnswerRequest } from "../types/game/answerRequest";

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

// 채팅 메시지 타입 (useWebSocket.ts와 일치)
interface ChatMessage {
  content: string;
  roomId: string;
  sender: number | string;
  userAnswer?: string;
  memberId?: number;
}

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
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{ sender: string; message: string; timestamp: Date }>>>;
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
  setChatMessages: () => {},
});

// 게임 컨텍스트 훅
export const useGame = () => useContext(GameContext);

// 게임 프로바이더 컴포넌트
export const GameProvider: React.FC<GameProviderProps> = ({ children, roomId, players }) => {
  const { user } = useUserInfo();
  const [loading, setLoading] = useState(true);

  // useWebSocket 훅 사용
  const { connected, subscribe, send, topics } = useWebSocket();

  // WebSocket 연결 상태 로깅
  useEffect(() => {
    console.log("GameContext - WebSocket 연결 상태:", connected, "roomId:", roomId);
  }, [connected, roomId]);

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

  // 게임 상태 변경 로깅
  useEffect(() => {
    console.log("GameContext - 게임 상태 변경:", gameState.gameStatus);
  }, [gameState.gameStatus]);

  // 로딩 상태 변경 로깅
  useEffect(() => {
    console.log("GameContext - 로딩 상태 변경:", loading);
  }, [loading]);

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
  const showError = () => {
    // 실제 애플리케이션에서는 토스트나 알림 UI를 표시
    console.error("오류가 발생했습니다");
  };

  // 애니메이션 완료 핸들러
  const handleAnimationComplete = useCallback(
    (playerId: number) => {
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
    (message: string) => {
      if (!message || message.trim() === "") {
        console.warn("빈 답변은 제출할 수 없습니다.");
        return false;
      }

      if (!currentQuizId) {
        console.warn("현재 퀴즈 ID가 없습니다.");
        return false;
      }

      const trimmedMessage = message.trim();
      const messageData: ChatMessage = {
        content: trimmedMessage,
        roomId: roomId.toString(),
        sender: playerStatus.id,
        userAnswer: trimmedMessage,
        memberId: playerStatus.id,
      };

      console.log("정답 제출:", messageData);
      send(`/app/game/${roomId}/checkAnswer`, messageData);
      return true;
    },
    [currentQuizId, roomId, playerStatus.id, send]
  );

  // WebSocket 메시지 핸들러 (useRef로 안정적인 참조 생성)
  const handleMessageRef = useRef<(message: IMessage) => void>(() => {});

  // 핸들러 업데이트
  useEffect(() => {
    handleMessageRef.current = (message: IMessage) => {
      try {
        // 전체 원본 메시지 로깅
        console.log("GameContext - WebSocket 원본 메시지:", message.body);

        // JSON 파싱 (신중하게 처리)
        let payload;
        try {
          // 1차 파싱 시도
          payload = JSON.parse(message.body);

          // 이중 문자열 파싱 처리 (가끔 서버에서 이중으로 인코딩되어 오는 경우)
          if (typeof payload === "string") {
            payload = JSON.parse(payload);
          }

          console.log("GameContext - 파싱된 메시지 데이터:", payload);

          // 이벤트와 데이터 확인 로깅
          console.log("GameContext - 이벤트 타입:", payload.event);
          console.log("GameContext - 데이터 구조:", payload.data);

          // data가 string인 경우 추가 파싱 (서버에서 가끔 데이터를 stringify하여 보내는 경우)
          if (typeof payload.data === "string") {
            try {
              payload.data = JSON.parse(payload.data);
            } catch {
              // data가 일반 문자열인 경우 파싱 오류는 무시
              console.log("GameContext - 데이터 내부 파싱 건너뜀 (일반 문자열)");
            }
          }
        } catch (parseError) {
          console.error("GameContext - 메시지 파싱 오류:", parseError);
          return;
        }

        // START 이벤트 특별 로깅
        if (payload.event === "START") {
          console.log("GameContext - 중요! START 이벤트 수신!");
          setLoading(false);
          setGameState((prev) => {
            console.log("GameContext - START 이벤트 처리: loading=false, gameStatus=playing");
            return {
              ...prev,
              gameStatus: "playing" as const,
            };
          });
          return; // START 이벤트 처리 후 종료
        }

        // MULTIPLE_QUIZ 이벤트 처리
        if (payload.event === "MULTIPLE_QUIZ") {
          console.log("GameContext - 중요! MULTIPLE_QUIZ 이벤트 수신! 원본 데이터:", JSON.stringify(payload.data, null, 2));

          // 문제 필드 확인 및 추출
          let questionText = "";

          if (payload.data.question) {
            console.log("GameContext - question 필드 발견:", payload.data.question);
            questionText = payload.data.question;
          } else if (payload.data.multipleQuestion) {
            console.log("GameContext - multipleQuestion 필드 발견:", payload.data.multipleQuestion);
            questionText = payload.data.multipleQuestion;
          } else {
            console.warn("GameContext - 문제 텍스트 필드 없음! 전체 데이터:", payload.data);
          }

          console.log("GameContext - 최종 사용할 문제 텍스트:", questionText);

          // 이전 문제와 같은지 확인
          if (gameState.currentQuestion === questionText) {
            console.log("GameContext - 이전과 동일한 문제입니다. 무시합니다.");
            return;
          }

          // 디버깅: 옵션 데이터 확인
          if (payload.data.options) {
            console.log("GameContext - 객관식 옵션 수:", payload.data.options.length);
            console.log("GameContext - 첫 번째 옵션:", payload.data.options[0]);
          } else {
            console.warn("GameContext - 객관식 옵션 없음!");
          }

          // 로딩 상태 해제 및 게임 상태 업데이트
          setLoading(false);
          setGameState((prev) => {
            const newState = {
              ...prev,
              gameStatus: "playing" as const,
              currentQuestion: questionText,
              remainingTime: payload.data.timer || 10,
            };
            console.log("GameContext - MULTIPLE_QUIZ 이벤트 처리 후 게임 상태:", newState);
            return newState;
          });

          // 퀴즈 ID 저장
          if (payload.data.quizId) {
            console.log("GameContext - 퀴즈 ID 저장:", payload.data.quizId);
            setCurrentQuizId(payload.data.quizId);
          }

          // 객관식 옵션 저장
          if (payload.data.options) {
            console.log("GameContext - 객관식 옵션 저장");
            setQuizOptions(payload.data.options);
          } else {
            setQuizOptions(null);
          }

          // 힌트 초기화
          setFirstHint(null);
          setSecondHint(null);

          return; // MULTIPLE_QUIZ 이벤트 처리 후 종료
        }

        // ESSAY_QUIZ 이벤트 처리
        else if (payload.event === "ESSAY_QUIZ") {
          console.log("GameContext - ESSAY_QUIZ 이벤트 수신! 원본 데이터:", JSON.stringify(payload.data, null, 2));

          // 문제 필드 확인 및 추출
          let questionText = "";

          if (payload.data.question) {
            console.log("GameContext - question 필드 발견:", payload.data.question);
            questionText = payload.data.question;
          } else if (payload.data.essayQuestion) {
            console.log("GameContext - essayQuestion 필드 발견:", payload.data.essayQuestion);
            questionText = payload.data.essayQuestion;
          } else {
            console.warn("GameContext - 문제 텍스트 필드 없음! 전체 데이터:", payload.data);
          }

          console.log("GameContext - 최종 사용할 문제 텍스트:", questionText);

          // 이전 문제와 같은지 확인
          if (gameState.currentQuestion === questionText) {
            console.log("GameContext - 이전과 동일한 문제입니다. 무시합니다.");
            return;
          }

          // 로딩 상태 해제 및 게임 상태 업데이트
          setLoading(false);
          setGameState((prev) => {
            const newState = {
              ...prev,
              gameStatus: "playing" as const,
              currentQuestion: questionText,
              remainingTime: payload.data.timer || 30,
            };
            console.log("GameContext - ESSAY_QUIZ 이벤트 처리 후 게임 상태:", newState);
            return newState;
          });

          // 퀴즈 ID 저장
          if (payload.data.quizId) {
            console.log("GameContext - 퀴즈 ID 저장:", payload.data.quizId);
            setCurrentQuizId(payload.data.quizId);
          }

          // 객관식 옵션 초기화
          setQuizOptions(null);

          // 힌트 초기화
          setFirstHint(null);
          setSecondHint(null);

          return; // ESSAY_QUIZ 이벤트 처리 후 종료
        }

        // 나머지 코드는 그대로 유지
        // 일반 채팅 메시지 처리
        if (!payload.event && payload.data) {
          const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;
          console.log("채팅 메시지 데이터:", data);

          if (data && (data.userAnswer || data.message || data.content)) {
            const memberId = data.memberId || payload.memberId || 0;
            const sender = data.sender || data.nickname || (memberId === playerStatus.id ? playerStatus.name : opponentStatus.name) || "알 수 없음";
            const content = data.userAnswer || data.message || data.content || "";

            console.log("채팅 메시지 처리:", { sender, content, memberId });

            // 내가 보낸 메시지도 포함하여 처리 (필터링 제거)
            // 중복 메시지 체크
            const messageKey = `${sender}-${content}`;
            const currentTime = new Date().getTime();
            const lastReceived = lastMessageTime[messageKey] || 0;

            if (currentTime - lastReceived < 2000) {
              console.log("중복 메시지 필터링됨:", messageKey);
              return;
            }

            // 마지막 메시지 시간 업데이트
            setLastMessageTime((prev) => ({
              ...prev,
              [messageKey]: currentTime,
            }));

            // 채팅 메시지 추가
            console.log("채팅 메시지 추가:", { sender, message: content });
            setChatMessages((prev) => [
              ...prev,
              {
                sender,
                message: content,
                timestamp: new Date(),
              },
            ]);

            return;
          }
        }

        // 퀴즈 결과 처리
        if (payload.event === "QUIZ_RESULT" && payload.data) {
          const resultData = typeof payload.data === "string" ? JSON.parse(payload.data) : payload.data;

          console.log("퀴즈 결과 데이터:", resultData);

          // 서버에서 보내는 데이터 형식에 맞게 처리
          const result = resultData.result || "";
          const quizId = resultData.quizId || 0;
          const sender = resultData.sender || "알 수 없음";

          // 채팅 메시지에 추가
          setChatMessages((prev) => [
            ...prev,
            {
              sender,
              message: result,
              timestamp: new Date(),
            },
          ]);

          // 정답 처리 애니메이션
          if (result === "정답입니다") {
            // 메시지를 보낸 사람이 자신일 경우
            if (sender === playerStatus.name) {
              setPlayerStatus((prev) => ({ ...prev, state: "attack" }));
              setOpponentStatus((prev) => ({ ...prev, state: "damage" }));
            } else {
              setOpponentStatus((prev) => ({ ...prev, state: "attack" }));
              setPlayerStatus((prev) => ({ ...prev, state: "damage" }));
            }
          }
        }

        // SHORT_QUIZ 이벤트 처리
        else if (payload.event === "SHORT_QUIZ") {
          console.log("GameContext - SHORT_QUIZ 이벤트 수신! 원본 데이터:", JSON.stringify(payload.data, null, 2));

          // 문제 필드 확인 및 추출
          let questionText = "";

          if (payload.data.question) {
            console.log("GameContext - question 필드 발견:", payload.data.question);
            questionText = payload.data.question;
          } else if (payload.data.shortQuestion) {
            console.log("GameContext - shortQuestion 필드 발견:", payload.data.shortQuestion);
            questionText = payload.data.shortQuestion;
          } else {
            console.warn("GameContext - 문제 텍스트 필드 없음! 전체 데이터:", payload.data);
          }

          console.log("GameContext - 최종 사용할 문제 텍스트:", questionText);

          // 이전 문제와 같은지 확인
          if (gameState.currentQuestion === questionText) {
            console.log("GameContext - 이전과 동일한 문제입니다. 무시합니다.");
            return;
          }

          // 로딩 상태 해제 및 게임 상태 업데이트
          setLoading(false);
          setGameState((prev) => {
            const newState = {
              ...prev,
              gameStatus: "playing" as const,
              currentQuestion: questionText,
              remainingTime: payload.data.timer || 20,
            };
            console.log("GameContext - SHORT_QUIZ 이벤트 처리 후 게임 상태:", newState);
            return newState;
          });

          // 퀴즈 ID 저장
          if (payload.data.quizId) {
            console.log("GameContext - 퀴즈 ID 저장:", payload.data.quizId);
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
          console.log("GameContext - REWARD/END 이벤트 수신!");
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
        console.error("메시지 처리 오류:", error);
      }
    };
  }, [playerStatus.id, playerStatus.name, opponentStatus.id, opponentStatus.name, lastMessageTime]);

  // 타이머 감소 로직
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (gameState.remainingTime > 0) {
      timerInterval = setInterval(() => {
        setGameState((prev) => {
          const newRemainingTime = Math.max(0, prev.remainingTime - 1);

          // 타이머가 0이 되면 콘솔에 로그 출력
          if (newRemainingTime === 0 && prev.remainingTime > 0) {
            console.log("GameContext - 타이머 종료: 다음 문제 대기 상태");
          }

          return {
            ...prev,
            remainingTime: newRemainingTime,
          };
        });
      }, 1000);
    }
    // 타이머가 0이 되었을 때 추가 로직
    else if (gameState.remainingTime === 0 && gameState.currentQuestion) {
      console.log("GameContext - 타이머가 0입니다. 다음 문제를 기다립니다.");

      // 타이머가 0이 된 후 3초 후에 자동으로 다음 문제를 받을 준비상태로 변경
      const readyForNextQuizTimer = setTimeout(() => {
        console.log("GameContext - 다음 문제 준비 상태로 변경");
        // 현재 문제 초기화하지만 게임 상태는 유지
        setGameState((prev) => ({
          ...prev,
          currentQuestion: "", // 현재 문제 초기화
        }));
      }, 3000);

      return () => {
        clearTimeout(readyForNextQuizTimer);
      };
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [gameState.currentQuestion, gameState.remainingTime, currentQuizId]);

  // WebSocket 구독 설정
  useEffect(() => {
    if (!connected || !roomId) {
      console.log("GameContext - 구독 실패: connected=", connected, "roomId=", roomId);
      return;
    }

    // 게임 토픽 구독
    const gameTopic = topics.GAME(roomId);
    console.log("GameContext - 게임 토픽 구독 시작:", gameTopic);
    setChatMessages([]);

    // useRef로 만든 안정적인 핸들러 사용
    const stableHandleMessage = (message: IMessage) => {
      console.log("GameContext - 메시지 수신!", message);
      console.log("GameContext - 메시지 원본 내용:", message.body);
      console.log("GameContext - 메시지 헤더:", message.headers);

      // 디버깅: 메시지 수신 상태 확인
      try {
        if (handleMessageRef.current) {
          handleMessageRef.current(message);
        }
      } catch (error) {
        console.error("GameContext - 메시지 처리 오류:", error);
      }
    };

    const gameSubscription = subscribe(gameTopic, stableHandleMessage);
    console.log("GameContext - 게임 토픽 구독 완료:", gameSubscription ? "성공" : "실패");

    // 백엔드 타이밍 이슈를 위한 안전장치
    // 8초 후에도 여전히 로딩 중이면 강제로 로딩 상태 해제
    const forceLoadingTimer = setTimeout(() => {
      console.log("GameContext - 8초 타임아웃 체크: loading=", loading);
      if (loading) {
        console.log("GameContext - 로딩 상태 8초 초과, 강제 해제");
        setLoading(false);
        setGameState((prev) => ({
          ...prev,
          gameStatus: "playing" as const,
        }));
      }
    }, 8000);

    return () => {
      clearTimeout(forceLoadingTimer);
      if (gameSubscription) {
        console.log("GameContext - 게임 토픽 구독 해제 - 컴포넌트 언마운트");
        gameSubscription.unsubscribe(); // 직접 구독 객체의 unsubscribe 호출
      }
    };
  }, [connected, roomId, topics.GAME]);

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
        const chatData: ChatMessage = {
          content: message,
          roomId,
          sender: sender,
        };

        // 채팅 메시지 전송
        send(`/app/game/${roomId}/checkAnswer`, chatData);

        return true;
      } catch {
        console.error("채팅 메시지 전송 실패");
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
      setChatMessages,
    }),
    [gameState, playerStatus, opponentStatus, loading, quizOptions, firstHint, secondHint, chatMessages, sendChatMessage, handleAnimationComplete, handleAttack, handleAnswerSubmit, setChatMessages]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
