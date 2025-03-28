import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useRoom } from "../hooks/useRoom";
import { useWebSocket } from "../hooks/useWebSocket";

/**
 * 방 참가자 정보를 담는 인터페이스
 */
interface RoomMember {
  memberId: number; // 사용자 ID
  nickname: string; // 닉네임
  mainCat: string; // 대표 캐릭터
  status: string; // 준비 상태
}

/**
 * 방 정보를 담는 인터페이스
 */
interface RoomInfo {
  roomId: number; // 방 ID
  maxPeople: number; // 최대 인원
  status: "OPEN" | "IN_PROGRESS" | "CLOSED"; // 방 상태
  host: RoomMember; // 방장 정보
  members: RoomMember[]; // 참가자 목록
}

/**
 * 방 준비 페이지 컴포넌트
 * 게임 시작 전 대기실 기능을 제공
 */
const RoomPreparePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // 상태 관리
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null); // 방 정보
  const [chatInput, setChatInput] = useState(""); // 채팅 입력
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; roomId: string }[]>([]); // 채팅 메시지
  const [showAlert, setShowAlert] = useState(false); // 알림 표시 여부
  const [alertMessage, setAlertMessage] = useState(""); // 알림 메시지

  // API 및 WebSocket 훅
  const { getRoomInfo, setReady, setUnready, leaveRoom, kickUser, startRoom } = useRoom();
  const { subscribe, unsubscribe, send, connected, topics, messageTypes } = useWebSocket();

  /**
   * WebSocket 연결 및 이벤트 구독 설정
   */
  useEffect(() => {
    if (!connected || !roomId) return;

    // 방 정보 구독
    subscribe(topics.ROOM(roomId), (message) => {
      const data = JSON.parse(message.body);
      switch (data.event) {
        case messageTypes.ROOM.INFO:
          setRoomInfo(data.data);
          break;
        case messageTypes.ROOM.READY:
        case messageTypes.ROOM.UNREADY:
          getRoomInfo(Number(roomId));
          break;
        case messageTypes.ROOM.LEAVE:
          getRoomInfo(Number(roomId));
          break;
        case messageTypes.ROOM.KICK:
          if (data.data === Number(localStorage.getItem("userId"))) {
            showCustomAlert("방에서 강퇴되었습니다.");
            navigate("/main");
          }
          break;
        case messageTypes.ROOM.DELETE:
          showCustomAlert("방이 삭제되었습니다.");
          navigate("/main");
          break;
      }
    });

    // 채팅 구독
    subscribe(topics.CHAT(roomId), (message) => {
      const chatMessage = JSON.parse(message.body);
      setChatMessages((prev) => [...prev, chatMessage]);
    });

    // 초기 방 정보 요청
    getRoomInfo(Number(roomId));

    // 언마운트 시 구독 해제
    return () => {
      unsubscribe(topics.ROOM(roomId));
      unsubscribe(topics.CHAT(roomId));
    };
  }, [connected, roomId]);

  /**
   * 준비 상태 토글 처리
   */
  const handleReadyToggle = (memberId: number, currentStatus: string) => {
    if (!roomId) return;

    if (currentStatus === "READY") {
      setUnready(Number(roomId), memberId);
    } else {
      setReady(Number(roomId), memberId);
    }
  };

  /**
   * 게임 시작 처리
   */
  const handleGameStart = async () => {
    if (!roomId || !roomInfo) return;

    try {
      await startRoom(Number(roomId), roomInfo.host.memberId);
    } catch (error) {
      console.error("게임 시작 중 오류 발생:", error);
      showCustomAlert("게임을 시작할 수 없습니다.");
    }
  };

  /**
   * 사용자 강퇴 처리
   */
  const handleKick = async (targetUserId: number) => {
    if (!roomId || !roomInfo) return;

    try {
      await kickUser(Number(roomId), roomInfo.host.memberId, targetUserId);
    } catch (error) {
      console.error("강퇴 중 오류 발생:", error);
      showCustomAlert("강퇴할 수 없습니다.");
    }
  };

  /**
   * 방 나가기 처리
   */
  const handleLeave = async () => {
    if (!roomId) return;

    try {
      const userId = Number(localStorage.getItem("userId"));
      await leaveRoom(Number(roomId), userId);
      navigate("/main");
    } catch (error) {
      console.error("방 나가기 중 오류 발생:", error);
      showCustomAlert("방을 나갈 수 없습니다.");
    }
  };

  /**
   * 채팅 메시지 전송 처리
   */
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !roomId) return;

    const userId = localStorage.getItem("userId");
    send(topics.CHAT(roomId), {
      sender: userId,
      content: chatInput,
      roomId: roomId,
    });

    setChatInput("");
  };

  /**
   * 알림 메시지 표시
   */
  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 로딩 중 표시
  if (!roomInfo) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">로딩 중...</div>
        </div>
      </Background>
    );
  }

  // 현재 사용자 정보
  const currentUserId = Number(localStorage.getItem("userId"));
  const isHost = roomInfo.host.memberId === currentUserId;

  // JSX 렌더링
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
                    onClick={() => handleReadyToggle(currentUserId, roomInfo.members.find((m) => m.memberId === currentUserId)?.status || "")}
                    className={`px-6 py-3 rounded-lg font-bold ${
                      roomInfo.members.find((m) => m.memberId === currentUserId)?.status === "READY" ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-blue-500 text-white hover:bg-blue-600"
                    } transition-colors`}
                  >
                    {roomInfo.members.find((m) => m.memberId === currentUserId)?.status === "READY" ? "준비 취소" : "준비 완료"}
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
                      <span className="font-bold">{msg.sender}:</span> {msg.content}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="flex">
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
      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </Background>
  );
};

export default RoomPreparePage;
