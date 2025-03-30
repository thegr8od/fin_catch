/**
 * WebSocket 토픽 정의
 * 각 도메인별(ROOM, CHAT, GAME)로 토픽을 구분하고 roomId를 파라미터로 받아 동적 토픽 생성
 * 백엔드와 협의 후 변경될 수 있음
 */
export const SOCKET_TOPICS = {
  ROOM: (roomId: string) => `/room/room/${roomId}`,
  CHAT: (roomId: string) => `/topic/chat/${roomId}`,
  GAME: (roomId: string) => `/topic/game/${roomId}`,
} as const;

/**
 * 토픽 타입 추론을 위한 유틸리티 타입
 */
export type TopicType = ReturnType<(typeof SOCKET_TOPICS)[keyof typeof SOCKET_TOPICS]>;
