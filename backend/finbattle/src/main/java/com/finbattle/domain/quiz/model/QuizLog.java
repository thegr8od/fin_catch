package com.finbattle.domain.quiz.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizLogId;

    @Column(nullable = false)
    private Long memberId;

    @Column(nullable = false)
    private Long quizId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private String userAnswer;

    @Column(nullable = false)
    private Boolean isCorrect;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
