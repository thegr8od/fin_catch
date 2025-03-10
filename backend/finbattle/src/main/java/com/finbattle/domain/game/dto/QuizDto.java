package com.finbattle.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuizDto {
    private Long quizId;
    private String question;
    private String firstHint;
    private String secondHint;
    private String[] options; // multiple choice 문제의 경우 옵션들
}
