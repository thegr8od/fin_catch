package com.finbattle.global.common.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.GameMemberStatus;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

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
            //log.info("✅ Redis Pub/Sub 메시지 수신: Channel={}, Message={}", new String(pattern), msgBody);

            if (msgBody.startsWith("\"") && msgBody.endsWith("\"")) {
                msgBody = objectMapper.readValue(msgBody, String.class); // JSON 문자열 → 실제 JSON
            }

            var rootNode = objectMapper.readTree(msgBody);

            var event = EventType.valueOf(rootNode.get("event").asText());
            var roomId = rootNode.get("roomId").asLong();
            var dataNode = rootNode.get("data");

            // EventMessage로 역직렬화
            Object data = null;

            switch (event) {
                case TWO_ATTACK:
                    // data는 List<GameMemberStatus>
                    data = objectMapper.readValue(
                        dataNode.toString(),
                        TypeFactory.defaultInstance()
                            .constructCollectionType(List.class, GameMemberStatus.class)
                    );
                    break;
                case MULTIPLE_QUIZ, SHORT_QUIZ, ESSAY_QUIZ, QUIZ_RESULT, ONE_ATTACK, FIRST_HINT,
                    SECOND_HINT, REWARD:
                    // data는 Map<String, Object>
                    data = objectMapper.readValue(
                        dataNode.toString(),
                        TypeFactory.defaultInstance()
                            .constructMapType(Map.class, String.class, Object.class)
                    );
                    break;
                default:
                    throw new UnsupportedOperationException("Unsupported event type: " + event);
            }

            EventMessage<Object> eventMessage = new EventMessage<>(event, roomId, data);

            // WebSocket으로 메시지 전송
            String destination = "/topic/game/" + eventMessage.getRoomId();
            messagingTemplate.convertAndSend(destination, eventMessage);
            //log.info("🔵 WebSocket 전송: Destination={}, Event={}, Data={}", destination, eventMessage.getEvent(), eventMessage.getData());

        } catch (Exception e) {
            log.error("❌ RedisGameSubscriber: WebSocket 전송 중 오류 발생", e);
        }
    }
}