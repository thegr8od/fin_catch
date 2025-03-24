import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { useUserInfo } from "../hooks/useUserInfo";
import Background from "../components/layout/Background";
import { CustomAlert } from "../components/layout/CustomAlert";

/**
 * 사용자 상태 인터페이스
 * 방에 참여한 각 사용자의 정보를 정의
 */
interface UserStatus {
  id: string; // 사용자 ID
  name: string; // 사용자 이름(닉네임)
  isReady: boolean; // 준비 상태 여부 (문자열이 아닌 boolean으로 수정)
  isHost: boolean; // 방장 여부 (문자열이 아닌 boolean으로 수정)
}

/**
 * 방 정보 인터페이스
 * 방의 기본 정보를 정의
 */
interface RoomInfo {
  id: string; // 방 ID
  title: string; // 방 제목
  host: string; // 방장 이름
  hostId: string; // 방장 ID
  players: number; // 현재 플레이어 수 (문자열이 아닌 number로 수정)
  maxPlayers: number; // 최대 플레이어 수 (문자열이 아닌 number로 수정)
  status: "waiting" | "playing"; // 방 상태
  category: string; // 게임 카테고리
}

/**
 * 채팅 메시지 인터페이스
 * 채팅 메시지의 구조를 정의
 */
interface ChatMessage {
  id: string; // 메시지 ID
  userId: string; // 발신자 ID
  username: string; // 발신자 이름
  content: string; // 메시지 내용
  timestamp: number; // 전송 시간 타임스탬프
}

/**
 * 방 준비 페이지 컴포넌트
 * 게임 시작 전 사용자들이 준비하는 화면
 */
const TempRoomPreparePage = () => {
  // 라우터 파라미터에서 방 ID 가져오기
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  // 상태 관리
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [users, setUsers] = useState<UserStatus[]>([]); // 이름 변경: UserStatus -> users (일관성)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // 사용자 정보 훅 사용
  const { user } = useUserInfo();

  // 현재 로그인한 사용자 정보
  const userId = user?.email || "guest";
  const username = user?.nickname || "게스트";

  // WebSocket 훅 사용
  const { connected, subscribe, unsubscribe, send, topics, messageTypes } = useWebSocket();

  /**
   * WebSocket 구독 및 초기 데이터 로드 설정
   * 방 입장 시 필요한 구독 설정 및 초기 데이터 요청
   */
  useEffect(() => {
    if (!roomId || !connected) return;

    // 방 토픽 구독
    const roomTopic = topics.ROOM(roomId);
    subscribe(roomTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("방 메시지 수신:", data);

        switch (data.type) {
          case messageTypes.ROOM.UPDATE:
            // 방 정보 및 사용자 목록 업데이트
            setRoomInfo(data.roomInfo);
            setUsers(data.users);
            break;
          case messageTypes.ROOM.KICK:
            // 강퇴 메시지 처리
            if (data.kickUserId === userId) {
              showCustomAlert("방장에 의해 강퇴되었습니다.");
              navigate("/"); // 로비로 이동
            }
            break;
          case messageTypes.ROOM.START:
            // 게임 시작 메시지 수신 시 게임 페이지로 이동
            navigate(`/game/${roomId}`);
            break;
        }
      } catch (error) {
        console.error("방 메시지 처리 중 오류 발생:", error);
      }
    });

    // 채팅 토픽 구독
    const chatTopic = topics.CHAT(roomId);
    subscribe(chatTopic, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log("채팅 메시지 수신:", data);

        if (data.type === messageTypes.CHAT.RECEIVE) {
          // 채팅 메시지 수신 시 목록에 추가
          setChatMessages((prev) => [...prev, data.message]);
        }
      } catch (error) {
        console.error("채팅 메시지 처리 중 오류:", error);
      }
    });

    // 방 정보 요청
    send(topics.ROOM(roomId), {
      type: "GET_ROOM_INFO",
      roomId: roomId,
      userId: userId,
    });

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      // 구독 해제
      unsubscribe(roomTopic);
      unsubscribe(chatTopic);

      // 방 나가기 메시지 전송
      send(topics.ROOM(roomId), {
        type: messageTypes.ROOM.LEAVE,
        roomId: roomId,
        userId: userId,
      });
    };
  }, [roomId, connected, subscribe, unsubscribe, send, topics, messageTypes, userId, navigate]);

  /**
   * 준비 상태 토글 함수
   * 사용자의 준비 상태를 변경하고 서버에 알림
   */
  const handleToggleReady = () => {
    if (!connected || !roomId) return;

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    send(topics.ROOM(roomId), {
      type: messageTypes.ROOM.READY,
      roomId: roomId,
      userId: userId,
      isReady: newReadyState,
    });
  };

  // 현재 사용자가 방장인지 확인
  const isHost = users.find((user) => user.id === userId)?.isHost || false;

  // 모든 플레이어가 준비 상태인지 확인
  const allReady = users.length > 0 && users.every((user) => user.isHost || user.isReady);

  /**
   * 게임 시작 함수
   * 방장만 호출 가능하며, 모든 플레이어가 준비된 경우 게임 시작
   */
  const handleStartGame = () => {
    if (!connected || !roomId) return;

    if (!isHost) {
      showCustomAlert("방장만 게임을 시작할 수 있습니다.");
      return;
    }

    if (!allReady) {
      showCustomAlert("모든 플레이어가 준비 완료 상태일 때만 게임 시작 가능합니다.");
      return;
    }

    send(topics.ROOM(roomId), {
      type: messageTypes.ROOM.START,
      roomId: roomId,
      userId: userId,
    });
  };

  /**
   * 사용자 강퇴 함수
   * 방장만 다른 사용자를 강퇴할 수 있음
   */
  const handleKickUser = (kickUserId: string) => {
    if (!connected || !roomId || !isHost) return;

    if (kickUserId === userId) {
      showCustomAlert("자기 자신을 강퇴할 수 없습니다.");
      return;
    }

    send(topics.ROOM(roomId), {
      type: messageTypes.ROOM.KICK,
      roomId: roomId,
      userId: userId,
      kickUserId: kickUserId,
    });
  };

  /**
   * 채팅 메시지 전송 함수
   * 입력된 메시지를 채팅 토픽으로 전송
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !connected || !roomId) return;

    send(topics.CHAT(roomId), {
      type: messageTypes.CHAT.SEND,
      roomId: roomId,
      userId: userId,
      username: username,
      content: messageInput.trim(),
    });

    setMessageInput("");
  };

  /**
   * 방 나가기 함수
   * 로비 페이지로 이동
   */
  const handleLeaveRoom = () => {
    navigate("/");
  };

  // 카테고리 이름 매핑
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "";

    const categories = [
      { id: "investment", name: "투자" },
      { id: "economy", name: "정책" },
      { id: "product", name: "상품" },
      { id: "finance", name: "금융" },
    ];

    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // 로딩 상태 표시
  if (!roomInfo) {
    return (
      <Background>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">{connected ? "방 정보 로딩 중..." : "서버 연결 중..."}</div>
        </div>
      </Background>
    );
  }

  return (
    <>
      <Background>
        <div className="w-full h-full flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-6xl bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden">
            {/* 방 정보 헤더 */}
            <div className="bg-gray-800 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">{roomInfo.title}</h1>
                  <p className="text-gray-300">주제: {getCategoryName(roomInfo.category)}</p>
                </div>
                <div className="flex items-center">
                  <div className={`px-3 py-1 rounded mr-3 ${connected ? "bg-green-500" : "bg-red-500"}`}>{connected ? "연결됨" : "연결 중..."}</div>
                  <button onClick={handleLeaveRoom} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                    나가기
                  </button>
                </div>
              </div>
            </div>

            <div className="flex h-[600px]">
              {/* 왼쪽: 사용자 목록 */}
              <div className="w-1/3 p-4 border-r">
                <h2 className="text-xl font-semibold mb-4">
                  참가자 ({users.length}/{roomInfo.maxPlayers})
                </h2>
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-100 rounded">
                      <div className="flex items-center">
                        <div className="font-medium">
                          {user.name} {user.isHost && <span className="text-blue-500">(방장)</span>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${user.isReady || user.isHost ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}`}>
                          {user.isHost ? "방장" : user.isReady ? "준비완료" : "대기중"}
                        </div>

                        {/* 방장이고 다른 사용자인 경우에만 강퇴 버튼 표시 */}
                        {isHost && user.id !== userId && (
                          <button onClick={() => handleKickUser(user.id)} className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600">
                            강퇴
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <div className="text-center text-gray-500">참가자가 없습니다</div>}
                </div>

                <div className="mt-8 space-y-4">
                  {!isHost ? (
                    <button
                      onClick={handleToggleReady}
                      disabled={!connected}
                      className={`w-full py-3 rounded-lg font-bold ${isReady ? "bg-yellow-400 hover:bg-yellow-500" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    >
                      {isReady ? "준비 취소" : "준비 완료"}
                    </button>
                  ) : (
                    <button
                      onClick={handleStartGame}
                      disabled={!connected || !allReady || users.length < 2}
                      className={`w-full py-3 rounded-lg font-bold ${
                        !connected || !allReady || users.length < 2 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      게임 시작
                    </button>
                  )}
                </div>
              </div>

              {/* 오른쪽: 채팅 */}
              <div className="w-2/3 p-4 flex flex-col">
                <h2 className="text-xl font-semibold mb-4">채팅</h2>

                {/* 채팅 메시지 영역 */}
                <div className="flex-1 overflow-y-auto mb-4 p-3 bg-gray-100 rounded">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.userId === userId ? "text-right" : ""}`}>
                      <div className={`inline-block px-3 py-2 rounded-lg ${msg.userId === userId ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                        <div className="font-medium text-xs mb-1">{msg.userId === userId ? "나" : msg.username}</div>
                        <div>{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && <div className="text-center text-gray-500 py-4">채팅 메시지가 없습니다</div>}
                </div>

                {/* 채팅 입력 영역 */}
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={!connected}
                    placeholder={connected ? "메시지를 입력하세요..." : "연결 중..."}
                    className="flex-1 px-4 py-2 border rounded-l focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!connected || !messageInput.trim()}
                    className={`px-4 py-2 rounded-r ${!connected || !messageInput.trim() ? "bg-gray-300 text-gray-500" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                  >
                    전송
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Background>
      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </>
  );
};

export default TempRoomPreparePage;
