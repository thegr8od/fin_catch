package com.finbattle.domain.quiz.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortAnswerQuiz {

    @Id
    private Long quizId;

    private String shortQuestion;
    private String shortAnswer;
    private String shortFirstHint;
    private String shortSecondHint;
}
