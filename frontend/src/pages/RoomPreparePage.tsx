import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { RoomManager } from "../manager/RoomManager";
import { RoomInfo, UserStatus } from "../types/Room/Room";
import { RoomPrepareErrorBoundary } from "../components/error/RoomPrepareErrorBoundary";
import { useRoom } from "../hooks/useRoom";
import { useWebSocket } from "../hooks/useWebSocket";
import { UserList } from "../components/room/UserList";
import { RoomInfoComponent } from "../components/room/RoomInfoComponent";

/**
 * 채팅 메시지 인터페이스
 */
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

/**
 * 방 준비 페이지 컴포넌트
 * 게임 시작 전 대기실 기능을 제공
 */
const RoomPreparePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const roomApi = useRoom();
  const webSocket = useWebSocket();

  // RoomManager 상태 추가
  const [roomManager, setRoomManager] = useState<RoomManager | null>(null);

  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 알림 표시
  const showCustomAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  // RoomManager 초기화
  useEffect(() => {
    let isSubscribed = true;

    const initializeManager = async () => {
      try {
        console.log("initializeManager 시작", { roomId });
        const manager = await RoomManager.initialize(roomApi, webSocket);
        console.log("RoomManager 초기화 완료");

        // WebSocket 연결만 수행
        await manager.connectToRoom(Number(roomId));

        if (!isSubscribed) {
          console.log("컴포넌트가 언마운트됨");
          return;
        }

        setRoomManager(manager);
        console.log("RoomManager 상태 설정 완료");

        if (!isSubscribed) return;
        setIsLoading(false);
      } catch (error) {
        console.error("방 참가 중 오류 발생:", error);
        if (isSubscribed) {
          setError(error instanceof Error ? error.message : "방 연결에 실패했습니다.");
          showCustomAlert("방 연결에 실패했습니다.");
          setIsLoading(false);
          navigate("/lobby");
        }
      }
    };

    console.log("useEffect 실행");
    if (roomId) {
      initializeManager();
    }

    return () => {
      console.log("cleanup 함수 실행");
      isSubscribed = false;
      if (roomManager && roomId) {
        console.log("이벤트 리스너 제거");
        roomManager.removeAllListeners();
      }
    };
  }, [roomId, roomApi, webSocket, navigate, showCustomAlert]);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    if (!roomId || !roomManager) {
      console.log("이벤트 핸들러 설정 건너뜀 - roomId 또는 roomManager가 없음");
      return;
    }

    console.log("=== 이벤트 핸들러 설정 시작 ===");
    const handleRoomInfo = (info: RoomInfo) => {
      console.log("방 정보 업데이트 이벤트 수신:", info);
      setRoomInfo(info);
      console.log("방 정보 상태 업데이트 완료");
    };

    const handleUsersUpdated = (updatedUsers: UserStatus[]) => {
      console.log("사용자 목록 업데이트 이벤트 수신:", updatedUsers);
      setUsers(updatedUsers);
      console.log("사용자 목록 상태 업데이트 완료");
    };

    const handleUserKicked = (userId: number) => {
      console.log("사용자 강퇴 이벤트 수신:", userId);
      if (userId === roomInfo?.host.memberId) {
        showCustomAlert("방에서 강퇴되었습니다.");
        navigate("/main");
      }
    };

    const handleRoomDeleted = () => {
      console.log("방 삭제 이벤트 수신");
      showCustomAlert("방이 삭제되었습니다.");
      navigate("/main");
    };

    const handleError = (error: Error) => {
      console.log("에러 이벤트 수신:", error);
      setError(error.message);
      showCustomAlert(error.message);
    };

    // 초기 방 정보 설정
    const initialRoomInfo = roomManager.getRoomInfo();
    if (initialRoomInfo) {
      console.log("초기 방 정보 설정:", initialRoomInfo);
      setRoomInfo(initialRoomInfo);
    }

    // 초기 사용자 목록 설정
    const initialUsers = roomManager.getUsers();
    console.log("초기 사용자 목록 설정:", initialUsers);
    setUsers(initialUsers);

    // 이벤트 구독
    console.log("이벤트 구독 시작");
    roomManager.subscribe("roomInfoUpdated", handleRoomInfo);
    roomManager.subscribe("usersUpdated", handleUsersUpdated);
    roomManager.subscribe("userKicked", handleUserKicked);
    roomManager.subscribe("roomDeleted", handleRoomDeleted);
    roomManager.subscribe("error", handleError);
    console.log("이벤트 구독 완료");

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log("=== 이벤트 핸들러 정리 시작 ===");
      console.log("모든 이벤트 리스너 제거");
      roomManager.removeAllListeners();
      console.log("=== 이벤트 핸들러 정리 완료 ===");
    };
  }, [roomId, roomManager, navigate, showCustomAlert]);

  // 준비 상태 토글
  // const handleReadyToggle = useCallback(
  //   async (memberId: number, currentStatus: string) => {
  //     if (!roomId || !roomManager) return;
  //     try {
  //       await roomManager.toggleReady(Number(roomId));
  //     } catch (error) {
  //       console.error("준비 상태 변경 실패:", error);
  //       showCustomAlert("준비 상태를 변경할 수 없습니다.");
  //     }
  //   },
  //   [roomId, roomManager, showCustomAlert]
  // );

  // 게임 시작
  const handleGameStart = useCallback(async () => {
    if (!roomId || !roomInfo || !roomManager) return;
    try {
      await roomManager.startGame(Number(roomId), roomInfo.host.nickname);
    } catch (error) {
      console.error("게임 시작 실패:", error);
      showCustomAlert("게임을 시작할 수 없습니다.");
    }
  }, [roomId, roomInfo, roomManager, showCustomAlert]);

  // 사용자 강퇴
  const handleKick = useCallback(
    async (targetUserId: number) => {
      if (!roomId || !roomInfo || !roomManager) return;
      try {
        const hostUser = users.find((u) => u.isHost);
        if (!hostUser) return;
        await roomManager.kickUser(Number(roomId), hostUser.nickname, users.find((u) => u.memberId === targetUserId)?.nickname || "");
      } catch (error) {
        console.error("강퇴 실패:", error);
        showCustomAlert("강퇴할 수 없습니다.");
      }
    },
    [roomId, roomInfo, roomManager, showCustomAlert, users]
  );

  // 방 나가기
  const handleLeave = useCallback(async () => {
    if (!roomId || !roomManager) return;
    try {
      await roomManager.leaveRoom(Number(roomId));
      navigate("/main");
    } catch (error) {
      console.error("방 나가기 실패:", error);
      showCustomAlert("방을 나갈 수 없습니다.");
    }
  }, [roomId, roomManager, navigate, showCustomAlert]);

  // 채팅 메시지 전송
  const sendChatMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const newMessage = {
        sender: "현재 사용자",
        message: chatInput,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setChatInput("");
    },
    [chatInput]
  );

  const hostUser = users.find((u) => u.isHost);
  const isHost = roomInfo?.host.nickname === hostUser?.nickname;
  const currentMember = roomInfo?.members.find((m) => m.nickname === hostUser?.nickname);

  // 에러 상태 표시
  if (error) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">{error}</div>
        </div>
      </Background>
    );
  }

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">로딩 중...</div>
        </div>
      </Background>
    );
  }

  // 방 정보가 없는 경우
  if (!roomInfo) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">방 정보를 불러올 수 없습니다.</div>
        </div>
      </Background>
    );
  }

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
        <div className="w-full max-w-6xl px-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-white font-bold tracking-wider text-shadow-lg">{roomInfo.roomId}번 방</h1>
            <button onClick={handleLeave} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
              방 나가기
            </button>
          </div>

          <div className="flex flex-1 gap-6">
            <div className="w-2/3 bg-white bg-opacity-80 rounded-lg p-6 flex flex-col">
              <RoomInfoComponent roomInfo={roomInfo} />
              <h3 className="text-xl font-bold mb-3">플레이어 목록</h3>
              <UserList users={users} isHost={isHost} onKick={handleKick} />

              <div className="flex justify-between mt-6">
                {isHost && (
                  <button
                    onClick={handleGameStart}
                    disabled={!users.every((user) => user.isReady || user.isHost)}
                    className={`px-6 py-3 rounded-lg font-bold ${
                      !users.every((user) => user.isReady || user.isHost) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
                    } transition-colors`}
                  >
                    게임 시작
                  </button>
                )}
              </div>
            </div>

            {/* 오른쪽: 채팅 */}
            <div className="w-1/3 h-full bg-white bg-opacity-80 rounded-lg p-4 flex flex-col overflow-hidden">
              <h3 className="text-xl font-bold mb-3">채팅</h3>

              <div className="flex-1 overflow-y-auto mb-4 bg-gray-100 rounded p-3">
                {chatMessages.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">채팅 메시지가 없습니다.</div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div key={index} className="mb-2">
                      <span className="font-bold">{msg.sender}:</span> {msg.message}
                    </div>
                  ))
                )}
              </div>

              <div className="w-full">
                <form onSubmit={sendChatMessage} className="flex">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 min-w-0 p-2 mr-2 border border-gray-300 rounded-l"
                    placeholder="메시지를 입력하세요..."
                  />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors whitespace-nowrap">
                    전송
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </Background>
  );
};

/**
 * 에러 경계와 함께 렌더링되는 RoomPreparePage
 */
export default function RoomPrepareWithErrorBoundary() {
  return (
    <RoomPrepareErrorBoundary>
      <RoomPreparePage />
    </RoomPrepareErrorBoundary>
  );
}
