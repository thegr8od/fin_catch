package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisGameHintSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 내부 클래스: 게임 힌트 메시지 구조
    public static class GameHint {
        private String roomId;
        private String hint;

        public String getRoomId() {
            return roomId;
        }
        public void setRoomId(String roomId) {
            this.roomId = roomId;
        }
        public String getHint() {
            return hint;
        }
        public void setHint(String hint) {
            this.hint = hint;
        }
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String msgBody = new String(message.getBody());
            GameHint gameHint = objectMapper.readValue(msgBody, GameHint.class);
            // WebSocket 발송 대상: /topic/game/{roomId}-hint
            String destination = "/topic/game/" + gameHint.getRoomId() + "-hint";
            messagingTemplate.convertAndSend(destination, gameHint.getHint());
            log.info("RedisGameHintSubscriber sent game hint to destination: {}", destination);
        } catch (Exception e) {
            log.error("Error processing game hint message from Redis", e);
        }
    }
}
