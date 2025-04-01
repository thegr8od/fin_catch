import Background from "../components/layout/Background";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mainBg from "../assets/main.gif";
import { CustomAlert } from "../components/layout/CustomAlert";
import { useApi } from "../hooks/useApi";

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

// 방 생성 요청 인터페이스
interface RoomCreateRequest {
  roomTitle: string;
  password: string;
  maxPlayer: number;
  roomType: RoomType;
  subjectType: SubjectType;
}

// API 응답 인터페이스
interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message?: string;
  result: T;
}

const LobbyPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | "">("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // API 훅 사용
  const { loading: loadingRooms, error: roomsError, execute: fetchRooms } = useApi<Room[]>("/api/room/open");
  const { loading: creatingRoom, error: createError, execute: createRoom } = useApi<Room, RoomCreateRequest>("/api/room", "POST");
  const { loading: joiningRoom, error: joinError, execute: joinRoom } = useApi<ApiResponse<null>>("", "POST");

  // 방 목록 로드
  useEffect(() => {
    const loadRooms = async () => {
      const response = await fetchRooms();
      if (response?.isSuccess && response.result) {
        setRooms(response.result);
      } else if (response?.message) {
        showCustomAlert(response.message);
      }
    };

    loadRooms();

    // 10초마다 방 목록 갱신
    const interval = setInterval(() => {
      loadRooms();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchRooms]);

  // 에러 처리
  useEffect(() => {
    if (roomsError) {
      showCustomAlert(roomsError);
    }
    if (createError) {
      showCustomAlert(createError);
    }
    if (joinError) {
      showCustomAlert(joinError);
    }
  }, [roomsError, createError, joinError]);

  // 방 생성 처리
  const handleCreateRoom = async () => {
    console.log("방 생성 함수 호출됨");
    if (!roomTitle || !selectedSubject) {
      console.log("필수 입력값 누락", { roomTitle, selectedSubject });
      return;
    }

    // 방 생성 요청 데이터
    const createRoomData: RoomCreateRequest = {
      roomTitle,
      password,
      maxPlayer: 2,
      roomType: "ONE_ON_ONE",
      subjectType: selectedSubject as SubjectType,
    };

    console.log("방 생성 요청 데이터:", createRoomData);

    // 방 생성 API 호출
    try {
      console.log("createRoom 호출 직전");
      const response = await createRoom(createRoomData);
      console.log("방 생성 응답:", response);

      if (response?.isSuccess && response.result) {
        // 방 생성 후 방 목록 갱신
        fetchRooms();

        // 모달 닫기 및 상태 초기화
        setShowModal(false);
        setRoomTitle("");
        setSelectedSubject("");
        setPassword("");

        // 준비 페이지로 이동
        navigate(`/room/prepare/${response.result.roomId}`);
      } else {
        console.error("방 생성 실패:", response);
        showCustomAlert(response?.message || "방 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("방 생성 중 예외 발생:", error);
      showCustomAlert("방 생성 처리 중 오류가 발생했습니다.");
    }
  };

  // 방 입장 처리
  const handleJoinRoom = async (roomId: number) => {
    // 방 입장 API 호출
    const response = await joinRoom(undefined, {
      url: `/api/room/room/${roomId}/join`,
    });

    if (response?.isSuccess) {
      // 준비 페이지로 이동
      navigate(`/room/prepare/${roomId}`);
    }
  };

  // 주제 데이터
  const subjects = [
    { id: "FIN_KNOWLEDGE", name: "금융 지식" },
    { id: "FIN_INVESTMENT", name: "투자" },
    { id: "FIN_POLICY", name: "정책" },
    { id: "FIN_PRODUCT", name: "상품" },
    { id: "FIN_CRIME", name: "범죄" },
  ];

  const showCustomAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center pt-8 relative z-10">
        <div className="w-full max-w-6xl px-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl text-white font-bold tracking-wider text-shadow-lg">방 목록</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
              disabled={loadingRooms || creatingRoom}
            >
              {creatingRoom ? "처리 중..." : "방 생성하기"}
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
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-4 text-center">입장</th>
                </tr>
              </thead>
              <tbody>
                {loadingRooms ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : rooms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      생성된 방이 없습니다. 새로운 방을 만들어보세요!
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => (
                    <tr key={room.roomId} className="border-t border-gray-300 hover:bg-gray-100">
                      <td className="py-3 px-4">{room.roomTitle}</td>
                      <td className="py-3 px-4">{room.subjectType}</td>
                      <td className="py-3 px-4">방장 {room.memberId}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${room.status === "OPEN" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                          {room.status === "OPEN" ? "대기중" : "게임중"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleJoinRoom(room.roomId)}
                          disabled={room.status !== "OPEN" || joiningRoom}
                          className={`px-4 py-1 rounded ${room.status !== "OPEN" || joiningRoom ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                        >
                          {joiningRoom ? "처리 중..." : "입장"}
                        </button>
                      </td>
                    </tr>
                  ))
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
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value as SubjectType | "")} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">주제를 선택하세요</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">비밀번호 (선택)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="비밀번호를 입력하세요 (선택)"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 mr-2">
                  취소
                </button>
                <button
                  onClick={(e) => {
                    console.log("방 생성 버튼 클릭됨");
                    e.preventDefault();
                    handleCreateRoom();
                  }}
                  disabled={!roomTitle || !selectedSubject || creatingRoom}
                  className={`px-4 py-2 rounded ${!roomTitle || !selectedSubject || creatingRoom ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  {creatingRoom ? "생성 중..." : "생성하기"}
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
