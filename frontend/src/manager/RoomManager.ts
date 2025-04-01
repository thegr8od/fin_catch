// src/manager/RoomManager.ts
import { EventEmitter } from "../utils/EventEmitter";
import { RoomInfo, UserStatus, RoomMember } from "../types/Room/Room";
import { useRoom } from "../hooks/useRoom";
import { useWebSocket } from "../hooks/useWebSocket";
import { RoomMessage } from "../types/Messages/RoomMessage";
import { MESSAGE_TYPES } from "../types/WebSocket/MessageTypes";
import { IMessage, StompSubscription } from "@stomp/stompjs";
import { SOCKET_TOPICS } from "../types/WebSocket/Topics";

// WebSocket 연결 상태를 나타내는 열거형
enum ConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  RECONNECTING = "RECONNECTING",
  DISCONNECTING = "DISCONNECTING",
  ERROR = "ERROR",
}

// WebSocket 에러 타입 정의
class WebSocketError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "WebSocketError";
  }
}

// 방 관리자 설정 인터페이스
interface RoomManagerConfig {
  maxReconnectAttempts: number;
  reconnectInterval: number;
  pollingInterval: number;
  messageTimeout: number;
}

/**
 * 방 관리 클래스
 * 간소화된 버전으로 핵심 기능만 유지
 */
export class RoomManager {
  private static instance: RoomManager;
  private roomInfo: RoomInfo | null = null;
  private users: UserStatus[] = [];
  private eventEmitter = new EventEmitter();
  private roomApi: ReturnType<typeof useRoom>;
  private webSocket: ReturnType<typeof useWebSocket> | null = null;
  private subscriptions: { [key: string]: StompSubscription } = {};
  private isCleanedUp = false;

  /**
   * private 생성자로 외부에서 인스턴스 생성 방지
   */
  private constructor(roomApi: ReturnType<typeof useRoom>, webSocket?: ReturnType<typeof useWebSocket> | null) {
    this.roomApi = roomApi;
    this.webSocket = webSocket || null;

    console.log("RoomManager 생성됨");
  }

  /**
   * RoomManager 인스턴스 초기화
   */
  public static async initialize(roomApi: ReturnType<typeof useRoom>, webSocket?: ReturnType<typeof useWebSocket> | null): Promise<RoomManager> {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager(roomApi, webSocket);
    } else {
      RoomManager.instance.roomApi = roomApi;
      if (webSocket !== undefined) {
        RoomManager.instance.webSocket = webSocket;
      }
    }
    return RoomManager.instance;
  }

  /**
   * 방 정보 설정 및 이벤트 발생
   */
  private setRoomInfo(roomInfo: RoomInfo | null) {
    if (!roomInfo) {
      console.error("방 정보가 없습니다.");
      return;
    }

    console.log("방 정보 설정:", roomInfo);

    // roomInfo.members가 undefined인 경우 빈 배열로 초기화
    if (!roomInfo.members) {
      roomInfo.members = [];
    }

    this.roomInfo = roomInfo;

    // 사용자 목록 변환
    const updatedUsers = roomInfo.members.map((member) => ({
      memberId: member.memberId,
      isReady: member.status === "READY",
      isHost: roomInfo.host && member.memberId === roomInfo.host.memberId,
      nickname: member.nickname,
      mainCat: member.mainCat || "",
      status: member.status,
    }));

    this.users = updatedUsers;

    // 이벤트 발생
    this.eventEmitter.emit("roomInfoUpdated", {
      roomInfo,
      users: updatedUsers,
    });
  }

  /**
   * WebSocket 메시지 처리
   */
  private handleWebSocketMessage = (message: IMessage) => {
    try {
      console.log("WebSocket 메시지 수신:", message.body);

      // 메시지 파싱
      let data;
      if (typeof message.body === "string") {
        try {
          data = JSON.parse(message.body);
          if (typeof data === "string") {
            data = JSON.parse(data);
          }
        } catch (e) {
          console.warn("JSON 파싱 실패:", e);
          return;
        }
      } else {
        data = message.body;
      }

      console.log("파싱된 메시지:", data);

      // 메시지 타입에 따라 처리
      if (data.event) {
        switch (data.event) {
          case "CREATE":
          case "UPDATE":
          case "INFO":
            if (data.data) {
              this.setRoomInfo(data.data);
            }
            break;

          case "READY":
          case "UNREADY":
          case "KICK":
          case "LEAVE":
            this.fetchRoomInfo();
            break;

          default:
            console.log("처리되지 않은 이벤트:", data.event);
        }
      }
    } catch (error) {
      console.error("메시지 처리 오류:", error);
    }
  };

  /**
   * 방 정보 가져오기
   */
  private async fetchRoomInfo() {
    if (!this.roomInfo?.roomId) {
      console.warn("방 ID가 없어 정보를 가져올 수 없습니다.");
      return;
    }

    try {
      const response = await this.roomApi.getRoomInfo(this.roomInfo.roomId);
      if (response.isSuccess && response.result) {
        this.setRoomInfo(response.result);
      } else {
        console.error("방 정보 요청 실패:", response.message);
      }
    } catch (error) {
      console.error("방 정보 요청 오류:", error);
    }
  }

  /**
   * WebSocket 연결 및 구독
   */
  private async subscribeToRoom(roomId: string): Promise<boolean> {
    console.log(`방 토픽 구독 시도 (roomId: ${roomId})`);

    if (!this.webSocket) {
      console.error("WebSocket이 초기화되지 않았습니다.");
      return false;
    }

    // 토픽 형식 확인
    const roomTopic = `/topic/room/${roomId}`;
    console.log(`구독할 토픽: ${roomTopic}`);

    // 기존 구독이 있으면 유지 (중복 구독 방지)
    if (this.subscriptions[roomTopic]) {
      console.log(`이미 ${roomTopic}에 구독 중입니다. 기존 구독을 유지합니다.`);
      return true;
    }

    // 연결 상태 확인 (최대 3초만 기다림)
    if (!this.webSocket.connected) {
      console.log("WebSocket 연결 대기 중...");
      const startTime = Date.now();
      while (!this.webSocket.connected && Date.now() - startTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!this.webSocket.connected) {
        console.error("WebSocket 연결 시간 초과");
        return false;
      }
    }

    try {
      console.log(`${roomTopic} 구독 시작...`);
      
      const subscription = this.webSocket.subscribe(roomTopic, this.handleWebSocketMessage);
      
      if (subscription) {
        console.log(`${roomTopic} 구독 성공, ID: ${subscription.id}`);
        this.subscriptions[roomTopic] = subscription;
        return true;
      } else {
        console.error(`${roomTopic} 구독 실패: 구독 객체가 생성되지 않음`);
        return false;
      }
    } catch (error) {
      console.error(`구독 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      return false;
    }
  }

  /**
   * 모든 구독 해제
   */
  private unsubscribeAll() {
    Object.values(this.subscriptions).forEach((subscription) => {
      try {
        if (subscription && subscription.unsubscribe) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error("구독 해제 실패:", error);
      }
    });

    this.subscriptions = {};
  }

  /**
   * 리소스 정리
   */
  public async cleanup() {
    if (this.isCleanedUp) return;

    console.log("리소스 정리 시작");

    // WebSocket 구독 해제
    this.unsubscribeAll();

    // 이벤트 리스너 제거
    this.eventEmitter.removeAllListeners();

    // 상태 초기화
    this.roomInfo = null;
    this.users = [];
    this.isCleanedUp = true;

    console.log("리소스 정리 완료");
  }

  /**
   * 방 생성
   */
  async createRoom(roomTitle: string, password: string, maxPlayer: number, roomType: string, subjectType: string): Promise<number> {
    try {
      console.log("방 생성 시작");

      // 기존 리소스 정리
      await this.cleanup();
      this.isCleanedUp = false;

      // API로 방 생성
      const response = await this.roomApi.createRoom(roomTitle, password, maxPlayer, roomType, subjectType);

      if (!response.isSuccess || !response.result) {
        throw new Error(response.message || "방 생성에 실패했습니다.");
      }

      const { roomId } = response.result;
      console.log("방 생성 성공:", roomId);

      // 방 구독
      const subscribed = await this.subscribeToRoom(roomId.toString());
      if (!subscribed) {
        throw new Error("방 구독에 실패했습니다.");
      }

      // 방 정보 가져오기
      await new Promise((resolve) => setTimeout(resolve, 500)); // 잠시 대기
      const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);

      if (!roomInfoResponse.isSuccess || !roomInfoResponse.result) {
        throw new Error("방 정보 조회에 실패했습니다.");
      }

      this.setRoomInfo(roomInfoResponse.result);
      console.log("방 생성 및 초기화 완료");

      return roomId;
    } catch (error) {
      console.error("방 생성 실패:", error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * 방 입장
   */
  async joinRoom(roomId: number, skipApiCall: boolean = false): Promise<void> {
    try {
      console.log("방 입장 시작");

      // 기존 리소스 정리
      await this.cleanup();
      this.isCleanedUp = false;

      // WebSocket 연결 확인
      if (!this.webSocket?.client?.connected) {
        throw new Error("WebSocket이 연결되어 있지 않습니다.");
      }

      // API 호출로 방 입장
      if (!skipApiCall) {
        const response = await this.roomApi.joinRoom(roomId);
        if (!response || !response.isSuccess) {
          throw new Error(response?.message || "방 입장에 실패했습니다.");
        }
      }

      // 방 구독
      const subscribed = await this.subscribeToRoom(roomId.toString());
      if (!subscribed) {
        throw new Error("방 구독에 실패했습니다.");
      }

      // 방 정보 가져오기
      const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);
      if (!roomInfoResponse.isSuccess || !roomInfoResponse.result) {
        throw new Error("방 정보 조회에 실패했습니다.");
      }

      this.setRoomInfo(roomInfoResponse.result);
      console.log("방 입장 및 초기화 완료");
    } catch (error) {
      console.error("방 입장 실패:", error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * 방에 연결
   */
  async connectToRoom(roomId: number): Promise<void> {
    try {
      console.log("방 연결 시작");

      // 기존 리소스 정리
      await this.cleanup();
      this.isCleanedUp = false;

      // 방 구독
      const subscribed = await this.subscribeToRoom(roomId.toString());
      if (!subscribed) {
        throw new Error("방 구독에 실패했습니다.");
      }

      // 방 정보 가져오기
      const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);
      if (!roomInfoResponse.isSuccess || !roomInfoResponse.result) {
        throw new Error("방 정보 조회에 실패했습니다.");
      }

      this.setRoomInfo(roomInfoResponse.result);
      console.log("방 연결 완료");
    } catch (error) {
      console.error("방 연결 실패:", error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * 방 나가기
   */
  async leaveRoom(roomId: number): Promise<void> {
    try {
      await this.roomApi.leaveRoom(roomId);
      await this.cleanup();
    } catch (error) {
      console.error("방 나가기 실패:", error);
      throw error;
    }
  }

  /**
   * 사용자 강퇴
   */
  async kickUser(roomId: number, hostNickname: string, targetNickname: string): Promise<void> {
    try {
      await this.roomApi.kickUser(roomId, hostNickname, targetNickname);
    } catch (error) {
      console.error("강퇴 실패:", error);
      throw error;
    }
  }

  /**
   * 게임 시작
   */
  async startGame(roomId: number, hostNickname: string): Promise<void> {
    try {
      await this.roomApi.startRoom(roomId, hostNickname);
      this.eventEmitter.emit("gameStarted", roomId);
    } catch (error) {
      console.error("게임 시작 실패:", error);
      throw error;
    }
  }

  /**
   * 준비 상태 토글
   */
  async toggleReady(roomId: number, nickname: string): Promise<void> {
    try {
      const user = this.users.find((u) => u.nickname === nickname);
      if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
      }

      if (user.isReady) {
        await this.roomApi.setUnready(roomId, nickname);
      } else {
        await this.roomApi.setReady(roomId, nickname);
      }
    } catch (error) {
      console.error("준비 상태 변경 실패:", error);
      throw error;
    }
  }

  /**
   * 이벤트 구독
   */
  subscribe(event: string, callback: Function): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * 이벤트 구독 해제
   */
  unsubscribe(event: string, callback: Function): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 모든 이벤트 구독 해제
   */
  removeAllListeners(): void {
    this.eventEmitter.removeAllListeners();
  }

  /**
   * 현재 방 정보 반환
   */
  getRoomInfo(): RoomInfo | null {
    return this.roomInfo;
  }

  /**
   * 현재 사용자 목록 반환
   */
  getUsers(): UserStatus[] {
    return this.users;
  }
}
