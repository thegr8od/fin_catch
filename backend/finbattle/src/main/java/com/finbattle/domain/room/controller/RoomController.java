package com.finbattle.domain.room.controller;

import com.finbattle.domain.room.dto.RoomCreateRequest;
import com.finbattle.domain.room.dto.RoomResponse;
import com.finbattle.domain.room.dto.RoomType;
import com.finbattle.domain.room.service.RoomService;
import com.finbattle.domain.room.service.RoomSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
@Tag(name = "Room API", description = "방 관련 기능을 제공하는 컨트롤러")
public class RoomController {

    private final RoomService roomService;
    private final RoomSubscriptionService roomSubscriptionService;

    /**
     * 방 생성
     */
    @Operation(summary = "방 생성하기", description = "방 생성 api")
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomCreateRequest request) {
        RoomResponse response = roomService.createRoom(request);
        roomSubscriptionService.createRoomSubscription(response);
        return ResponseEntity.ok(response);
    }

    /**
     * 방 삭제
     */
    @Operation(summary = "방 삭제하기", description = "방 삭제 api")
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 방 목록 조회
     */
    @Operation(summary = "방 모든 방 조회하기", description = "방 전체 조회 api")
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    /**
     * 주제별 방 조회
     */
    @Operation(summary = "방 주제별 방 조회하기", description = "방 주제별 방 조회 api")
    @GetMapping("/type/{roomType}")
    public ResponseEntity<List<RoomResponse>> getRoomsByType(@PathVariable String roomType) {
        return ResponseEntity.ok(
            roomService.getRoomsByType(RoomType.valueOf(roomType.toUpperCase())));
    }

    /**
     * 특정 방 조회
     */
    @Operation(summary = "방 id 검색 조회", description = "방 id 검색 조회 api")
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomService.getRoomById(roomId));
    }

    /**
     * OPEN 상태의 방 목록 조회
     */
    @Operation(summary = "방 열려 있는 방 조회하기", description = "방 열려 있는 방 조회 api")
    @GetMapping("/open")
    public ResponseEntity<List<RoomResponse>> getOpenRooms() {
        return ResponseEntity.ok(roomService.getOpenRooms());
    }
}
