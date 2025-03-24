package com.finbattle.domain.quiz.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
