// WebSocket과 STOMP 관련 훅과 타입을 가져옵니다.
import { useWebSocket, MESSAGE_TYPES } from "./useWebSocket";
import { useEffect } from "react";
import { IMessage } from "@stomp/stompjs";

// 방 관련 메시지 타입을 정의하는 열거형
export enum MessageType {
  CREATE = "CREATE", // 방 생성 이벤트
  READY = "READY", // 사용자 준비 완료 이벤트
  COUNT = "COUNT", // 방 인원 수 업데이트 이벤트
  JOIN_FAIL = "JOIN_FAIL", // 방 참가 실패 이벤트
  NOT_READY = "NOT_READY", // 준비되지 않은 상태 이벤트
  DELETE = "DELETE", // 방 삭제 이벤트
  LEAVE = "LEAVE", // 사용자 퇴장 이벤트
  KICK_FAIL = "KICK_FAIL", // 강퇴 실패 이벤트
  KICK = "KICK", // 강퇴 성공 이벤트
  INFO = "INFO", // 방 정보 업데이트 이벤트
  START = "START", // 게임 시작 이벤트
  UNREADY = "UNREADY", // 준비 해제 이벤트
}

// WebSocket으로 받는 이벤트 메시지의 구조를 정의하는 인터페이스
interface EventMessage<T> {
  event: MessageType; // 이벤트 타입
  roomId: number; // 방 ID
  data: T; // 이벤트와 관련된 데이터
}

/**
 * 방 관련 WebSocket 이벤트를 처리하는 커스텀 훅
 * @param roomId 방 ID
 * @param handlers 각 이벤트 타입별 핸들러 함수들
 */
export const useRoomSocket = (roomId: number, handlers: { [key in MessageType]?: (data: any) => void }) => {
  const { subscribe, unsubscribe, connected, topics } = useWebSocket();

  useEffect(() => {
    // WebSocket이 연결되지 않은 경우 구독하지 않음
    if (!connected) return;

    // 방 토픽에 대한 STOMP 구독 설정
    const subscription = subscribe(topics.ROOM(roomId.toString()), (message: IMessage) => {
      try {
        // 수신된 메시지를 파싱하고 해당하는 핸들러 실행
        const eventMessage: EventMessage<any> = JSON.parse(message.body);
        const handler = handlers[eventMessage.event];

        if (handler) {
          handler(eventMessage.data);
        }
      } catch (error) {
        console.error("STOMP 메시지 처리 중 오류:", error);
      }
    });

    // 컴포넌트 언마운트 또는 의존성 변경 시 구독 해제
    return () => {
      if (subscription) {
        unsubscribe(topics.ROOM(roomId.toString()));
      }
    };
  }, [roomId, handlers, connected, subscribe, unsubscribe, topics]);

  // WebSocket 연결 상태 반환
  return {
    connected,
  };
};
