package com.finbattle.domain.ai.repository;

import com.finbattle.domain.ai.model.AiQuizLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiQuizLogRepository extends JpaRepository<AiQuizLog, Long> {

    // 필요 시 로그 조회용 쿼리 메서드
    // List<AiQuizLog> findByMemberId(Long memberId);
    // List<AiQuizLog> findByAiQuizId(Long quizId);

}
