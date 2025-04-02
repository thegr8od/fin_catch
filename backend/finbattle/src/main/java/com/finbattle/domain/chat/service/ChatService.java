package com.finbattle.domain.chat.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.chat.dto.ChatMessage;
import com.finbattle.domain.chat.model.ChatLog;
import com.finbattle.domain.chat.repository.ChatLogRepository;
import com.finbattle.domain.room.dto.RedisRoomMember;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.domain.room.repository.RedisRoomRepository;
import com.finbattle.domain.room.service.RoomSubscriptionService;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatLogRepository chatLogRepository;
    private final RedisRoomRepository redisRoomRepository;
    private final RedisPublisher redisPublisher;
    private final RoomSubscriptionService roomSubscriptionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 채팅 메시지를 DB에 저장하고, Redis 채널("chat")에 발행
     */
    public void processChatMessage(ChatMessage message, Long memberId) {
        // DB 저장
        ChatLog log = new ChatLog(message.getRoomId(), memberId, message.getContent());
        chatLogRepository.save(log);
        // Redis에 JSON 형태로 발행
        try {
            Long roomId = Long.parseLong(message.getRoomId());
            RedisRoom redisRoom = roomSubscriptionService.getRedisRoom(roomId);

            List<RedisRoomMember> members = redisRoom.getMembers();
            AtomicReference<String> nickname = new AtomicReference<>("");
            members.forEach(member -> {
                if (member.getMemberId().equals(memberId)) {
                    nickname.set(member.getNickname());
                }
            });

            ChatMessage finalMessage = new ChatMessage(message.getContent(), message.getRoomId(),
                nickname.get());
            String jsonMessage = objectMapper.writeValueAsString(finalMessage);
            redisPublisher.publish("chat:" + message.getRoomId(), jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
