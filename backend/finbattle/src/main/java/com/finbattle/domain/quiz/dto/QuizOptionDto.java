package com.finbattle.domain.quiz.dto;

import com.finbattle.domain.quiz.model.QuizOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * QuizOption 엔티티용 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizOptionDto {

    private Long quizOptionId;
    private Long quizId;
    private int optionNumber;
    private String optionText;
    private boolean isCorrect;

    public static QuizOptionDto toDto(QuizOption entity) {
        if (entity == null) {
            return null;
        }
        QuizOptionDto dto = new QuizOptionDto();
        dto.setQuizOptionId(entity.getQuizOptionId());
        dto.setQuizId(entity.getQuizId());
        dto.setOptionText(entity.getOptionText());
        dto.setCorrect(entity.isCorrect());
        return dto;
    }

    public static List<QuizOptionDto> toDtoList(List<QuizOption> entities) {
        if (entities == null || entities.isEmpty()) {
            return new ArrayList<>();
        }

        List<QuizOptionDto> dtoList = new ArrayList<>();
        int number = 1;
        for (QuizOption entity : entities) {
            QuizOptionDto dto = toDto(entity);
            dto.setOptionNumber(number++);
            dtoList.add(dto);
        }

        dtoList.sort(Comparator.comparingInt(QuizOptionDto::getOptionNumber));
        return dtoList;
    }
}
