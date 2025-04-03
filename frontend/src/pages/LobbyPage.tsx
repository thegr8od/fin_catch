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
  currentPlayerCount: number;
}

interface PageinationResponse {
  roomList: Room[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
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
  code: number;
  message?: string;
  result: T;
}

const LobbyPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | "">("");
  const [currentSubject, setCurrentSubject] = useState<SubjectType | "ALL">("ALL");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [isLastPage, setIsLastPage] = useState<boolean>(true);
  const [totalElements, setTotalElements] = useState<number>(0);

  // API 훅 사용
  const { loading: loadingRooms, error: roomsError, execute: fetchRooms } = useApi<PageinationResponse>("");
  const { loading: loadingSubjectRooms, error: subjectRoomsError, execute: searchBySubject } = useApi<PageinationResponse>("");
  const { loading: creatingRoom, error: createError, execute: createRoom } = useApi<Room, RoomCreateRequest>("/api/room", "POST");
  const { loading: joiningRoom, error: joinError, execute: joinRoom } = useApi<ApiResponse<null>>("", "POST");

  // 방 목록 로드
  useEffect(() => {
    const loadRooms = async () => {
      let response;
      if (currentSubject === "ALL") {
        response = await fetchRooms(undefined, {
          url: `/api/room/open/${currentPage}`,
        });
      } else {
        response = await searchBySubject(undefined, {
          url: `/api/room/type/${currentSubject}/${currentPage}`,
        });
      }

      if (response?.isSuccess && response.result) {
        setRooms(response.result.roomList);
        setCurrentPage(response.result.page);
        const calculatedTotalPages = Math.ceil(response.result.totalElements / pageSize);
        setTotalPages(calculatedTotalPages);
        setIsLastPage(response.result.last);
        setTotalElements(response.result.totalElements);
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
  }, [fetchRooms, searchBySubject, currentPage, currentSubject, pageSize]);

  const handlePageChange = (newPage: number) => {
    console.log("페이지 변경:", {
      currentPage,
      newPage,
      totalPages,
      totalElements,
    });
    if (newPage >= 1 && newPage <= Math.ceil(totalElements / pageSize)) {
      setCurrentPage(newPage);
    }
  };
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

        // 준비 페이지로 이동 (방 정보와 함께)
        navigate(`/room/prepare/${response.result.roomId}`, {
          state: { roomInfo: response.result },
        });
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
  const handleJoinRoom = async (roomId: number, roomInfo: Room) => {
    // 방 입장 API 호출
    const response = await joinRoom(undefined, {
      url: `/api/room/room/${roomId}/join`,
    });

    if (response?.isSuccess) {
      // 준비 페이지로 이동 (방 정보와 함께)
      navigate(`/room/prepare/${roomId}`, {
        state: { roomInfo },
      });
    }
  };

  // 주제 데이터
  const filterSubjects = [
    { id: "FIN_KNOWLEDGE", name: "금융 지식" },
    { id: "FIN_INVESTMENT", name: "투자" },
    { id: "FIN_POLICY", name: "정책" },
    { id: "FIN_PRODUCT", name: "상품" },
    { id: "FIN_CRIME", name: "범죄" },
  ];

  // 주제 타입을 한글로 변환하는 함수
  const getSubjectName = (subjectType: SubjectType): string => {
    const subject = filterSubjects.find((subject) => subject.id === subjectType);
    return subject ? subject.name : subjectType;
  };

  const handleSubjectChange = (subject: SubjectType) => {
    if (currentSubject === subject) {
      // 같은 주제를 다시 클릭하면 전체 보기로 변경
      setCurrentSubject("ALL");
    } else {
      // 다른 주제를 클릭하면 해당 주제로 필터링
      setCurrentSubject(subject);
    }
    setCurrentPage(1); // 주제 변경 시 첫 페이지로 이동
  };

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
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg flex items-center gap-2"
              disabled={loadingRooms || creatingRoom}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {creatingRoom ? "처리 중..." : "방 생성하기"}
            </button>
          </div>

          {/* 주제 필터 버튼들 */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {filterSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => handleSubjectChange(subject.id as SubjectType)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 ${
                  currentSubject === subject.id ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-300" : "bg-white bg-opacity-90 hover:bg-blue-50 shadow"
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>

          {/* 방 목록 테이블 */}
          <div className="bg-white bg-opacity-90 rounded-xl overflow-hidden flex flex-col shadow-xl">
            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">방 제목</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">주제</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">인원 수</th>
                      <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">상태</th>
                      <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">입장</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loadingRooms ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            로딩 중...
                          </div>
                        </td>
                      </tr>
                    ) : rooms.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                            <p>생성된 방이 없습니다. 새로운 방을 만들어보세요!</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rooms.map((room) => (
                        <tr key={room.roomId} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">{room.roomTitle}</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">{getSubjectName(room.subjectType)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                              </svg>
                              {room.currentPlayerCount}/{room.maxPlayer}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${room.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {room.status === "OPEN" ? "대기중" : "게임중"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleJoinRoom(room.roomId, room)}
                              disabled={room.status !== "OPEN" || joiningRoom || room.currentPlayerCount >= room.maxPlayer}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                room.status !== "OPEN" || joiningRoom || room.currentPlayerCount >= room.maxPlayer
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
                              }`}
                            >
                              {joiningRoom ? "처리 중..." : room.currentPlayerCount >= room.maxPlayer ? "정원 초과" : "입장"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center py-4 gap-2 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                }`}
              >
                이전
              </button>

              {totalElements > 0 && (
                <>
                  {Array.from({ length: Math.ceil(totalElements / pageSize) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === pageNum ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalElements / pageSize)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage >= Math.ceil(totalElements / pageSize) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                }`}
              >
                다음
              </button>
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
                <label className="block text-gray-700 mb-2">주제 선택</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value as SubjectType)} className="w-full p-2 border border-gray-300 rounded">
                  <option value="">주제를 선택하세요</option>
                  {filterSubjects.map((subject) => (
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
