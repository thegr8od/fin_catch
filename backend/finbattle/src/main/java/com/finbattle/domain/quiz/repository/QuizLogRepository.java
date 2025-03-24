package com.finbattle.domain.quiz.repository;

import com.finbattle.domain.quiz.model.QuizLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizLogRepository extends JpaRepository<QuizLog, Long> {
    List<QuizLog> findByMemberId(Long memberId);
    List<QuizLog> findByQuizId(Long quizId);
}
