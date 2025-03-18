package com.finbattle.domain.room.controller;

import com.finbattle.domain.room.service.RoomService;
import com.finbattle.domain.room.service.RoomSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RoomWebSocketController {

    private final RoomService roomService;
    private final RoomSubscriptionService roomSubscriptionService;

    /**
     * WebSocket을 통해 방 이벤트를 처리하면 RoomSubscriptionService로 위임하여 Redis Pub/Sub을 활용
     */
//    @MessageMapping("/room/{roomId}/event")
//    public void handleRoomEvent(@DestinationVariable Long roomId, String message) {
//        log.info("Received WebSocket event for room {}: {}", roomId, message);
//        // --- Redis Pub/Sub으로 메시지 전송을 서비스에서 처리하도록 위임 ---
//        roomSubscriptionService.publishEvent(message, roomId, null, null, 0);
//        // ---
//    }

    /**
     * 방 정보 요청 -> RedisRoom 정보 조회
     */
    @MessageMapping("/room/{roomId}/info")
    public void getRoomInfo(@DestinationVariable Long roomId) {
        log.info("Requesting info for room {}", roomId);
        System.out.println("info 작성");
        roomSubscriptionService.getRoomInfo(roomId);
    }
    

    /**
     * 방 참가 요청 처리 (RDB에 저장하지 않고 Redis에서만 관리)
     */
    @MessageMapping("/room/{roomId}/join/{userId}")
    public void joinRoom(@DestinationVariable Long roomId, @DestinationVariable Long userId) {
        log.info("User {} joining room {}", userId, roomId);
        roomSubscriptionService.joinRoom(roomId, userId);
    }

    /**
     * 방 구독자 수 확인
     */
    @MessageMapping("/room/{roomId}/count")
    public void getRoomUserCount(@DestinationVariable Long roomId) {
        log.info("Checking user count for room {}", roomId);
        roomSubscriptionService.getRoomUserCount(roomId);
    }

    /**
     * 유저가 방을 나갈 때 처리 (방장이면 위임 or 방 해체)
     */
    @MessageMapping("/room/{roomId}/leave/{userId}")
    public void leaveRoom(@DestinationVariable Long roomId, @DestinationVariable Long userId) {
        log.info("User {} leaving room {}", userId, roomId);
        roomSubscriptionService.leaveRoom(roomId, userId);
    }

    /**
     * 강퇴(kick) 요청 처리
     */
    @MessageMapping("/room/{roomId}/kick/{targetUserId}")
    public void kickUser(@DestinationVariable Long roomId, @DestinationVariable Long targetUserId) {
        log.info("Kicking user {} from room {}", targetUserId, roomId);
        roomSubscriptionService.kickUser(roomId, targetUserId);
    }

    /**
     * 준비(ready) 요청 처리
     */
    @MessageMapping("/room/{roomId}/ready/{userId}")
    public void setReady(@DestinationVariable Long roomId, @DestinationVariable Long userId) {
        log.info("User {} set READY in room {}", userId, roomId);
        roomSubscriptionService.setUserReady(roomId, userId);
    }

    /**
     * 방 삭제 요청 처리
     */
    @MessageMapping("/room/{roomId}/delete")
    public void deleteRoom(@DestinationVariable Long roomId) {
        log.info("Deleting room {}", roomId);
        roomSubscriptionService.deleteRoom(roomId);
    }
}
