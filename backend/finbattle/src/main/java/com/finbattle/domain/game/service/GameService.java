package com.finbattle.domain.game.service;

import com.finbattle.domain.game.dto.GameInfo;
import com.finbattle.domain.game.dto.UserStatus;
import com.finbattle.domain.game.repository.GameRoomRepository;
import com.finbattle.domain.game.util.UserStatusUtil;
import com.finbattle.global.common.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRoomRepository gameRoomRepository;
    private final RedisPublisher redisPublisher;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String USER_STATUS_KEY_PREFIX = "room:users:";

    // 게임 정보 발행
    public void publishGameInfo(String roomId) {
        GameInfo gameInfo = gameRoomRepository.findByRoomId(roomId)
                .map(room -> new GameInfo(room.getStatus(), room.getScore(), room.getRoomId()))
                .orElse(new GameInfo("NOT_FOUND", 0, roomId));
        redisPublisher.publish("game-info", gameInfo.toString());
    }

    // 게임 힌트 발행
    public void publishGameHint(String roomId) {
        String hint = "힌트 예시입니다 (roomId=" + roomId + ")";
        Map<String, String> map = new HashMap<>();
        map.put("roomId", roomId);
        map.put("hint", hint);
        redisPublisher.publish("game-hint", map.toString());
    }

    // 사용자 접속 처리 (라이프 초기값 3)
    public void userConnected(String roomId, String userId) {
        String key = USER_STATUS_KEY_PREFIX + roomId;
        UserStatus userStatus = new UserStatus();
        userStatus.setUserId(userId);
        userStatus.setLife(3); // 초기 라이프 3
        String serialized = UserStatusUtil.serialize(userStatus);
        redisTemplate.opsForHash().put(key, userId, serialized);
        publishUserStatus(roomId);
    }

    // 사용자 상태 발행 (문자열 형식: "roomId:1234;users:user1|3,user2|2")
    public void publishUserStatus(String roomId) {
        String key = USER_STATUS_KEY_PREFIX + roomId;
        Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
        List<UserStatus> userList = userMap.values().stream()
                .map(val -> UserStatusUtil.deserialize((String) val))
                .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("roomId:").append(roomId).append(";users:");
        boolean first = true;
        for (UserStatus u : userList) {
            if (!first) {
                sb.append(",");
            }
            first = false;
            sb.append(UserStatusUtil.serialize(u));
        }
        redisPublisher.publish("game-userStatus", sb.toString());
    }
}
