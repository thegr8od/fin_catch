// // WebSocket과 STOMP 관련 훅과 타입을 가져옵니다.
// import { useWebSocket, MESSAGE_TYPES } from "./useWebSocket";
// import { useEffect } from "react";
// import { IMessage } from "@stomp/stompjs";

// // WebSocket으로 받는 이벤트 메시지의 구조를 정의하는 인터페이스
// interface EventMessage<T> {
//   event: string; // 이벤트 타입 (MESSAGE_TYPES.ROOM의 값 중 하나)
//   roomId: number; // 방 ID
//   data: T; // 이벤트와 관련된 데이터
// }

// /**
//  * 방 관련 WebSocket 이벤트를 처리하는 커스텀 훅
//  * @param roomId 방 ID
//  * @param handlers 각 이벤트 타입별 핸들러 함수들
//  */
// export const useRoomSocket = (roomId: number, handlers: { [key: string]: (data: any) => void }) => {
//   const { subscribe, unsubscribe, connected, topics } = useWebSocket();

//   useEffect(() => {
//     // WebSocket이 연결되지 않은 경우 구독하지 않음
//     if (!connected) return;

//     // 방 토픽에 대한 STOMP 구독 설정
//     const subscription = subscribe(topics.ROOM(roomId.toString()), (message: IMessage) => {
//       try {
//         // 수신된 메시지를 파싱하고 해당하는 핸들러 실행
//         const eventMessage: EventMessage<any> = JSON.parse(message.body);
//         const handler = handlers[eventMessage.event];

//         if (handler) {
//           handler(eventMessage.data);
//         }
//       } catch (error) {
//         console.error("STOMP 메시지 처리 중 오류:", error);
//       }
//     });

//     // 컴포넌트 언마운트 또는 의존성 변경 시 구독 해제
//     return () => {
//       if (subscription) {
//         unsubscribe(topics.ROOM(roomId.toString()));
//       }
//     };
//   }, [roomId, handlers, connected, subscribe, unsubscribe, topics]);

//   // WebSocket 연결 상태 반환
//   return {
//     connected,
//   };
// };
