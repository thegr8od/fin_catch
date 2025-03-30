import { MESSAGE_TYPES } from "../../hooks/useWebSocket";
import { RoomInfo, RoomMember } from "../Room/Room";

export type RoomMessageType = (typeof MESSAGE_TYPES.ROOM)[keyof typeof MESSAGE_TYPES.ROOM];

export interface RoomMessage {
  type: RoomMessageType;
  roomId: number;
  data?: {
    roomInfo?: RoomInfo;
    member?: RoomMember;
    message?: string;
  };
}
