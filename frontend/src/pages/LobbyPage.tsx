import Background from "../components/layout/Background";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// 모드 이미지 import
import botImg from "../assets/Bot.png";
import oneVsOneImg from "../assets/one_vs_one.png";
import multiImg from "../assets/multi.png";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useRoom } from "../hooks/useRoom";
import { Response } from "../types/response/Response";
import { RoomManager } from "../manager/RoomManager";
import { useWebSocket } from "../hooks/useWebSocket";

/**
 * 서버 응답 타입
 */
interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

/**
 * 방 생성 응답 타입
 */
interface CreateRoomResponse {
  roomId: number;
  roomTitle: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  roomType: "ONE_ON_ONE" | "MULTI" | "AI_BATTLE";
  subjectType: "FIN_KNOWLEDGE" | "FIN_CRIME" | "FIN_POLICY" | "FIN_PRODUCT" | "FIN_INVESTMENT";
  maxPlayer: number;
  memberId: number;
  createdAt: string;
}

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
  memberId: number; // 방장 ID
  currentPeople?: number; // 현재 플레이어 수
}

/**
 * 로비 페이지 컴포넌트
 * 방 목록을 보여주고 방 생성/입장 기능을 제공
 */
const LobbyPage = () => {
  const navigate = useNavigate();
  const webSocket = useWebSocket();

  // State Hooks
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [password, setPassword] = useState("");
  const [maxPlayer, setMaxPlayer] = useState(2);
  const [roomType, setRoomType] = useState<Room["roomType"]>("ONE_ON_ONE");
  const [subjectType, setSubjectType] = useState<Room["subjectType"]>("FIN_KNOWLEDGE");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Custom Hooks
  const roomApi = useRoom();

  const showCustomAlert = useCallback((message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  const loadRooms = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const openRooms = await roomApi.searchByOpen();
      const roomsArray = Array.isArray(openRooms) ? openRooms : [openRooms];
      const formattedRooms = roomsArray.map((room) => ({
        ...room,
        password: room.password || null,
        memberId: room.memberId || 0,
      }));
      setRooms(formattedRooms);
    } catch (error) {
      console.error("방 목록 로딩 실패:", error);
      showCustomAlert("방 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, roomApi, showCustomAlert]);

  // 초기 로딩
  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = useCallback(async () => {
    if (!roomTitle) {
      showCustomAlert("방 제목을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const manager = await RoomManager.initialize(roomApi, webSocket);
      const roomId = await manager.createRoom(roomTitle, password, maxPlayer, roomType, subjectType);

      setIsLoading(false);
      setShowModal(false);
      navigate(`/room/prepare/${roomId}`);
    } catch (error) {
      setIsLoading(false);
      console.error("방 생성 중 오류 발생:", error);
      showCustomAlert(error instanceof Error ? error.message : "방 생성에 실패했습니다.");
    }
  }, [roomTitle, password, maxPlayer, roomType, subjectType, roomApi, webSocket, navigate, showCustomAlert]);

  const handleJoinRoom = useCallback(
    async (roomId: number) => {
      try {
        setIsLoading(true);
        const manager = await RoomManager.initialize(roomApi, webSocket);
        await manager.joinRoom(roomId);
        setIsLoading(false);
        navigate(`/room/prepare/${roomId}`);
      } catch (error) {
        setIsLoading(false);
        console.error("방 입장 중 오류 발생:", error);
        showCustomAlert(error instanceof Error ? error.message : "방 입장에 실패했습니다.");
      }
    },
    [roomApi, webSocket, navigate, showCustomAlert]
  );

  // 7. Render
  if (isLoading) {
    return (
      <Background backgroundImage={mainBg}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-white text-2xl">로딩 중...</div>
        </div>
      </Background>
    );
  }

  // JSX 렌더링
  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8">
        <div className="w-full max-w-6xl px-6">
          {/* 상단 버튼 영역 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button onClick={() => setShowModal(true)} className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-bold">
                방 만들기
              </button>
            </div>
            <button onClick={() => {}} className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-bold">
              로그아웃
            </button>
          </div>

          {/* 방 목록 */}
          <div className="bg-white bg-opacity-80 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">방 목록</h2>
              <div className="flex gap-4">
                <button onClick={loadRooms} className="text-blue-500 hover:text-blue-600 transition-colors">
                  새로고침
                </button>
              </div>
            </div>

            {/* 방 목록 테이블을 스크롤 가능한 컨테이너로 감싸기 */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 text-left">방 번호</th>
                    <th className="py-3 px-4 text-left">방 제목</th>
                    <th className="py-3 px-4 text-center">상태</th>
                    <th className="py-3 px-4 text-center">인원</th>
                    <th className="py-3 px-4 text-center">방장</th>
                    <th className="py-3 px-4 text-center">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.roomId} className="border-t border-gray-200">
                      <td className="py-4 px-4">{room.roomId}</td>
                      <td className="py-4 px-4">{room.roomTitle}</td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            room.status === "OPEN" ? "bg-green-200 text-green-800" : room.status === "IN_PROGRESS" ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"
                          }`}
                        >
                          {room.status === "OPEN" ? "대기중" : room.status === "IN_PROGRESS" ? "게임중" : "종료"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {room.currentPeople || 0}/{room.maxPlayer}
                      </td>
                      <td className="py-4 px-4 text-center">{room.memberId}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleJoinRoom(room.roomId)}
                          disabled={room.status === "IN_PROGRESS" || room.status === "CLOSED"}
                          className={`px-4 py-2 rounded ${
                            room.status === "IN_PROGRESS" || room.status === "CLOSED" ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                          } transition-colors`}
                        >
                          입장
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
    </Background>
  );
};

export default LobbyPage;
