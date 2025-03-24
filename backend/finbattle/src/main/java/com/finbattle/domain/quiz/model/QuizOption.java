package com.finbattle.domain.quiz.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizOptionId;

    private Long quizId;

    private String optionText;

    private boolean isCorrect;
}
