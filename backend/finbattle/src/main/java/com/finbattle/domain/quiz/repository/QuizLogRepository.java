package com.finbattle.domain.quiz.repository;

import com.finbattle.domain.quiz.model.QuizLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizLogRepository extends JpaRepository<QuizLog, Long> {

    List<QuizLog> findByMemberId(Long memberId);

    List<QuizLog> findByQuizId(Long quizId);

    Optional<QuizLog> findTopByQuizIdAndMemberIdOrderByCreatedAtDesc(Long quizId, Long memberId); // 🔥 추가

    List<QuizLog> findByMemberIdAndIsCorrectFalse(Long memberId);
}
