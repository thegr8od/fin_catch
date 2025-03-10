package com.finbattle.domain.game.dto;

import lombok.Data;

/**
 * 사용자가 정답 제출 시 바디 예시
 */
@Data
public class AnswerRequest {
    private Long quizId;      // 어떤 퀴즈에 대한 답인지 (클라이언트가 getQuiz 시 받은 quizId 포함)
    private String userAnswer; // 제출 답안
}
