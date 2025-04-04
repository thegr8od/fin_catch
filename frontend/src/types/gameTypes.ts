import { PlayerStatus } from "../components/game/types/character";
import { GameState } from "../components/game/types/game";

// 게임 컨텍스트 상태 인터페이스
export interface GameContextState {
  gameState: GameState;
  playerStatus: PlayerStatus;
  opponentStatus: PlayerStatus;
  currentQuizId: number | null;
  connected: boolean;
  loading: boolean;
}

// 게임 이벤트 데이터 타입
export interface GameEventData {
  event: string;
  roomId: string;
  data: unknown;
}

// 퀴즈 데이터 타입
export interface QuizData {
  quizId: number;
  question: string;
  options?: QuizOption[];
}

// 퀴즈 옵션 타입
export interface QuizOption {
  optionNumber: number;
  optionText: string;
  isCorrect: boolean;
}

// 힌트 데이터
export interface HintData {
  type: number;
  hint: string;
}

// 공격 데이터
export interface AttackData {
  attackedMemberId: number;
  memberList: MemberData[];
}

// 멤버 데이터
export interface MemberData {
  memberId: number;
  nickname: string;
  mainCat: string;
  life: number;
}

// 게임 결과 데이터
export interface GameResultData {
  winner: number;
  loser: number;
}
