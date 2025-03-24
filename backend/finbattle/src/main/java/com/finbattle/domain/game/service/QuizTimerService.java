package com.finbattle.domain.game.service;

import com.finbattle.domain.quiz.model.QuizMode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class QuizTimerService {

    // 테스트 환경에 맞게 풀 사이즈 조절 가능
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(5);

    /**
     * 퀴즈 타이머를 시작합니다.
     *
     * @param roomId   퀴즈가 진행되는 방의 ID
     * @param quizId   해당 퀴즈의 ID
     * @param quizMode 퀴즈 유형 (타임 제한에 따라 달라짐)
     */
    public void startQuizTimer(String roomId, Long quizId, QuizMode quizMode) {
        int timeLimit = getTimeLimit(quizMode);
        log.info("Starting quiz timer for quizId {} in room {} with a limit of {} seconds", quizId, roomId, timeLimit);
        scheduler.schedule(() -> handleTimeout(roomId, quizId, quizMode), timeLimit, TimeUnit.SECONDS);
    }

    /**
     * 퀴즈 유형에 따른 타임 제한 값을 반환합니다.
     */
    private int getTimeLimit(QuizMode quizMode) {
        switch (quizMode) {
            case SHORT_ANSWER:
                return 20;
            case MULTIPLE_CHOICE:
                return 10;
            case ESSAY:
                return 40;
            default:
                throw new IllegalArgumentException("Unsupported quiz mode: " + quizMode);
        }
    }

    /**
     * 타임아웃 시 처리 로직 (예: 정답 제출이 없을 경우 타임아웃 이벤트 전파)
     */
    private void handleTimeout(String roomId, Long quizId, QuizMode quizMode) {
        log.info("Quiz timeout reached for quizId {} in room {} (mode: {})", quizId, roomId, quizMode);
        // 예시: RedisPublisher를 이용하여 타임아웃 이벤트 전파 또는 WebSocket을 통해 클라이언트에게 알림
        // redisPublisher.publish("game:" + roomId, timeoutEventPayload);
    }
}
