package com.finbattle.domain.quiz.dto;

import com.finbattle.domain.quiz.model.MultipleChoiceQuiz;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MultipleChoiceQuiz 엔티티용 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MultipleChoiceQuizDto extends QuizDto {

    private String multipleQuestion;
    private String multipleFirstHint;
    private String multipleSecondHint;
    private List<QuizOptionDto> quizOptions;

    public static MultipleChoiceQuizDto toDto(MultipleChoiceQuiz entity) {
        if (entity == null) {
            return null;
        }
        MultipleChoiceQuizDto dto = new MultipleChoiceQuizDto();
        // 부모(QuizDto)에 있는 공통 필드 설정
        dto.mapCommonFields(entity);
        // 자식 필드 설정
        dto.setMultipleQuestion(entity.getMultipleQuestion());
        dto.setMultipleFirstHint(entity.getMultipleFirstHint());
        dto.setMultipleSecondHint(entity.getMultipleSecondHint());

        return dto;
    }
}
