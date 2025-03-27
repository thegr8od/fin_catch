package com.finbattle.domain.quiz.service;

import com.finbattle.domain.quiz.dto.WrongQuizLogDto;
import com.finbattle.domain.quiz.model.*;
import com.finbattle.domain.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizLogRepository quizLogRepository;
    private final QuizRepository quizRepository;
    private final ShortAnswerQuizRepository shortAnswerQuizRepository;
    private final EssayQuizRepository essayQuizRepository;
    private final MultipleChoiceQuizRepository multipleChoiceQuizRepository;
    private final QuizOptionRepository quizOptionRepository;

    public List<WrongQuizLogDto> getWrongQuizLogsByMember(Long memberId) {
        List<QuizLog> wrongLogs = quizLogRepository.findByMemberIdAndIsCorrectFalse(memberId);

        return wrongLogs.stream().map(log -> {
            Quiz quiz = quizRepository.findById(log.getQuizId())
                    .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + log.getQuizId()));

            String question = null;
            String correctAnswer = null;
            List<String> options = null;

            switch (quiz.getQuizMode()) {
                case SHORT_ANSWER -> {
                    ShortAnswerQuiz sa = shortAnswerQuizRepository.findById(quiz.getQuizId())
                            .orElseThrow(() -> new RuntimeException("ShortAnswerQuiz not found with id: " + quiz.getQuizId()));
                    question = sa.getShortQuestion();
                    correctAnswer = sa.getShortAnswer();
                }
                case ESSAY -> {
                    EssayQuiz essay = essayQuizRepository.findById(quiz.getQuizId())
                            .orElseThrow(() -> new RuntimeException("EssayQuiz not found with id: " + quiz.getQuizId()));
                    question = essay.getEssayQuestion();
                }
                case MULTIPLE_CHOICE -> {
                    MultipleChoiceQuiz mcq = multipleChoiceQuizRepository.findById(quiz.getQuizId())
                            .orElseThrow(() -> new RuntimeException("MultipleChoiceQuiz not found with id: " + quiz.getQuizId()));
                    question = mcq.getMultipleQuestion();
                    List<QuizOption> quizOptions = quizOptionRepository.findByQuizId(quiz.getQuizId());
                    correctAnswer = quizOptions.stream().filter(QuizOption::isCorrect).map(QuizOption::getOptionText).findFirst().orElse(null);
                }
            }

            return WrongQuizLogDto.builder()
                    .quizId(quiz.getQuizId())
                    .quizMode(quiz.getQuizMode())
                    .quizSubject(quiz.getSubjectType())
                    .question(question)
                    .correctAnswer(correctAnswer)
                    .userAnswer(log.getUserAnswer())
                    .createdAt(log.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
}
