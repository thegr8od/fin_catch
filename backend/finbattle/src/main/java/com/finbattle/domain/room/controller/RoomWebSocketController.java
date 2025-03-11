package com.finbattle.domain.room.controller;

import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.service.RoomService;
import com.finbattle.domain.room.service.RoomSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class RoomWebSocketController {

    private final RoomService roomService;
    private final RoomSubscriptionService roomSubscriptionService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 방 생성 WebSocket 요청 처리
     */
    @MessageMapping("/room/create")
    public void createRoom(RoomCreateRequest request) {
        log.info("Creating room: {}", request);
        RoomResponse roomResponse = roomService.createRoom(request);
        // RDB에 저장된 Room 정보를 바탕으로 Redis JSON 생성 메서드로 교체
        roomSubscriptionService.createRoomSubscription(roomResponse.getRoomId());

        messagingTemplate.convertAndSend("/topic/room/event",
            String.format("{\"event\":\"CREATE\", \"roomId\":\"%s\"}", roomResponse.getRoomId()));
    }

    /**
     * 방 참가 요청 처리 (RDB에 저장하지 않고 Redis에서만 관리)
     */
    @MessageMapping("/room/{roomId}/join/{userId}")
    public void joinRoom(@DestinationVariable Long roomId, @DestinationVariable Long userId) {
        log.info("User {} joining room {}", userId, roomId);
        // 방 정보를 JSON으로 받아 인원 체크 후 상태 업데이트
        try {
            roomSubscriptionService.joinRoom(roomId, userId);
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                String.format("{\"event\":\"JOIN\",\"roomId\":\"%s\",\"userId\":\"%s\"}", roomId,
                    userId));
        } catch (IllegalStateException e) {
            // 인원 초과 등 불가능한 경우를 처리
            log.warn("Cannot join room {}: {}", roomId, e.getMessage());
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                String.format("{\"event\":\"JOIN_FAIL\",\"reason\":\"%s\"}", e.getMessage()));
        }
    }

    /**
     * 방 구독자 수 확인
     */
    @MessageMapping("/room/{roomId}/count")
    public void getRoomUserCount(@DestinationVariable Long roomId) {
        // JSON에 저장된 members 사이즈 반환
        long userCount = roomSubscriptionService.getRoomUserCount(roomId);

        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/count",
            String.format("{\"roomId\":\"%s\",\"userCount\":%d}", roomId, userCount));
    }

    /**
     * 유저가 방을 나갈 때 처리 (방장이면 위임 or 방 해체)
     */
    @MessageMapping("/room/{roomId}/leave/{userId}")
    public void leaveRoom(@DestinationVariable Long roomId, @DestinationVariable Long userId) {
        //   JSON 구조 이용
        //   실제론 JSON에서 관리하므로 아래에서 새 로직으로 처리

        log.info("User {} leaving room {}", userId, roomId);
        boolean deleted = roomSubscriptionService.leaveRoom(roomId, userId);
        // leaveRoom 메서드가 방 삭제까지 처리한 경우 deleted = true

        if (deleted) {
            // 방이 완전히 삭제된 경우
            roomService.deleteRoom(roomId);
            messagingTemplate.convertAndSend("/topic/room/event",
                String.format("{\"event\":\"DELETE\",\"roomId\":\"%s\"}", roomId));
        } else {
            // 아직 방이 존재하는 경우
            messagingTemplate.convertAndSend("/topic/room/" + roomId,
                String.format("{\"event\":\"LEAVE\",\"roomId\":\"%s\",\"userId\":\"%s\"}", roomId,
                    userId));
        }
    }
}
