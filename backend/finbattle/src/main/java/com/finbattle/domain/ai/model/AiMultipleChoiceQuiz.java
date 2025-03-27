package com.finbattle.domain.ai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_multiple_choice_quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMultipleChoiceQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "multiple_choice_quiz_id")
    private Long multipleChoiceQuizId;

    // AiQuiz와 1:1 매핑 (각 AI퀴즈에 대해 객관식 문제 1개를 둔다고 가정)
    @OneToOne
    @JoinColumn(name = "ai_quiz_id", nullable = false)
    private AiQuiz aiQuiz;

    @Column(name = "ai_multiple_question", nullable = false)
    private String question;
}
