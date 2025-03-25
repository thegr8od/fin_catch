package com.finbattle.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class QuizAiResponseDto {
    private String analysis;
    private String weakness;
    private String recommendation;
}
