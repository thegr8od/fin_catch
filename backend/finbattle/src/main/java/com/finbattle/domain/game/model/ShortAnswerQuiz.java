package com.finbattle.domain.game.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "short_answer_quiz")
public class ShortAnswerQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "short_question", nullable = false)
    private String shortQuestion;

    @Column(name = "short_answer", nullable = false)
    private String shortAnswer;

    @Column(name = "short_first_hint", nullable = false)
    private String shortFirstHint;

    @Column(name = "short_second_hint", nullable = false)
    private String shortSecondHint;
}
