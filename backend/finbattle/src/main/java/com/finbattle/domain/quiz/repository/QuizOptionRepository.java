package com.finbattle.domain.quiz.repository;

import com.finbattle.domain.quiz.model.QuizOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizOptionRepository extends JpaRepository<QuizOption, Long> {
    List<QuizOption> findByQuizId(Long quizId);
}
