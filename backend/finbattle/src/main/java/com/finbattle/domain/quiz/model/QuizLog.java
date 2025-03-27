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
@Table(name = "quiz_log")
public class QuizLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_log_id")
    private Long quizLogId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "user_answer")
    private String userAnswer;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
