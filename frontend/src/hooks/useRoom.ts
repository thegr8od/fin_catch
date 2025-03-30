import { Room, RoomInfo } from "../types/Room/Room";
import { useApi } from "./useApi";

/**
 * 방 관련 API 호출을 관리하는 커스텀 훅
 * 방 생성, 조회, 수정, 삭제 등의 기능을 제공
 */
export const useRoom = () => {
  // 방 CRUD 관련 API 엔드포인트 설정
  const createRoomApi = useApi<
    Room,
    {
      roomTitle: string; // 방 제목
      password: string; // 비밀번호 (선택)
      maxplayer: number; // 최대 인원
      roomType: string; // 방 타입 (1대1, 다인전, AI대전)
      subjectType: string; // 주제 타입 (금융 지식, 범죄 등)
    }
  >("/api/room", "POST");

  // 방 조회 관련 API 엔드포인트
  const getAllRoomApi = useApi<Room>("/api/room", "GET");
  const searchRoomApi = useApi<Room>("/api/room", "GET");
  const deleteRoomApi = useApi<Room>("/api/room", "DELETE");
  const searchByTypeApi = useApi<Room>("/api/room/type", "GET");
  const searchByOpenApi = useApi<Room>("/api/room/open", "GET");

  // 방 상태 관리 관련 API 엔드포인트
  const startRoomApi = useApi<void>("/api/room/start", "PUT");
  const getRoomInfoApi = useApi<RoomInfo>("/api/room/room", "POST");
  const joinRoomApi = useApi<void>("/api/room/room/join", "POST");
  const getRoomUserCountApi = useApi<void>("/api/room/room/count", "POST");
  const leaveRoomApi = useApi<void>("/api/room/room/leave", "POST");
  const kickUserApi = useApi<void>("/api/room/room/kick", "POST");
  const setReadyApi = useApi<void>("/api/room/room/ready", "POST");
  const setUnreadyApi = useApi<void>("/api/room/room/unready", "POST");

  /**
   * 새로운 방을 생성하는 함수
   */
  const createRoom = async (roomTitle: string, password: string, maxplayer: number, roomType: string, subjectType: string) => {
    const response = await createRoomApi.execute({
      roomTitle,
      password,
      maxplayer,
      roomType,
      subjectType,
    });
    return response.data;
  };

  /**
   * 모든 방 목록을 조회하는 함수
   */
  const getAllRoom = async () => {
    const response = await getAllRoomApi.execute();
    return response.data;
  };

  /**
   * 특정 방을 ID로 검색하는 함수
   */
  const searchRoom = async (roomId: string) => {
    const response = await searchRoomApi.execute(undefined, { params: { roomId } });
    return response.data;
  };

  /**
   * 방을 삭제하는 함수
   */
  const deleteRoom = async (roomId: string) => {
    const response = await deleteRoomApi.execute(undefined, { params: { roomId } });
    return response.data;
  };

  /**
   * 특정 타입의 방을 검색하는 함수
   */
  const searchByType = async (roomType: string) => {
    const response = await searchByTypeApi.execute(undefined, { params: { roomType } });
    return response.data;
  };

  /**
   * 열린 방 목록을 조회하는 함수
   */
  const searchByOpen = async () => {
    const response = await searchByOpenApi.execute();
    return response.data;
  };

  /**
   * 게임을 시작하는 함수
   */
  const startRoom = async (roomId: number, memberId: number) => {
    const response = await startRoomApi.execute(undefined, {
      url: `/api/room/start/${roomId}/${memberId}`,
    });
    return response;
  };

  /**
   * 방 정보를 조회하는 함수
   */
  const getRoomInfo = async (roomId: number) => {
    const response = await getRoomInfoApi.execute(undefined, {
      url: `/api/room/room/${roomId}/info`,
    });
    return response;
  };

  /**
   * 방에 입장하는 함수
   */
  const joinRoom = async (roomId: number, userId: number) => {
    const response = await joinRoomApi.execute(undefined, {
      url: `/api/room/room/${roomId}/join/${userId}`,
    });
    return response;
  };

  /**
   * 방의 현재 인원수를 조회하는 함수
   */
  const getRoomUserCount = async (roomId: number) => {
    const response = await getRoomUserCountApi.execute(undefined, {
      url: `/api/room/room/${roomId}/count`,
    });
    return response;
  };

  /**
   * 방에서 나가는 함수
   */
  const leaveRoom = async (roomId: number, userId: number) => {
    const response = await leaveRoomApi.execute(undefined, {
      url: `/api/room/room/${roomId}/leave/${userId}`,
    });
    return response;
  };

  /**
   * 사용자를 강퇴하는 함수
   */
  const kickUser = async (roomId: number, hostId: number, targetUserId: number) => {
    const response = await kickUserApi.execute(undefined, {
      url: `/api/room/room/${roomId}/kick/${hostId}/${targetUserId}`,
    });
    return response;
  };

  /**
   * 준비 상태로 변경하는 함수
   */
  const setReady = async (roomId: number, userId: number) => {
    const response = await setReadyApi.execute(undefined, {
      url: `/api/room/room/${roomId}/ready/${userId}`,
    });
    return response;
  };

  /**
   * 준비 해제 상태로 변경하는 함수
   */
  const setUnready = async (roomId: number, userId: number) => {
    const response = await setUnreadyApi.execute(undefined, {
      url: `/api/room/room/${roomId}/unready/${userId}`,
    });
    return response;
  };

  // 모든 함수들을 객체로 반환
  return {
    // 방 CRUD 관련 함수들
    createRoom,
    getAllRoom,
    searchRoom,
    deleteRoom,
    searchByType,
    searchByOpen,

    // 방 상태 관리 관련 함수들
    startRoom,
    getRoomInfo,
    joinRoom,
    getRoomUserCount,
    leaveRoom,
    kickUser,
    setReady,
    setUnready,
  };
};
