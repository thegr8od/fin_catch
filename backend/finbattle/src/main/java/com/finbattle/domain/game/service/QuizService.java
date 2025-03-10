package com.finbattle.domain.game.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.model.ShortAnswerQuiz;
import com.finbattle.domain.game.repository.ShortAnswerQuizRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final ShortAnswerQuizRepository quizRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 각 방의 현재 활성 퀴즈를 저장 (힌트와 정답 검사용)
    private final ConcurrentMap<String, ShortAnswerQuiz> activeQuizMap = new ConcurrentHashMap<>();

    /**
     * 랜덤 퀴즈 문제를 가져와 Redis 채널 "game-quiz"에 발행합니다.
     * 요청 시마다 새로운 퀴즈를 선택하고, 활성 퀴즈로 저장합니다.
     */
    public void publishRandomQuiz(String roomId) {
        Pageable pageable = PageRequest.of(0, 1);
        List<ShortAnswerQuiz> list = quizRepository.findRandomQuiz(pageable);
        if (list.isEmpty()) {
            return;
        }
        ShortAnswerQuiz quiz = list.get(0);
        // 해당 방의 활성 퀴즈로 저장
        activeQuizMap.put(roomId, quiz);

        Map<String, Object> payload = new HashMap<>();
        payload.put("quizId", quiz.getQuizId());
        payload.put("question", quiz.getShortQuestion());
        payload.put("roomId", roomId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            redisPublisher.publish("game-quiz", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 현재 활성 퀴즈의 힌트(힌트1, 힌트2)를 Redis 채널 "game-quizHint"에 발행합니다.
     */
    public void publishQuizHint(String roomId) {
        ShortAnswerQuiz quiz = activeQuizMap.get(roomId);
        if (quiz == null) {
            return;
        }
        Map<String, String> payload = new HashMap<>();
        payload.put("hint1", quiz.getShortFirstHint());
        payload.put("hint2", quiz.getShortSecondHint());
        payload.put("roomId", roomId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            redisPublisher.publish("game-quizHint", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 제출된 정답과 활성 퀴즈의 정답을 비교 후, 결과를 Redis 채널 "game-quizResult"에 발행합니다.
     */
    public void checkQuizAnswer(String roomId, String userAnswer) {
        ShortAnswerQuiz quiz = activeQuizMap.get(roomId);
        if (quiz == null) {
            return;
        }
        boolean isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());
        Map<String, Object> payload = new HashMap<>();
        payload.put("quizId", quiz.getQuizId());
        payload.put("result", isCorrect ? "정답입니다" : "오답입니다");
        payload.put("roomId", roomId);

        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            redisPublisher.publish("game-quizResult", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // 퀴즈 완료 후 활성 퀴즈 제거
        activeQuizMap.remove(roomId);
    }
}
