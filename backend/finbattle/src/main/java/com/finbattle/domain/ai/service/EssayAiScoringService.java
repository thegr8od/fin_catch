package com.finbattle.domain.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EssayAiScoringService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.ai.openai.api-key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    /**
     * 사용자 서술형 답변에 대해 0~100 사이의 점수를 반환하는 메서드
     * @param essayQuestion 문제 내용
     * @param userAnswer 사용자의 답변
     * @return 0부터 100까지의 점수 (정수)
     */
    public int scoreEssayAnswer(String essayQuestion, String userAnswer) {
        // 프롬프트 구성: 문제, 사용자 답변, 그리고 점수 부여 요청
        String prompt = String.format(
                "문제: %s\n" +
                        "사용자 답변: %s\n" +
                        "위 사용자 답변을 0부터 100까지의 점수로 평가해주세요. 점수가 높을수록 답변이 훌륭함을 의미합니다. 단, 점수와 간단한 평가 이유를 함께 JSON 형태로 응답해주세요.\n" +
                        "예시: {\"score\": 85, \"comment\": \"답변이 전반적으로 좋으나, 추가적인 근거가 부족합니다.\"}",
                essayQuestion, userAnswer);

        // API 요청 본문 구성
        Map<String, Object> message = Map.of("role", "user", "content", prompt);
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(message),
                "temperature", 0.7
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                OPENAI_API_URL, HttpMethod.POST, entity, Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("OpenAI API 호출 실패: {}", response.getStatusCode());
            throw new RuntimeException("AI 채점 API 호출 실패");
        }

        // 응답에서 첫 번째 선택지의 메시지 내용 추출
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("AI 응답이 비어 있습니다.");
        }
        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
        log.info("AI 채점 응답: {}", content);

        // 간단하게 JSON 파싱 (실제 구현에서는 robust한 JSON 파서 사용 권장)
        // 예시 응답: {"score": 85, "comment": "답변이 전반적으로 좋으나, 추가 근거 부족."}
        try {
            // 단순 파싱 예시: 점수를 찾는 로직 (실제에서는 Jackson 등을 사용)
            int scoreIndex = content.indexOf("\"score\":");
            if (scoreIndex == -1) {
                throw new RuntimeException("점수 정보가 응답에 없습니다.");
            }
            int colonIndex = content.indexOf(":", scoreIndex);
            int commaIndex = content.indexOf(",", colonIndex);
            String scoreStr = content.substring(colonIndex + 1, commaIndex).trim();
            return Integer.parseInt(scoreStr);
        } catch (Exception e) {
            log.error("응답 파싱 실패: {}", e.getMessage());
            throw new RuntimeException("AI 응답 파싱 실패");
        }
    }
}
