import Background from "../components/layout/Background";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 모드 이미지 import
import botImg from "../assets/Bot.png";
import oneVsOneImg from "../assets/one_vs_one.png";
import multiImg from "../assets/multi.png";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useRoom } from "../hooks/useRoom";

/**
 * 방 정보를 담는 인터페이스
 * 서버의 Room 엔티티와 일치하는 구조
 */
interface Room {
  roomId: number; // 방 고유 ID
  roomTitle: string; // 방 제목
  password: string | null; // 비밀번호 (없을 수 있음)
  maxPlayer: number; // 최대 플레이어 수
  roomType: "ONE_ON_ONE" | "MULTI" | "AI_BATTLE"; // 방 타입
  subjectType: "FIN_KNOWLEDGE" | "FIN_CRIME" | "FIN_POLICY" | "FIN_PRODUCT" | "FIN_INVESTMENT"; // 주제 타입
  status: "OPEN" | "IN_PROGRESS" | "CLOSED"; // 방 상태
  createdAt: string; // 생성 시간
  memberId: number | null; // 방장 ID
  currentPlayer?: number; // 현재 플레이어 수
}

/**
 * 로비 페이지 컴포넌트
 * 방 목록을 보여주고 방 생성/입장 기능을 제공
 */
const LobbyPage = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [rooms, setRooms] = useState<Room[]>([]); // 방 목록
  const [showModal, setShowModal] = useState(false); // 방 생성 모달 표시 여부
  const [roomTitle, setRoomTitle] = useState(""); // 새 방 제목
  const [password, setPassword] = useState(""); // 새 방 비밀번호
  const [maxPlayer, setMaxPlayer] = useState(2); // 새 방 최대 인원
  const [roomType, setRoomType] = useState<Room["roomType"]>("ONE_ON_ONE"); // 새 방 타입
  const [subjectType, setSubjectType] = useState<Room["subjectType"]>("FIN_KNOWLEDGE"); // 새 방 주제
  const [showAlert, setShowAlert] = useState(false); // 알림 표시 여부
  const [alertMessage, setAlertMessage] = useState(""); // 알림 메시지

  // Room 관련 API 훅
  const { createRoom, getAllRoom, searchByOpen } = useRoom();

  /**
   * 컴포넌트 마운트 시 방 목록 로드
   */
  useEffect(() => {
    loadRooms();
  }, []);

  /**
   * 열린 방 목록을 서버에서 가져오는 함수
   */
  const loadRooms = async () => {
    try {
      const openRooms = await searchByOpen();
      if (openRooms) {
        setRooms(Array.isArray(openRooms) ? (openRooms as Room[]) : [openRooms as Room]);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error("방 목록을 불러오는 중 오류 발생:", error);
      showCustomAlert("방 목록을 불러오는데 실패했습니다.");
    }
  };

  /**
   * 새로운 방을 생성하는 함수
   */
  const handleCreateRoom = async () => {
    if (!roomTitle) {
      showCustomAlert("방 제목을 입력해주세요.");
      return;
    }

    try {
      const response = await createRoom(roomTitle, password, maxPlayer, roomType, subjectType);
      if (!response?.roomId) {
        throw new Error("방 생성 응답에 roomId가 없습니다.");
      }

      // 모달 닫기 및 상태 초기화
      setShowModal(false);
      setRoomTitle("");
      setPassword("");
      setMaxPlayer(2);
      setRoomType("ONE_ON_ONE");
      setSubjectType("FIN_KNOWLEDGE");

      // 준비 페이지로 이동
      navigate(`/room/prepare/${response.roomId}`);
    } catch (error) {
      console.error("방 생성 중 오류 발생:", error);
      showCustomAlert("방 생성에 실패했습니다.");
    }
  };

  /**
   * 특정 방에 입장하는 함수
   */
  const handleJoinRoom = (roomId: number) => {
    navigate(`/room/prepare/${roomId}`);
  };

  /**
   * 알림 메시지를 표시하는 함수
   */
  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // JSX 렌더링
  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
        <div className="w-full max-w-6xl px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl text-white font-bold tracking-wider text-shadow-lg">방 목록</h1>
            <div>
              <button onClick={loadRooms} className="bg-blue-400 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 transition-colors mr-4">
                새로고침
              </button>
              <button onClick={() => setShowModal(true)} className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                방 생성하기
              </button>
            </div>
          </div>

          {/* 방 목록 테이블 */}
          <div className="bg-white bg-opacity-80 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-3 px-4 text-left">방 제목</th>
                  <th className="py-3 px-4 text-left">주제</th>
                  <th className="py-3 px-4 text-left">방 타입</th>
                  <th className="py-3 px-4 text-center">인원</th>
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-4 text-center">입장</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.roomId} className="border-t border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-4">{room.roomTitle}</td>
                    <td className="py-3 px-4">{room.subjectType}</td>
                    <td className="py-3 px-4">{room.roomType}</td>
                    <td className="py-3 px-4 text-center">
                      {/* 현재 인원은 서버에서 받아와야 함 */}
                      0/{room.maxPlayer}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          room.status === "OPEN" ? "bg-green-200 text-green-800" : room.status === "IN_PROGRESS" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleJoinRoom(room.roomId)}
                        disabled={room.status !== "OPEN"}
                        className={`px-4 py-1 rounded ${room.status !== "OPEN" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                      >
                        입장
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
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
                <label className="block text-gray-700 mb-2">비밀번호 (선택)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="비밀번호를 입력하세요" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">최대 인원</label>
                <input type="number" value={maxPlayer} onChange={(e) => setMaxPlayer(Number(e.target.value))} min={2} max={4} className="w-full p-2 border border-gray-300 rounded" />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">방 타입</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value as Room["roomType"])} className="w-full p-2 border border-gray-300 rounded">
                  <option value="ONE_ON_ONE">1대1</option>
                  <option value="MULTI">다인전</option>
                  <option value="AI_BATTLE">AI 대전</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">주제</label>
                <select value={subjectType} onChange={(e) => setSubjectType(e.target.value as Room["subjectType"])} className="w-full p-2 border border-gray-300 rounded">
                  <option value="FIN_KNOWLEDGE">금융 지식</option>
                  <option value="FIN_CRIME">금융 범죄</option>
                  <option value="FIN_POLICY">금융 정책</option>
                  <option value="FIN_PRODUCT">금융 상품</option>
                  <option value="FIN_INVESTMENT">금융 투자</option>
                </select>
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 mr-2">
                  취소
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!roomTitle}
                  className={`px-4 py-2 rounded ${!roomTitle ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {showAlert && <CustomAlert message={alertMessage} onClose={() => setShowAlert(false)} />}
      </div>
    </Background>
  );
};

export default LobbyPage;
