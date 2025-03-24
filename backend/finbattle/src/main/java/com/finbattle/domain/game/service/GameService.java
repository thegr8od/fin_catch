package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.MemberStatus;
import com.finbattle.domain.quiz.model.QuizMode;
import com.finbattle.domain.room.dto.RedisRoomMember;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.internal.util.stereotypes.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final RedisPublisher redisPublisher;
    private final RedisTemplate<String, Object> redisTemplate;
    @Lazy
    private final QuizTimerService quizTimerService; // 퀴즈 타이머 호출용
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ROOM_DATA_KEY_PREFIX = "room:";
    private static final String USER_FIELD = "users";
    private static final int DEFAULT_LIFE = 3;

    public void startGame(String roomId, Long requesterId) {
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId;

        RedisRoom redisRoom = getRoomDataFromRedis(dataKey);
        if (redisRoom == null) {
            log.warn("🚨 게임 시작 실패: room:{}에 방 데이터가 없습니다.", roomId);
            sendError(roomId, "게임 시작 실패: 방 데이터가 존재하지 않습니다.");
            return;
        }

        if (redisRoom.getHost() == null || !redisRoom.getHost().getMemberId().equals(requesterId)) {
            log.warn("🚨 게임 시작 실패: room:{}의 게임 시작은 방장만 가능합니다.", roomId);
            sendError(roomId, "게임 시작 실패: 방장만 게임을 시작할 수 있습니다.");
            return;
        }

        List<RedisRoomMember> roomMembers = redisRoom.getMembers();
        if (roomMembers == null || roomMembers.isEmpty()) {
            log.warn("🚨 게임 시작 실패: room:{}에 멤버 정보가 없습니다.", roomId);
            sendError(roomId, "게임 시작 실패: 방 멤버 정보가 없습니다.");
            return;
        }
        boolean allReady = roomMembers.stream()
            .allMatch(member -> "READY".equalsIgnoreCase(member.getStatus()));
        if (!allReady) {
            log.warn("🚨 게임 시작 실패: room:{}의 모든 플레이어가 준비완료되어야 합니다.", roomId);
            sendError(roomId, "모든 사용자가 준비완료가 되어야합니다.");
            return;
        }

        List<MemberStatus> memberStatusList = new ArrayList<>();
        for (RedisRoomMember member : roomMembers) {
            memberStatusList.add(new MemberStatus(member.getMemberId(), DEFAULT_LIFE));
        }
        try {
            String jsonArray = objectMapper.writeValueAsString(memberStatusList);
            redisTemplate.opsForHash().put(dataKey, USER_FIELD, jsonArray);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 직렬화 실패: {}", e.getMessage());
            sendError(roomId, "게임 시작 실패: 사용자 상태 저장 오류.");
            return;
        }

        redisRoom.setStatus(RoomStatus.IN_PROGRESS);
        updateRoomDataInRedis(dataKey, redisRoom);

        publishUserStatus(roomId);

        EventMessage<String> startMessage = new EventMessage<>(EventType.GAME_INFO, roomId,
            "IN_PROGRESS");
        publishToRoom(roomId, startMessage);
        log.info("✅ 게임 시작: room:{}에서 방장 {}의 요청으로 게임을 시작합니다.", roomId, requesterId);

        // 첫 퀴즈 시작 (SHORT_ANSWER로 가정)
        quizTimerService.startQuizTimer(roomId, 1L, QuizMode.SHORT_ANSWER);
    }

    private void updateRoomDataInRedis(String roomKey, RedisRoom redisRoom) {
        try {
            String dataJson = objectMapper.writeValueAsString(redisRoom);
            redisTemplate.opsForHash().put(roomKey, "data", dataJson);
            log.info("Updated room data in Redis for key={}", roomKey);
        } catch (JsonProcessingException e) {
            log.error("Failed to update room data in Redis: {}", e.getMessage());
        }
    }

    public void publishUserStatus(String roomId) {
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId;
        String jsonArray = (String) redisTemplate.opsForHash().get(dataKey, USER_FIELD);
        if (jsonArray == null) {
            log.warn("🚨 publishUserStatus: room:{}에 멤버 상태가 없습니다.", roomId);
            return;
        }
        try {
            List<MemberStatus> userList = objectMapper.readValue(jsonArray,
                objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, MemberStatus.class));
            EventMessage<List<MemberStatus>> message = new EventMessage<>(EventType.USER_STATUS,
                roomId, userList);
            publishToRoom(roomId, message);
            log.info("🚀 UserStatus 전송 -> {}", message);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    private void publishToRoom(String roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    private RedisRoom getRoomDataFromRedis(String roomKey) {
        Object dataJson = redisTemplate.opsForHash().get(roomKey, "data");
        if (dataJson == null) {
            log.warn("🚨 Redis에서 room 데이터 없음: {}", roomKey);
            return null;
        }
        try {
            return objectMapper.readValue(dataJson.toString(), RedisRoom.class);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
            return null;
        }
    }

    private List<Long> extractMemberIdsFromRoom(RedisRoom room) {
        List<Long> userIds = new ArrayList<>();
        if (room.getMembers() != null) {
            for (RedisRoomMember member : room.getMembers()) {
                userIds.add(member.getMemberId());
            }
        }
        return userIds;
    }

    private void sendError(String roomId, String errorMessage) {
        EventMessage<String> message = new EventMessage<>(EventType.GAME_INFO, roomId,
            errorMessage);
        publishToRoom(roomId, message);
        log.warn("게임 시작 에러 - room {}: {}", roomId, errorMessage);
    }
}