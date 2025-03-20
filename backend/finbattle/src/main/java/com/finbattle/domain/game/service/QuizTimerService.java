package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.MemberStatus;
import com.finbattle.domain.game.dto.QuizMode;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.global.common.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizTimerService {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    // GameService 의존성 제거!

    private static final String ROOM_DATA_KEY_PREFIX = "room:";
    private static final String USER_FIELD = "users";

    public void startQuizTimer(String roomId, Long quizId, QuizMode quizMode) {
        int timeLimit = getTimeLimit(quizMode);
        log.info("Starting quiz timer for quizId {} in room {} with a limit of {} seconds", quizId, roomId, timeLimit);
        scheduler.schedule(() -> handleTimeout(roomId, quizId, quizMode), timeLimit, TimeUnit.SECONDS);
    }

    private int getTimeLimit(QuizMode quizMode) {
        switch (quizMode) {
            case SHORT_ANSWER:
                return 20;
            case MULTIPLE_CHOICE:
                return 10;
            case ESSAY:
                return 40;
            default:
                throw new IllegalArgumentException("Unsupported quiz mode: " + quizMode);
        }
    }

    private void handleTimeout(String roomId, Long quizId, QuizMode quizMode) {
        log.info("Quiz timeout reached for quizId {} in room {} (mode: {})", quizId, roomId, quizMode);
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId;
        String jsonArray = (String) redisTemplate.opsForHash().get(dataKey, USER_FIELD);

        if (jsonArray == null) {
            log.warn("🚨 No user status found for room: {}", roomId);
            return;
        }

        try {
            // 사용자 상태 조회
            List<MemberStatus> userList = objectMapper.readValue(
                    jsonArray,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, MemberStatus.class)
            );

            // 모든 사용자 라이프 1 감소
            boolean anyLifeZero = false;
            for (MemberStatus user : userList) {
                int newLife = Math.max(0, user.getLife() - 1);
                user.setLife(newLife);
                if (newLife == 0) {
                    anyLifeZero = true;
                }
            }

            // 업데이트된 사용자 상태 저장
            String updatedJsonArray = objectMapper.writeValueAsString(userList);
            redisTemplate.opsForHash().put(dataKey, USER_FIELD, updatedJsonArray);

            // 사용자 상태 전파 (내부 메서드 호출)
            publishUserStatus(roomId);

            // 라이프 0인 사용자가 있으면 게임 종료, 없으면 다음 퀴즈 타이머 시작
            if (anyLifeZero) {
                endGame(roomId, userList);
            } else {
                startQuizTimer(roomId, quizId + 1, quizMode);
            }

        } catch (JsonProcessingException e) {
            log.error("❌ JSON 처리 실패: {}", e.getMessage());
        }
    }

    private void endGame(String roomId, List<MemberStatus> userList) {
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId;
        // 방 상태를 CLOSED로 변경
        Object dataJson = redisTemplate.opsForHash().get(dataKey, "data");
        if (dataJson != null) {
            try {
                RedisRoom redisRoom = objectMapper.readValue(dataJson.toString(), RedisRoom.class);
                redisRoom.setStatus(RoomStatus.CLOSED);
                String updatedRoomJson = objectMapper.writeValueAsString(redisRoom);
                redisTemplate.opsForHash().put(dataKey, "data", updatedRoomJson);
            } catch (JsonProcessingException e) {
                log.error("❌ Failed to update room status: {}", e.getMessage());
            }
        }

        // 게임 종료 이벤트 전파 (사용자 상태 포함)
        EventMessage<List<MemberStatus>> endMessage = new EventMessage<>(EventType.GAME_INFO, roomId, userList);
        endMessage.setData(userList); // 결과 표시를 위해 사용자 상태 전송
        publishToRoom(roomId, endMessage);
        log.info("✅ Game ended in room {} due to a player reaching 0 life", roomId);

        // 게임 종료 시 Redis에 저장된 방 정보 삭제
        redisTemplate.delete(dataKey);
        log.info("✅ Redis data for room {} has been deleted", roomId);
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

    // GameService에 있던 사용자 상태 전파 메서드를 복사하여 사용
    public void publishUserStatus(String roomId) {
        String dataKey = ROOM_DATA_KEY_PREFIX + roomId;
        String jsonArray = (String) redisTemplate.opsForHash().get(dataKey, USER_FIELD);
        if (jsonArray == null) {
            log.warn("🚨 publishUserStatus: room:{}에 멤버 상태가 없습니다.", roomId);
            return;
        }
        try {
            List<MemberStatus> userList = objectMapper.readValue(
                    jsonArray,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, MemberStatus.class)
            );
            EventMessage<List<MemberStatus>> message = new EventMessage<>(EventType.USER_STATUS, roomId, userList);
            publishToRoom(roomId, message);
            log.info("🚀 UserStatus 전송 -> {}", message);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }
}