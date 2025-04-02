import React from "react";
import { RoomInfo as RoomInfoType } from "../../types/Room/Room";

interface RoomInfoProps {
  roomInfo: RoomInfoType;
}

export const RoomInfoComponent: React.FC<RoomInfoProps> = ({ roomInfo }) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">방 정보</h2>
      <div className="space-y-2">
        <p>
          <span className="font-semibold">최대 인원:</span> {roomInfo.maxPeople}명
        </p>
        <p>
          <span className="font-semibold">상태:</span> {roomInfo.status}
        </p>
        <p>
          <span className="font-semibold">방장:</span> {roomInfo.host.nickname}
        </p>
      </div>
    </div>
  );
};
