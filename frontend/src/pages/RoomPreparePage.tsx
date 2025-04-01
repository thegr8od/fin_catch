import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Background from "../components/layout/Background";
import oneVsOneImg from "../assets/one_vs_one.png";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useWebSocket } from "../hooks/useWebSocket";
import { IMessage } from "@stomp/stompjs";
import { useApi } from "../hooks/useApi";
import { useUserInfo } from "../hooks/useUserInfo";

// 방 상태 타입 정의
type RoomStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

// 방 유형 타입 정의
type RoomType = "ONE_ON_ONE" | "GENERAL" | "PRIVATE";

// 주제 유형 타입 정의
type SubjectType = "FIN_KNOWLEDGE" | "FIN_INVESTMENT" | "FIN_POLICY" | "FIN_PRODUCT" | "FIN_CRIME";

// 방 인터페이스 정의
interface Room {
  roomId: number;
  roomTitle: string;
  status: RoomStatus;
  roomType: RoomType;
  subjectType: SubjectType;
  maxPlayer: number;
  memberId: number;
  createdAt: string;
}

// 플레이어 인터페이스 정의
interface RedisRoomMember {
  memberId: number;
  nickname: string;
  mainCat: string;
  status: "READY" | "UNREADY";
}

// 레디스 방 인터페이스
interface RedisRoom {
  roomId: number;
  maxPeople: number;
  status: RoomStatus;
  host: RedisRoomMember;
  members: RedisRoomMember[];
}

// 이벤트 메시지 인터페이스
interface EventMessage<T> {
  event: string;
  roomId: number;
  data: T;
}

// 채팅 메시지 인터페이스
interface ChatMessage {
  nickname: string;
  content: string;
  roomId: number;
}

// API 응답 인터페이스
interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message?: string;
  result: T;
}

const RoomPreparePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [redisRoom, setRedisRoom] = useState<RedisRoom | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; timestamp: Date }[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);

  // room 값을 참조할 ref 추가
  const roomRef = React.useRef<Room | null>(null);

  // room 상태가 업데이트될 때마다 ref 업데이트
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // API 훅 사용
  const { loading: roomLoading, error: roomError, execute: fetchRoom } = useApi<Room>("");
  const { loading: infoLoading, error: infoError, execute: fetchRoomInfo } = useApi<ApiResponse>("", "POST");
  const { loading: readyLoading, error: readyError, execute: setReady } = useApi<ApiResponse>("", "POST");
  const { loading: unreadyLoading, error: unreadyError, execute: setUnready } = useApi<ApiResponse>("", "POST");
  const { loading: startLoading, error: startError, execute: startGame } = useApi<ApiResponse>("", "PUT");
  const { loading: leaveLoading, error: leaveError, execute: leaveRoomApi } = useApi<ApiResponse>("", "POST");
  const { loading: kickLoading, error: kickError, execute: kickPlayer } = useApi<ApiResponse>(`/api/room/room/${roomId}/kick`, "POST");

  // WebSocket 훅 사용
  const { client, connected, subscribe, unsubscribe, send, topics, messageTypes } = useWebSocket();
  const { user } = useUserInfo();
  // 사용자 정보 로드 (실제로는 로그인 정보에서 가져옴)
  // useEffect(() => {
  //   // 임시 사용자 ID (실제로는 로그인한 사용자 정보)
  //   // 예시를 위해 로컬 스토리지에서 가져오는 방식 사용
  //   const userIdFromStorage = parseInt(localStorage.getItem("userId") || "1");
  //   setMemberId(userIdFromStorage);
  // }, []);

  // 방 정보 로드
  useEffect(() => {
    if (!roomId) return;

    const loadRoomInfo = async () => {
      try {
        // 방 기본 정보 가져오기
        const roomResponse = await fetchRoom(undefined, {
          url: `/api/room/${roomId}`,
        });

        if (roomResponse?.isSuccess && roomResponse.result) {
          setRoom(roomResponse.result);
        } else {
          showCustomAlert("방 정보를 불러오는데 실패했습니다.");
          navigate("/main");
          return;
        }

        // 실시간 방 정보 요청
        const infoResponse = await fetchRoomInfo(undefined, {
          url: `/api/room/room/${roomId}/info`,
        });

        if (!infoResponse?.isSuccess) {
          showCustomAlert("실시간 방 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("방 정보를 불러오는 중 오류 발생:", error);
        showCustomAlert("방 정보를 불러오는데 실패했습니다.");
        navigate("/main");
      }
    };

    loadRoomInfo();
  }, [roomId, navigate, fetchRoom, fetchRoomInfo]);

  // 에러 처리
  useEffect(() => {
    const errors = [roomError, infoError, readyError, unreadyError, startError, leaveError];
    const errorMsg = errors.find((err) => err !== null);

    if (errorMsg) {
      showCustomAlert(errorMsg);
    }
  }, [roomError, infoError, readyError, unreadyError, startError, leaveError]);

  // WebSocket 구독
  useEffect(() => {
    if (!connected || !client || !roomId) return;

    // 방 토픽 구독
    const roomTopic = topics.ROOM(roomId);

    // 메시지 핸들러
    const handleRoomMessage = (message: IMessage) => {
      try {
        console.log("원본 메시지 본문:", message.body);

        // 이중 인코딩된 메시지 처리 - 메시지 본문이 JSON 문자열을 포함한 문자열인 경우
        let parsedData: EventMessage<RedisRoom | number | null>;

        // 첫 번째 파싱 시도
        const firstParse = JSON.parse(message.body);

        // 결과가 문자열인지 확인 (이중 인코딩된 경우)
        if (typeof firstParse === "string") {
          // 두 번째 파싱 시도
          parsedData = JSON.parse(firstParse);
          console.log("이중 인코딩된 메시지 감지, 두 번째 파싱 결과:", parsedData);
        } else {
          // 일반적인 경우 (한 번만 인코딩됨)
          parsedData = firstParse;
        }

        console.log("최종 파싱 결과:", parsedData);
        console.log("이벤트 타입:", parsedData.event);

        // 이벤트 타입 확인
        if (!parsedData || typeof parsedData !== "object") {
          console.error("유효하지 않은 메시지 구조:", parsedData);
          return;
        }

        // 이벤트 처리
        const event = parsedData.event;

        if (event === "INFO" || event === "JOIN" || event === "READY" || event === "UPDATE" || event === "UNREADY") {
          // 방 정보 업데이트
          if (parsedData.data && typeof parsedData.data === "object") {
            console.log("방 정보 업데이트:", parsedData.data);
            setRedisRoom(parsedData.data as RedisRoom);
          }
        } else if (event === "KICK") {
          if (typeof parsedData.data === "number") {
            const kickedMemberId = parsedData.data;

            // 강퇴당하는 사람이 방장인지 확인 (nickname으로 체크)
            const isKickedUserHost = redisRoom?.members.find((member) => member.memberId === kickedMemberId)?.nickname === redisRoom?.host.nickname;

            // 방장이면 강퇴 처리하지 않음
            if (isKickedUserHost) {
              console.log("방장은 강퇴할 수 없습니다.");
              return;
            }

            // 자신이 강퇴당한 경우 (nickname으로 체크)
            const isCurrentUserKicked = redisRoom?.members.find((member) => member.memberId === kickedMemberId)?.nickname === user?.nickname;

            if (isCurrentUserKicked) {
              showCustomAlert("방에서 강퇴되었습니다.");
              navigate("/main");
              return;
            }

            // 다른 사람이 강퇴당한 경우 멤버 목록 업데이트
            setRedisRoom((prevRoom) => {
              if (!prevRoom) return null;

              // 강퇴된 멤버를 제외한 새로운 배열 생성
              const updatedMembers = prevRoom.members.filter((member) => member.memberId !== kickedMemberId);

              return {
                ...prevRoom,
                members: updatedMembers,
              };
            });
          }
        } else if (event === "LEAVE") {
          if (typeof parsedData.data === "number") {
            const leavingMemberId = parsedData.data;
            setRedisRoom((prevRoom) => {
              if (!prevRoom) return null;

              const updatedMembers = prevRoom.members.filter((member) => member.memberId !== leavingMemberId);

              let updatedHost = prevRoom.host;
              if (prevRoom.host.memberId === leavingMemberId && updatedMembers.length > 0) {
                updatedHost = updatedMembers[0];
              }

              return {
                ...prevRoom,
                members: updatedMembers,
                host: updatedHost,
              };
            });
          }
        } else if (event === "START") {
          // 게임 시작
          if (roomRef.current?.subjectType) {
            navigate(`/one-to-one/${roomRef.current.subjectType.toLowerCase()}`);
          }
        } else {
          console.log("알 수 없는 이벤트:", event, "서버 데이터:", parsedData);
        }
      } catch (error) {
        console.error("메시지 처리 중 오류 발생:", error, "원본 메시지:", message.body);
      }
    };

    // 구독
    const subscription = subscribe(roomTopic, handleRoomMessage);

    // 채팅 토픽 구독 (채팅 기능이 구현된 경우)
    const chatTopic = topics.CHAT(roomId);
    const handleChatMessage = (message: IMessage) => {
      try {
        const chatData = JSON.parse(message.body);
        setChatMessages((prev) => [
          ...prev,
          {
            sender: chatData.sender, // 이미 nickname이 들어있음
            message: chatData.content,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("채팅 메시지 처리 중 오류 발생:", error);
      }
    };

    const chatSubscription = subscribe(chatTopic, handleChatMessage);

    // 정리 함수
    return () => {
      if (subscription) {
        unsubscribe(roomTopic);
      }
      if (chatSubscription) {
        unsubscribe(chatTopic);
      }
    };
  }, [connected, client, roomId, topics, subscribe, unsubscribe, messageTypes, memberId, navigate]);

  // 준비 상태 토글
  const handleToggleReady = async () => {
    if (!roomId) return;

    try {
      if (isReady) {
        // 준비 해제
        await setUnready(undefined, {
          url: `/api/room/room/${roomId}/unready`,
        });
      } else {
        // 준비 완료
        await setReady(undefined, {
          url: `/api/room/room/${roomId}/ready`,
        });
      }
      setIsReady(!isReady);
    } catch (error) {
      console.error("준비 상태 변경 중 오류 발생:", error);
      showCustomAlert("준비 상태 변경에 실패했습니다.");
    }
  };

  // RedisRoom의 members 배열에서 강퇴할 멤버의 ID를 가져와서 사용
  const handleKickPlayer = async (targetMemberId: number) => {
    if (!roomId || !redisRoom) return;

    // 이미 UI에서 방장만 버튼이 보이도록 했으니, 여기서는 추가 체크가 필요 없음
    try {
      const response = await kickPlayer(undefined, {
        url: `/api/room/room/${roomId}/kick/${targetMemberId}`,
      });

      if (!response?.isSuccess) {
        showCustomAlert("강퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("강퇴 처리 중 오류 발생:", error);
      showCustomAlert("강퇴 처리 중 오류가 발생했습니다.");
    }
  };

  // 게임 시작
  const handleStartGame = async () => {
    if (!roomId || !memberId || !redisRoom) return;

    // 방장 체크
    if (redisRoom.host.memberId !== memberId) {
      showCustomAlert("방장만 게임을 시작할 수 있습니다.");
      return;
    }

    // 모든 플레이어가 준비 상태인지 확인
    const allReady = redisRoom.members.every((member) => member.memberId === redisRoom.host.memberId || member.status === "READY");

    if (!allReady) {
      showCustomAlert("모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.");
      return;
    }

    // 게임 시작 API 호출
    await startGame(undefined, {
      url: `/api/room/start/${roomId}`,
    });
  };

  // 방 나가기
  const handleLeaveRoom = async () => {
    if (!roomId) return;

    // 방 나가기 API 호출
    const response = await leaveRoomApi(undefined, {
      url: `/api/room/room/${roomId}/leave`,
    });

    if (response?.isSuccess) {
      navigate("/main");
    }
  };

  // 채팅 메시지 전송
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !roomId || !client || !connected || !redisRoom) return;

    // redisRoom에서 현재 사용자의 정보 찾기
    const currentMember = redisRoom.members.find((member) => member.nickname === user?.nickname);

    if (!currentMember) {
      showCustomAlert("사용자 정보를 찾을 수 없습니다.");
      return;
    }

    const chatTopic = `/app/chat/${roomId}`;
    const chatData = {
      roomId: parseInt(roomId),
      sender: currentMember.memberId, // memberId를 sender로 보냄
      content: chatInput,
    };

    send(chatTopic, chatData);
    setChatInput("");
  };

  // 주제 이름 가져오기
  const getSubjectName = (subjectType?: SubjectType) => {
    if (!subjectType) return "";

    const subjects = [
      { id: "FIN_KNOWLEDGE", name: "금융 지식" },
      { id: "FIN_INVESTMENT", name: "투자" },
      { id: "FIN_POLICY", name: "정책" },
      { id: "FIN_PRODUCT", name: "상품" },
      { id: "FIN_CRIME", name: "범죄" },
    ];

    return subjects.find((s) => s.id === subjectType)?.name || subjectType;
  };

  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  if (!room || !redisRoom) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">{roomLoading || infoLoading ? "로딩 중..." : "방 정보를 불러올 수 없습니다."}</div>
        </div>
      </Background>
    );
  }

  // 현재 사용자의 준비 상태 확인
  const currentMember = redisRoom.members.find((member) => member.nickname === user?.nickname);
  const currentIsReady = currentMember?.status === "READY";

  const isLoading = readyLoading || unreadyLoading || startLoading || leaveLoading;

  return (
    <>
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
          <div className="w-full max-w-6xl px-6 flex flex-col h-[calc(100vh-12rem)]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl text-white font-bold tracking-wider text-shadow-lg">{room.roomTitle}</h1>
              <button onClick={handleLeaveRoom} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" disabled={isLoading}>
                {leaveLoading ? "처리 중..." : "방 나가기"}
              </button>
            </div>

            <div className="flex flex-1 gap-6">
              {/* 왼쪽: 방 정보 및 플레이어 목록 */}
              <div className="w-2/3 bg-white bg-opacity-80 rounded-lg p-6 flex flex-col">
                <div className="flex mb-6">
                  <div className="w-1/3">
                    <img src={oneVsOneImg} alt={`${room.roomType} 모드`} className="w-full h-48 object-contain" />
                  </div>
                  <div className="w-2/3 pl-6">
                    <h2 className="text-2xl font-bold mb-4">방 정보</h2>
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">모드:</span> {room.roomType}
                      </p>
                      {room.subjectType && (
                        <p>
                          <span className="font-semibold">주제:</span> {getSubjectName(room.subjectType)}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold">인원:</span> {redisRoom.members.length}/{room.maxPlayer}
                      </p>
                      <p>
                        <span className="font-semibold">방장:</span> {redisRoom.host.nickname}
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">플레이어 목록</h3>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="py-2 px-4 text-left">이름</th>
                        <th className="py-2 px-4 text-center">상태</th>
                        <th className="py-2 px-4 text-center">역할</th>
                      </tr>
                    </thead>
                    <tbody>
                      {redisRoom.members.map((player) => (
                        <tr key={player.memberId} className="border-t border-gray-300">
                          <td className="py-3 px-4">{player.nickname}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${player.status === "READY" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                              {player.status === "READY" ? "준비 완료" : "대기 중"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {player.memberId === redisRoom.host.memberId ? (
                              "방장"
                            ) : user?.nickname === redisRoom.host.nickname ? ( // 현재 사용자가 방장인지 닉네임으로 체크
                              <button
                                onClick={() => handleKickPlayer(player.memberId)}
                                className="bg-red text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                                disabled={kickLoading}
                              >
                                {kickLoading ? "처리 중..." : "강퇴"}
                              </button>
                            ) : (
                              "참가자"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between mt-6">
                  {/* 방장이 아닌 경우에만 준비 버튼 표시 */}
                  {user?.nickname !== redisRoom.host.nickname && (
                    <button
                      onClick={handleToggleReady}
                      disabled={readyLoading || unreadyLoading}
                      className={`px-6 py-3 rounded-lg font-bold ${currentIsReady ? "bg-yellow-500 text-black hover:bg-yellow-500" : "bg-blue-500 text-white hover:bg-blue-600"} transition-colors`}
                    >
                      {readyLoading || unreadyLoading ? "처리 중..." : currentIsReady ? "준비 취소" : "준비 완료"}
                    </button>
                  )}

                  {/* 방장인 경우에만 시작 버튼 표시 */}
                  {user?.nickname === redisRoom.host.nickname && (
                    <button
                      onClick={handleStartGame}
                      disabled={startLoading || !redisRoom.members.every((member) => member.nickname === redisRoom.host.nickname || member.status === "READY")}
                      className={`px-6 py-3 rounded-lg font-bold ${
                        startLoading || !redisRoom.members.every((member) => member.nickname === redisRoom.host.nickname || member.status === "READY")
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      } transition-colors`}
                    >
                      {startLoading ? "시작 중..." : "게임 시작"}
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
      </Background>
      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </>
  );
};

export default RoomPreparePage;
