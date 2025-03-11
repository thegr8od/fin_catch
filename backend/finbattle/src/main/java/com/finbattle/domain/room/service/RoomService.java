package com.finbattle.domain.room.service;

import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.model.MemberToRoom;
import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.model.RoomStatus;
import com.finbattle.domain.room.model.RoomType;
import com.finbattle.domain.room.repository.MemberToRoomRepository;
import com.finbattle.domain.room.repository.RoomRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final MemberToRoomRepository memberToRoomRepository;
    private final MemberRepository memberRepository;

    /**
     * 방 생성
     */
    public RoomResponse createRoom(RoomCreateRequest request) {
        // 사용자 조회
        Member member = memberRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 방 생성
        Room room = new Room();
        room.setRoomTitle(request.getRoomTitle());
        room.setPassword(request.getPassword());
        room.setMaxPlayer(request.getMaxPlayer());
        room.setRoomType(RoomType.valueOf(request.getRoomType().toUpperCase()));
        room.setStatus(RoomStatus.OPEN); // 기본 상태

        Room savedRoom = roomRepository.save(room);

        // 사용자 방 참여 등록
        MemberToRoom memberToRoom = new MemberToRoom();
        memberToRoom.setMember(member);
        memberToRoom.setRoom(savedRoom);
        memberToRoomRepository.save(memberToRoom);

        return mapToRoomResponse(savedRoom);
    }

    /**
     * 게임 시작
     */
    public RoomResponse startRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        room.setStatus(RoomStatus.IN_PROGRESS); // 진행 중 상태로 변경
        roomRepository.save(room);

        return mapToRoomResponse(room);
    }

    public RoomResponse closeRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        room.setStatus(RoomStatus.CLOSED); // 방 상태 변경
        roomRepository.save(room);

        return mapToRoomResponse(room);
    }

    /**
     * 방 삭제
     */
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));

        if (room.getStatus() == RoomStatus.IN_PROGRESS) {
            throw new IllegalStateException("게임이 진행 중인 방은 삭제할 수 없습니다.");
        }

        room.setStatus(RoomStatus.CLOSED);
        roomRepository.save(room);
    }

    /**
     * 방 목록 조회
     */
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
            .map(this::mapToRoomResponse)
            .collect(Collectors.toList());
    }

    /**
     * 주제별 방 조회
     */
    public List<RoomResponse> getRoomsByType(RoomType roomType) {
        return roomRepository.findByRoomType(roomType).stream()
            .map(this::mapToRoomResponse)
            .collect(Collectors.toList());
    }

    /**
     * 특정 방 조회
     */
    public RoomResponse getRoomById(Long roomId) {
        return roomRepository.findById(roomId)
            .map(this::mapToRoomResponse)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
    }

    /**
     * 방장이 방을 나갈 시
     */
    public Long assignNewHost(Long roomId, Long oldHostId) {
        List<MemberToRoom> members = memberToRoomRepository.findAllByRoomId(roomId);

        if (members.size() > 1) {
            MemberToRoom newHost = members.stream()
                .filter(m -> !m.getMember().getMemberId().equals(oldHostId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("방장이 될 사람이 없습니다."));

            // 이 로직은 실제로 '방장' 필드를 Room에 따로 두고 관리하는 경우에 맞게 수정 필요.
            // 현재 Room 테이블엔 별도의 '방장 ID'가 없으므로, 예시로만 두겠습니다.
            newHost.getRoom().setRoomId(newHost.getMember().getMemberId());
            roomRepository.save(newHost.getRoom());
            return newHost.getMember().getMemberId();
        }
        return null;
    }

    private RoomResponse mapToRoomResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setRoomId(room.getRoomId());
        response.setRoomTitle(room.getRoomTitle());
        response.setStatus(room.getStatus());
        response.setRoomType(room.getRoomType());
        response.setMaxPlayer(room.getMaxPlayer());
        response.setCreatedAt(room.getCreatedAt());
        return response;
    }
}
