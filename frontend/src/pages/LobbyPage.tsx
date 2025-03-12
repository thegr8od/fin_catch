import Background from "../components/layout/Background";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 모드 이미지 import
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

const LobbyPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);

    // 선택한 모드에 따른 페이지 이동 처리
    if (mode === "oneVsOne") {
      navigate("/one-to-one");
    } else if (mode === "Bot") {
      // AI 모드 페이지로 이동 (구현 필요)
      console.log("AI 모드 선택");
    } else if (mode === "Survival") {
      // 멀티 모드 페이지로 이동 (구현 필요)
      console.log("멀티 모드 선택");
    }
  };
  // 임시 방 데이터 생성
  useEffect(() => {
    // 로컬 스토리지에서 방 목록 불러오기
    try {
      const storedRooms = localStorage.getItem("rooms");
      if (storedRooms) {
        const parsedRooms: Room[] = JSON.parse(storedRooms);
        setRooms(parsedRooms);
        return;
      }
    } catch (error) {
      console.error("방 목록을 불러오는 중 오류 발생:", error);
    }

    // 로컬 스토리지에 방 목록이 없거나 오류 발생 시 기본 방 목록 사용
    const dummyRooms: Room[] = [
      {
        id: "1",
        title: "봇과 대결해보자!",
        mode: "Bot",
        host: "사용자1",
        players: 1,
        maxPlayers: 1,
        status: "waiting",
        category: "investment",
        difficulty: "easy",
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "1:1 대결방",
        mode: "oneVsOne",
        host: "사용자2",
        players: 1,
        maxPlayers: 2,
        status: "waiting",
        category: "economy",
        createdAt: new Date(),
      },
      {
        id: "3",
        title: "서바이벌 모드!",
        mode: "Survival",
        host: "사용자3",
        players: 3,
        maxPlayers: 8,
        status: "playing",
        createdAt: new Date(),
      },
    ];

    setRooms(dummyRooms);

    // 기본 방 목록을 로컬 스토리지에 저장
    try {
      localStorage.setItem("rooms", JSON.stringify(dummyRooms));
    } catch (error) {
      console.error("방 목록을 저장하는 중 오류 발생:", error);
    }
  }, []);

  // 방 생성 처리
  const handleCreateRoom = () => {
    if (!roomTitle || !selectedMode) return;

    // 새 방 ID 생성 (실제로는 서버에서 생성)
    const newRoomId = Date.now().toString();

    // 새 방 객체 생성
    const newRoom: Room = {
      id: newRoomId,
      title: roomTitle,
      mode: selectedMode,
      host: "현재 사용자", // 실제로는 로그인한 사용자 정보
      players: 1,
      maxPlayers: selectedMode === "oneVsOne" ? 2 : selectedMode === "Survival" ? 8 : 1,
      status: "waiting",
      category: selectedCategory || undefined,
      difficulty: selectedMode === "Bot" ? selectedDifficulty : undefined,
      createdAt: new Date(),
    };

    // 방 목록에 추가 (실제로는 서버에 저장)
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);

    // 로컬 스토리지에 방 정보 저장
    try {
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    } catch (error) {
      console.error("방 정보를 저장하는 중 오류 발생:", error);
    }

    // 모달 닫기 및 상태 초기화
    setShowModal(false);
    setSelectedMode(null);
    setRoomTitle("");
    setSelectedCategory("");
    setSelectedDifficulty("");

    // 준비 페이지로 이동
    navigate(`/room/prepare/${newRoomId}`);
  };

  // 방 입장 처리
  const handleJoinRoom = (roomId: string) => {
    // 방 정보 확인 (실제로는 서버에서 확인)
    const room = rooms.find((r) => r.id === roomId);

    if (!room) {
      alert("존재하지 않는 방입니다.");
      return;
    }

    if (room.status === "playing") {
      alert("이미 게임이 진행 중인 방입니다.");
      return;
    }

    if (room.players >= room.maxPlayers) {
      alert("방이 가득 찼습니다.");
      return;
    }

    // 방 입장 처리 (실제로는 서버에 요청)
    const updatedRooms = rooms.map((r) => (r.id === roomId ? { ...r, players: r.players + 1 } : r));

    setRooms(updatedRooms);

    // 로컬 스토리지 업데이트
    try {
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    } catch (error) {
      console.error("방 정보를 업데이트하는 중 오류 발생:", error);
    }

    // 준비 페이지로 이동
    navigate(`/room/prepare/${roomId}`);
  };

  // 모드 데이터 정의
  const modeData = [
    {
      id: "Bot",
      title: "Bot",
      description: "인공지능이랑 맞짱 뒤지게 까셈 ㅋㅋㅋ",
      imageSrc: botImg,
    },
    {
      id: "oneVsOne",
      title: "PVP",
      description: "마 좀 치나 한 다이 할래?",
      imageSrc: oneVsOneImg,
    },
    {
      id: "Survival",
      title: "Survival",
      description: "이새기 ㅈ밥이네 ㅋㅋ",
      imageSrc: multiImg,
    },
  ];

  // 카테고리 데이터
  const categories = [
    { id: "investment", name: "투자" },
    { id: "economy", name: "정책" },
    { id: "product", name: "상품" },
    { id: "delivery", name: "범죄" },
  ];

  // 난이도 데이터
  const difficulties = [
    { id: "easy", name: "쉬움" },
    { id: "medium", name: "보통" },
    { id: "hard", name: "어려움" },
  ];

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
        <div className="w-full max-w-6xl px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl text-white font-bold tracking-wider text-shadow-lg">방 목록</h1>
            <button onClick={() => setShowModal(true)} className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
              방 생성하기
            </button>
          </div>

          {/* 방 목록 테이블 */}
          <div className="bg-white bg-opacity-80 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left">방 제목</th>
                  <th className="py-3 px-4 text-left">모드</th>
                  <th className="py-3 px-4 text-left">주제/난이도</th>
                  <th className="py-3 px-4 text-left">방장</th>
                  <th className="py-3 px-4 text-center">인원</th>
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-4 text-center">입장</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-t border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-4">{room.title}</td>
                    <td className="py-3 px-4">{room.mode}</td>
                    <td className="py-3 px-4">
                      {room.category && `${room.category}`}
                      {room.difficulty && ` / ${room.difficulty}`}
                    </td>
                    <td className="py-3 px-4">{room.host}</td>
                    <td className="py-3 px-4 text-center">
                      {room.players}/{room.maxPlayers}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${room.status === "waiting" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {room.status === "waiting" ? "대기중" : "게임중"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={room.status === "playing" || room.players >= room.maxPlayers}
                        className={`px-4 py-1 rounded ${
                          room.status === "playing" || room.players >= room.maxPlayers ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        입장
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      생성된 방이 없습니다. 새로운 방을 만들어보세요!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 방 생성 모달 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">방 생성하기</h2>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">방 제목</label>
                <input type="text" value={roomTitle} onChange={(e) => setRoomTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="방 제목을 입력하세요" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">게임 모드</label>
                <div className="grid grid-cols-3 gap-2">
                  {modeData.map((mode) => (
                    <div
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id as GameMode)}
                      className={`border rounded p-2 cursor-pointer flex flex-col items-center ${selectedMode === mode.id ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
                    >
                      <img src={mode.imageSrc} alt={mode.title} className="w-16 h-16 object-contain mb-2" />
                      <span>{mode.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 선택된 모드에 따른 추가 옵션 */}
              {selectedMode === "oneVsOne" && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">주제 선택</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                    <option value="">주제를 선택하세요</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedMode === "Bot" && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">주제 선택</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                      <option value="">주제를 선택하세요</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">난이도 선택</label>
                    <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full p-2 border border-gray-300 rounded">
                      <option value="">난이도를 선택하세요</option>
                      {difficulties.map((difficulty) => (
                        <option key={difficulty.id} value={difficulty.id}>
                          {difficulty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 mr-2">
                  취소
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!roomTitle || !selectedMode || (selectedMode === "oneVsOne" && !selectedCategory) || (selectedMode === "Bot" && (!selectedCategory || !selectedDifficulty))}
                  className={`px-4 py-2 rounded ${
                    !roomTitle || !selectedMode || (selectedMode === "oneVsOne" && !selectedCategory) || (selectedMode === "Bot" && (!selectedCategory || !selectedDifficulty))
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Background>
  );
};

export default LobbyPage;
