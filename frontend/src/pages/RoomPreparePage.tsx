import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Background from "../components/layout/Background";
import oneVsOneImg from "../assets/shin_chang_seop_boxing.gif";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useWebSocket } from "../hooks/useWebSocket";
import { IMessage } from "@stomp/stompjs";
import { useApi } from "../hooks/useApi";
import { useUserInfo } from "../hooks/useUserInfo";
import CharacterAnimation from "../components/game/CharacterAnimation";
import { CharacterType } from "../components/game/constants/animations";
import { CharacterState } from "../components/game/types/character";

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

interface PullupRoom {
  updated: boolean;
  secondsRemaining: number;
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
  const location = useLocation();
  const initialRoomInfo = location.state?.roomInfo;
  const [room, setRoom] = useState<Room | null>(initialRoomInfo || null);
  const [redisRoom, setRedisRoom] = useState<RedisRoom | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ content: string; roomId: string; sender: string }[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [memberId, setMemberId] = useState<number | null>(null);
  const [pullupTimer, setPullupTimer] = useState<number>(0);
  const [isPullupDisabled, setIsPullupDisabled] = useState(false);
  // room 값을 참조할 ref 추가
  const roomRef = React.useRef<Room | null>(null);

  // room 상태가 업데이트될 때마다 ref 업데이트
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    if (pullupTimer >= 1) {
      const timer = setInterval(() => {
        setPullupTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setIsPullupDisabled(false);
    }
  }, [pullupTimer]);

  // API 훅 사용
  const { loading: infoLoading, error: infoError, execute: fetchRoomInfo } = useApi<ApiResponse>("", "POST");
  const { loading: readyLoading, error: readyError, execute: setReady } = useApi<ApiResponse>("", "POST");
  const { loading: unreadyLoading, error: unreadyError, execute: setUnready } = useApi<ApiResponse>("", "POST");
  const { loading: startLoading, error: startError, execute: startGame } = useApi<ApiResponse>("", "PUT");
  const { loading: leaveLoading, error: leaveError, execute: leaveRoomApi } = useApi<ApiResponse>("", "POST");
  const { loading: pullupLoading, error: pullupError, execute: pullupRoom } = useApi<PullupRoom>("", "PUT");
  const { loading: kickLoading, error: kickError, execute: kickPlayer } = useApi<ApiResponse>(`/api/room/room/${roomId}/kick`, "POST");

  // WebSocket 훅 사용
  const { client, connected, subscribe, unsubscribe, send, topics, messageTypes } = useWebSocket();
  const { user } = useUserInfo();

  // 방 정보 로드
  useEffect(() => {
    if (!roomId || !connected) return;

    const loadRoomInfo = async () => {
      try {
        // 연결 1초 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 실시간 방 정보 요청
        const infoResponse = await fetchRoomInfo(undefined, {
          url: `/api/room/room/${roomId}/info`,
        });
        console.log("실시간 방 정보 : ", infoResponse);
        if (!infoResponse?.isSuccess) {
          showCustomAlert("실시간 방 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("방 정보를 불러오는 중 오류 발생:", error);
        showCustomAlert("방 정보를 불러오는데 실패했습니다.");
        navigate("/lobby");
      }
    };

    loadRoomInfo();
  }, [roomId, navigate, fetchRoomInfo, connected]);

  // 에러 처리
  useEffect(() => {
    const errors = [infoError, readyError, unreadyError, startError, leaveError];
    const errorMsg = errors.find((err) => err !== null);

    if (errorMsg) {
      showCustomAlert(errorMsg);
    }
  }, [infoError, readyError, unreadyError, startError, leaveError]);

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

        if (event === "CREATE" || event === "INFO" || event === "JOIN" || event === "READY" || event === "UPDATE" || event === "UNREADY") {
          // 방 정보 업데이트
          if (parsedData.data && typeof parsedData.data === "object") {
            console.log("방 정보 업데이트:", parsedData.data);
            setRedisRoom(parsedData.data as RedisRoom);
          }
        } else if (event === "KICK") {
          console.log("🔵 KICK 이벤트 시작");
          if (typeof parsedData.data === "number") {
            const kickedMemberId = parsedData.data;
            console.log("🔵 강퇴될 memberId:", kickedMemberId);

            setRedisRoom((prevRoom) => {
              if (!prevRoom) {
                console.log("🔴 prevRoom이 null임");
                return null;
              }

              console.log("🔵 prevRoom 정보:", prevRoom);

              const isCurrentUserKicked = prevRoom?.members.some((member) => member.memberId === kickedMemberId && member.nickname === user?.nickname);

              if (isCurrentUserKicked) {
                console.log("🔵 강퇴된 사용자 처리 시작");
                setAlertMessage("방에서 강퇴되었습니다.");
                setShowAlert(true);
                setOnConfirm(() => navigate("/lobby"));
                console.log("🔵 강퇴된 사용자 메인으로 이동");
                return prevRoom;
              }

              const updatedRoom = {
                ...prevRoom,
                members: prevRoom.members.filter((member) => member.memberId !== kickedMemberId),
              };
              console.log("🔵 업데이트된 room 정보:", updatedRoom);
              return updatedRoom;
            });
            console.log("🔵 KICK 이벤트 처리 완료");
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
          console.log("🔵 START 이벤트 수신된 원본 데이터:", parsedData);
          const members = parsedData.data;
          console.log("🔵 게임 시작 멤버 정보:", members);

          try {
            // 기존 방 구독 해제
            unsubscribe(roomTopic);
            unsubscribe(chatTopic);

            // 데이터 유효성 검사
            if (!Array.isArray(members)) {
              console.error("🔴 멤버 데이터가 배열이 아님:", members);
              return;
            }

            console.log("🔵 게임으로 전달될 최종 데이터:", {
              path: `/one-to-one/${roomRef.current?.subjectType?.toLowerCase()}`,
              players: members,
            });

            // 게임 시작
            if (roomRef.current?.subjectType) {
              navigate(`/one-to-one/${roomRef.current.subjectType.toLowerCase()}`, {
                state: {
                  host: redisRoom?.host,
                  players: members,
                },
              });
            }
          } catch (error) {
            console.error("🔴 게임 시작 처리 중 오류 발생:", error);
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
        console.log("원본 메시지:", message.body);
        // 메시지가 이중으로 JSON 문자열로 되어있을 수 있으므로 두 번 파싱
        let chatData;
        try {
          const firstParse = JSON.parse(message.body);
          if (typeof firstParse === "string") {
            chatData = JSON.parse(firstParse);
          } else {
            chatData = firstParse;
          }
        } catch {
          chatData = JSON.parse(message.body);
        }

        console.log("파싱된 데이터:", chatData);

        // redisRoom에서 발신자의 닉네임 찾기
        const senderMember = redisRoom?.members.find((member) => member.memberId === chatData.sender);
        const senderNickname = senderMember?.nickname || "알 수 없음";

        setChatMessages((prev) => [
          ...prev,
          {
            content: chatData.content,
            roomId: chatData.roomId,
            sender: chatData.sender,
          },
        ]);
      } catch (error) {
        console.error("채팅 메시지 처리 중 오류 발생:", error, "원본 메시지:", message.body);
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
    if (!roomId || !redisRoom) return;

    // 모든 플레이어가 준비 상태인지 확인
    const allReady = redisRoom.members.every((member) => member.memberId === redisRoom.host.memberId || member.status === "READY");

    if (!allReady) {
      showCustomAlert("모든 플레이어가 준비 되지 않았어요!");
      return;
    }

    if (redisRoom.members.length < 2) {
      showCustomAlert("2명의 사용자가 필요해요!");
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
      navigate("/lobby");
    }
  };

  const handlePullUp = async () => {
    if (!roomId || isPullupDisabled) return;

    try {
      const response = await pullupRoom(undefined, {
        url: `/api/room/${roomId}`,
      });

      if (response?.isSuccess) {
        setIsPullupDisabled(true);
        setPullupTimer(response?.result?.secondsRemaining || 0);
      }
    } catch (error) {
      console.error("PullUp 처리 중 오류 발생:", error);
      showCustomAlert("PullUp 처리 중 오류가 발생했습니다.");
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
      roomId: roomId.toString(),
      content: chatInput,
      sender: currentMember.memberId,
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

  const showCustomAlert = (message: string, onConfirm?: () => void) => {
    setAlertMessage(message);
    setShowAlert(true);
    setOnConfirm(onConfirm || null);
  };

  if (!room || !redisRoom) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">{infoLoading ? "캣 휠 돌리는 중..." : "그루밍 중..."}</div>
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
          <div className="w-full max-w-7xl px-6 flex flex-col h-[calc(100vh-12rem)]">
            {/* VS 배너 */}
            <div className="relative flex justify-center items-center mb-8">
              <div className="px-8 py-2 bg-gradient-to-r from-red-600 to-blue-600 rounded-full transform -skew-x-12">
                <h1 className="text-4xl text-white font-black tracking-wider transform skew-x-12 flex items-center gap-4">
                  <span className="text-black font-bold">{redisRoom.host.nickname}</span>
                  <span className="text-yellow-300 text-5xl">VS</span>
                  <span className="text-black font-bold">{redisRoom.members.length > 1 ? redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname)?.nickname : "???"}</span>
                </h1>
              </div>

              {/* PullUp 버튼 */}
              <button
                onClick={handlePullUp}
                disabled={isPullupDisabled || pullupLoading}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 flex items-center gap-2 ${
                  isPullupDisabled ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r  text-white"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                {isPullupDisabled ? `${pullupTimer}초 대기` : ""}
              </button>
            </div>

            {/* 방 정보 */}
            <div className="text-center mb-4">
              <h2 className="text-xl text-white/80">
                <span className="font-bold text-yellow-400">{room.roomTitle}</span>
                <span className="mx-2">·</span>
                <span className="text-blue-300">{getSubjectName(room.subjectType)}</span>
              </h2>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="flex-1 flex gap-6 relative">
              {/* 왼쪽 플레이어 - 빨간팀 */}
              <div className="w-1/3 rounded-3xl p-6 flex flex-col items-center bg-black/40 backdrop-blur-sm border-2 border-black">
                <div className="w-48 h-48 mb-4 relative">
                  <div className="absolute inset-0 rounded-full animate-pulse"></div>
                  <CharacterAnimation characterType={redisRoom.host.mainCat as CharacterType} state="idle" direction={true} size="large" loop={true} />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{redisRoom.host.nickname}</h3>
                <span className="px-6 py-2 rounded-full bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/50">방장</span>
              </div>

              {/* 중앙 채팅 및 컨트롤 */}
              <div className="flex-1 flex flex-col gap-4 z-10">
                {/* 채팅창 */}
                <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-3xl p-4 border border-white/10">
                  <div className="flex-1 overflow-y-auto mb-4 rounded-2xl bg-black/20 p-4 h-[calc(100%-80px)]">
                    {chatMessages.length === 0 ? (
                      <div className="text-white/50 text-center py-8">
                        <p className="text-lg">채팅을 입력하세요...</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div key={index} className="mb-2 p-2 hover:bg-white/5 rounded-lg transition-all">
                          <span className="font-bold text-yellow-400">{msg.sender}</span>
                          <span className="mx-2 text-white/70">:</span>
                          <span className="text-white">{msg.content}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={sendChatMessage} className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 p-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-500"
                      placeholder="메시지를 입력하세요..."
                    />
                    <button type="submit" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all">
                      전송
                    </button>
                  </form>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex justify-center gap-6">
                  {user?.nickname !== redisRoom.host.nickname && (
                    <button
                      onClick={handleToggleReady}
                      disabled={readyLoading || unreadyLoading}
                      className={`px-12 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                        currentIsReady ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-blue-500 text-white hover:bg-blue-400"
                      }`}
                    >
                      {readyLoading || unreadyLoading ? "처리 중..." : currentIsReady ? "준비 취소" : "준비 완료"}
                    </button>
                  )}
                  {user?.nickname === redisRoom.host.nickname && (
                    <button
                      onClick={handleStartGame}
                      disabled={startLoading || !redisRoom.members.every((member) => member.nickname === redisRoom.host.nickname || member.status === "READY")}
                      className={`px-12 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                        startLoading || !redisRoom.members.every((member) => member.nickname === redisRoom.host.nickname || member.status === "READY")
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-400"
                      }`}
                    >
                      {startLoading ? "시작 중..." : "게임 시작"}
                    </button>
                  )}
                </div>
              </div>

              {/* 오른쪽 플레이어 - 파란팀 */}
              <div className="w-1/3 rounded-3xl p-6 flex flex-col items-center bg-black/40 backdrop-blur-sm border-2 border-black">
                {redisRoom.members.length > 1 ? (
                  <>
                    <div className="w-48 h-48 mb-4 relative">
                      <div className="absolute inset-0 rounded-full animate-pulse"></div>
                      <CharacterAnimation
                        characterType={redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname)?.mainCat as CharacterType}
                        state="idle"
                        direction={false}
                        size="large"
                        loop={true}
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-white">{redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname)?.nickname}</h3>
                      {/* 방장일 때만 강퇴 버튼 표시 */}
                      {user?.nickname === redisRoom.host.nickname && (
                        <button
                          onClick={() => {
                            const targetMember = redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname);
                            if (targetMember) {
                              handleKickPlayer(targetMember.memberId);
                            }
                          }}
                          className="text-red-500 hover:text-red-600 transition-all transform hover:scale-110"
                          disabled={kickLoading}
                        >
                          {kickLoading ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    <span
                      className={`px-6 py-2 rounded-full font-bold shadow-lg ${
                        redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname)?.status === "READY"
                          ? "bg-green-500 text-white shadow-green-500/50"
                          : "bg-yellow-500 text-black shadow-yellow-500/50"
                      }`}
                    >
                      {redisRoom.members.find((m) => m.nickname !== redisRoom.host.nickname)?.status === "READY" ? "준비 완료" : "대기 중"}
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-48 h-48 mb-4 relative">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                      <img src={oneVsOneImg} alt="대기 중" className="w-full h-full object-contain opacity-30" />
                    </div>
                    <p className="text-blue-200 text-xl font-bold">상대방 대기 중...</p>
                  </div>
                )}
              </div>
            </div>

            {/* 나가기 버튼 */}
            <button
              onClick={handleLeaveRoom}
              className="absolute top-4 right-4 px-6 py-2 bg-red text-white rounded-full hover:bg-red-500 transition-all transform hover:scale-105"
              disabled={isLoading}
            >
              {leaveLoading ? "처리 중..." : "나가기"}
            </button>
          </div>
        </div>
      </Background>
      {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
    </>
  );
};

export default RoomPreparePage;
