package com.finbattle.global.common.redis;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.GameInfo;
import com.finbattle.domain.game.dto.MemberStatus;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisGameSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // (1) Redis에서 수신한 메시지 변환
            String msgBody = new String(message.getBody(), StandardCharsets.UTF_8);
            Map<String, Object> payloadMap = objectMapper.readValue(msgBody,
                new TypeReference<Map<String, Object>>() {
                });

            // (2) Redis 채널에서 roomId 추출
            String channel = new String(message.getChannel(), StandardCharsets.UTF_8);
            String roomId = channel.split(":")[1]; // Redis 채널 형식: "game:{roomId}"

            log.info("✅ Redis Pub/Sub 메시지 수신: Channel={}, RoomId={}, Message={}", channel, roomId,
                msgBody);

            // (3) event 타입 추출
            String eventTypeStr = (String) payloadMap.get("event");

            if (eventTypeStr == null) {
                log.warn("❌ RedisGameSubscriber: event 없음 => {}", msgBody);
                return;
            }

            EventType eventType;
            try {
                eventType = EventType.fromValue(eventTypeStr);
            } catch (IllegalArgumentException e) {
                log.warn("❌ RedisGameSubscriber: 알 수 없는 type 수신 => {}", eventTypeStr);
                return;
            }

            // (4) WebSocket 전송 경로 설정: /topic/game/{roomId}
            String destination = "/topic/game/" + roomId;

            // (5) 메시지 유형(type)에 따라 data 변환
            Object eventData;
            switch (eventType) {
                case USER_STATUS:
                    eventData = objectMapper.convertValue(payloadMap.get("data"),
                        new TypeReference<List<MemberStatus>>() {
                        });
                    break;
                case QUIZ:
                case QUIZ_RESULT:
                case QUIZ_HINT:
                    eventData = payloadMap;
                    break;
                case GAME_INFO:
                    eventData = objectMapper.convertValue(payloadMap, GameInfo.class);
                    break;
                default:
                    log.warn("❌ RedisGameSubscriber: 처리할 수 없는 type => {}", eventType);
                    return;
            }

            if (eventData == null) {
                log.warn("⚠️ eventData가 null입니다2! eventType={}, roomId={}", eventType, roomId);
            }

            // (6) EventMessage 객체 생성 및 WebSocket 전송
            EventMessage<Object> eventMessage = new EventMessage<>(eventType, roomId, eventData);
            messagingTemplate.convertAndSend(destination, eventMessage);

            log.info("🔵 WebSocket 전송: Destination={}, Event={}, Payload={}", destination, eventType,
                eventMessage);

        } catch (Exception e) {
            log.error("❌ RedisGameSubscriber: WebSocket 전송 중 오류 발생", e);
        }
    }
}
