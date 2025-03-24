package com.finbattle.domain.quiz.repository;

import com.finbattle.domain.quiz.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    // 퀴즈 타입으로 전체 리스트 조회 (예: SHORT_ANSWER, ESSAY, MULTIPLE_CHOICE)
    List<Quiz> findByQuizMode(String quizMode);

    // 퀴즈 주제로 필터링 (예: FIN_KNOWLEDGE, FIN_CRIME 등)
    List<Quiz> findByQuizSubject(String quizSubject);

    // 상태로 필터링 (예: ACTIVE)
    List<Quiz> findByStatus(String status);

    // 퀴즈 타입 + 주제 조합으로 필터링
    List<Quiz> findByQuizModeAndQuizSubject(String quizMode, String quizSubject);

    // 퀴즈 상태 + 타입 + 주제로 복합 조건 조회
    List<Quiz> findByStatusAndQuizModeAndQuizSubject(String status, String quizMode, String quizSubject);
}
