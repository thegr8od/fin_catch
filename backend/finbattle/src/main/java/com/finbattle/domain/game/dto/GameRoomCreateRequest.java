package com.finbattle.domain.game.dto;

import lombok.Data;

@Data
public class GameRoomCreateRequest {
    private String roomId;
    private String status; // 초기 상태, 예를 들어 "READY"
}
