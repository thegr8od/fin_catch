import { Client, IMessage } from "@stomp/stompjs";
import { useCallback, useEffect, useState } from "react";
import { createStompClient, sendMessage } from "../service/stompService";
import { MESSAGE_TYPES } from "../types/WebSocket/MessageTypes";
import { SOCKET_TOPICS } from "../types/WebSocket/Topics";
/**
 * WebSocket 연결 및 관리를 위한 React 훅
 *
 * 주요 기능:
 * - WebSocket 클라이언트 생성 및 연결 관리
 * - 토픽 구독 및 구독 해제
 * - 메시지 전송
 *
 * @returns WebSocket 관련 상태 및 함수들
 */
export const useWebSocket = () => {
  // WebSocket 클라이언트 상태
  const [client, setClient] = useState<Client | null>(null);
  // 연결 상태
  const [connected, setConnected] = useState(false);
  // 활성 구독 목록 (토픽별로 관리)
  const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});

  // 컴포넌트 마운트 시 WebSocket 클라이언트 초기화
  useEffect(() => {
    let mounted = true;

    const initializeWebSocket = async () => {
      try {
        console.log("WebSocket 연결 시도");
        const stompClient = await createStompClient();

        if (mounted) {
          console.log("STOMP 클라이언트 생성 및 연결 완료");
          setClient(stompClient);
          setConnected(true);
        }
      } catch (error) {
        console.error("WebSocket 초기화 실패:", error);
        if (mounted) {
          setConnected(false);
        }
      }
    };

    initializeWebSocket();

    return () => {
      mounted = false;
      if (client) {
        console.log("WebSocket 연결 해제");
        Object.values(subscriptions).forEach((sub) => sub.unsubscribe());
        client.deactivate();
      }
    };
  }, []);

  /**
   * 토픽 구독 함수
   *
   * @param topic 구독할 토픽 경로
   * @param callback 메시지 수신 시 실행할 콜백 함수
   * @returns 구독 객체 또는 실패 시 null
   */
  const subscribe = useCallback(
    (topic: string, callback: (message: IMessage) => void) => {
      console.log("[WebSocket] subscribe 호출됨:", { topic, hasClient: !!client, connected });

      if (!client) {
        console.error("[WebSocket] STOMP client가 없습니다.");
        return null;
      }

      if (!connected) {
        console.error("[WebSocket] WebSocket이 연결되지 않았습니다.");
        return null;
      }

      try {
        console.log("[WebSocket] 구독 시도:", { topic, clientConnected: client.connected });

        // 이미 구독 중인 경우 기존 구독 해제
        if (subscriptions[topic]) {
          console.log("[WebSocket] 기존 구독 해제:", topic);
          subscriptions[topic].unsubscribe();
        }

        const subscription = client.subscribe(topic, (message) => {
          console.log(`[STOMP] 메시지 수신 (${topic}):`, message);
          console.log(`[STOMP] 메시지 body:`, message.body);
          try {
            const parsedBody = JSON.parse(message.body);
            console.log(`[STOMP] 파싱된 메시지:`, parsedBody);
            callback(message);
          } catch (e) {
            console.error(`[STOMP] 메시지 파싱 실패:`, e);
            callback(message);
          }
        });

        console.log(`[WebSocket] 구독 성공: ${topic}, subscription ID: ${subscription.id}`);

        setSubscriptions((prev) => ({
          ...prev,
          [topic]: subscription,
        }));

        return subscription;
      } catch (error) {
        console.error("[WebSocket] 구독 중 에러 발생:", error);
        return null;
      }
    },
    [client, connected, subscriptions]
  );

  const send = useCallback(
    (destination: string, body: any, headers = {}) => {
      if (!client || !connected) {
        console.error("[WebSocket] 메시지 전송 실패: 연결되지 않음");
        return false;
      }

      try {
        sendMessage(client, destination, body, headers);
        console.log(`[WebSocket] 메시지 전송 성공: ${destination}`);
        return true;
      } catch (error) {
        console.error("[WebSocket] 메시지 전송 실패:", error);
        return false;
      }
    },
    [client, connected]
  );

  return {
    client,
    connected,
    subscriptions,
    subscribe,
    send,
  };
};
