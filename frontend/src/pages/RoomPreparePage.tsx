import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Background from "../components/layout/Background";
import botImg from "../assets/Bot.png";
import oneVsOneImg from "../assets/one_vs_one.png";
import multiImg from "../assets/multi.png";
import mainBg from "../assets/main.gif";

// 게임 모드 타입 정의
type GameMode = "Bot" | "oneVsOne" | "Survival" | null;

// 방 인터페이스 정의
interface Room {
  id: string;
  title: string;
  mode: GameMode;
  host: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "playing";
  category?: string;
  difficulty?: string;
  createdAt: Date;
}

// 플레이어 인터페이스 정의
interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
}

const RoomPreparePage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; timestamp: Date }[]>([]);

  // 임시 방 데이터 로드
  useEffect(() => {
    // 실제로는 서버에서 방 정보를 가져옴
    // 임시로 로컬 스토리지에서 방 정보를 가져오는 방식으로 구현
    try {
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) {
        const rooms: Room[] = JSON.parse(storedRooms);
        const foundRoom = rooms.find((r) => r.id === roomId);

        if (foundRoom) {
          setRoom(foundRoom);

          // 임시 플레이어 데이터
          const dummyPlayers: Player[] = [
            {
              id: "1",
              name: "현재 사용자",
              isReady: false,
              isHost: true,
            },
          ];

          setPlayers(dummyPlayers);
          return;
        }
      }
    } catch (error) {
      console.error("방 정보를 불러오는 중 오류 발생:", error);
    }

    // 방 정보를 찾지 못한 경우 기본 방 정보 생성
    const defaultRoom: Room = {
      id: roomId || "1",
      title: "게임 준비방",
      mode: "oneVsOne", // 기본값
      host: "현재 사용자",
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      category: "investment",
      createdAt: new Date(),
    };

    setRoom(defaultRoom);

    // 임시 플레이어 데이터
    const dummyPlayers: Player[] = [
      {
        id: "1",
        name: "현재 사용자",
        isReady: false,
        isHost: true,
      },
    ];

    setPlayers(dummyPlayers);
  }, [roomId]);

  // 준비 상태 토글
  const toggleReady = () => {
    setIsReady(!isReady);

    // 플레이어 준비 상태 업데이트
    const updatedPlayers = players.map((player) => (player.id === "1" ? { ...player, isReady: !isReady } : player));
    setPlayers(updatedPlayers);
  };

  // 게임 시작
  const startGame = () => {
    if (!room) return;

    // 모든 플레이어가 준비 상태인지 확인 (실제로는 서버에서 체크)
    const allReady = players.every((player) => player.isHost || player.isReady);

    if (!allReady) {
      alert("모든 플레이어가 준비 상태여야 게임을 시작할 수 있습니다.");
      return;
    }

    // 방 상태 업데이트 (실제로는 서버에 요청)
    try {
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) {
        const rooms: Room[] = JSON.parse(storedRooms);
        const updatedRooms = rooms.map((r) => (r.id === room.id ? { ...r, status: "playing" } : r));

        localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      }
    } catch (error) {
      console.error("방 상태를 업데이트하는 중 오류 발생:", error);
    }

    // 게임 모드에 따라 다른 페이지로 이동
    if (room.mode === "Bot") {
      navigate(`/game/bot`);
    } else if (room.mode === "oneVsOne" && room.category) {
      navigate(`/one-to-one/${room.category}`);
    } else if (room.mode === "Survival") {
      navigate("/ai-quiz");
    } else {
      console.error("게임 모드 또는 카테고리가 올바르게 설정되지 않았습니다.");
      console.log("현재 방 정보:", room);
    }
  };

  // 방 나가기
  const leaveRoom = () => {
    if (!room) return;

    // 방 상태 업데이트 (실제로는 서버에 요청)
    try {
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) {
        const rooms: Room[] = JSON.parse(storedRooms);

        // 방장이 나가면 방 삭제, 아니면 인원수만 감소
        if (players.some((p) => p.id === "1" && p.isHost)) {
          const updatedRooms = rooms.filter((r) => r.id !== room.id);
          localStorage.setItem("rooms", JSON.stringify(updatedRooms));
        } else {
          const updatedRooms = rooms.map((r) => (r.id === room.id ? { ...r, players: Math.max(1, r.players - 1) } : r));
          localStorage.setItem("rooms", JSON.stringify(updatedRooms));
        }
      }
    } catch (error) {
      console.error("방 상태를 업데이트하는 중 오류 발생:", error);
    }

    navigate("/main");
  };

  // 채팅 메시지 전송
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      sender: "현재 사용자",
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
  };

  // 모드에 따른 이미지 가져오기
  const getModeImage = (mode: GameMode) => {
    switch (mode) {
      case "Bot":
        return botImg;
      case "oneVsOne":
        return oneVsOneImg;
      case "Survival":
        return multiImg;
      default:
        return "";
    }
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "";

    const categories = [
      { id: "investment", name: "투자" },
      { id: "economy", name: "정책" },
      { id: "product", name: "상품" },
      { id: "delivery", name: "범죄" },
    ];

    return categories.find((c) => c.id === categoryId)?.name || categoryId;
  };

  // 난이도 이름 가져오기
  const getDifficultyName = (difficultyId?: string) => {
    if (!difficultyId) return "";

    const difficulties = [
      { id: "easy", name: "쉬움" },
      { id: "medium", name: "보통" },
      { id: "hard", name: "어려움" },
    ];

    return difficulties.find((d) => d.id === difficultyId)?.name || difficultyId;
  };

  if (!room) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">로딩 중...</div>
        </div>
      </Background>
    );
  }

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
        <div className="w-full max-w-6xl px-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-white font-bold tracking-wider text-shadow-lg">{room.title}</h1>
            <button onClick={leaveRoom} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
              방 나가기
            </button>
          </div>

          <div className="flex flex-1 gap-6 mb-6">
            {/* 왼쪽: 방 정보 및 플레이어 목록 */}
            <div className="w-2/3 bg-white bg-opacity-80 rounded-lg p-6 flex flex-col">
              <div className="flex mb-6">
                <div className="w-1/3">
                  <img src={getModeImage(room.mode)} alt={`${room.mode} 모드`} className="w-full h-48 object-contain" />
                </div>
                <div className="w-2/3 pl-6">
                  <h2 className="text-2xl font-bold mb-4">방 정보</h2>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">모드:</span> {room.mode}
                    </p>
                    {room.category && (
                      <p>
                        <span className="font-semibold">주제:</span> {getCategoryName(room.category)}
                      </p>
                    )}
                    {room.difficulty && (
                      <p>
                        <span className="font-semibold">난이도:</span> {getDifficultyName(room.difficulty)}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">인원:</span> {room.players}/{room.maxPlayers}
                    </p>
                    <p>
                      <span className="font-semibold">방장:</span> {room.host}
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
                    {players.map((player) => (
                      <tr key={player.id} className="border-t border-gray-300">
                        <td className="py-3 px-4">{player.name}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${player.isReady ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                            {player.isReady ? "준비 완료" : "대기 중"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{player.isHost ? "방장" : "참가자"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={toggleReady}
                  className={`px-6 py-3 rounded-lg font-bold ${isReady ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-blue-500 text-white hover:bg-blue-600"} transition-colors`}
                >
                  {isReady ? "준비 취소" : "준비 완료"}
                </button>

                <button
                  onClick={startGame}
                  disabled={!players.every((player) => player.isHost || player.isReady)}
                  className={`px-6 py-3 rounded-lg font-bold ${
                    !players.every((player) => player.isHost || player.isReady) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
                  } transition-colors`}
                >
                  게임 시작
                </button>
              </div>
            </div>

            {/* 오른쪽: 채팅 */}
            <div className="w-1/3 bg-white bg-opacity-80 rounded-lg p-4 flex flex-col">
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

              <form onSubmit={sendChatMessage} className="flex">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-l" placeholder="메시지를 입력하세요..." />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors">
                  전송
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default RoomPreparePage;
