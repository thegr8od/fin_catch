package com.finbattle.domain.room.service;

import static com.finbattle.domain.room.dto.RoomStatus.OPEN;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.domain.room.dto.EventMessage;
import com.finbattle.domain.room.dto.MessageType;
import com.finbattle.domain.room.dto.QuizType;
import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.dto.RoomType;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.repository.RedisRoomRepository;
import com.finbattle.domain.room.repository.RoomRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final MemberRepository memberRepository;
    private final RedisRoomRepository redisRoomRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 방 생성
    public RoomResponse createRoom(RoomCreateRequest request) {
        // (1) Member 조회
        Member member = memberRepository.findById(request.getMemberId())
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // (2) Room 엔티티 생성
        Room room = new Room();
        room.setRoomTitle(request.getRoomTitle());
        room.setPassword(request.getPassword());
        room.setMaxPlayer(request.getMaxPlayer());
        room.setRoomType(RoomType.valueOf(request.getRoomType().toUpperCase()));
        room.setStatus(OPEN); // 기본 상태
        room.setQuizType(QuizType.valueOf(request.getQuizType().toUpperCase()));

        // --- 1:N 핵심 ---
        // 방의 소유자(=호스트)를 Member로 직접 지정
        room.setHostMember(member);

        // DB 저장
        Room savedRoom = roomRepository.save(room);

        // (3) 응답 반환
        return mapToRoomResponse(savedRoom);
    }

    public void startRoom(Long roomId, Long memberId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        room.setStatus(RoomStatus.IN_PROGRESS);
        roomRepository.save(room);

        RedisRoom redisRoom = redisRoomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("Redis에 해당 방이 존재하지 않습니다."));
        redisRoom.setStatus(RoomStatus.IN_PROGRESS);
        redisRoomRepository.save(redisRoom);

//        if (!redisRoom.getHost().getMemberId().equals(memberId)) {
//            log.warn("🚨 게임 시작 실패: room:{}의 게임 시작은 방장만 가능합니다.", roomId);
//            sendError(roomId, "게임 시작 실패: 방장만 게임을 시작할 수 있습니다.");
//            return;
//        }

        EventMessage<RedisRoom> eventMessage = new EventMessage<>(MessageType.START, roomId,
            redisRoom);
        try {
            String jsonMessage = objectMapper.writeValueAsString(eventMessage);
            redisPublisher.publish("room:" + roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("RedisRoom START 이벤트 직렬화 실패", e);
            throw new IllegalStateException("이벤트 메시지 생성 중 오류가 발생했습니다.");
        }
    }

    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        if (room.getStatus() == RoomStatus.IN_PROGRESS) {
            throw new IllegalStateException("게임이 진행 중인 방은 삭제할 수 없습니다.");
        }
        room.setStatus(RoomStatus.CLOSED);
        roomRepository.save(room);

        redisRoomRepository.deleteById(roomId);
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
            .map(this::mapToRoomResponse)
            .collect(Collectors.toList());
    }

    public List<RoomResponse> getRoomsByType(RoomType roomType) {
        return roomRepository.findByRoomType(roomType).stream()
            .map(this::mapToRoomResponse)
            .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
            .map(this::mapToRoomResponse)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
    }

    // OPEN 상태의 방만 가져오기
    public List<RoomResponse> getOpenRooms() {
        return roomRepository.findByStatus(RoomStatus.OPEN).stream()
            .map(RoomResponse::fromEntity) // Room -> RoomResponse 변환
            .collect(Collectors.toList());
    }

    // 예시: 방장이 방을 나갈 시 새 방장을 지정하는 로직이 필요하다면
    // Room 엔티티 안에 "hostMember"만 존재하므로, 새 호스트를 어떻게 정할지 별도 설계가 필요함.

    private RoomResponse mapToRoomResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setRoomId(room.getRoomId());
        response.setRoomTitle(room.getRoomTitle());
        response.setStatus(room.getStatus());
        response.setRoomType(room.getRoomType());
        response.setMaxPlayer(room.getMaxPlayer());
        response.setCreatedAt(room.getCreatedAt());
        response.setQuizType(room.getQuizType());
        response.setMemberId(room.getHostMember().getMemberId());
        return response;
    }

//    private void sendError(String roomId, String errorMessage) {
//        com.finbattle.domain.game.dto.EventMessage<String> message = new com.finbattle.domain.game.dto.EventMessage<>(
//            EventType.GAME_INFO, roomId,
//            errorMessage);
//        publishToRoom(roomId, message);
//        log.warn("게임 시작 에러 - room {}: {}", roomId, errorMessage);
//    }

//    private
}
