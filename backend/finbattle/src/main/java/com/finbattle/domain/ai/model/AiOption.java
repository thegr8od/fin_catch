package com.finbattle.domain.ai.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_option")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_option_id")
    private Long aiOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "multiple_choice_quiz_id", nullable = false)
    private AiMultipleChoiceQuiz multipleChoiceQuiz;

    @Column(name = "ai_option_text", nullable = false)
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    private boolean isCorrect;
}
