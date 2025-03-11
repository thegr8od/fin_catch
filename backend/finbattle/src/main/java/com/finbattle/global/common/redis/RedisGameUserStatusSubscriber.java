package com.finbattle.global.common.redis;

import com.finbattle.domain.game.dto.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisGameUserStatusSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // 메시지를 문자열로 직접 변환 (StringRedisSerializer 사용)
            String payloadStr = new String(message.getBody(), StandardCharsets.UTF_8);
            // 예상 포맷: "roomId:1234;users:user1|3,user2|2"
            String roomId = "";
            List<UserStatus> userList = new ArrayList<>();

            String[] parts = payloadStr.split(";");
            for (String part : parts) {
                if (part.startsWith("roomId:")) {
                    roomId = part.substring("roomId:".length());
                } else if (part.startsWith("users:")) {
                    String usersPart = part.substring("users:".length());
                    if (!usersPart.isEmpty()) {
                        String[] usersArr = usersPart.split(",");
                        for (String userStr : usersArr) {
                            String[] userParts = userStr.split("\\|");
                            if (userParts.length == 2) {
                                UserStatus u = new UserStatus();
                                u.setUserId(userParts[0]);
                                u.setLife(Integer.parseInt(userParts[1]));
                                userList.add(u);
                            }
                        }
                    }
                }
            }
            messagingTemplate.convertAndSend("/topic/game/" + roomId + "-userStatus", userList);
            log.info("RedisGameUserStatusSubscriber sent user status for room {}: {}", roomId, userList);
        } catch (Exception e) {
            log.error("Error in RedisGameUserStatusSubscriber", e);
        }
    }
}
