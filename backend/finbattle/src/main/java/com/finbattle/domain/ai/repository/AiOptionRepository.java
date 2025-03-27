package com.finbattle.domain.ai.repository;

import com.finbattle.domain.ai.model.AiOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiOptionRepository extends JpaRepository<AiOption, Long> {

    // 필요 시 quizId로 보기 목록을 조회하는 메서드
    // List<AiOption> findByMultipleChoiceQuizId(Long multipleChoiceQuizId);

}
