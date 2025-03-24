package com.finbattle.domain.quiz.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizId;

    @Enumerated(EnumType.STRING)
    private QuizMode quizMode;  // SHORT_ANSWER, ESSAY, MULTIPLE_CHOICE

    @Column(nullable = false)
    private String quizSubject;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE 등 (ENUM 또는 문자열)

    @Column(nullable = false)
    private String createdAt; // timestamp → String으로 가정
}
