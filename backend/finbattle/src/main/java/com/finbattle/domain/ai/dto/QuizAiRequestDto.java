package com.finbattle.domain.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class QuizAiRequestDto {
    private Long quizId;
    private String userAnswer;
}
