package com.finbattle.domain.room.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.room.model.RedisRoom;
import com.finbattle.domain.room.model.RedisRoomMember;
import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.model.RoomStatus;
import com.finbattle.domain.room.repository.RoomRepository;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomSubscriptionService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RoomRepository roomRepository;
    private final ObjectMapper objectMapper = new ObjectMapper(); // (추가) JSON 직렬화/역직렬화용

    /**
     * 방을 생성하면 Redis에서 JSON 데이터로 저장
     */
    public void createRoomSubscription(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        // 기존: 단순 Set 생성 코드
        // redisTemplate.opsForSet().add("room:" + roomId, "OWNER");

        // 수정: RedisRoom 객체 생성 후 JSON 변환 저장
        RedisRoom redisRoom = new RedisRoom();
        redisRoom.setRoomId(room.getRoomId());
        redisRoom.setMaxPeople(room.getMaxPlayer());
        redisRoom.setStatus(room.getStatus());

        // 방장 정보를 host 필드로 설정 (Room 테이블에 방장정보가 없는 경우 MemberToRoom 등에서 가져와야 함)
        // 여기서는 예시로 roomId를 생성한 유저라고 가정하거나, 별도의 로직으로 방장을 구해야 합니다.
        RedisRoomMember host = new RedisRoomMember();
        // 방장 정보를 어떻게 가져올지는 비즈니스 로직에 따라 다릅니다.
        // DB에서 memberToRoom 중 (roomId)와 일치하고, 첫 번째로 들어온 멤버를 host로 설정한다고 가정
        // 실제로는 방장을 식별할 수 있는 추가 정보가 필요합니다.
        host.setMemberId(room.getRoomId()); // 예시로 roomId 대신 다른 값으로 대체 필요
        host.setStatus("READY");
        redisRoom.setHost(host);

        // 호스트를 members 리스트에도 추가
        redisRoom.getMembers().add(host);

        String redisKey = "room:" + roomId;
        try {
            String roomJson = objectMapper.writeValueAsString(redisRoom);
            redisTemplate.opsForValue().set(redisKey, roomJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to create room in Redis: {}", e.getMessage());
        }

        log.info("Room {} subscription created in Redis (JSON)", roomId);
    }

    /**
     * 특정 방의 현재 참가자 수 조회 (JSON 구조에서 members 사이즈 사용)
     */
    public long getRoomUserCount(Long roomId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            return 0;
        }
        return redisRoom.getMembers().size();
    }

    /**
     * 방에 참가한 유저를 Redis JSON에 추가 - 인원 초과 시 예외 - 이미 있는 유저면 중복 추가 방지
     */
    public void joinRoom(Long roomId, Long userId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            throw new IllegalStateException("방이 존재하지 않습니다.");
        }
        if (redisRoom.getStatus() != RoomStatus.OPEN) {
            throw new IllegalStateException("방에 입장할 수 없는 상태입니다.");
        }
        // 인원 초과 체크
        if (redisRoom.getMembers().size() >= redisRoom.getMaxPeople()) {
            throw new IllegalStateException("방 정원이 초과되었습니다.");
        }
        // 이미 방에 있는지 체크
        boolean alreadyIn = redisRoom.getMembers().stream()
            .anyMatch(m -> m.getMemberId().equals(userId));
        if (alreadyIn) {
            throw new IllegalStateException("이미 방에 입장해 있습니다.");
        }

        // 새 멤버 추가 (처음 상태는 NOT_READY)
        RedisRoomMember member = new RedisRoomMember();
        member.setMemberId(userId);
        member.setStatus("NOT_READY");
        redisRoom.getMembers().add(member);

        saveRedisRoom(roomId, redisRoom);
        log.info("User {} joined Room {} in Redis (JSON)", userId, roomId);
    }

    /**
     * 방에서 특정 유저 제거 - 유저가 방장인 경우, 다른 유저가 있으면 방장 위임 - 다른 유저가 없으면 방 삭제
     *
     * @return 방이 삭제되었으면 true, 아니면 false
     */
    public boolean leaveRoom(Long roomId, Long userId) {
        RedisRoom redisRoom = getRedisRoom(roomId);
        if (redisRoom == null) {
            // 이미 삭제된 방이거나 없음
            return true;
        }
        List<RedisRoomMember> members = redisRoom.getMembers();

        // 나가려는 유저가 방에 있는지 확인
        RedisRoomMember leavingMember = members.stream()
            .filter(m -> m.getMemberId().equals(userId))
            .findFirst()
            .orElse(null);
        if (leavingMember == null) {
            // 방에 없는 유저가 leave를 시도
            return false;
        }

        // 방에서 제거
        members.remove(leavingMember);

        // 방장 여부 체크
        boolean isHost = (redisRoom.getHost() != null
            && redisRoom.getHost().getMemberId().equals(userId));

        // 남은 인원이 없으면 방 삭제
        if (members.isEmpty()) {
            deleteRoom(roomId); // Redis에서 삭제
            log.info("Room {} deleted from Redis, because last user left", roomId);
            return true; // 컨트롤러 쪽에서 방 삭제 로직을 추가 실행
        }

        // 방장이 나갔고, 아직 인원이 남아있다면 첫 번째 멤버를 새 방장으로 위임
        if (isHost) {
            RedisRoomMember newHost = members.get(0);
            redisRoom.setHost(newHost);
            log.info("Host {} left, new host is {}", userId, newHost.getMemberId());
        }

        // 변경사항 Redis에 다시 저장
        saveRedisRoom(roomId, redisRoom);

        return false; // 방은 여전히 존재
    }

    /**
     * 방을 삭제할 때 Redis에서 방 구독 데이터 삭제
     */
    public void deleteRoom(Long roomId) {
        // 기존: simple set 삭제
        // redisTemplate.delete("room:" + roomId);

        // 수정: JSON 구조로 저장된 값 삭제
        redisTemplate.delete("room:" + roomId);
        log.info("Room {} deleted from Redis (JSON)", roomId);
    }

    /**
     * 방에 현재 남아 있는 모든 유저 목록(레거시) 조회 - 예전 Set 구조 쓰던 코드 남아있으면 사용 가능 JSON 기반으로 변경 시, 가급적 getRedisRoom()
     * 통해 처리
     */
    public Set<Object> getRoomUsersLegacy(Long roomId) {
        return redisTemplate.opsForSet().members("room:" + roomId);
    }

    /**
     * Redis에서 roomId 키로 JSON 가져오기
     */
    private RedisRoom getRedisRoom(Long roomId) {
        String redisKey = "room:" + roomId;
        Object roomJsonObj = redisTemplate.opsForValue().get(redisKey);
        if (roomJsonObj == null) {
            return null;
        }
        try {
            return objectMapper.readValue(roomJsonObj.toString(), RedisRoom.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse RedisRoom JSON: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 수정된 RedisRoom 객체를 다시 Redis에 JSON 형태로 저장
     */
    private void saveRedisRoom(Long roomId, RedisRoom redisRoom) {
        String redisKey = "room:" + roomId;
        try {
            String updatedJson = objectMapper.writeValueAsString(redisRoom);
            redisTemplate.opsForValue().set(redisKey, updatedJson);
        } catch (JsonProcessingException e) {
            log.error("Failed to save RedisRoom JSON: {}", e.getMessage());
        }
    }
}
