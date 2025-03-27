package com.finbattle.domain.quiz.dto;

import com.finbattle.domain.quiz.model.ShortAnswerQuiz;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ShortAnswerQuiz 엔티티용 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShortAnswerQuizDto extends QuizDto {

    private String shortQuestion;
    private String shortAnswer;
    private String shortFirstHint;
    private String shortSecondHint;

    public static ShortAnswerQuizDto toDto(ShortAnswerQuiz entity) {
        if (entity == null) {
            return null;
        }
        ShortAnswerQuizDto dto = new ShortAnswerQuizDto();
        // 공통 필드
        dto.mapCommonFields(entity);
        // 자식 필드
        dto.setShortQuestion(entity.getShortQuestion());
        dto.setShortAnswer(entity.getShortAnswer());
        dto.setShortFirstHint(entity.getShortFirstHint());
        dto.setShortSecondHint(entity.getShortSecondHint());
        return dto;
    }
}
