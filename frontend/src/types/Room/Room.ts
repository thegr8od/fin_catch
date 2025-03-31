/**
 * 방 상태 타입 정의
 */
export type RoomStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

/**
 * 사용자 상태 타입 정의
 */
export type UserStatusType = "READY" | "NOT_READY";

/**
 * 기본 방 정보 인터페이스
 */
export interface Room {
  roomId: number;
  roomTitle: string;
  status: RoomStatus;
  roomType: string;
  subjectType: string;
  maxPlayer: number;
  createdAt: string;
}

/**
 * 상세 방 정보 인터페이스
 */
export interface RoomInfo {
  roomId: number;
  maxPeople: number;
  status: RoomStatus;
  host: RoomMember;
  members: RoomMember[];
}

/**
 * 방 멤버 인터페이스
 */
export interface RoomMember {
  memberId: number;
  nickname: string;
  mainCat: string;
  status: UserStatusType;
}

/**
 * 사용자 상태 인터페이스
 */
export interface UserStatus {
  memberId: number;
  isReady: boolean;
  isHost: boolean;
}
