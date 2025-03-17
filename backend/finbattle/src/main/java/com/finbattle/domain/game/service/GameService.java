package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.MemberStatus;
import com.finbattle.domain.room.dto.RedisRoomMember;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final RedisPublisher redisPublisher;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ROOM_DATA_KEY_PREFIX = "room:";
    private static final String USER_STATUS_KEY_SUFFIX = ":users";
    private static final int DEFAULT_LIFE = 3;

    /**
     * (1) 게임 시작: 각 플레이어의 초기 life를 설정하고 WebSocket으로 전송
     */
    public void startGame(String roomId) {
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId; // 🔹 `room:{roomId}` 키 사용
        String usersKey = ROOM_DATA_KEY_PREFIX + roomId + USER_STATUS_KEY_SUFFIX;

        // 🔹 Redis에서 "data" 필드를 정확하게 가져오기
        RedisRoom redisRoom = getRoomDataFromRedis(dataKey);
        if (redisRoom == null) {
            log.warn("🚨 게임 시작 실패: room:{}에 멤버 정보 없음", roomId);
            return;
        }

        List<Long> memberIds = extractMemberIdsFromRoom(redisRoom);
        if (memberIds.isEmpty()) {
            log.warn("🚨 게임 시작 실패: room:{}에 멤버 정보 없음", roomId);
            return;
        }

        // 초기 라이프 설정
        List<MemberStatus> memberStatusList = new ArrayList<>();
        for (Long mid : memberIds) {
            memberStatusList.add(new MemberStatus(mid, DEFAULT_LIFE));
        }

        try {
            String jsonArray = objectMapper.writeValueAsString(memberStatusList);
            redisTemplate.opsForHash().put(dataKey, "users", jsonArray);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 직렬화 실패: {}", e.getMessage());
        }

        // WebSocket을 통해 사용자 상태 전송
        publishUserStatus(roomId);
    }

    /**
     * (2) 현재 게임 방의 사용자 상태를 Redis에서 조회 후 WebSocket으로 전송
     */
    public void publishUserStatus(String roomId) {
        String usersKey = ROOM_DATA_KEY_PREFIX + roomId + USER_STATUS_KEY_SUFFIX;
        String jsonArray = (String) redisTemplate.opsForValue().get(usersKey);

        if (jsonArray == null) {
            log.warn("🚨 publishUserStatus: room:{}에 멤버 상태 없음", roomId);
            return;
        }

        try {
            List<MemberStatus> userList = objectMapper.readValue(jsonArray, List.class);
            EventMessage<List<MemberStatus>> message = new EventMessage<>(EventType.USER_STATUS,
                roomId, userList);

            publishToRoom(roomId, message);
            log.info("🚀 UserStatus 전송 -> {}", message);

        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    /**
     * (3) WebSocket + Redis를 통한 메시지 발행 → "game:{roomId}" (WebSocket: "/topic/game/{roomId}")
     */
    private void publishToRoom(String roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    /**
     * (4) Redis에서 "room:{roomId}"의 "data" 필드를 직접 가져와 RedisRoom 객체로 변환
     */
    private RedisRoom getRoomDataFromRedis(String roomKey) {
        Object dataJson = redisTemplate.opsForHash().get(roomKey, "data"); // 🔹 정확한 필드 조회

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

    /**
     * (5) RedisRoom에서 members 리스트의 memberId 추출
     */
    private List<Long> extractMemberIdsFromRoom(RedisRoom room) {
        List<Long> userIds = new ArrayList<>();

        if (room.getMembers() != null) {
            for (RedisRoomMember member : room.getMembers()) {
                userIds.add(member.getMemberId());
            }
        }

        return userIds;
    }
}
