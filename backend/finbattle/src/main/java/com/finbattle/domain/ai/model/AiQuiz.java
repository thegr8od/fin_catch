package com.finbattle.domain.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_quiz")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ai_quiz_id")
    private Long aiQuizId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;  // 문제 생성자 (or 퀴즈 소유자)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    // 필요하다면 quiz 유형, 주제 등 추가 가능
    // 예: private String subject;
}
