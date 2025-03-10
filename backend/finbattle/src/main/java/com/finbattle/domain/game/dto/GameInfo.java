package com.finbattle.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GameInfo {
    private String status; // 예: READY, START, END 등
    private int score;
    private String roomId;
}
