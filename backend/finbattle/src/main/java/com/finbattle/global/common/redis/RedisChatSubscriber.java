package com.finbattle.global.common.redis;

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

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            String msg = message.toString();

            String roomId = channel.split(":")[1];
            //  WebSocket 발송 대상: /topic/chat/{roomId}
            String destination = "/topic/chat/" + roomId;
            
            messagingTemplate.convertAndSend(destination, msg);
            log.info("🔵 WebSocket 전송: Destination={}, Message={}", destination, msg);
        } catch (Exception e) {
            log.error("Error processing chat message from Redis", e);
        }
    }
}
