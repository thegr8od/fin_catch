package com.finbattle.domain.game.dto;

import lombok.Data;

@Data
public class UserStatus {
    private String userId;
    private int life; // 플레이어의 남은 라이프 (예: 3)
}
