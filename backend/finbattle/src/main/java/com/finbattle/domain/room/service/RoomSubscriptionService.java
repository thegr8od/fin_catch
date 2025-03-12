package com.finbattle.domain.room.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.room.dto.EventMessage;
import com.finbattle.domain.room.dto.RedisRoomMember;
import com.finbattle.domain.room.dto.RoomContainer;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.domain.room.model.RoomStatus;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomSubscriptionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 방을 생성하고 Redis에 저장 후 이벤트 발행
     */
    public void createRoomSubscription(Long roomId) {
        RedisRoom redisRoom = new RedisRoom();
        redisRoom.setRoomId(roomId);
        redisRoom.setMaxPeople(10);
        redisRoom.setStatus(RoomStatus.OPEN);

        RedisRoomMember host = new RedisRoomMember();
        host.setMemberId(roomId);
        host.setStatus("READY");
        redisRoom.setHost(host);
        redisRoom.getMembers().add(host);

        RoomContainer container = new RoomContainer();
        container.setData(redisRoom);

        saveRoomContainer(roomId, container);
        publishEvent("CREATE", roomId, null, null, 0);
    }

    /**
     * 특정 방의 현재 참가자 수 조회 후 이벤트 발행
     */
    public void getRoomUserCount(Long roomId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        int count = redisRoom == null ? 0 : redisRoom.getMembers().size();
        publishEvent("COUNT", roomId, null, null, count);
    }

    /**
     * 방 참가 처리 후 Redis 저장 및 이벤트 발행
     */
    public void joinRoom(Long roomId, Long userId) {
        RoomContainer container = getRoomContainer(roomId);
        if (container == null) {
            publishEvent("JOIN_FAIL", roomId, userId, "방이 존재하지 않습니다.", 0);
            throw new IllegalStateException("방이 존재하지 않습니다.");
        }

        RedisRoom redisRoom = container.getData();
        if (redisRoom.getStatus() != RoomStatus.OPEN) {
            publishEvent("JOIN_FAIL", roomId, userId, "방이 닫혀있습니다.", 0);
            throw new IllegalStateException("방에 입장할 수 없는 상태입니다.");
        }

        if (redisRoom.getMembers().size() >= redisRoom.getMaxPeople()) {
            publishEvent("JOIN_FAIL", roomId, userId, "방 정원이 초과되었습니다.", 0);
            throw new IllegalStateException("방 정원이 초과되었습니다.");
        }

        boolean alreadyIn = redisRoom.getMembers().stream()
            .anyMatch(m -> m.getMemberId().equals(userId));
        if (alreadyIn) {
            publishEvent("JOIN_FAIL", roomId, userId, "이미 입장한 유저입니다.", 0);
            throw new IllegalStateException("이미 방에 입장해 있습니다.");
        }

        RedisRoomMember member = new RedisRoomMember();
        member.setMemberId(userId);
        member.setStatus("NOT_READY");
        redisRoom.getMembers().add(member);

        saveRoomContainer(roomId, container);
        publishEvent("JOIN", roomId, userId, null, redisRoom.getMembers().size());
    }

    /**
     * 방에서 유저 제거 후 Redis 저장 및 이벤트 발행
     */
    public void leaveRoom(Long roomId, Long userId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            publishEvent("DELETE", roomId, null, null, 0);
            return;
        }

        // 1) 멤버 목록 수정
        List<RedisRoomMember> members = redisRoom.getMembers();
        members.removeIf(m -> m.getMemberId().equals(userId));

        // 2) 방 인원이 0명이면 방 삭제
        if (members.isEmpty()) {
            deleteRoom(roomId);
            return;
        }

        // 3) 기존 RoomContainer 가져와서 멤버 목록 갱신
        RoomContainer container = getRoomContainer(roomId);
        container.getData().setMembers(members);

        // 4) Redis에 다시 저장
        saveRoomContainer(roomId, container);

        // 5) 이벤트 발행
        publishEvent("LEAVE", roomId, userId, null, members.size());
    }

    /**
     * 유저 강퇴 처리 후 Redis 저장 및 이벤트 발행
     */
    public void kickUser(Long roomId, Long targetUserId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            publishEvent("KICK_FAIL", roomId, targetUserId, "방이 존재하지 않습니다.", 0);
            throw new IllegalStateException("방이 존재하지 않습니다.");
        }

        List<RedisRoomMember> members = redisRoom.getMembers();
        boolean removed = members.removeIf(m -> m.getMemberId().equals(targetUserId));
        if (!removed) {
            publishEvent("KICK_FAIL", roomId, targetUserId, "유저가 존재하지 않습니다.",
                redisRoom.getMembers().size());
            throw new IllegalStateException("해당 유저가 방에 없습니다.");
        }

        // 기존 RoomContainer를 가져와서 members 갱신
        RoomContainer container = getRoomContainer(roomId);
        container.getData().setMembers(members);
        saveRoomContainer(roomId, container);

        publishEvent("KICK", roomId, targetUserId, null, redisRoom.getMembers().size());
    }

    /**
     * 방 삭제 및 이벤트 발행
     */
    public void deleteRoom(Long roomId) {
        redisTemplate.delete("room:" + roomId);
        publishEvent("DELETE", roomId, null, null, 0);
        log.info("Room {} deleted from Redis", roomId);
    }

    /**
     * 유저 준비 상태 변경 후 Redis 저장 및 이벤트 발행
     */
    public void setUserReady(Long roomId, Long userId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            throw new IllegalStateException("방이 존재하지 않습니다.");
        }

        List<RedisRoomMember> members = redisRoom.getMembers();
        RedisRoomMember member = members.stream()
            .filter(m -> m.getMemberId().equals(userId))
            .findFirst()
            .orElse(null);
        if (member == null) {
            throw new IllegalStateException("해당 유저는 방에 없습니다.");
        }

        member.setStatus("READY");

        // 변경된 멤버 목록을 다시 세팅
        RoomContainer container = getRoomContainer(roomId);
        container.getData().setMembers(members);
        saveRoomContainer(roomId, container);

        publishEvent("READY", roomId, userId, null, members.size());
    }

    /**
     * Redis에서 방 정보를 가져오기
     */
    public RedisRoom getRedisRoom(Long roomId) {
        String redisKey = "room:" + roomId;
        Object roomJsonObj = redisTemplate.opsForHash().get(redisKey, "data");
        if (roomJsonObj == null) {
            return null;
        }
        try {
            return objectMapper.readValue(roomJsonObj.toString(), RedisRoom.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse RedisRoom JSON: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 기존 RoomContainer 가져오기
     */
    public RoomContainer getRoomContainer(Long roomId) {
        String redisKey = "room:" + roomId;

        // "users" 해시 필드
        Object usersField = redisTemplate.opsForHash().get(redisKey, "users");
        // "data" 해시 필드
        Object dataField = redisTemplate.opsForHash().get(redisKey, "data");

        // 없으면 null
        if (usersField == null || dataField == null) {
            return null;
        }

        try {
            RoomContainer container = new RoomContainer();
            // users는 Map<String, String>
            container.setUsers(
                objectMapper.readValue(usersField.toString(), container.getUsers().getClass()));
            // data는 RedisRoom
            RedisRoom redisRoom = objectMapper.readValue(dataField.toString(), RedisRoom.class);
            container.setData(redisRoom);
            return container;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse RoomContainer from Redis: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 방 데이터를 Redis에 저장
     */
    private void saveRoomContainer(Long roomId, RoomContainer container) {
        String redisKey = "room:" + roomId;
        try {
            String usersJson = objectMapper.writeValueAsString(container.getUsers());
            String dataJson = objectMapper.writeValueAsString(container.getData());

            redisTemplate.opsForHash().put(redisKey, "users", usersJson);
            redisTemplate.opsForHash().put(redisKey, "data", dataJson);

            log.info("Saved RoomContainer to Redis as a hash => key={}, fields=[users, data]",
                redisKey);
        } catch (JsonProcessingException e) {
            log.error("Failed to save RoomContainer to Redis: {}", e.getMessage());
        }
    }

    /**
     * 이벤트 메시지를 Redis Pub/Sub을 통해 발행
     */
    private void publishEvent(String event, Long roomId, Long userId, String reason,
        int userCount) {
        try {
            EventMessage message = new EventMessage(event, roomId, userId, reason, userCount);
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("room:" + roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("Failed to publish event: {}", e.getMessage());
        }
    }
}
