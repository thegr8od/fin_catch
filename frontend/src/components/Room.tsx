import { useEffect, useState } from "react";
import { useRoom } from "../hooks/useRoom";
import { useRoomSocket, MessageType } from "../hooks/useRoomSocket";
import { useWebSocket } from "../hooks/useWebSocket";

interface RoomMember {
  memberId: number;
  nickname: string;
  mainCat: string;
  status: string;
}

interface RoomInfo {
  roomId: number;
  maxPeople: number;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  host: RoomMember;
  members: RoomMember[];
}

export const Room = ({ roomId, userId }: { roomId: number; userId: number }) => {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const { getRoomInfo, setReady, setUnready, leaveRoom, kickUser } = useRoom();
  const { send, topics } = useWebSocket();

  // 웹소켓 이벤트 핸들러 정의
  const socketHandlers = {
    [MessageType.INFO]: (data: RoomInfo) => {
      setRoomInfo(data);
    },
    [MessageType.READY]: (data: RoomInfo) => {
      setRoomInfo(data);
    },
    [MessageType.UNREADY]: (data: RoomInfo) => {
      setRoomInfo(data);
    },
    [MessageType.LEAVE]: () => {
      getRoomInfo(roomId);
    },
    [MessageType.KICK]: (kickedUserId: number) => {
      if (kickedUserId === userId) {
        // 자신이 강퇴당한 경우 처리
        alert("방에서 강퇴되었습니다.");
        // 여기에 방 나가기 로직 추가
      }
    },
    [MessageType.DELETE]: () => {
      alert("방이 삭제되었습니다.");
      // 여기에 방 목록으로 이동하는 로직 추가
    },
  };

  // STOMP 웹소켓 연결
  const { connected } = useRoomSocket(roomId, socketHandlers);

  // 초기 방 정보 로딩
  useEffect(() => {
    if (connected) {
      send(topics.ROOM(roomId.toString()), {
        type: MessageType.INFO,
        roomId,
        userId,
      });
    }
  }, [roomId, connected]);

  // 준비 상태 토글 핸들러
  const handleReadyToggle = (memberId: number, currentStatus: string) => {
    if (connected) {
      if (currentStatus === "READY") {
        send(topics.ROOM(roomId.toString()), {
          type: MessageType.UNREADY,
          roomId,
          userId: memberId,
        });
      } else {
        send(topics.ROOM(roomId.toString()), {
          type: MessageType.READY,
          roomId,
          userId: memberId,
        });
      }
    }
  };

  // 강퇴 핸들러
  const handleKick = (targetUserId: number) => {
    if (connected && roomInfo?.host.memberId === userId) {
      send(topics.ROOM(roomId.toString()), {
        type: MessageType.KICK,
        roomId,
        hostId: userId,
        targetUserId,
      });
    }
  };

  // 방 나가기 핸들러
  const handleLeave = () => {
    if (connected) {
      send(topics.ROOM(roomId.toString()), {
        type: MessageType.LEAVE,
        roomId,
        userId,
      });
    }
  };

  if (!roomInfo) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h2>방 정보</h2>
      <div>
        <h3>참가자 목록</h3>
        {roomInfo.members.map((member) => (
          <div key={member.memberId}>
            <span>{member.nickname}</span>
            <span>{member.status}</span>
            {userId === member.memberId && <button onClick={() => handleReadyToggle(member.memberId, member.status)}>{member.status === "READY" ? "준비 해제" : "준비"}</button>}
            {roomInfo.host.memberId === userId && member.memberId !== userId && <button onClick={() => handleKick(member.memberId)}>강퇴</button>}
          </div>
        ))}
      </div>
      <button onClick={handleLeave}>나가기</button>
    </div>
  );
};
