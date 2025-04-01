import { Client, IMessage, StompHeaders, StompSubscription } from "@stomp/stompjs";

/**
 * WebSocket 서버 연결 URL
 * 개발 환경에서는 로컬 서버 주소를 사용
 */
const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_BASE_URL;

/**
 * 재연결 시도 간격 (밀리초)
 * 연결이 끊어졌을 때 5초 후에 재연결 시도
 */
const RECONNECT_DELAY = 5000;

/**
 * STOMP 클라이언트 생성 함수
 *
 * WebSocket 연결을 위한 STOMP 클라이언트를 초기화하고 설정합니다.
 * 이벤트 리스너와 연결 옵션을 설정하고 준비된 클라이언트를 반환합니다.
 *
 * @returns {Client} 설정이 완료된 STOMP 클라이언트 인스턴스
 */
export const createStompClient = (): Client => {
  // 로컬 스토리지에서 토큰 가져오기
  const token = localStorage.getItem("accessToken");

  // 클라이언트 인스턴스 생성 및 기본 설정
  const client = new Client({
    // WebSocket 팩토리 함수: 실제 WebSocket 연결 생성
    webSocketFactory: () => {
      console.log("WebSocket 연결 생성:", SOCKET_URL);
      return new WebSocket(SOCKET_URL);
    },
    // 연결 헤더 설정: 인증 토큰 포함
    connectHeaders: {
      Authorization: token ? `Bearer ${token}` : "",
    },
    // 디버그 메시지 처리 함수
    debug: (str) => {
      console.log("STOMP 디버그:", str);
    },
    // 재연결 설정: 연결 끊어진 후 재시도 간격
    reconnectDelay: RECONNECT_DELAY,
    // 하트비트 설정: 연결 유지를 위한 ping/pong 간격
    heartbeatIncoming: 10000, // 서버로부터 10초마다 하트비트 확인
    heartbeatOutgoing: 10000, // 서버로 10초마다 하트비트 전송
    // 연결 타임아웃: 30초 동안 연결 안되면 실패로 간주
    connectionTimeout: 30000,
  });

  // 연결 시작 전 호출되는 이벤트 핸들러
  client.beforeConnect = () => {
    console.log("STOMP 연결 시도 중...");
    // 연결 시도 직전에 토큰 갱신
    const currentToken = localStorage.getItem("accessToken");
    if (currentToken && client.connectHeaders) {
      client.connectHeaders.Authorization = `Bearer ${currentToken}`;
      console.log("STOMP 연결 헤더에 토큰 설정:", currentToken.substring(0, 15) + "...");
    }
  };

  // WebSocket 연결 종료 이벤트 핸들러
  client.onWebSocketClose = (e) => {
    console.log("WebSocket 연결 종료:", e);
  };

  // WebSocket 오류 발생 이벤트 핸들러
  client.onWebSocketError = (e) => {
    console.log("WebSocket 오류 : ", e);
  };

  // 설정 완료된 클라이언트 반환
  return client;
};

/**
 * STOMP 메시지 전송 함수
 *
 * 지정된 대상(destination)으로 메시지를 전송합니다.
 * 클라이언트가 연결된 상태일 때만 메시지를 전송합니다.
 *
 * @param {Client} client - STOMP 클라이언트 인스턴스
 * @param {string} destination - 메시지를 전송할 대상 경로
 * @param {unknown} body - 전송할 메시지 내용 (JSON으로 직렬화됨)
 * @param {Record<string, string>} headers - 메시지에 포함할 추가 헤더 (선택적)
 */
export const sendMessage = (client: Client, destination: string, body: unknown, headers: Record<string, string> = {}): void => {
  // 클라이언트 연결 상태 확인
  if (client.connected) {
    try {
      const token = localStorage.getItem("accessToken");
      // 메시지 발행(publish)
      client.publish({
        destination, // 메시지 대상 경로
        body: JSON.stringify(body), // 메시지 내용을 JSON 문자열로 변환
        headers: {
          ...headers,
          Authorization: token ? `Bearer ${token}` : "",
        }, // 추가 헤더
      });

      console.log("STOMP 메시지 전송 완료!");
    } catch (e) {
      console.error("STOMP 메시지 전송 오류ㅠ", e);
    }
  } else {
    console.error("STOMP 클라이언트가 연결되어 있지 않아용. 연결 상태 :", client.connected);
  }
};

/**
 * STOMP 토픽 구독 함수
 *
 * 지정된 토픽을 구독하고 메시지 수신 시 콜백 함수를 실행합니다.
 * 클라이언트가 연결된 상태일 때만 구독을 수행합니다.
 *
 * @param {Client} client - STOMP 클라이언트 인스턴스
 * @param {string} topic - 구독할 토픽 경로
 * @param {Function} callback - 메시지 수신 시 실행할 콜백 함수
 * @param {Record<string, string>} headers - 구독에 사용할 추가 헤더 (선택적)
 * @returns {StompSubscription | null} 구독 객체 또는 실패 시 null
 */
export const subscribeToTopic = (client: Client, topic: string, callback: (message: IMessage) => void, headers: Record<string, string> = {}): StompSubscription | null => {
  // 클라이언트 연결 상태 확인
  if (client.connected) {
    try {
      console.log(`토픽 구독 시작: ${topic}`);

      // 토픽 구독 수행
      const subscription = client.subscribe(
        topic, // 구독할 토픽 경로
        (message) => {
          // 메시지 수신 시 처리 로직
          console.log(`토픽 ${topic}에서 메시지 수신:`, message);
          callback(message); // 사용자 정의 콜백 실행
        },
        headers // 추가 헤더
      );

      console.log(`토픽 구독 성공: ${topic}, ID: ${subscription.id}`);
      return subscription; // 구독 객체 반환
    } catch (e) {
      console.error(`구독 오류 토픽 : (${topic}):`, e);
      return null; // 오류 발생 시 null 반환
    }
  } else {
    console.error(`STOMP 클라이언트 연결 상태 오류로 구독 실패 토픽 : (${topic}). 연결 상태: `, client.connected);
    return null; // 연결되지 않은 경우 null 반환
  }
};
