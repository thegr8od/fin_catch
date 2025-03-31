// src/manager/RoomManager.ts
import { EventEmitter } from "../utils/EventEmitter";
import { RoomInfo, UserStatus, RoomMember } from "../types/Room/Room";
import { useRoom } from "../hooks/useRoom";
import { useWebSocket } from "../hooks/useWebSocket";
import { RoomMessage } from "../types/Messages/RoomMessage";
import { MESSAGE_TYPES } from "../types/WebSocket/MessageTypes";
import { IMessage } from "@stomp/stompjs";
import { SOCKET_TOPICS } from "../types/WebSocket/Topics";

/**
 * 방 관리 클래스
 * 싱글톤 패턴을 사용하여 전역적으로 방 상태를 관리
 * 방 정보, 사용자 상태, 이벤트 처리를 담당
 */
export class RoomManager {
  // 싱글톤 인스턴스
  private static instance: RoomManager;
  // 현재 방 정보
  private roomInfo: RoomInfo | null = null;
  // 방에 참여한 사용자 목록
  private users: UserStatus[] = [];
  // 이벤트 발생 및 구독을 관리하는 이벤트 에미터
  private eventEmitter = new EventEmitter();
  // 방 관련 API 호출을 위한 훅
  private roomApi: ReturnType<typeof useRoom>;
  // WebSocket 관련 훅
  private webSocket: ReturnType<typeof useWebSocket> | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isWebSocketConnected: boolean = false;

  /**
   * private 생성자로 외부에서 인스턴스 생성 방지
   */
  private constructor(roomApi: ReturnType<typeof useRoom>, webSocket?: ReturnType<typeof useWebSocket> | null) {
    this.roomApi = roomApi;
    this.webSocket = webSocket || null;
  }

  /**
   * WebSocket 메시지 처리
   */
  private handleWebSocketMessage = (message: IMessage) => {
    console.log("=== WebSocket 메시지 수신 시작 ===");
    console.log("원본 메시지:", message);
    console.log("메시지 body:", message.body);
    try {
      const data = JSON.parse(message.body);
      console.log("파싱된 데이터:", data);
      console.log("이벤트 타입:", data.event);
      console.log("방 데이터:", data.data);

      if (data.event === "CREATE" || data.event === "UPDATE" || data.event === "JOIN" || data.event === "INFO") {
        console.log("방 정보 업데이트 시도");
        if (data.data) {
          console.log("setRoomInfo 호출 전 roomInfo:", this.roomInfo);
          this.setRoomInfo(data.data);
          console.log("setRoomInfo 호출 후 roomInfo:", this.roomInfo);
          console.log("roomInfoUpdated 이벤트 발생 시도");
          this.eventEmitter.emit("roomInfoUpdated", data.data);
          console.log("roomInfoUpdated 이벤트 발생 완료");
        } else {
          console.log("data.data가 없음");
        }
      } else {
        console.log("처리되지 않은 이벤트 타입:", data.event);
      }
    } catch (error) {
      console.error("WebSocket 메시지 처리 실패:", error);
      console.error("에러 상세:", error);
    }
    console.log("=== WebSocket 메시지 수신 완료 ===");
  };

  /**
   * WebSocket 연결 및 구독
   */
  private async connectWebSocket(roomId: string): Promise<boolean> {
    if (!this.webSocket) {
      console.error("WebSocket이 초기화되지 않았습니다.");
      return false;
    }

    try {
      const { subscribe, client } = this.webSocket;

      if (!client || !subscribe) {
        console.error("WebSocket 설정이 올바르지 않습니다.");
        return false;
      }

      if (!client.connected) {
        console.error("WebSocket이 연결되어 있지 않습니다.");
        return false;
      }

      // 구독할 토픽 설정
      const roomTopic = `/topic/room/${roomId}`;
      console.log("구독 시도:", roomTopic);

      // 구독 시도
      const subscription = await subscribe(roomTopic, (message) => {
        console.log("메시지 수신:", message);
        this.handleWebSocketMessage(message);
      });

      if (subscription) {
        this.isWebSocketConnected = true;
        console.log("WebSocket 구독 성공:", roomTopic);
        return true;
      }

      console.error("WebSocket 구독 실패");
      return false;
    } catch (error) {
      console.error("WebSocket 연결/구독 실패:", error);
      return false;
    }
  }

  /**
   * WebSocket 연결 해제
   */
  private disconnectWebSocket() {
    if (this.webSocket && this.isWebSocketConnected) {
      Object.values(this.webSocket.subscriptions).forEach((subscription) => {
        if (subscription && typeof subscription.unsubscribe === "function") {
          subscription.unsubscribe();
        }
      });
      this.isWebSocketConnected = false;
      console.log("WebSocket disconnected");
    }
  }

  /**
   * RoomManager의 싱글톤 인스턴스를 반환
   * @returns RoomManager 인스턴스
   */
  public static async initialize(roomApi: ReturnType<typeof useRoom>, webSocket?: ReturnType<typeof useWebSocket> | null): Promise<RoomManager> {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager(roomApi, webSocket);
    }
    return RoomManager.instance;
  }

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      throw new Error("RoomManager must be initialized with initialize() before using getInstance()");
    }
    return RoomManager.instance;
  }

  /**
   * 방 정보를 설정하고 이벤트 발생
   */
  private setRoomInfo(roomInfo: RoomInfo | null) {
    if (!roomInfo) {
      console.error("방 정보가 없습니다.");
      return;
    }

    console.log("=== 방 정보 설정 시작 ===");
    console.log("새로운 방 정보:", roomInfo);

    // roomInfo.members가 undefined인 경우 빈 배열로 초기화
    if (!roomInfo.members) {
      console.log("멤버 정보가 없어 빈 배열로 초기화합니다.");
      roomInfo.members = [];
    }

    this.roomInfo = roomInfo;

    console.log("멤버 정보 변환 시작");
    try {
      this.users = roomInfo.members.map((member) => {
        const userStatus = {
          isReady: member.status === "READY",
          isHost: member.nickname === roomInfo.host?.nickname,
          nickname: member.nickname,
          mainCat: member.mainCat,
        };
        console.log(`멤버 변환 결과 (${member.nickname}):`, userStatus);
        return userStatus;
      });
      console.log("최종 users 배열:", this.users);
    } catch (error) {
      console.error("멤버 정보 변환 중 오류 발생:", error);
      this.users = [];
    }

    console.log("roomInfoUpdated 이벤트 발생");
    this.eventEmitter.emit("roomInfoUpdated", roomInfo);
    console.log("=== 방 정보 설정 완료 ===");
  }

  /**
   * RoomMember[]를 UserStatus[]로 변환
   * @param members 변환할 멤버 목록
   * @returns 변환된 사용자 상태 목록
   */
  private convertMembersToUserStatus(members: RoomMember[]): UserStatus[] {
    return members.map((member) => ({
      isReady: member.status === "READY",
      isHost: member.nickname === this.roomInfo?.host?.nickname,
      nickname: member.nickname,
      mainCat: member.mainCat,
    }));
  }

  /**
   * 현재 방 정보를 반환
   * @returns 현재 방 정보 또는 null
   */
  getRoomInfo(): RoomInfo | null {
    return this.roomInfo;
  }

  /**
   * 사용자 목록을 업데이트하고 이벤트 발생
   * @param users 업데이트할 사용자 목록
   */
  updateUsers(users: UserStatus[]) {
    this.users = users;
    this.eventEmitter.emit("usersUpdated", users);
  }

  /**
   * 현재 사용자 목록을 반환
   * @returns 사용자 목록
   */
  getUsers(): UserStatus[] {
    return this.users;
  }

  /**
   * 특정 사용자가 방장인지 확인
   * @param nickname 확인할 사용자 닉네임
   * @returns 방장 여부
   */
  isHost(nickname: string): boolean {
    return this.roomInfo?.host?.nickname === nickname;
  }

  /**
   * 사용자의 준비 상태를 토글
   * @param roomId 방 ID
   * @param nickname 사용자 닉네임
   */
  async toggleReady(roomId: number, nickname: string) {
    try {
      const user = this.users.find((u) => u.nickname === nickname);
      if (!user) return;
      if (user.isReady) {
        await this.setUnready(roomId, nickname);
      } else {
        await this.setReady(roomId, nickname);
      }
    } catch (error) {
      this.eventEmitter.emit("error", error);
    }
  }

  /**
   * 사용자를 준비 상태로 변경
   * @param roomId 방 ID
   * @param nickname 사용자 닉네임
   */
  private async setReady(roomId: number, nickname: string) {
    try {
      await this.roomApi.setReady(roomId, nickname);
      this.updateUserStatus(nickname, true);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자의 준비 상태를 해제
   * @param roomId 방 ID
   * @param nickname 사용자 닉네임
   */
  private async setUnready(roomId: number, nickname: string) {
    try {
      await this.roomApi.setUnready(roomId, nickname);
      this.updateUserStatus(nickname, false);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자의 준비 상태를 업데이트
   * @param nickname 사용자 닉네임
   * @param isReady 준비 상태
   */
  private updateUserStatus(nickname: string, isReady: boolean) {
    this.users = this.users.map((user) => (user.nickname === nickname ? { ...user, isReady } : user));
    this.eventEmitter.emit("usersUpdated", this.users);
  }

  /**
   * 사용자를 제거
   * @param nickname 제거할 사용자 닉네임
   */
  private removeUser(nickname: string) {
    this.users = this.users.filter((user) => user.nickname !== nickname);
    this.eventEmitter.emit("usersUpdated", this.users);
  }

  /**
   * 게임 시작 가능 여부를 확인
   * @returns 게임 시작 가능 여부
   */
  canStartGame(): boolean {
    return this.users.length > 0 && this.users.every((user) => user.isHost || user.isReady);
  }

  /**
   * 게임을 시작
   * @param roomId 방 ID
   * @param hostNickname 방장 닉네임
   */
  async startGame(roomId: number, hostNickname: string) {
    try {
      if (!this.isHost(hostNickname)) {
        throw new Error("방장만 게임을 시작할 수 있습니다.");
      }
      if (!this.canStartGame()) {
        throw new Error("모든 플레이어가 준비되어야 합니다.");
      }
      await this.roomApi.startRoom(roomId, hostNickname);
      this.eventEmitter.emit("gameStarted", roomId);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 방에서 나가기
   * @param roomId 방 ID
   */
  async leaveRoom(roomId: number): Promise<void> {
    try {
      await this.roomApi.leaveRoom(roomId);
      this.disconnectWebSocket();
      this.eventEmitter.emit("roomLeft", roomId);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자를 강퇴
   * @param roomId 방 ID
   * @param hostNickname 방장 닉네임
   * @param targetNickname 강퇴할 사용자 닉네임
   */
  async kickUser(roomId: number, hostNickname: string, targetNickname: string) {
    try {
      if (!this.isHost(hostNickname)) {
        throw new Error("방장만 강퇴할 수 있습니다.");
      }
      await this.roomApi.kickUser(roomId, hostNickname, targetNickname);
      this.eventEmitter.emit("userKicked", targetNickname);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 이벤트 구독
   * @param event 구독할 이벤트 이름
   * @param callback 이벤트 발생 시 실행할 콜백 함수
   */
  subscribe(eventName: string, listener: Function) {
    console.log(`이벤트 리스너 등록: ${eventName}`);
    this.eventEmitter.on(eventName, listener);
  }

  /**
   * 이벤트 구독 해제
   * @param event 구독 해제할 이벤트 이름
   * @param callback 구독 해제할 콜백 함수
   */
  unsubscribe(event: string, callback: Function) {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 모든 이벤트 구독을 해제
   */
  removeAllListeners() {
    this.eventEmitter.removeAllListeners();
  }

  /**
   * 방 목록을 로드하고 업데이트합니다.
   */
  async loadRooms() {
    try {
      const openRooms = await this.roomApi.searchByOpen();
      if (openRooms) {
        const roomsArray = Array.isArray(openRooms) ? openRooms : [openRooms];
        const formattedRooms = roomsArray.map((room) => ({
          ...room,
          password: room.password || null,
          memberId: room.memberId || 0,
        }));
        this.eventEmitter.emit("roomsUpdated", formattedRooms);
      } else {
        this.eventEmitter.emit("roomsUpdated", []);
      }
    } catch (error) {
      console.error("방 목록 로딩 실패:", error);
      this.eventEmitter.emit("error", new Error("방 목록을 불러오는데 실패했습니다."));
    }
  }

  /**
   * 새로운 방을 생성합니다.
   */
  async createRoom(roomTitle: string, password: string, maxPlayer: number, roomType: string, subjectType: string): Promise<number> {
    try {
      console.log("방 생성 시작");
      const response = await this.roomApi.createRoom(roomTitle, password, maxPlayer, roomType, subjectType);

      if (!response.isSuccess || !response.result) {
        throw new Error(response.message || "방 생성에 실패했습니다.");
      }

      const { roomId } = response.result;
      console.log("방 생성 성공, roomId:", roomId);

      // WebSocket 연결 시도
      if (this.webSocket) {
        console.log("WebSocket 연결 시도");
        const connected = await this.connectWebSocket(roomId.toString());
        if (!connected) {
          console.log("WebSocket 연결은 실패했지만 방 생성은 계속 진행합니다.");
        }
      }

      // 방 정보 조회
      console.log("방 정보 조회 시도");
      const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);
      if (roomInfoResponse.isSuccess && roomInfoResponse.result) {
        console.log("방 정보 조회 성공");
        this.setRoomInfo(roomInfoResponse.result);
      } else {
        console.log("방 정보 조회 실패");
      }

      return roomId;
    } catch (error) {
      console.error("방 생성 실패:", error);
      throw error;
    }
  }

  /**
   * 방에 입장합니다.
   */
  async joinRoom(roomId: number, skipApiCall: boolean = false): Promise<void> {
    console.log("joinRoom 시작", { roomId, skipApiCall });
    try {
      if (!skipApiCall) {
        console.log("방 참가 API 호출 시도");
        const response = await this.roomApi.joinRoom(roomId);
        console.log("방 참가 API 응답:", response);

        if (!response || !response.isSuccess) {
          throw new Error(response?.message || "방 입장에 실패했습니다.");
        }

        // 방 정보 조회
        console.log("방 정보 조회 시도");
        const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);
        console.log("방 정보 조회 응답:", roomInfoResponse);

        if (!roomInfoResponse || !roomInfoResponse.isSuccess) {
          throw new Error(roomInfoResponse?.message || "방 정보를 불러올 수 없습니다.");
        }

        // 방 정보 설정
        console.log("방 정보 설정 시도:", roomInfoResponse.result);
        this.setRoomInfo(roomInfoResponse.result);
        console.log("방 정보 설정 완료");
      }

      // WebSocket 체크 및 연결
      if (this.webSocket) {
        console.log("WebSocket 연결 시도");
        const connected = await this.connectWebSocket(roomId.toString());
        console.log("WebSocket 연결 결과:", connected);

        if (!connected) {
          throw new Error("WebSocket 연결에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("방 입장 실패 상세:", error);
      throw error;
    }
  }

  // 주기적인 방 목록 업데이트를 시작합니다.
  startPolling(interval: number = 10000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(() => this.loadRooms(), interval);
  }

  // 주기적인 방 목록 업데이트를 중지합니다.
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * WebSocket 연결만 수행합니다.
   * 방장이 방을 생성한 후 호출됩니다.
   */
  async connectToRoom(roomId: number): Promise<void> {
    try {
      // 방 정보 조회
      console.log("방 정보 조회 시도");
      const roomInfoResponse = await this.roomApi.getRoomInfo(roomId);
      console.log("방 정보 조회 응답:", roomInfoResponse);

      if (!roomInfoResponse || !roomInfoResponse.isSuccess) {
        throw new Error(roomInfoResponse?.message || "방 정보를 불러올 수 없습니다.");
      }

      // 방 정보 설정
      console.log("방 정보 설정 시도:", roomInfoResponse.result);
      this.setRoomInfo(roomInfoResponse.result);
      console.log("방 정보 설정 완료");

      if (this.webSocket) {
        console.log("WebSocket 연결 시도");
        const connected = await this.connectWebSocket(roomId.toString());
        console.log("WebSocket 연결 결과:", connected);

        if (!connected) {
          throw new Error("WebSocket 연결에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("방 연결 실패:", error);
      throw error;
    }
  }
}
