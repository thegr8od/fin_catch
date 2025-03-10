package com.finbattle.domain.game.dto;

import lombok.Data;

@Data
public class GameRoomCreateRequest {
    private String roomId;
    private String status; // 예: "READY"
}
