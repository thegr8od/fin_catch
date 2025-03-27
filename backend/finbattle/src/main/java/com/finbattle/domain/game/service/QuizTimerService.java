package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.GameMemberStatus;
import com.finbattle.domain.game.model.GameData;
import com.finbattle.domain.game.repository.RedisGameRepository;
import com.finbattle.domain.quiz.dto.EssayQuizDto;
import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
import com.finbattle.domain.quiz.dto.QuizDto;
import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
import com.finbattle.global.common.redis.RedisPublisher;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizTimerService {

    private final RedisGameRepository redisGameRepository;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(15);
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<Long, List<ScheduledFuture<?>>> quizTasks = new ConcurrentHashMap<>();

    //게임 시작
    public void startQuizTimer(Long roomId, Long quizId, QuizMode quizMode, QuizDto quizDto) {
        //게임 시간 찾기
        int timeLimit = getTimeLimit(quizMode);

        int firstHintDelay = timeLimit / 3;
        int secondHintDelay = (timeLimit * 2) / 3;

        log.info("Starting quiz timer for quizId {} in room {} with a limit of {} seconds", quizId,
            roomId, timeLimit);

        //스케줄러 시작
        ScheduledFuture<?> timeoutTask = scheduler.schedule(
            () -> handleTimeout(roomId, quizId, quizMode), timeLimit,
            TimeUnit.SECONDS);
        ScheduledFuture<?> hint1Task = scheduler.schedule(
            () -> sendHint(roomId, quizMode, quizDto, true), firstHintDelay,
            TimeUnit.SECONDS);
        ScheduledFuture<?> hint2Task = scheduler.schedule(
            () -> sendHint(roomId, quizMode, quizDto, false), secondHintDelay,
            TimeUnit.SECONDS);

        quizTasks.put(roomId, List.of(timeoutTask, hint1Task, hint2Task));
    }

    private void sendHint(Long roomId, QuizMode quizMode, Object quizDto, boolean isFirstHint) {
        Integer hintKey = isFirstHint ? 1 : 2;
        String hintValue = "";

        try {
            switch (quizMode) {
                case SHORT_ANSWER:
                    ShortAnswerQuizDto shortQuiz = (ShortAnswerQuizDto) quizDto;
                    hintValue = hintKey.equals(1) ? shortQuiz.getShortFirstHint()
                        : shortQuiz.getShortSecondHint();
                    break;

                case MULTIPLE_CHOICE:
                    MultipleChoiceQuizDto multipleQuiz = (MultipleChoiceQuizDto) quizDto;
                    hintValue = hintKey.equals(1) ? multipleQuiz.getMultipleFirstHint()
                        : multipleQuiz.getMultipleSecondHint();
                    break;

                case ESSAY:
                    EssayQuizDto essayQuiz = (EssayQuizDto) quizDto;
                    hintValue = hintKey.equals(1) ? essayQuiz.getEssayFirstHint()
                        : essayQuiz.getEssaySecondHint();
                    break;

                default:
                    throw new IllegalArgumentException("지원되지 않는 퀴즈 모드: " + quizMode);
            }

            EventMessage<Map<String, Object>> hintMessage = new EventMessage<>(
                isFirstHint ? EventType.FIRST_HINT : EventType.SECOND_HINT,
                roomId,
                Map.of(
                    "type", hintKey,
                    "hint", hintValue
                )
            );
            publishToRoom(roomId, hintMessage);

        } catch (Exception e) {
            log.error("❌ 힌트 전송 실패: {}", e.getMessage());
        }
    }

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

    private void handleTimeout(Long roomId, Long quizId, QuizMode quizMode) {
        log.info("Quiz timeout reached for quizId {} in room {} (mode: {})", quizId, roomId,
            quizMode);

        GameData gameData = redisGameRepository.findById(roomId).orElse(null);

        if (gameData == null) {
            log.warn("🚨 No user status found for room: {}", roomId);
            return;
        }

        // 사용자 상태 조회
        List<GameMemberStatus> userList = gameData.getGameMemberStatusList();

        // 모든 사용자 라이프 1 감소
        boolean anyLifeZero = false;
        for (GameMemberStatus user : userList) {
            int newLife = Math.max(0, user.getLife() - 1);
            user.setLife(newLife);
            if (newLife == 0) {
                anyLifeZero = true;
            }
        }

        // 업데이트된 사용자 상태 저장
        gameData.setQuizNum(gameData.getQuizNum() + 1);
        redisGameRepository.save(gameData);

        // 사용자 상태 전파 (내부 메서드 호출)
        publishUserStatus(roomId);

        // 라이프 0인 사용자가 있으면 게임 종료, 없으면 다음 퀴즈 타이머 시작
        if (anyLifeZero) {
            endGame(roomId, userList);
        }
    }

    private void endGame(Long roomId, List<GameMemberStatus> userList) {
        // 게임 종료 이벤트 전파 (사용자 상태 포함)
        EventMessage<List<GameMemberStatus>> endMessage = new EventMessage<>(EventType.GAME_INFO,
            roomId, userList);
        endMessage.setData(userList); // 결과 표시를 위해 사용자 상태 전송
        publishToRoom(roomId, endMessage);
        log.info("✅ Game ended in room {} due to a player reaching 0 life", roomId);

        // 게임 종료 시 Redis에 저장된 방 정보 삭제
        redisGameRepository.deleteById(roomId);
        log.info("✅ Redis data for room {} has been deleted", roomId);
    }

    public void cancelQuizTasks(Long roomId) {
        List<ScheduledFuture<?>> tasks = quizTasks.remove(roomId);
        if (tasks != null) {
            for (ScheduledFuture<?> task : tasks) {
                task.cancel(false); // true면 실행 중이라도 강제 중단
            }
        }
    }

    private void publishToRoom(Long roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    // GameService에 있던 사용자 상태 전파 메서드를 복사하여 사용
    public void publishUserStatus(Long roomId) {
        GameData gameData = redisGameRepository.findById(roomId).orElse(null);
        if (gameData == null) {
            log.warn("🚨 publishUserStatus: room:{}에 멤버 상태가 없습니다.", roomId);
            return;
        }
        List<GameMemberStatus> userList = gameData.getGameMemberStatusList();
        EventMessage<List<GameMemberStatus>> message = new EventMessage<>(EventType.USER_STATUS,
            roomId, userList);
        publishToRoom(roomId, message);
        log.info("🚀 UserStatus 전송 -> {}", message);
    }
}