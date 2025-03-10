package com.finbattle.domain.chat.repository;

import com.finbattle.domain.chat.model.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {
    // 필요 시 추가 쿼리 메서드 작성
}
