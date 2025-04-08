package com.finbattle.domain.game.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.domain.ai.service.EssayAiScoringService;
import com.finbattle.domain.game.dto.EventMessage;
import com.finbattle.domain.game.dto.EventType;
import com.finbattle.domain.game.dto.GameMemberStatus;
import com.finbattle.domain.game.model.EssayCorrected;
import com.finbattle.domain.game.model.GameData;
import com.finbattle.domain.game.repository.RedisGameRepository;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.domain.quiz.dto.EssayQuizDto;
import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
import com.finbattle.domain.quiz.model.QuizLog;
import com.finbattle.domain.quiz.model.QuizMode;
import com.finbattle.domain.quiz.repository.QuizLogRepository;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.repository.RoomRepository;
import com.finbattle.global.common.redis.RedisPublisher;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final RedisGameRepository redisGameRepository;
    private final RedisPublisher redisPublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final QuizTimerService quizTimerService;
    private final EssayAiScoringService essayAiScoringService;
    private final RoomRepository roomRepository;
    private final QuizLogRepository quizLogRepository;
    private final MemberRepository memberRepository;

    private final Map<Long, LocalDateTime> lastAnswerMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(100);

    public void startAutoGame(Long roomId) {
        if (!canStartGame(roomId)) {
            return;
        }
        askNextQuiz(roomId);
    }

    private boolean canStartGame(Long roomId) {
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("GameData not found! roomId=" + roomId));
        boolean dead = gameData.getGameMemberStatusList().stream().anyMatch(m -> m.getLife() <= 0);
        if (dead) {
            endGame(roomId);
            return false;
        }
        if (quizTimerService.hasQuizTask(roomId)) {
            return false;
        }
        return true;
    }

    private void askNextQuiz(Long roomId) {
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("No GameData for roomId=" + roomId));

        if (isSomebodyDead(gameData)) {
            endGame(roomId);
            return;
        }
        List<Integer> remaining = new ArrayList<>();
        int quizNum = (gameData.getQuizNum() == null) ? 1 : gameData.getQuizNum();
        for (int i = 1; i <= 9; i++) {
            if ((quizNum & (1 << i)) == 0) {
                remaining.add(i);
            }
        }
        if (remaining.isEmpty()) {
            endGame(roomId);
            return;
        }
        int selectedQuizNum = remaining.get((int) (Math.random() * remaining.size()));
        quizNum |= (1 << selectedQuizNum);
        gameData.setQuizNum(quizNum);
        gameData.setCurrentQuizNum(selectedQuizNum);
        redisGameRepository.save(gameData);

        publishQuiz(roomId, selectedQuizNum, gameData);
    }

    private boolean isSomebodyDead(GameData gameData) {
        return gameData.getGameMemberStatusList().stream().anyMatch(m -> m.getLife() <= 0);
    }

    private void publishQuiz(Long roomId, int quizIndex, GameData gameData) {
        if (quizIndex >= 1 && quizIndex <= 5) {
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizIndex - 1);
            EventMessage<Map<String, Object>> msg = new EventMessage<>(
                EventType.MULTIPLE_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getMultipleQuestion(),
                    "options", quiz.getQuizOptions()
                )
            );
            publishToGame(roomId, msg);
            quizTimerService.startQuizTimerWithCallback(
                roomId,
                quiz.getQuizId(),
                QuizMode.MULTIPLE_CHOICE,
                quiz,
                () -> {
                    handleTimeoutOrEnd(roomId);
                }
            );

        } else if (quizIndex >= 6 && quizIndex <= 8) {
            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(quizIndex - 6);
            EventMessage<Map<String, Object>> msg = new EventMessage<>(
                EventType.SHORT_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getShortQuestion()
                )
            );
            publishToGame(roomId, msg);
            quizTimerService.startQuizTimerWithCallback(
                roomId,
                quiz.getQuizId(),
                QuizMode.SHORT_ANSWER,
                quiz,
                () -> {
                    handleTimeoutOrEnd(roomId);
                }
            );

        } else if (quizIndex == 9) {
            EssayQuizDto quiz = gameData.getEssayQuiz();
            EventMessage<Map<String, Object>> msg = new EventMessage<>(
                EventType.ESSAY_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getEssayQuestion()
                )
            );
            publishToGame(roomId, msg);
            quizTimerService.startQuizTimerWithCallback(
                roomId,
                quiz.getQuizId(),
                QuizMode.ESSAY,
                quiz,
                () -> {
                    handleTimeoutOrEnd(roomId);
                }
            );
        }
    }

    private void handleTimeoutOrEnd(Long roomId) {
        askNextQuiz(roomId);
    }

    public void checkQuizAnswer(Long roomId, String userAnswer, Long memberId) {
        if (!quizTimerService.hasQuizTask(roomId)) {
            return;
        }
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 없습니다."));
        String nickname = gameData.getGameMemberStatusList().stream()
            .filter(member -> member.getMemberId() == memberId).map(GameMemberStatus::getNickname)
            .findFirst().orElse(null);
        int quizNum = gameData.getCurrentQuizNum();
        boolean isCorrect = false;
        Long quizId = null;

        if (quizNum >= 1 && quizNum <= 5) {
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizNum - 1);
            quizId = quiz.getQuizId();
            boolean isNumericAnswer = userAnswer.matches("[1-4]");
            String resultMessageText;
            if (isNumericAnswer) {
                LocalDateTime now = LocalDateTime.now();

                if (lastAnswerMap.containsKey(memberId)) {
                    LocalDateTime last = lastAnswerMap.get(memberId);
                    if (Duration.between(last, now).toMillis() < 2000) {
                        log.warn("❗ Too fast answer from memberId={}", memberId);
                        return; // 2초 안에 또 입력하면 무시
                    }
                }

                lastAnswerMap.put(memberId, now);

                int ans = Integer.parseInt(userAnswer);
                isCorrect = quiz.getQuizOptions().stream()
                    .anyMatch(option -> option.getOptionNumber() == ans && option.isCorrect());
                resultMessageText = isCorrect ? "정답입니다" : "오답입니다";
                if (isCorrect) {
                    quizTimerService.cancelQuizTasks(roomId);
                }
            } else {
                resultMessageText = userAnswer;
            }
            EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
                EventType.QUIZ_RESULT,
                roomId,
                Map.of(
                    "quizId", quizId,
                    "result", resultMessageText,
                    "sender", nickname
                )
            );
            publishToGame(roomId, resultMessage);
            QuizLog log = QuizLog.builder()
                .memberId(memberId)
                .quizId(quizId)
                .userAnswer(userAnswer)
                .isCorrect(isCorrect)
                .build();
            quizLogRepository.save(log);
            if (isCorrect) {
                for (GameMemberStatus member : gameData.getGameMemberStatusList()) {
                    lastAnswerMap.remove(member.getMemberId());
                }
                quizTimerService.cancelQuizTasks(roomId);
                updateUserLives(gameData, memberId);
                scheduler.schedule(() -> askNextQuiz(roomId), 2300, TimeUnit.MILLISECONDS);
            }

        } else if (quizNum >= 6 && quizNum <= 8) {
            int index = quizNum - 6;
            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(index);
            quizId = quiz.getQuizId();
            isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());
            EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
                EventType.QUIZ_RESULT,
                roomId,
                Map.of(
                    "quizId", quizId,
                    "result", isCorrect ? "정답입니다" : userAnswer,
                    "sender", nickname
                )
            );
            publishToGame(roomId, resultMessage);
            QuizLog log = QuizLog.builder()
                .memberId(memberId)
                .quizId(quizId)
                .userAnswer(userAnswer)
                .isCorrect(isCorrect)
                .build();
            quizLogRepository.save(log);
            if (isCorrect) {
                quizTimerService.cancelQuizTasks(roomId);
                updateUserLives(gameData, memberId);
                scheduler.schedule(() -> askNextQuiz(roomId), 2300, TimeUnit.MILLISECONDS);
            }

        } else if (quizNum == 9) {
            EssayQuizDto quiz = gameData.getEssayQuiz();
            List<EssayCorrected> correcteds = gameData.getEssayCorrectedList();
            for (EssayCorrected corrected : correcteds) {
                if (corrected.getMemberId() == memberId) {
                    return;
                }
            }
            quizId = quiz.getQuizId();
            int score = essayAiScoringService.scoreEssayAnswer(quiz.getEssayQuestion(), userAnswer);
            isCorrect = score >= 70;
            Map<String, Object> essayResult = Map.of(
                "quizId", quizId,
                "score", score,
                "sender", nickname
            );
            EventMessage<Map<String, Object>> essayResultMessage = new EventMessage<>(
                EventType.QUIZ_RESULT,
                roomId,
                essayResult
            );
            publishToGame(roomId, essayResultMessage);
            QuizLog log = QuizLog.builder()
                .memberId(memberId)
                .quizId(quizId)
                .userAnswer(userAnswer)
                .isCorrect(isCorrect)
                .build();
            quizLogRepository.save(log);
            if (isCorrect) {
                correcteds.add(new EssayCorrected(memberId, score, LocalDateTime.now()));
                redisGameRepository.save(gameData);
                if (correcteds.size() >= 2) {
                    quizTimerService.cancelQuizTasks(roomId);
                    updateUserLives(gameData, memberId);
                    scheduler.schedule(() -> askNextQuiz(roomId), 2300, TimeUnit.MILLISECONDS);
                }
            }
        }
    }

    private void updateUserLives(GameData gameData, Long targetMemberId) {
        List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
        if (memberList == null) {
            return;
        }
        Long attackedMemberId = -1L;
        if (gameData.getCurrentQuizNum() == 9 && !gameData.getEssayCorrectedList().isEmpty()) {
            EssayCorrected m1 = gameData.getEssayCorrectedList().get(0);
            EssayCorrected m2 = gameData.getEssayCorrectedList().get(1);
            if (m1.getScore() > m2.getScore()) {
                for (GameMemberStatus m : memberList) {
                    if (m.getMemberId() == m2.getMemberId()) {
                        attackedMemberId = m.getMemberId();
                        m.setLife(Math.max(0, m.getLife() - 1));
                        break;
                    }
                }
            } else if (m1.getScore() < m2.getScore()) {
                for (GameMemberStatus m : memberList) {
                    if (m.getMemberId() == m1.getMemberId()) {
                        attackedMemberId = m.getMemberId();
                        m.setLife(Math.max(0, m.getLife() - 1));
                        break;
                    }
                }
            } else {
                if (m1.getCreatedAt().isAfter(m2.getCreatedAt())) {
                    for (GameMemberStatus m : memberList) {
                        if (m.getMemberId() == m2.getMemberId()) {
                            attackedMemberId = m.getMemberId();
                            m.setLife(Math.max(0, m.getLife() - 1));
                            break;
                        }
                    }
                } else {
                    for (GameMemberStatus m : memberList) {
                        if (m.getMemberId() == m1.getMemberId()) {
                            attackedMemberId = m.getMemberId();
                            m.setLife(Math.max(0, m.getLife() - 1));
                            break;
                        }
                    }
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
            publishToGame(gameData.getRoomId(), userStatusMessage);
            return;
        }
        for (GameMemberStatus ms : memberList) {
            if (ms.getMemberId() != targetMemberId) {
                attackedMemberId = ms.getMemberId();
                ms.setLife(Math.max(0, ms.getLife() - 1));
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
        publishToGame(gameData.getRoomId(), userStatusMessage);
    }

    public void endGame(Long roomId) {
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("해당 roomId의 GameData가 없습니다."));
        long winnerId = -1L;
        long loserId = -1L;
        GameMemberStatus member1 = gameData.getGameMemberStatusList().get(0);
        GameMemberStatus member2 = gameData.getGameMemberStatusList().get(1);

        if (member1.getLife() > member2.getLife()) {
            winnerId = member1.getMemberId();
            loserId = -1L;
        } else if (member2.getLife() > member1.getLife()) {
            winnerId = member2.getMemberId();
            loserId = member1.getMemberId();
        }
        if (winnerId != -1L) {
            memberRepository.findByMemberId(winnerId).ifPresent(member -> {
                member.setPoint(member.getPoint() + 300);
                memberRepository.save(member);
            });
            memberRepository.findByMemberId(loserId).ifPresent(member -> {
                member.setPoint(member.getPoint() + 100);
                memberRepository.save(member);
            });
        } else {
            for (GameMemberStatus m : gameData.getGameMemberStatusList()) {
                memberRepository.findByMemberId(m.getMemberId()).ifPresent(member -> {
                    member.setPoint(member.getPoint() + 100);
                    memberRepository.save(member);
                });
            }
        }
        redisGameRepository.deleteById(roomId);
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        room.setStatus(RoomStatus.CLOSED);
        roomRepository.save(room);
        Map<String, Object> data = Map.of(
            "winner", winnerId,
            "loser", loserId
        );
        EventMessage<Map<String, Object>> message = new EventMessage<>(EventType.REWARD, roomId,
            data);
        publishToGame(roomId, message);
    }

    private void publishToGame(Long roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }
}

