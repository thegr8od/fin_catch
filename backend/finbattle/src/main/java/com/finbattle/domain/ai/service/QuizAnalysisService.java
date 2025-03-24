package com.finbattle.domain.ai.service;

import com.finbattle.domain.ai.dto.QuizAiRequestDto;
import com.finbattle.domain.game.dto.QuizMode;
import com.finbattle.domain.quiz.model.*;
import com.finbattle.domain.quiz.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizAnalysisService {

    private final QuizRepository quizRepository;
    private final ShortAnswerQuizRepository shortAnswerQuizRepository;
    private final EssayQuizRepository essayQuizRepository;
    private final MultipleChoiceQuizRepository multipleChoiceQuizRepository;
    private final QuizOptionRepository quizOptionRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.openai.api-key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public String analyze(QuizAiRequestDto dto) {
        Long quizId = dto.getQuizId();
        String userAnswer = dto.getUserAnswer();

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("퀴즈를 찾을 수 없습니다."));

        QuizMode quizMode = quiz.getQuizMode(); // Quiz 엔티티에 QuizMode 필드가 있어야 함
        String prompt;

        switch (quizMode) {
            case SHORT_ANSWER -> {
                ShortAnswerQuiz q = shortAnswerQuizRepository.findById(quizId)
                        .orElseThrow();
                prompt = """
                        문제: %s
                        사용자 답변: %s

                        위 사용자 답변이 어떤 점에서 부족하거나 틀렸는지, 어떻게 개선하면 좋을지 피드백을 줘.
                        """.formatted(q.getShortQuestion(), userAnswer);
            }
            case ESSAY -> {
                EssayQuiz q = essayQuizRepository.findById(quizId)
                        .orElseThrow();
                prompt = """
                        문제: %s
                        사용자 답변: %s

                        사용자 답변을 평가하고 논리성, 문법, 핵심 포인트 도달 여부 측면에서 피드백을 줘.
                        """.formatted(q.getEssayQuestion(), userAnswer);
            }
            case MULTIPLE_CHOICE -> {
                MultipleChoiceQuiz q = multipleChoiceQuizRepository.findById(quizId)
                        .orElseThrow();
                List<QuizOption> options = quizOptionRepository.findByQuizId(quizId);

                StringBuilder optionsText = new StringBuilder();
                for (QuizOption option : options) {
                    optionsText.append("- ").append(option.getOptionText()).append("\n");
                }

                prompt = """
                        문제: %s
                        보기:
                        %s
                        사용자 답변: %s

                        사용자의 답변이 정답과 비교하여 어떤지 설명해줘. 정답이 무엇인지, 오답인 경우 무엇을 잘못 이해했는지 알려줘.
                        """.formatted(q.getMutipleQuestion(), optionsText, userAnswer);
            }
            default -> throw new RuntimeException("지원하지 않는 퀴즈 유형입니다.");
        }

        return callOpenAi(prompt);
    }

    private String callOpenAi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> message = Map.of(
                "role", "user",
                "content", prompt
        );

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                entity,
                Map.class
        );

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        return (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
    }
}
