package com.finbattle.domain.quiz.dto;

import com.finbattle.domain.quiz.model.EssayQuiz;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * EssayQuiz 엔티티용 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EssayQuizDto extends QuizDto {

    private String essayQuestion;
    private String essayFirstHint;
    private String essaySecondHint;

    public static EssayQuizDto toDto(EssayQuiz entity) {
        if (entity == null) {
            return null;
        }
        EssayQuizDto dto = new EssayQuizDto();
        // 부모(QuizDto)에 있는 공통 필드 설정
        dto.mapCommonFields(entity);
        // 자식 필드 설정
        dto.setEssayQuestion(entity.getEssayQuestion());
        dto.setEssayFirstHint(entity.getEssayFirstHint());
        dto.setEssaySecondHint(entity.getEssaySecondHint());
        return dto;
    }
}
