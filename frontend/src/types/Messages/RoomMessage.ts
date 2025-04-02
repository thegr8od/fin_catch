import { MESSAGE_TYPES } from "../WebSocket/MessageTypes";
import { RoomInfo } from "../Room/Room";

export interface RoomMessage {
  event: "CREATE" | "UPDATE" | "JOIN" | "KICK" | "DELETE";
  roomId: number;
  data: RoomInfo;
}

export type RoomMessageType = (typeof MESSAGE_TYPES.ROOM)[keyof typeof MESSAGE_TYPES.ROOM];
