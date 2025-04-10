package com.finbattle.global.common.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRoomSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String msg = message.toString();

        //log.info("Received message from Redis Pub/Sub: Channel={}, Message={}", channel, msg);
        //log.info("✅ Redis Pub/Sub 메시지 수신: Channel={}, Message={}", channel, msg);

        // WebSocket을 통해 클라이언트로 메시지 전송
        try {
            String roomId = channel.split(":")[1];
            //System.out.println("roomId = " + roomId);
            String destination = "/topic/room/" + roomId;

            //log.info("🔵 WebSocket 전송: Destination={}, Message={}", destination, msg);
            messagingTemplate.convertAndSend(destination, msg);

        } catch (Exception e) {
            //log.error("❌ WebSocket 전송 중 오류 발생", e);
        }
    }
}
