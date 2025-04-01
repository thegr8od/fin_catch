import { Client } from "@stomp/stompjs";

/**
 * WebSocket 서버 연결 URL
 */
const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_BASE_URL;

/**
 * 재연결 시도 간격 (밀리초)
 * 연결이 끊어졌을 때 5초 후에 재연결 시도
 */
const RECONNECT_DELAY = 5000;

/**
 * STOMP 클라이언트 생성 및 연결 함수
 */
export const createStompClient = (): Promise<Client> => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("인증 토큰이 없습니다.");
        reject(new Error("인증 토큰이 없습니다."));
        return;
      }

      console.log("WebSocket 연결 시도:", SOCKET_URL);
      console.log("인증 토큰:", accessToken);

      const client = new Client({
        brokerURL: SOCKET_URL,
        connectHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        reconnectDelay: 0, // 자동 재연결 비활성화
        heartbeatIncoming: 0, // 하트비트 비활성화
        heartbeatOutgoing: 0,
      });

      // 연결 성공 시
      client.onConnect = (frame) => {
        console.log("STOMP 연결 성공:", frame);
        console.log("클라이언트 상태:", {
          connected: client.connected,
          active: client.active,
        });
        resolve(client);
      };

      // STOMP 프로토콜 에러
      client.onStompError = (frame) => {
        const errorMessage = frame.headers?.message || "알 수 없는 STOMP 오류";
        console.error("STOMP 에러:", errorMessage, frame);
        client.deactivate(); // 클라이언트 비활성화
        reject(new Error(`STOMP 연결 실패: ${errorMessage}`));
      };

      // WebSocket 에러
      client.onWebSocketError = (event) => {
        console.error("WebSocket 에러:", event);
        client.deactivate(); // 클라이언트 비활성화
        reject(new Error("WebSocket 연결 실패"));
      };

      // 연결 해제 시
      client.onDisconnect = (frame) => {
        console.log("STOMP 연결 해제:", frame);
        console.log("클라이언트 상태:", {
          connected: client.connected,
          active: client.active,
        });
        // 의도적인 연결 해제가 아닌 경우에만 에러 처리
        if (!client.active) {
          reject(new Error("STOMP 연결이 예기치 않게 종료되었습니다."));
        }
      };

      // 클라이언트 활성화 전에 모든 이전 연결 정리
      if (client.connected) {
        console.log("기존 연결 해제");
        client.deactivate();
      }

      console.log("STOMP 클라이언트 활성화 시도");
      client.activate();
    } catch (error) {
      console.error("STOMP 클라이언트 생성 실패:", error);
      reject(error);
    }
  });
};

/**
 * STOMP 메시지 전송 함수
 */
export const sendMessage = (client: Client, destination: string, body: any, headers = {}) => {
  if (!client.connected) {
    console.error("WebSocket이 연결되어 있지 않습니다.");
    return;
  }

  try {
    console.log(`메시지 전송 시도 - destination: ${destination}`, body);
    client.publish({
      destination,
      body: JSON.stringify(body),
      headers: {
        ...headers,
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    console.log("메시지 전송 완료");
  } catch (error) {
    console.error("메시지 전송 실패:", error);
  }
};

/**
 * STOMP 토픽 구독 함수
 *
 * 지정된 토픽을 구독하고 메시지 수신 시 콜백 함수를 실행합니다.
 * 클라이언트가 연결된 상태일 때만 구독을 수행합니다.
 *
 * @param {Stomp} client - STOMP 클라이언트 인스턴스
 * @param {string} topic - 구독할 토픽 경로
 * @param {Function} callback - 메시지 수신 시 실행할 콜백 함수
 * @param {Record<string, string>} headers - 구독에 사용할 추가 헤더 (선택적)
 * @returns {Promise<any>} 구독 객체 또는 실패 시 null
 */
export const subscribeToTopic = (client: any, topic: string, callback: (message: any) => void, headers: Record<string, string> = {}): any => {
  if (client && client.connected) {
    try {
      console.log(`토픽 구독 시작: ${topic}`);
      const subscription = client.subscribe(
        topic,
        (message: any) => {
          console.log(`[STOMP] 메시지 수신 (${topic}):`, message);
          console.log(`[STOMP] 메시지 body:`, message.body);
          try {
            const parsedBody = JSON.parse(message.body);
            console.log(`[STOMP] 파싱된 메시지:`, parsedBody);
            callback(parsedBody);
          } catch (e) {
            console.error(`[STOMP] 메시지 파싱 실패:`, e);
            callback(message);
          }
        },
        headers
      );
      console.log(`토픽 구독 성공: ${topic}, subscription ID: ${subscription.id}`);
      return subscription;
    } catch (e) {
      console.error(`구독 오류 (${topic}):`, e);
      return null;
    }
  } else {
    console.error(`STOMP 클라이언트 연결 상태 오류로 구독 실패 (${topic}). 연결 상태:`, client?.connected);
    return null;
  }
};
