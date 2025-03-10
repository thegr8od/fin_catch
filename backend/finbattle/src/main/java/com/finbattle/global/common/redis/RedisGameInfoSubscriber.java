package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.GameInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisGameInfoSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String msgBody = new String(message.getBody());
            GameInfo gameInfo = objectMapper.readValue(msgBody, GameInfo.class);
            // WebSocket 발송 대상: /topic/game/{roomId}-getInfo
            String destination = "/topic/game/" + gameInfo.getRoomId() + "-getInfo";
            messagingTemplate.convertAndSend(destination, gameInfo);
            log.info("RedisGameInfoSubscriber sent game info to destination: {}", destination);
        } catch (Exception e) {
            log.error("Error processing game info message from Redis", e);
        }
    }
}
