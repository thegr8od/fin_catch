package com.finbattle.domain.ai.service;

import com.finbattle.domain.ai.model.*;
import com.finbattle.domain.ai.repository.*;
import com.finbattle.global.common.exception.exception.BusinessException;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiQuizLogService {

    private final AiQuizRepository aiQuizRepository;
    private final AiMultipleChoiceQuizRepository multipleChoiceQuizRepository;
    private final AiOptionRepository aiOptionRepository;
    private final AiQuizLogRepository aiQuizLogRepository;

    public void submitAnswer(Long quizId, Long memberId, int selectedIndex) {
        // 1) AiQuiz 유효성 체크
        AiQuiz quiz = aiQuizRepository.findById(quizId)
                .orElseThrow(() -> new BusinessException(BaseResponseStatus.QUIZ_NOT_FOUND));

        // 2) multipleChoiceQuiz 찾기
        AiMultipleChoiceQuiz multipleQuiz = multipleChoiceQuizRepository.findAll().stream()
                .filter(m -> m.getAiQuiz().getAiQuizId().equals(quizId))
                .findFirst()
                .orElseThrow(() -> new BusinessException(BaseResponseStatus.QUIZ_NOT_FOUND));

        // 3) 보기 목록
        List<AiOption> options = aiOptionRepository.findAll().stream()
                .filter(opt -> opt.getMultipleChoiceQuiz().getMultipleChoiceQuizId().equals(multipleQuiz.getMultipleChoiceQuizId()))
                .toList();

        if (selectedIndex < 0 || selectedIndex >= options.size()) {
            throw new BusinessException(BaseResponseStatus.BAD_REQUEST);
        }

        AiOption selectedOption = options.get(selectedIndex);
        boolean isCorrect = selectedOption.isCorrect();

        // 4) 로그 저장
        AiQuizLog log = AiQuizLog.builder()
                .aiQuizId(quizId)
                .memberId(memberId)
                .userAnswer(selectedOption.getOptionText())
                .isCorrect(isCorrect)
                .build();
        aiQuizLogRepository.save(log);
    }
}
