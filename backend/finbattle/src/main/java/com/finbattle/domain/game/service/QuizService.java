package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.MemberStatus;
import com.finbattle.domain.game.dto.QuizMode;
import com.finbattle.domain.game.model.ShortAnswerQuiz;
import com.finbattle.domain.game.repository.ShortAnswerQuizRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final ShortAnswerQuizRepository quizRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RedisTemplate<String, Object> redisTemplate;
    private final GameService gameService;
    private final QuizTimerService quizTimerService; // 타이머 서비스 주입

    private final ConcurrentMap<String, ShortAnswerQuiz> activeQuizMap = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Long> firstCorrectAnswerMap = new ConcurrentHashMap<>();

    /**
     * (1) 랜덤 퀴즈 문제 발행 → "topic/game/{roomId}" (EventMessage 사용)
     */
    public void publishRandomQuiz(String roomId) {
        Pageable pageable = PageRequest.of(0, 1);
        List<ShortAnswerQuiz> list = quizRepository.findRandomQuiz(pageable);
        if (list.isEmpty()) {
            return;
        }

        ShortAnswerQuiz quiz = list.get(0);
        activeQuizMap.put(roomId, quiz);
        firstCorrectAnswerMap.remove(roomId);

        EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.QUIZ,
                roomId,
                Map.of("quizId", quiz.getQuizId(), "question", quiz.getShortQuestion())
        );

        publishToRoom(roomId, message);

        // 단답형 퀴즈의 경우 QuizMode.SHORT_ANSWER 로 타이머 시작 (타임 제한 20초)
        quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.SHORT_ANSWER);
    }

    /**
     * (2) 현재 활성 퀴즈 힌트 발행 → "topic/game/{roomId}"
     */
    public void publishQuizHint(String roomId) {
        ShortAnswerQuiz quiz = activeQuizMap.get(roomId);
        if (quiz == null) {
            return;
        }

        EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.QUIZ_HINT,
                roomId,
                Map.of("hint1", quiz.getShortFirstHint(), "hint2", quiz.getShortSecondHint())
        );

        publishToRoom(roomId, message);
    }

    /**
     * (3) 정답 체크 및 결과 발행 → "topic/game/{roomId}"
     */
    public void checkQuizAnswer(String roomId, String userAnswer, Long memberId) {
        ShortAnswerQuiz quiz = activeQuizMap.get(roomId);
        if (quiz == null) {
            return;
        }

        boolean isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());

        EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
                EventType.QUIZ_RESULT,
                roomId,
                Map.of("quizId", quiz.getQuizId(), "result", isCorrect ? "정답입니다" : "오답입니다", "memberId", memberId)
        );

        publishToRoom(roomId, resultMessage);

        // 첫 정답자는 라이프 유지, 나머지는 -1 처리
        if (isCorrect && !firstCorrectAnswerMap.containsKey(roomId)) {
            firstCorrectAnswerMap.put(roomId, memberId);
            updateUserLives(roomId, memberId);
        }

        // 정답이면 퀴즈 제거
        if (isCorrect) {
            activeQuizMap.remove(roomId);
            firstCorrectAnswerMap.remove(roomId);
        }
    }

    /**
     * (4) 멤버들의 라이프 업데이트 → WebSocket으로 반영
     */
    private void updateUserLives(String roomId, Long correctMemberId) {
        String usersKey = "room:" + roomId + ":users";
        String jsonArray = (String) redisTemplate.opsForValue().get(usersKey);

        if (jsonArray == null) {
            return;
        }

        try {
            List<MemberStatus> userStatusList = objectMapper.readValue(
                    jsonArray,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, MemberStatus.class)
            );

            // 정답자를 제외한 모든 유저의 life를 -1 처리
            for (MemberStatus ms : userStatusList) {
                if (ms.getMemberId() != correctMemberId) {
                    ms.setLife(ms.getLife() - 1);
                }
            }

            redisTemplate.opsForValue().set(usersKey, objectMapper.writeValueAsString(userStatusList));

            EventMessage<List<MemberStatus>> userStatusMessage = new EventMessage<>(
                    EventType.USER_STATUS, roomId, userStatusList
            );
            publishToRoom(roomId, userStatusMessage);

        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    /**
     * (5) WebSocket + Redis를 통한 메시지 발행 → "topic/game/{roomId}"
     */
    private void publishToRoom(String roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }
}
