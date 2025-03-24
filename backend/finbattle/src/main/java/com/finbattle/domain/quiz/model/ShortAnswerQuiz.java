package com.finbattle.domain.quiz.model;

import jakarta.persistence.Column;
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
    @Column(name = "quiz_id")
    private Long quizId;

    private String shortQuestion;
    private String shortAnswer;
    private String shortFirstHint;
    private String shortSecondHint;
}
