package com.finbattle.domain.game.dto;

import lombok.Data;

@Data
public class AnswerRequest {

    private Long quizId;      // 어떤 퀴즈에 대한 답인지
    private String userAnswer; // 제출 답안
    private Long memberId;    // 제출한 사용자 ID
}
