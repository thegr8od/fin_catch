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
    // 각 방에서 첫 정답 제출자를 기록 (전투 모드용)
    private final ConcurrentMap<String, String> firstCorrectAnswerMap = new ConcurrentHashMap<>();

    /**
     * 랜덤 퀴즈 문제를 가져와 Redis 채널 "game-quiz"에 발행합니다.
     */
    public void publishRandomQuiz(String roomId) {
        Pageable pageable = PageRequest.of(0, 1);
        List<ShortAnswerQuiz> list = quizRepository.findRandomQuiz(pageable);
        if (list.isEmpty()) {
            return;
        }
        ShortAnswerQuiz quiz = list.get(0);
        activeQuizMap.put(roomId, quiz);
        // 초기화: 이전 첫 정답 기록 삭제
        firstCorrectAnswerMap.remove(roomId);

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
     * 제출된 정답과 활성 퀴즈의 정답을 비교 후, 전투모드 로직을 적용합니다.
     * - 첫 정답 제출 시, 해당 사용자가 정답이면 상대방의 라이프를 1 감소시킵니다.
     * - 이후 정답 제출은 무시됩니다.
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
        if (isCorrect && !firstCorrectAnswerMap.containsKey(roomId)) {
            // 첫 정답 제출 처리
            firstCorrectAnswerMap.put(roomId, userId);
            // 모든 사용자 상태를 가져와서, 본인을 제외한 상대방의 라이프 1 감소
            Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
            for (Map.Entry<Object, Object> entry : userMap.entrySet()) {
                String stored = (String) entry.getValue();
                UserStatus status = UserStatusUtil.deserialize(stored);
                if (!status.getUserId().equals(userId)) {
                    status.setLife(status.getLife() - 1);
                    redisTemplate.opsForHash().put(key, status.getUserId(), UserStatusUtil.serialize(status));
                }
            }
            // 변경된 사용자 상태 발행
            gameService.publishUserStatus(roomId);
        }

        try {
            String jsonMessage = objectMapper.writeValueAsString(payload);
            redisPublisher.publish("game-quizResult", jsonMessage);
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (isCorrect) {
            activeQuizMap.remove(roomId);
            firstCorrectAnswerMap.remove(roomId);
        }
    }
}
