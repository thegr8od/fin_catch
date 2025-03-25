package com.finbattle.domain.quiz.service;

import com.finbattle.domain.quiz.model.QuizLog;
import com.finbattle.domain.quiz.repository.QuizLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizAnalysisQueryService {

    private final QuizLogRepository quizLogRepository;

    public List<QuizLog> getWrongQuizLogsByMember(Long memberId) {
        return quizLogRepository.findByMemberIdAndIsCorrectFalse(memberId);
    }
}
