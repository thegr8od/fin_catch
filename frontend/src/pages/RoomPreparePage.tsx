import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { RoomManager } from "../manager/RoomManager";
import { RoomInfo, UserStatus } from "../types/Room/Room";

/**
 * 채팅 메시지 인터페이스
 */
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
}

/**
 * 방 준비 페이지 컴포넌트
 * 게임 시작 전 대기실 기능을 제공
 */
const RoomPreparePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const currentUserId = Number(localStorage.getItem("userId"));

  // 상태 관리
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // RoomManager 인스턴스
  const roomManager = RoomManager.getInstance();

  // 방 정보 가져오기
  const fetchRoomInfo = useCallback(async () => {
    if (!roomId) return;
    try {
      setIsLoading(true);
      const info = roomManager.getRoomInfo();
      if (info) {
        setRoomInfo(info);
      } else {
        throw new Error("방 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("방 정보 조회 실패:", error);
      showCustomAlert("방 정보를 불러올 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, roomManager]);

  // 이벤트 구독 설정
  useEffect(() => {
    if (!roomId) return;

    // 방 정보 업데이트 이벤트 구독
    roomManager.subscribe("roomInfoUpdated", (info: RoomInfo) => {
      setRoomInfo(info);
    });

    // 사용자 강퇴 이벤트 구독
    roomManager.subscribe("userKicked", (userId: number) => {
      if (userId === currentUserId) {
        showCustomAlert("방에서 강퇴되었습니다.");
        navigate("/main");
      }
    });

    // 방 삭제 이벤트 구독
    roomManager.subscribe("roomDeleted", () => {
      showCustomAlert("방이 삭제되었습니다.");
      navigate("/main");
    });

    // 초기 방 정보 요청
    fetchRoomInfo();

    return () => {
      roomManager.removeAllListeners();
    };
  }, [roomId, currentUserId, navigate, fetchRoomInfo]);

  // 준비 상태 토글
  const handleReadyToggle = useCallback(
    async (memberId: number, currentStatus: string) => {
      if (!roomId) return;

      try {
        await roomManager.toggleReady(Number(roomId), memberId);
      } catch (error) {
        console.error("준비 상태 변경 실패:", error);
        showCustomAlert("준비 상태를 변경할 수 없습니다.");
      }
    },
    [roomId, roomManager]
  );

  // 게임 시작
  const handleGameStart = useCallback(async () => {
    if (!roomId || !roomInfo) return;

    try {
      await roomManager.startGame(Number(roomId), roomInfo.host.memberId);
    } catch (error) {
      console.error("게임 시작 실패:", error);
      showCustomAlert("게임을 시작할 수 없습니다.");
    }
  }, [roomId, roomInfo, roomManager]);

  // 사용자 강퇴
  const handleKick = useCallback(
    async (targetUserId: number) => {
      if (!roomId || !roomInfo) return;

      try {
        await roomManager.kickUser(Number(roomId), roomInfo.host.memberId, targetUserId);
      } catch (error) {
        console.error("강퇴 실패:", error);
        showCustomAlert("강퇴할 수 없습니다.");
      }
    },
    [roomId, roomInfo, roomManager]
  );

  // 방 나가기
  const handleLeave = useCallback(async () => {
    if (!roomId) return;

    try {
      await roomManager.leaveRoom(Number(roomId), currentUserId);
      navigate("/main");
    } catch (error) {
      console.error("방 나가기 실패:", error);
      showCustomAlert("방을 나갈 수 없습니다.");
    }
  }, [roomId, currentUserId, roomManager, navigate]);

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

  // 알림 표시
  const showCustomAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  if (isLoading) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">로딩 중...</div>
        </div>
      </Background>
    );
  }

  if (!roomInfo) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">방 정보를 불러올 수 없습니다.</div>
        </div>
      </Background>
    );
  }

  const isHost = roomInfo.host.memberId === currentUserId;
  const currentMember = roomInfo.members.find((m) => m.memberId === currentUserId);

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
            {/* 왼쪽: 방 정보 및 플레이어 목록 */}
            <div className="w-2/3 bg-white bg-opacity-80 rounded-lg p-6 flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">방 정보</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">최대 인원:</span> {roomInfo.maxPeople}명
                  </p>
                  <p>
                    <span className="font-semibold">상태:</span> {roomInfo.status}
                  </p>
                  <p>
                    <span className="font-semibold">방장:</span> {roomInfo.host.nickname}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">플레이어 목록</h3>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="py-2 px-4 text-left">닉네임</th>
                      <th className="py-2 px-4 text-center">상태</th>
                      <th className="py-2 px-4 text-center">역할</th>
                      {isHost && <th className="py-2 px-4 text-center">액션</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {roomInfo.members.map((member) => (
                      <tr key={member.memberId} className="border-t border-gray-300">
                        <td className="py-3 px-4">{member.nickname}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${member.status === "READY" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                            {member.status === "READY" ? "준비 완료" : "대기 중"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{member.memberId === roomInfo.host.memberId ? "방장" : "참가자"}</td>
                        {isHost && (
                          <td className="py-3 px-4 text-center">
                            {member.memberId !== currentUserId && (
                              <button onClick={() => handleKick(member.memberId)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                                강퇴
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-6">
                {currentUserId !== roomInfo.host.memberId && (
                  <button
                    onClick={() => handleReadyToggle(currentUserId, currentMember?.status || "")}
                    className={`px-6 py-3 rounded-lg font-bold ${
                      currentMember?.status === "READY" ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors`}
                  >
                    {currentMember?.status === "READY" ? "준비 취소" : "준비 완료"}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={handleGameStart}
                    disabled={!roomInfo.members.every((member) => member.status === "READY" || member.memberId === roomInfo.host.memberId)}
                    className={`px-6 py-3 rounded-lg font-bold ${
                      !roomInfo.members.every((member) => member.status === "READY" || member.memberId === roomInfo.host.memberId)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
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

export default RoomPreparePage;
