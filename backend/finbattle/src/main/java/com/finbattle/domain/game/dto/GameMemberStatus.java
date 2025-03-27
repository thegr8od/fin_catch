package com.finbattle.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor        // 모든 필드 받는 생성자를 자동 생성
@NoArgsConstructor
public class GameMemberStatus {

    private long memberId;
    private String mainCat;
    private String nickname;
    private int life; // 플레이어의 남은 라이프 (예: 3)
}
