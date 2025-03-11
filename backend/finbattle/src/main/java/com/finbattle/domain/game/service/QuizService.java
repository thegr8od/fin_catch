package com.finbattle.domain.game.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.UserStatus;
import com.finbattle.domain.game.model.ShortAnswerQuiz;
import com.finbattle.domain.game.repository.ShortAnswerQuizRepository;
import com.finbattle.domain.game.util.UserStatusUtil;
import com.finbattle.global.common.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final ShortAnswerQuizRepository quizRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RedisTemplate<String, Object> redisTemplate;
    private final GameService gameService;

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
        activeQuizMap.put(roomId, quiz);

        Map<String, Object> payload = new HashMap<>();
        payload.put("quizId", quiz.getQuizId());
        payload.put("question", quiz.getShortQuestion());
        payload.put("roomId", roomId);

        try {
            // 기존에는 JSON 문자열로 변환했으나 여기서는 그대로 객체(Map)를 발행할 수도 있습니다.
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
    public void checkQuizAnswer(String roomId, String userAnswer, String userId) {
        ShortAnswerQuiz quiz = activeQuizMap.get(roomId);
        if (quiz == null) {
            return;
        }
        boolean isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());
        Map<String, Object> payload = new HashMap<>();
        payload.put("quizId", quiz.getQuizId());
        payload.put("result", isCorrect ? "정답입니다" : "오답입니다");
        payload.put("roomId", roomId);
        payload.put("userId", userId);

        String key = "room:users:" + roomId;
        // Redis에 저장된 값은 문자열 형태이므로, 가져올 때 형변환 후 역직렬화
        Object obj = redisTemplate.opsForHash().get(key, userId);
        if (obj != null) {
            String stored = (String) obj;
            UserStatus userStatus = UserStatusUtil.deserialize(stored);
            if (isCorrect) {
                userStatus.setCorrect(true);
                redisTemplate.opsForHash().put(key, userId, UserStatusUtil.serialize(userStatus));
            }
        }

        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            redisPublisher.publish("game-quizResult", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (isCorrect) {
            activeQuizMap.remove(roomId);
            gameService.publishUserStatus(roomId); // 상태 발행
        }
    }
}
