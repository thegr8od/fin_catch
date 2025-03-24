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
public class EssayQuiz {

    @Id
    private Long quizId;

    private String essayQuestion;
}
