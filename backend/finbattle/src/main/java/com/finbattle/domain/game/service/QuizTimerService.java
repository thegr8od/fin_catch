//package com.finbattle.domain.game.service;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.finbattle.domain.game.dto.EventMessage;
//import com.finbattle.domain.game.dto.EventType;
//import com.finbattle.domain.game.dto.GameMemberStatus;
//import com.finbattle.domain.game.model.EssayCorrected;
//import com.finbattle.domain.game.model.GameData;
//import com.finbattle.domain.game.repository.RedisGameRepository;
//import com.finbattle.domain.quiz.dto.EssayQuizDto;
//import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
//import com.finbattle.domain.quiz.dto.QuizDto;
//import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
//import com.finbattle.domain.quiz.model.QuizMode;
//import com.finbattle.global.common.redis.RedisPublisher;
//import java.util.List;
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
//import java.util.concurrent.Executors;
//import java.util.concurrent.ScheduledExecutorService;
//import java.util.concurrent.ScheduledFuture;
//import java.util.concurrent.TimeUnit;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class QuizTimerService {
//
//    private final RedisGameRepository redisGameRepository;
//    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(100);
//    private final RedisPublisher redisPublisher;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//    private final Map<Long, List<ScheduledFuture<?>>> quizTasks = new ConcurrentHashMap<>();
//
//    //게임 시작
//    public void startQuizTimer(Long roomId, Long quizId, QuizMode quizMode, QuizDto quizDto) {
//        //게임 시간 찾기
//        int timeLimit = getTimeLimit(quizMode);
//
//        int firstHintDelay = timeLimit / 3;
//        int secondHintDelay = (timeLimit * 2) / 3;
//
//        log.info("Starting quiz timer for quizId {} in room {} with a limit of {} seconds", quizId,
//            roomId, timeLimit);
//
//        //스케줄러 시작
//        ScheduledFuture<?> timeoutTask = scheduler.schedule(
//            () -> handleTimeout(roomId, quizId, quizMode), timeLimit,
//            TimeUnit.SECONDS);
//        ScheduledFuture<?> hint1Task = scheduler.schedule(
//            () -> sendHint(roomId, quizMode, quizDto, true), firstHintDelay,
//            TimeUnit.SECONDS);
//        ScheduledFuture<?> hint2Task = scheduler.schedule(
//            () -> sendHint(roomId, quizMode, quizDto, false), secondHintDelay,
//            TimeUnit.SECONDS);
//
//        quizTasks.put(roomId, List.of(timeoutTask, hint1Task, hint2Task));
//    }
//
//    private void sendHint(Long roomId, QuizMode quizMode, Object quizDto, boolean isFirstHint) {
//        Integer hintKey = isFirstHint ? 1 : 2;
//        String hintValue = "";
//
//        try {
//            switch (quizMode) {
//                case SHORT_ANSWER:
//                    ShortAnswerQuizDto shortQuiz = (ShortAnswerQuizDto) quizDto;
//                    hintValue = hintKey.equals(1) ? shortQuiz.getShortFirstHint()
//                        : shortQuiz.getShortSecondHint();
//                    break;
//
//                case MULTIPLE_CHOICE:
//                    MultipleChoiceQuizDto multipleQuiz = (MultipleChoiceQuizDto) quizDto;
//                    hintValue = hintKey.equals(1) ? multipleQuiz.getMultipleFirstHint()
//                        : multipleQuiz.getMultipleSecondHint();
//                    break;
//
//                case ESSAY:
//                    EssayQuizDto essayQuiz = (EssayQuizDto) quizDto;
//                    hintValue = hintKey.equals(1) ? essayQuiz.getEssayFirstHint()
//                        : essayQuiz.getEssaySecondHint();
//                    break;
//
//                default:
//                    throw new IllegalArgumentException("지원되지 않는 퀴즈 모드: " + quizMode);
//            }
//
//            EventMessage<Map<String, Object>> hintMessage = new EventMessage<>(
//                isFirstHint ? EventType.FIRST_HINT : EventType.SECOND_HINT,
//                roomId,
//                Map.of(
//                    "type", hintKey,
//                    "hint", hintValue
//                )
//            );
//            publishToRoom(roomId, hintMessage);
//
//        } catch (Exception e) {
//            log.error("❌ 힌트 전송 실패: {}", e.getMessage());
//        }
//    }
//
//    private int getTimeLimit(QuizMode quizMode) {
//        switch (quizMode) {
//            case SHORT_ANSWER:
//                return 20;
//            case MULTIPLE_CHOICE:
//                return 10;
//            case ESSAY:
//                return 40;
//            default:
//                throw new IllegalArgumentException("Unsupported quiz mode: " + quizMode);
//        }
//    }
//
//    public int getTimeLimitByQuizNum(int quizNum) {
//        if (quizNum >= 1 && quizNum <= 5) {
//            return 10;
//        } else if (quizNum >= 6 && quizNum <= 8) {
//            return 20;
//        }
//        return 40;
//    }
//
//    private void handleTimeout(Long roomId, Long quizId, QuizMode quizMode) {
//        log.info("Quiz timeout reached for quizId {} in room {} (mode: {})", quizId, roomId,
//            quizMode);
//
//        GameData gameData = redisGameRepository.findById(roomId).orElse(null);
//
//        if (gameData == null) {
//            log.warn("🚨 No user status found for room: {}", roomId);
//            return;
//        }
//
//        //서술형 별도 처리
//        if (gameData.getCurrentQuizNum() == 9 && !gameData.getEssayCorrectedList().isEmpty()) {
//            EssayCorrected corrected = gameData.getEssayCorrectedList().get(0);
//
//            Long attackedMemberId = -1L;
//
//            List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
//            for (GameMemberStatus m : memberList) {
//                if (m.getMemberId() != corrected.getMemberId()) {
//                    attackedMemberId = m.getMemberId();
//                    m.setLife(Math.max(0, m.getLife() - 1));
//                    break;
//                }
//            }
//
//            redisGameRepository.save(gameData);
//
//            Map<String, Object> data = Map.of(
//                "attackedMemberId", attackedMemberId,
//                "memberList", memberList
//            );
//
//            EventMessage<Map<String, Object>> userStatusMessage = new EventMessage<>(
//                EventType.ONE_ATTACK, gameData.getRoomId(), data
//            );
//
//            publishToRoom(roomId, userStatusMessage);
//
//            return;
//        }
//
//        // 사용자 상태 조회
//        List<GameMemberStatus> userList = gameData.getGameMemberStatusList();
//
//        // 모든 사용자 라이프 1 감소
//        for (GameMemberStatus user : userList) {
//            int newLife = Math.max(0, user.getLife() - 1);
//            user.setLife(newLife);
//        }
//
//        log.info("바뀐 life: {}", gameData.getGameMemberStatusList().get(0).getLife());
//
//        // 업데이트된 사용자 상태 저장
//        redisGameRepository.save(gameData);
//
//        // 사용자 상태 전파 (내부 메서드 호출)
//        publishUserStatus(roomId);
//
//    }
//
//    public void cancelQuizTasks(Long roomId) {
//        List<ScheduledFuture<?>> tasks = quizTasks.remove(roomId);
//        if (tasks != null) {
//            for (ScheduledFuture<?> task : tasks) {
//                task.cancel(false); // true면 실행 중이라도 강제 중단
//            }
//        }
//    }
//
//    public boolean hasQuizTask(Long roomId) {
//        return quizTasks.containsKey(roomId);
//    }
//
//    private void publishToRoom(Long roomId, EventMessage<?> message) {
//        try {
//            String jsonMessage = objectMapper.writeValueAsString(message);
//            redisPublisher.publish("game:" + roomId, jsonMessage);
//            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
//        } catch (JsonProcessingException e) {
//            log.error("❌ JSON 변환 실패: {}", e.getMessage());
//        }
//    }
//
//    // GameService에 있던 사용자 상태 전파 메서드를 복사하여 사용
//    public void publishUserStatus(Long roomId) {
//        GameData gameData = redisGameRepository.findById(roomId).orElse(null);
//        if (gameData == null) {
//            log.warn("🚨 publishUserStatus: room:{}에 멤버 상태가 없습니다.", roomId);
//            return;
//        }
//        List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
//        EventMessage<List<GameMemberStatus>> message = new EventMessage<>(EventType.TWO_ATTACK,
//            roomId, memberList);
//        publishToRoom(roomId, message);
//        log.info("🚀 UserStatus 전송 -> {}", message);
//    }
//}

package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.GameMemberStatus;
import com.finbattle.domain.game.model.EssayCorrected;
import com.finbattle.domain.game.model.GameData;
import com.finbattle.domain.game.repository.RedisGameRepository;
import com.finbattle.domain.quiz.dto.EssayQuizDto;
import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
import com.finbattle.domain.quiz.dto.QuizDto;
import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
import com.finbattle.domain.quiz.model.QuizMode;
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
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(100);
    private final Map<Long, List<ScheduledFuture<?>>> quizTasks = new ConcurrentHashMap<>();

    public void startQuizTimerWithCallback(
        Long roomId,
        Long quizId,
        QuizMode quizMode,
        QuizDto quizDto,
        Runnable onTimeout
    ) {
        int timeLimit = getTimeLimit(quizMode);
        int firstHintDelay = timeLimit / 3;
        int secondHintDelay = (timeLimit * 2) / 3;

        ScheduledFuture<?> timeoutTask = scheduler.schedule(
            () -> {
                handleTimeout(roomId, quizId, quizMode);
                onTimeout.run();
            },
            timeLimit,
            TimeUnit.SECONDS
        );
        ScheduledFuture<?> hint1Task = scheduler.schedule(
            () -> sendHint(roomId, quizMode, quizDto, true),
            firstHintDelay,
            TimeUnit.SECONDS
        );
        ScheduledFuture<?> hint2Task = scheduler.schedule(
            () -> sendHint(roomId, quizMode, quizDto, false),
            secondHintDelay,
            TimeUnit.SECONDS
        );
        quizTasks.put(roomId, List.of(timeoutTask, hint1Task, hint2Task));
    }

    private void sendHint(Long roomId, QuizMode quizMode, Object quizDto, boolean isFirstHint) {
        Integer hintKey = isFirstHint ? 1 : 2;
        String hintValue = "";
        try {
            switch (quizMode) {
                case SHORT_ANSWER:
                    ShortAnswerQuizDto shortQuiz = (ShortAnswerQuizDto) quizDto;
                    hintValue = isFirstHint ? shortQuiz.getShortFirstHint()
                        : shortQuiz.getShortSecondHint();
                    break;
                case MULTIPLE_CHOICE:
                    MultipleChoiceQuizDto multipleQuiz = (MultipleChoiceQuizDto) quizDto;
                    hintValue = isFirstHint ? multipleQuiz.getMultipleFirstHint()
                        : multipleQuiz.getMultipleSecondHint();
                    break;
                case ESSAY:
                    EssayQuizDto essayQuiz = (EssayQuizDto) quizDto;
                    hintValue = isFirstHint ? essayQuiz.getEssayFirstHint()
                        : essayQuiz.getEssaySecondHint();
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported quiz mode: " + quizMode);
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
        GameData gameData = redisGameRepository.findById(roomId).orElse(null);
        if (gameData == null) {
            return;
        }
        if (gameData.getCurrentQuizNum() == 9 && !gameData.getEssayCorrectedList().isEmpty()) {
            EssayCorrected corrected = gameData.getEssayCorrectedList().get(0);
            Long attackedMemberId = -1L;
            List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
            for (GameMemberStatus m : memberList) {
                if (m.getMemberId() != corrected.getMemberId()) {
                    attackedMemberId = m.getMemberId();
                    m.setLife(Math.max(0, m.getLife() - 1));
                    break;
                }
            }
            redisGameRepository.save(gameData);
            Map<String, Object> data = Map.of(
                "attackedMemberId", attackedMemberId,
                "memberList", memberList
            );
            EventMessage<Map<String, Object>> userStatusMessage = new EventMessage<>(
                EventType.ONE_ATTACK, gameData.getRoomId(), data
            );
            publishToRoom(roomId, userStatusMessage);
            return;
        }
        List<GameMemberStatus> userList = gameData.getGameMemberStatusList();
        for (GameMemberStatus user : userList) {
            int newLife = Math.max(0, user.getLife() - 1);
            user.setLife(newLife);
        }
        redisGameRepository.save(gameData);
        publishUserStatus(roomId);
    }

    public void cancelQuizTasks(Long roomId) {
        List<ScheduledFuture<?>> tasks = quizTasks.remove(roomId);
        if (tasks != null) {
            for (ScheduledFuture<?> task : tasks) {
                task.cancel(false);
            }
        }
    }

    public boolean hasQuizTask(Long roomId) {
        return quizTasks.containsKey(roomId);
    }

    private void publishToRoom(Long roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }

    public void publishUserStatus(Long roomId) {
        GameData gameData = redisGameRepository.findById(roomId).orElse(null);
        if (gameData == null) {
            return;
        }
        List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
        EventMessage<List<GameMemberStatus>> message = new EventMessage<>(EventType.TWO_ATTACK,
            roomId, memberList);
        publishToRoom(roomId, message);
    }
}
