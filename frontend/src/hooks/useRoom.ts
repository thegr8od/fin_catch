import { Room, RoomInfo } from "../types/Room/Room";
import { useApi } from "./useApi";
import { Response, SuccessResponse } from "../types/response/Response";

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

interface CreateRoomResponse {
  roomId: number;
  roomTitle: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  roomType: "ONE_ON_ONE" | "MULTI" | "AI_BATTLE";
  subjectType: "FIN_KNOWLEDGE" | "FIN_CRIME" | "FIN_POLICY" | "FIN_PRODUCT" | "FIN_INVESTMENT";
  maxPlayer: number;
  memberId: number;
  createdAt: string;
}

/**
 * 방 관련 API 호출을 관리하는 커스텀 훅
 * 방 생성, 조회, 수정, 삭제 등의 기능을 제공
 */
export const useRoom = () => {
  // 방 CRUD 관련 API 엔드포인트 설정
  const createRoomApi = useApi<
    CreateRoomResponse,
    {
      roomTitle: string;
      password: string;
      maxplayer: number;
      roomType: string;
      subjectType: string;
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
  const joinRoomApi = useApi<void, { roomId: number }>("/api/room/room/join", "POST");
  const getRoomUserCountApi = useApi<void>("/api/room/room/count", "POST");
  const leaveRoomApi = useApi<void>("/api/room/room/leave", "POST");
  const kickUserApi = useApi<void>("/api/room/room/kick", "POST");
  const setReadyApi = useApi<void>("/api/room/room/ready", "POST");
  const setUnreadyApi = useApi<void>("/api/room/room/unready", "POST");

  /**
   * 새로운 방을 생성하는 함수
   */
  const createRoom = async (roomTitle: string, password: string, maxplayer: number, roomType: string, subjectType: string): Promise<Response<CreateRoomResponse>> => {
    const response = await createRoomApi.execute({
      roomTitle,
      password,
      maxplayer,
      roomType,
      subjectType,
    });

    // 성공 응답인 경우
    if (response.isSuccess && response.result) {
      return {
        isSuccess: true,
        code: response.code,
        message: response.message,
        result: response.result,
      } as SuccessResponse<CreateRoomResponse>;
    }

    // 실패 응답인 경우
    return {
      isSuccess: false,
      code: response.code || 500,
      message: response.message || "방 생성에 실패했습니다.",
    };
  };

  /**
   * 모든 방 목록을 조회하는 함수
   */
  const getAllRoom = async () => {
    const response = await getAllRoomApi.execute();
    return response.result;
  };

  /**
   * 특정 방을 ID로 검색하는 함수
   */
  const searchRoom = async (roomId: string) => {
    const response = await searchRoomApi.execute(undefined, { params: { roomId } });
    return response.result;
  };

  /**
   * 방을 삭제하는 함수
   */
  const deleteRoom = async (roomId: string) => {
    const response = await deleteRoomApi.execute(undefined, { params: { roomId } });
    return response.result;
  };

  /**
   * 특정 타입의 방을 검색하는 함수
   */
  const searchByType = async (roomType: string) => {
    const response = await searchByTypeApi.execute(undefined, { params: { roomType } });
    return response.result;
  };

  /**
   * 열린 방 목록을 조회하는 함수
   */
  const searchByOpen = async () => {
    const response = await searchByOpenApi.execute();
    return response.result;
  };

  /**
   * 게임을 시작하는 함수
   */
  const startRoom = async (roomId: number, nickname: string) => {
    const response = await startRoomApi.execute(undefined, {
      url: `/api/room/start/${roomId}/${nickname}`,
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
  const joinRoom = async (roomId: number): Promise<Response<void>> => {
    try {
      // 현재 방에서 먼저 나가기
      await leaveCurrentRoom();

      const response = await joinRoomApi.execute(undefined, {
        url: `/api/room/room/${roomId}/join`,
      });

      if (response.isSuccess) {
        return {
          isSuccess: true,
          code: response.code,
          message: response.message,
          result: undefined,
        };
      }

      return {
        isSuccess: false,
        code: response.code || 500,
        message: response.message || "방 입장에 실패했습니다.",
      };
    } catch (error) {
      console.error("방 입장 중 오류 발생:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "방 입장 중 오류가 발생했습니다.",
      };
    }
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
  const leaveRoom = async (roomId: number) => {
    const response = await leaveRoomApi.execute(undefined, {
      url: `/api/room/room/${roomId}/leave`,
    });
    return response;
  };

  /**
   * 사용자를 강퇴하는 함수
   */
  const kickUser = async (roomId: number, hostNickname: string, targetNickname: string) => {
    const response = await kickUserApi.execute(undefined, {
      url: `/api/room/room/${roomId}/kick/${hostNickname}/${targetNickname}`,
    });
    return response;
  };

  /**
   * 준비 상태로 변경하는 함수
   */
  const setReady = async (roomId: number, nickname: string) => {
    const response = await setReadyApi.execute(undefined, {
      url: `/api/room/room/${roomId}/ready/${nickname}`,
    });
    return response;
  };

  /**
   * 준비 해제 상태로 변경하는 함수
   */
  const setUnready = async (roomId: number, nickname: string) => {
    const response = await setUnreadyApi.execute(undefined, {
      url: `/api/room/room/${roomId}/unready/${nickname}`,
    });
    return response;
  };

  /**
   * 현재 입장해있는 방에서 나가는 함수
   */
  const leaveCurrentRoom = async (): Promise<Response<void>> => {
    try {
      const response = await leaveRoomApi.execute(undefined, {
        url: `/api/room/room/leave`,
      });

      if (response.isSuccess) {
        return {
          isSuccess: true,
          code: response.code,
          message: response.message,
          result: undefined,
        };
      }

      return {
        isSuccess: false,
        code: response.code || 500,
        message: response.message || "방 나가기에 실패했습니다.",
      };
    } catch (error) {
      console.error("방 나가기 중 오류 발생:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "방 나가기 중 오류가 발생했습니다.",
      };
    }
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
    leaveCurrentRoom,
  };
};
