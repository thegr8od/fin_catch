import React, { useEffect, useRef } from "react";
import { UserStatus } from "../../types/Room/Room";

interface UserListProps {
  users: UserStatus[];
  isHost: boolean;
  onKick: (memberId: number) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, isHost, onKick }) => {
  const prevUsersRef = useRef<UserStatus[]>(users);

  useEffect(() => {
    // 이전 사용자 목록과 현재 사용자 목록 비교
    const prevUsers = prevUsersRef.current;
    
    // 사용자 수 변경 감지
    if (prevUsers.length !== users.length) {
      console.log("사용자 수 변경:", {
        이전: prevUsers.length,
        현재: users.length,
        신규사용자: users.filter(user => !prevUsers.find(prev => prev.memberId === user.memberId)),
        퇴장사용자: prevUsers.filter(prev => !users.find(user => user.memberId === prev.memberId))
      });
    }

    // 사용자 상태 변경 감지
    users.forEach(user => {
      const prevUser = prevUsers.find(prev => prev.memberId === user.memberId);
      if (prevUser && prevUser.status !== user.status) {
        console.log("사용자 상태 변경:", {
          사용자: user.nickname,
          이전상태: prevUser.status,
          현재상태: user.status
        });
      }
    });

    prevUsersRef.current = users;
  }, [users]);

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">닉네임</th>
            <th className="py-2 px-4 text-center">상태</th>
            <th className="py-2 px-4 text-center">역할</th>
            {isHost && <th className="py-2 px-4 text-center">액션</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.memberId} className="border-t border-gray-300">
              <td className="py-3 px-4">{user.nickname}</td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    user.isReady ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {user.isReady ? "준비 완료" : "대기 중"}
                </span>
              </td>
              <td className="py-3 px-4 text-center">{user.isHost ? "방장" : "참가자"}</td>
              {isHost && (
                <td className="py-3 px-4 text-center">
                  {!user.isHost && (
                    <button
                      onClick={() => onKick(user.memberId)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      강퇴
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};