import Background from "../components/layout/Background"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
// 모드 이미지 import
import botImg from "../assets/Bot.png"
import oneVsOneImg from "../assets/one_vs_one.png"
import multiImg from "../assets/multi.png"
import mainBg from "../assets/main.gif"
// 게임 모드 타입 정의
type GameMode = "oneVsOne" | null

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
  createdAt: Date;
}

const LobbyPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");


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

  }, []);


  // 방 생성 처리
  const handleCreateRoom = () => {
    if (!roomTitle) return

    // 새 방 ID 생성 (실제로는 서버에서 생성)
    const newRoomId = Date.now().toString()

    // 새 방 객체 생성
    const newRoom: Room = {
      id: newRoomId,
      title: roomTitle,
      mode: "oneVsOne",
      host: "현재 사용자", // 실제로는 로그인한 사용자 정보
      players: 1,
      maxPlayers: 2,
      status: "waiting",
      category: selectedCategory || undefined,
      createdAt: new Date(),
    }

    // 방 목록에 추가 (실제로는 서버에 저장)
    const updatedRooms = [...rooms, newRoom]
    setRooms(updatedRooms)

    // 로컬 스토리지에 방 정보 저장
    try {
      localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    } catch (error) {
      console.error("방 정보를 저장하는 중 오류 발생:", error)
    }

    // 모달 닫기 및 상태 초기화
    setShowModal(false)
    setRoomTitle("")
    setSelectedCategory("")

    // 준비 페이지로 이동
    navigate(`/room/prepare/${newRoomId}`)
  }

  // 방 입장 처리
  const handleJoinRoom = (roomId: string) => {
    // 방 정보 확인 (실제로는 서버에서 확인)
    const room = rooms.find((r) => r.id === roomId)

    if (!room) {
      alert("존재하지 않는 방입니다.")
      return
    }

    if (room.status === "playing") {
      alert("이미 게임이 진행 중인 방입니다.")
      return
    }

    if (room.players >= room.maxPlayers) {
      alert("방이 가득 찼습니다.")
      return
    }

    // 방 입장 처리 (실제로는 서버에 요청)
    const updatedRooms = rooms.map((r) => (r.id === roomId ? { ...r, players: r.players + 1 } : r))

    setRooms(updatedRooms)

    // 로컬 스토리지 업데이트
    try {
      localStorage.setItem("rooms", JSON.stringify(updatedRooms))
    } catch (error) {
      console.error("방 정보를 업데이트하는 중 오류 발생:", error)
    }

    // 준비 페이지로 이동
    navigate(`/room/prepare/${roomId}`)
  }

  // 카테고리 데이터
  const categories = [
    { id: "investment", name: "투자" },
    { id: "economy", name: "정책" },
    { id: "product", name: "상품" },
    { id: "delivery", name: "범죄" },
  ]

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
                  <th className="py-3 px-4 text-left">주제</th>
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
                    <td className="py-3 px-4">
                      {room.category && `${room.category}`}
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

              <div className="flex justify-end mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 mr-2">
                  취소
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!roomTitle || !selectedCategory}
                  className={`px-4 py-2 rounded ${!roomTitle || !selectedCategory ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Background>
  )
}

export default LobbyPage
