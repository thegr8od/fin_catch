// src/manager/RoomManager.ts
import { EventEmitter } from "../utils/EventEmitter";
import { RoomInfo, UserStatus, RoomMember } from "../types/Room/Room";
import { useRoom } from "../hooks/useRoom";
import { useWebSocket } from "../hooks/useWebSocket";
import { RoomMessage } from "../types/Messages/RoomMessage";
import { MESSAGE_TYPES } from "../types/WebSocket/MessageTypes";

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
  private roomApi = useRoom();
  // WebSocket 관련 훅
  private webSocket = useWebSocket();

  /**
   * private 생성자로 외부에서 인스턴스 생성 방지
   */
  private constructor() {
    this.initializeWebSocket();
  }

  /**
   * WebSocket 초기화 및 이벤트 구독 설정
   */
  private initializeWebSocket() {
    const { subscribe, topics } = this.webSocket;

    // 방 정보 업데이트 이벤트 구독
    subscribe(topics.ROOM(""), (message) => {
      try {
        const data = JSON.parse(message.body) as RoomMessage;
        this.handleWebSocketMessage(data);
      } catch (error) {
        console.error("WebSocket 메시지 처리 실패:", error);
      }
    });
  }

  /**
   * WebSocket 메시지 처리
   * @param message 수신된 WebSocket 메시지
   */
  private handleWebSocketMessage(message: RoomMessage) {
    switch (message.type) {
      case MESSAGE_TYPES.ROOM.INFO:
        if (message.data?.roomInfo) {
          this.setRoomInfo(message.data.roomInfo);
        }
        break;
      case MESSAGE_TYPES.ROOM.READY:
      case MESSAGE_TYPES.ROOM.UNREADY:
        if (message.data?.member) {
          this.updateUserStatus(message.data.member.memberId, message.type === MESSAGE_TYPES.ROOM.READY);
        }
        break;
      case MESSAGE_TYPES.ROOM.LEAVE:
        if (message.data?.member) {
          this.removeUser(message.data.member.memberId);
        }
        break;
      case MESSAGE_TYPES.ROOM.KICK:
        if (message.data?.member) {
          this.removeUser(message.data.member.memberId);
          this.eventEmitter.emit("userKicked", message.data.member.memberId);
        }
        break;
      case MESSAGE_TYPES.ROOM.DELETE:
        this.eventEmitter.emit("roomDeleted");
        break;
    }
  }

  /**
   * RoomManager의 싱글톤 인스턴스를 반환
   * @returns RoomManager 인스턴스
   */
  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * 방 정보를 설정하고 이벤트 발생
   * @param info 설정할 방 정보
   */
  setRoomInfo(info: RoomInfo) {
    this.roomInfo = info;
    this.users = this.convertMembersToUserStatus(info.members);
    this.eventEmitter.emit("roomInfoUpdated", info);
  }

  /**
   * RoomMember[]를 UserStatus[]로 변환
   * @param members 변환할 멤버 목록
   * @returns 변환된 사용자 상태 목록
   */
  private convertMembersToUserStatus(members: RoomMember[]): UserStatus[] {
    return members.map((member) => ({
      memberId: member.memberId,
      nickname: member.nickname,
      isReady: member.status === "READY",
      isHost: member.memberId === this.roomInfo?.host.memberId,
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
   * @param userId 확인할 사용자 ID
   * @returns 방장 여부
   */
  isHost(userId: number): boolean {
    return this.roomInfo?.host.memberId === userId;
  }

  /**
   * 사용자의 준비 상태를 토글
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  async toggleReady(roomId: number, userId: number) {
    try {
      const user = this.users.find((u) => u.memberId === userId);
      if (!user) return;
      if (user.isReady) {
        await this.setUnready(roomId, userId);
      } else {
        await this.setReady(roomId, userId);
      }
    } catch (error) {
      this.eventEmitter.emit("error", error);
    }
  }

  /**
   * 사용자를 준비 상태로 변경
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  private async setReady(roomId: number, userId: number) {
    try {
      await this.roomApi.setReady(roomId, userId);
      this.updateUserStatus(userId, true);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자의 준비 상태를 해제
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  private async setUnready(roomId: number, userId: number) {
    try {
      await this.roomApi.setUnready(roomId, userId);
      this.updateUserStatus(userId, false);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자의 준비 상태를 업데이트
   * @param userId 사용자 ID
   * @param isReady 준비 상태
   */
  private updateUserStatus(userId: number, isReady: boolean) {
    this.users = this.users.map((user) => (user.memberId === userId ? { ...user, isReady } : user));
    this.eventEmitter.emit("usersUpdated", this.users);
  }

  /**
   * 사용자를 제거
   * @param userId 제거할 사용자 ID
   */
  private removeUser(userId: number) {
    this.users = this.users.filter((user) => user.memberId !== userId);
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
   * @param hostId 방장 ID
   */
  async startGame(roomId: number, hostId: number) {
    try {
      if (!this.isHost(hostId)) {
        throw new Error("방장만 게임을 시작할 수 있습니다.");
      }
      if (!this.canStartGame()) {
        throw new Error("모든 플레이어가 준비되어야 합니다.");
      }
      await this.roomApi.startRoom(roomId, hostId);
      this.eventEmitter.emit("gameStarted", roomId);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 방에서 나가기
   * @param roomId 방 ID
   * @param userId 사용자 ID
   */
  async leaveRoom(roomId: number, userId: number) {
    try {
      await this.roomApi.leaveRoom(roomId, userId);
      this.eventEmitter.emit("roomLeft", roomId);
    } catch (error) {
      this.eventEmitter.emit("error", error);
      throw error;
    }
  }

  /**
   * 사용자를 강퇴
   * @param roomId 방 ID
   * @param hostId 방장 ID
   * @param targetUserId 강퇴할 사용자 ID
   */
  async kickUser(roomId: number, hostId: number, targetUserId: number) {
    try {
      if (!this.isHost(hostId)) {
        throw new Error("방장만 강퇴할 수 있습니다.");
      }
      await this.roomApi.kickUser(roomId, hostId, targetUserId);
      this.eventEmitter.emit("userKicked", targetUserId);
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
  subscribe(event: string, callback: Function) {
    this.eventEmitter.on(event, callback);
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
}
