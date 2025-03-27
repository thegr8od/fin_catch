package com.finbattle.domain.ai.service;

import com.finbattle.domain.ai.dto.QuizAiRequestDto;
import com.finbattle.domain.ai.dto.QuizAiResponseDto;
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
public class QuizAiService {

    private final QuizRepository quizRepository;
    private final ShortAnswerQuizRepository shortAnswerQuizRepository;
    private final EssayQuizRepository essayQuizRepository;
    private final MultipleChoiceQuizRepository multipleChoiceQuizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final QuizLogRepository quizLogRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.openai.api-key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    public QuizAiResponseDto analyze(Long memberId, QuizAiRequestDto dto) {
        Long quizId = dto.getQuizId();

        QuizLog quizLog = quizLogRepository
                .findTopByQuizIdAndMemberIdOrderByCreatedAtDesc(quizId, memberId)
                .orElseThrow(() -> new RuntimeException("해당 퀴즈에 대한 유저 답변이 존재하지 않습니다."));

        String userAnswer = quizLog.getUserAnswer();
        String prompt;

        Optional<ShortAnswerQuiz> shortOpt = shortAnswerQuizRepository.findById(quizId);
        if (shortOpt.isPresent()) {
            ShortAnswerQuiz q = shortOpt.get();
            prompt = getPrompt(q.getShortQuestion(), userAnswer, null);
            return callOpenAi(prompt);
        }

        Optional<EssayQuiz> essayOpt = essayQuizRepository.findById(quizId);
        if (essayOpt.isPresent()) {
            EssayQuiz q = essayOpt.get();
            prompt = getPrompt(q.getEssayQuestion(), userAnswer, null);
            return callOpenAi(prompt);
        }

        Optional<MultipleChoiceQuiz> multipleOpt = multipleChoiceQuizRepository.findById(quizId);
        if (multipleOpt.isPresent()) {
            MultipleChoiceQuiz q = multipleOpt.get();
            List<QuizOption> options = quizOptionRepository.findByQuizId(quizId);
            String optionsText = options.stream().map(o -> "- " + o.getOptionText()).reduce("", (a, b) -> a + b + "\n");
            prompt = getPrompt(q.getMultipleQuestion(), userAnswer, optionsText);
            return callOpenAi(prompt);
        }

        throw new RuntimeException("해당 퀴즈 ID로 문제 유형을 찾을 수 없습니다.");
    }

    private String getPrompt(String question, String userAnswer, String optionsText) {
        return """
                문제: %s
                %s사용자 답변: %s

                아래 항목을 포함해 분석해줘. 각 항목은 [항목명]으로 시작해줘.
                [분석 내용]
                문제에서 다루는 주요 개념이나 사실을 정리해줘.

                [취약점]
                사용자의 선택이 왜 맞거나 틀렸는지, 오해한 점이 있다면 설명해줘.

                [추천 학습]
                부족한 부분을 보완할 수 있는 학습 방향을 제안해줘.
                """.formatted(question,
                optionsText != null ? "보기:\n" + optionsText + "\n" : "",
                userAnswer);
    }

    private QuizAiResponseDto callOpenAi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(OPENAI_API_URL, HttpMethod.POST, entity, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

        return parseFeedback(content);
    }

    private QuizAiResponseDto parseFeedback(String content) {
        String[] sections = content.split("\\[.*?\\]");
        List<String> parts = Arrays.stream(sections).map(String::trim).filter(s -> !s.isBlank()).toList();

        return new QuizAiResponseDto(
                parts.size() > 0 ? parts.get(0) : "",
                parts.size() > 1 ? parts.get(1) : "",
                parts.size() > 2 ? parts.get(2) : ""
        );
    }
}
