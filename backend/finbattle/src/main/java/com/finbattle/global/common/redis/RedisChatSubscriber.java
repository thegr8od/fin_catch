package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.chat.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisChatSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String msgBody = new String(message.getBody());
            ChatMessage chatMessage = objectMapper.readValue(msgBody, ChatMessage.class);
            // WebSocket 발송 대상: /topic/chat/{roomId}
            String destination = "/topic/chat/" + chatMessage.getRoomId();
            messagingTemplate.convertAndSend(destination, chatMessage);
            log.info("RedisChatSubscriber sent message to destination: {}", destination);
        } catch (Exception e) {
            log.error("Error processing chat message from Redis", e);
        }
    }
}
