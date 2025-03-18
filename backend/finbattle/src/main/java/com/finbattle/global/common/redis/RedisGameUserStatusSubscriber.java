package com.finbattle.global.common.redis;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.MemberStatus;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisGameUserStatusSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // (1) 수신된 Redis 메시지를 문자열로
            String msgBody = new String(message.getBody(), StandardCharsets.UTF_8);

            // (2) JSON -> Map(roomId, users)
            // 예상 예시: {"roomId":"10","users":[{"memberId":1,"life":3},{"memberId":2,"life":2}]}
            Map<String, Object> payloadMap = objectMapper.readValue(
                msgBody, new TypeReference<Map<String, Object>>() {
                });

            String roomId = (String) payloadMap.get("roomId");
            if (roomId == null) {
                log.warn("RedisGameUserStatusSubscriber: roomId가 없음 => {}", msgBody);
                return;
            }

            // users 필드를 List<MemberStatus>로 변환
            List<MemberStatus> userList = objectMapper.convertValue(
                payloadMap.get("users"),
                new TypeReference<List<MemberStatus>>() {
                }
            );

            // (3) WebSocket으로 전송: /topic/game/{roomId}-userStatus
            String destination = "/topic/game/" + roomId + "-userStatus";
            messagingTemplate.convertAndSend(destination, userList);

            log.info("RedisGameUserStatusSubscriber => destination={}, payload={}", destination,
                userList);

        } catch (Exception e) {
            log.error("RedisGameUserStatusSubscriber: Exception occurred", e);
        }
    }
}
