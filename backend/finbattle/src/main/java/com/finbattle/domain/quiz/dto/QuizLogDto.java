package com.finbattle.domain.quiz.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizLogDto {
    private Long quizLogId;
    private Long memberId;
    private String userAnswer;
    private Boolean isCorrect;
    private LocalDateTime createdAt;
}