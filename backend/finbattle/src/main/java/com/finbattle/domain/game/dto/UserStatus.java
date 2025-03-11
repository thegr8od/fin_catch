package com.finbattle.domain.game.dto;

import lombok.Data;

@Data
public class UserStatus {
    private String userId;
    private boolean correct; // 퀴즈 정답 여부
}
