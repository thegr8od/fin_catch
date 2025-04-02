/**
 * WebSocket 메시지 타입 정의
 * 각 도메인별 가능한 액션 타입을 상수로 정의
 * 백엔드와 협의 후 변경될 수 있음
 */
export const MESSAGE_TYPES = {
  ROOM: {
    CREATE: "CREATE", // 방 생성
    READY: "READY", // 준비 완료
    COUNT: "COUNT", // 인원 수 업데이트
    JOIN_FAIL: "JOIN_FAIL", // 입장 실패
    NOT_READY: "NOT_READY", // 준비 안됨
    DELETE: "DELETE", // 방 삭제
    LEAVE: "LEAVE", // 퇴장
    KICK_FAIL: "KICK_FAIL", // 강퇴 실패
    KICK: "KICK", // 강퇴
    INFO: "INFO", // 방 정보
    START: "START", // 게임 시작
    UNREADY: "UNREADY", // 준비 해제
    UPDATE: "UPDATE", // 방 정보 업데이트
  },
  GAME: {
    STATUS: "STATUS", // 게임 상태
    PROBLEM: "PROBLEM", // 문제
    ANSWER: "ANSWER", // 답변
    RESULT: "RESULT", // 결과
    END: "END", // 종료
  },
  CHAT: {
    MESSAGE: "MESSAGE", // 채팅 메시지
    SEND: "SEND", // 메시지 전송
    RECEIVE: "RECEIVE", // 메시지 수신
  },
} as const;

/**
 * 메시지 타입 추론을 위한 유틸리티 타입
 */
export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES][keyof (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES]];
