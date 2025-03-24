package com.finbattle.domain.quiz.repository;

import com.finbattle.domain.quiz.model.QuizLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizLogRepository extends JpaRepository<QuizLog, Long> {

    List<QuizLog> findByMemberId(Long memberId);

    List<QuizLog> findByQuizId(Long quizId);
}
