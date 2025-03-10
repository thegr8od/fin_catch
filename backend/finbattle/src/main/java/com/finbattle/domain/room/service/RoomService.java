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
import java.time.LocalDateTime;
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

        // 참여자들의 종료 시간 업데이트
        List<MemberToRoom> members = memberToRoomRepository.findAllByRoom(room);
        members.forEach(memberToRoom -> memberToRoom.setCloseAt(LocalDateTime.now()));
        memberToRoomRepository.saveAll(members);

        return mapToRoomResponse(room);
    }

    /**
     * 방 삭제
     */
    public void deleteRoom(Long roomId) {
        roomRepository.deleteById(roomId);
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
