package com.finbattle.domain.room.controller;

import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.model.RoomType;
import com.finbattle.domain.room.service.RoomService;
import com.finbattle.domain.room.service.RoomSubscriptionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomSubscriptionService roomSubscriptionService;

    /**
     * 방 생성
     */
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomCreateRequest request) {
        RoomResponse response = roomService.createRoom(request);
        roomSubscriptionService.createRoomSubscription(response.getRoomId());
        return ResponseEntity.ok(response);
    }

    /**
     * 방 삭제
     */
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 방 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    /**
     * 주제별 방 조회
     */
    @GetMapping("/{roomType}")
    public ResponseEntity<List<RoomResponse>> getRoomsByType(@PathVariable String roomType) {
        return ResponseEntity.ok(
            roomService.getRoomsByType(RoomType.valueOf(roomType.toUpperCase())));
    }

    /**
     * 특정 방 조회
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

}
