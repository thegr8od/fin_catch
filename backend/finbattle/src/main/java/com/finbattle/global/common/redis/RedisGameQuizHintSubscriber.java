package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisGameQuizHintSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String msgBody = new String(message.getBody());
            Map<String, Object> payload = objectMapper.readValue(msgBody, HashMap.class);
            String roomId = (String) payload.get("roomId");
            if (roomId == null) {
                log.warn("No roomId in quizHint payload.");
                return;
            }

            String destination = "/topic/game/" + roomId + "-quizHint";
            messagingTemplate.convertAndSend(destination, payload);
            log.info("RedisGameQuizHintSubscriber -> {} : {}", destination, payload);
        } catch (Exception e) {
            log.error("Error in RedisGameQuizHintSubscriber", e);
        }
    }
}
