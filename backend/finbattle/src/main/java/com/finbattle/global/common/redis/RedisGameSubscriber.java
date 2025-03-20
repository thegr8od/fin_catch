package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class RedisGameSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate; // WebSocket 전송용

    public RedisGameSubscriber(ObjectMapper objectMapper, SimpMessagingTemplate messagingTemplate) {
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String msgBody = new String(message.getBody(), StandardCharsets.UTF_8);
            log.info("✅ Redis Pub/Sub 메시지 수신: Channel={}, Message={}", new String(pattern), msgBody);

            // EventMessage로 역직렬화
            EventMessage<?> eventMessage = objectMapper.readValue(msgBody, EventMessage.class);

            // WebSocket으로 메시지 전송
            String destination = "/topic/game/" + eventMessage.getRoomId();
            messagingTemplate.convertAndSend(destination, eventMessage);
            log.info("🔵 WebSocket 전송: Destination={}, Event={}, Data={}",
                    destination, eventMessage.getEvent(), eventMessage.getData());

        } catch (Exception e) {
            log.error("❌ RedisGameSubscriber: WebSocket 전송 중 오류 발생", e);
        }
    }
}