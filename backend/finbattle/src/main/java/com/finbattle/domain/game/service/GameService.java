package com.finbattle.domain.game.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.GameInfo;
import com.finbattle.domain.game.model.GameRoom;
import com.finbattle.domain.game.repository.GameRoomRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRoomRepository gameRoomRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 특정 roomId의 게임 정보를 조회한 후, Redis 채널("game-info")에 발행
     */
    public void publishGameInfo(String roomId) {
        GameInfo gameInfo = gameRoomRepository.findByRoomId(roomId)
                .map(room -> new GameInfo(room.getStatus(), room.getScore(), room.getRoomId()))
                .orElse(new GameInfo("NOT_FOUND", 0, roomId));
        try {
            String jsonMessage = objectMapper.writeValueAsString(gameInfo);
            redisPublisher.publish("game-info", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * roomId 기반 힌트 제공 후, Redis 채널("game-hint")에 발행
     */
    public void publishGameHint(String roomId) {
        String hint = "힌트 예시입니다 (roomId=" + roomId + ")";
        try {
            var map = new java.util.HashMap<String, String>();
            map.put("roomId", roomId);
            map.put("hint", hint);
            String jsonMessage = objectMapper.writeValueAsString(map);
            redisPublisher.publish("game-hint", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
