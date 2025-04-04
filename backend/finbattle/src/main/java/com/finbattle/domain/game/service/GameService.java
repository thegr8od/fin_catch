//package com.finbattle.domain.game.service;
//
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.finbattle.domain.ai.service.EssayAiScoringService;
//import com.finbattle.domain.game.dto.EventMessage;
//import com.finbattle.domain.game.dto.EventType;
//import com.finbattle.domain.game.dto.GameMemberStatus;
//import com.finbattle.domain.game.model.EssayCorrected;
//import com.finbattle.domain.game.model.GameData;
//import com.finbattle.domain.game.repository.RedisGameRepository;
//import com.finbattle.domain.member.repository.MemberRepository;
//import com.finbattle.domain.quiz.dto.EssayQuizDto;
//import com.finbattle.domain.quiz.dto.MultipleChoiceQuizDto;
//import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
//import com.finbattle.domain.quiz.model.QuizLog;
//import com.finbattle.domain.quiz.model.QuizMode;
//import com.finbattle.domain.quiz.repository.QuizLogRepository;
//import com.finbattle.domain.room.dto.RoomStatus;
//import com.finbattle.domain.room.model.Room;
//import com.finbattle.domain.room.repository.RoomRepository;
//import com.finbattle.global.common.redis.RedisPublisher;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//
//@Slf4j
//@Service
//@RequiredArgsConstructor
//public class GameService {
//
//    private final RedisGameRepository redisGameRepository;
//    private final RedisPublisher redisPublisher;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//    private final QuizTimerService quizTimerService; // 타이머 서비스 주입
//    private final EssayAiScoringService essayAiScoringService; // AI 채점 서비스 주입
//    private final RoomRepository roomRepository;
//    private final QuizLogRepository quizLogRepository;
//    private final MemberRepository memberRepository;
//
//    private final Map<Long, Thread> roomThreadMap = new ConcurrentHashMap<>();
//
//    public void startAutoGame(Long roomId) {
//        // 이미 게임이 진행 중인지, 라이프 0이 있는지 등의 체크
//        if (!canStartGame(roomId)) {
//            return;
//        }
//
//        // 새 스레드로 실행 (메인 스레드 블로킹 방지)
//        Thread gameThread = new Thread(() -> runGameLoop(roomId));
//
//        roomThreadMap.put(roomId, gameThread);
//
//        gameThread.start();
//    }
//
//    private boolean canStartGame(Long roomId) {
//        GameData gameData = redisGameRepository.findById(roomId)
//            .orElseThrow(() -> new RuntimeException("GameData not found! roomId=" + roomId));
//        // 누군가 라이프 0인가?
//        boolean dead = gameData.getGameMemberStatusList().stream().anyMatch(m -> m.getLife() <= 0);
//        if (dead) {
//            log.info("Somebody is already dead in roomId={}. End game directly.", roomId);
//            endGame(roomId);
//            return false;
//        }
//        // 이미 진행중? (퀴즈 타이머가 돌고 있는지)
//        if (quizTimerService.hasQuizTask(roomId)) {
//            log.warn("Quiz is already in progress, cannot start new game. roomId={}", roomId);
//            return false;
//        }
//        return true;
//    }
//
//    private boolean isSomebodyDead(GameData gameData) {
//        return gameData.getGameMemberStatusList().stream().anyMatch(m -> m.getLife() <= 0);
//    }
//
//    /**
//     * (B) 메인 게임 루프: 1~9 문제 모두 or 누군가 라이프=0 발생 시까지 자동 진행
//     */
//    private void runGameLoop(Long roomId) {
//        // 1) GameData 조회
//        GameData gameData = redisGameRepository.findById(roomId)
//            .orElseThrow(() -> new RuntimeException("No GameData for roomId=" + roomId));
//
//        // 이미 출제된 문제 비트마스크
//        int quizNum = (gameData.getQuizNum() == null) ? 1 : gameData.getQuizNum();
//
//        // 2) 문제를 9번 모두 소진하거나, 중간에 라이프=0 발생하면 종료
//        while (true) {
//            // (a) 라이프 0이 있으면 바로 끝
//            if (isSomebodyDead(gameData)) {
//                log.info("Someone's life reached 0, end game. roomId={}", roomId);
//                endGame(roomId);
//                return;
//            }
//
//            // (b) 아직 안 풀린 문제 찾기
//            List<Integer> remaining = new ArrayList<>();
//            for (int i = 1; i <= 9; i++) {
//                if ((quizNum & (1 << i)) == 0) {
//                    remaining.add(i);
//                }
//            }
//            // (c) 남은 문제가 없으면 종료
//            if (remaining.isEmpty()) {
//                log.info("All 9 quizzes have been used, end game. roomId={}", roomId);
//                endGame(roomId);
//                return;
//            }
//
//            // (d) 무작위 문제 1개 선택
//            int selectedQuizNum = remaining.get((int) (Math.random() * remaining.size()));
//            // 비트마스크 갱신
//            quizNum |= (1 << selectedQuizNum);
//            gameData.setQuizNum(quizNum);
//            gameData.setCurrentQuizNum(selectedQuizNum);
//            redisGameRepository.save(gameData);
//
//            // (e) 문제 전송 + 타이머 시작
//            //    => 타이머 완료 or 정답을 맞춘 순간, QuizTimerService가
//            //       "timeout" or "정답처리"를 WebSocket으로 보내준다고 가정.
//            publishQuiz(roomId, selectedQuizNum, gameData);
//
//            // (f) 타이머가 돌아가는 동안 "유저 정답(checkAnswer)" 또는 "타임아웃"을 기다려야 함
//            //    여기선 “blocking sleep”으로 시뮬레이션(실제로는 이벤트 기반 구현)
//            //    문제별 제한 시간(10,20,40초) 만큼 “최대” 대기
//            int timeLimit = quizTimerService.getTimeLimitByQuizNum(selectedQuizNum);
//            try {
//                Thread.sleep((timeLimit + 2) * 1000L); // 조금 여유
//            } catch (InterruptedException e) {
//                Thread.currentThread().interrupt();
//            }
//
//            // (g) 문제 하나가 완전히 끝났으니 타이머 취소(혹시 아직 살아있다면)
//            quizTimerService.cancelQuizTasks(roomId);
//
//            // (h) 다시 while 루프 맨 앞으로 올라가서 라이프/문제 체크
//            //     -> 계속 진행 or gameEnd
//        }
//    }
//
//    private void publishQuiz(Long roomId, int quizIndex, GameData gameData) {
//        if (quizIndex >= 1 && quizIndex <= 5) {
//            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizIndex - 1);
//            EventMessage<Map<String, Object>> msg = new EventMessage<>(
//                EventType.MULTIPLE_QUIZ,
//                roomId,
//                Map.of(
//                    "quizId", quiz.getQuizId(),
//                    "question", quiz.getMultipleQuestion(),
//                    "options", quiz.getQuizOptions()
//                )
//            );
//            publishToGame(roomId, msg);
//            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.MULTIPLE_CHOICE,
//                quiz);
//
//        } else if (quizIndex >= 6 && quizIndex <= 8) {
//            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(quizIndex - 6);
//            EventMessage<Map<String, Object>> msg = new EventMessage<>(
//                EventType.SHORT_QUIZ,
//                roomId,
//                Map.of(
//                    "quizId", quiz.getQuizId(),
//                    "question", quiz.getShortQuestion()
//                )
//            );
//            publishToGame(roomId, msg);
//            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.SHORT_ANSWER, quiz);
//
//        } else if (quizIndex == 9) {
//            EssayQuizDto quiz = gameData.getEssayQuiz();
//            EventMessage<Map<String, Object>> msg = new EventMessage<>(
//                EventType.ESSAY_QUIZ,
//                roomId,
//                Map.of(
//                    "quizId", quiz.getQuizId(),
//                    "question", quiz.getEssayQuestion()
//                )
//            );
//            publishToGame(roomId, msg);
//            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.ESSAY, quiz);
//        }
//    }
//
//    /**
//     * 정답 체크 및 결과 발행 → "topic/game/{roomId}"
//     */
//    public void checkQuizAnswer(Long roomId, String userAnswer, Long memberId) {
//        if (!quizTimerService.hasQuizTask(roomId)) {
//            log.warn("🚨 roomId={}에 대한 퀴즈 타이머가 존재하지 않아 정답 처리 중단", roomId);
//            return; // 또는 continue / skip 처리
//        }
//
//        // GameData 조회
//        GameData gameData = redisGameRepository.findById(roomId)
//            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 없습니다."));
//
//        String nickname = gameData.getGameMemberStatusList().stream()
//            .filter(member -> member.getMemberId() == memberId).map(GameMemberStatus::getNickname)
//            .findFirst().orElse(null);
//
//        int quizNum = gameData.getCurrentQuizNum();
//        boolean isCorrect = false;
//        Long quizId = null;
//
//        if (quizNum >= 1 && quizNum <= 5) {
//            // 객관식 문제
//            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizNum - 1);
//            quizId = quiz.getQuizId();
//
//            boolean isNumericAnswer = userAnswer.matches("[1-4]"); // 1~4 숫자만 허용
//            String resultMessageText;
//
//            if (isNumericAnswer) {
//                int ans = Integer.parseInt(userAnswer);
//                isCorrect = quiz.getQuizOptions().stream()
//                    .anyMatch(option -> option.getOptionNumber() == ans && option.isCorrect());
//
//                resultMessageText = isCorrect ? "정답입니다" : "오답입니다";
//
//                if (isCorrect) {
//                    quizTimerService.cancelQuizTasks(roomId);
//                    updateUserLives(gameData, memberId);
//                }
//            } else {
//                isCorrect = false;
//                resultMessageText = userAnswer; // 사용자가 입력한 문자열을 그대로 전달
//            }
//
//            EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
//                EventType.QUIZ_RESULT,
//                roomId,
//                Map.of(
//                    "quizId", quizId,
//                    "result", resultMessageText,
//                    "sender", nickname
//                )
//            );
//
//            publishToGame(roomId, resultMessage);
//
//            //퀴즈 로그 넣기
//            QuizLog log = QuizLog.builder()
//                .memberId(memberId)
//                .quizId(quizId)
//                .userAnswer(userAnswer)
//                .isCorrect(isCorrect)
//                .build();
//
//            quizLogRepository.save(log);
//
//            //정답 체크
//            if (isCorrect) {
//                quizTimerService.cancelQuizTasks(roomId);
//                updateUserLives(gameData, memberId);
//
//                Thread t = roomThreadMap.get(roomId);
//                if (t != null && t.isAlive()) {
//                    t.interrupt();
//                }
//            }
//
//        } else if (quizNum >= 6 && quizNum <= 8) {
//            // 단답형 문제
//            int index = quizNum - 6;
//            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(index);
//            quizId = quiz.getQuizId();
//            isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());
//
//            EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
//                EventType.QUIZ_RESULT,
//                roomId,
//                Map.of(
//                    "quizId", quizId,
//                    "result", isCorrect ? "정답입니다" : userAnswer,
//                    "sender", nickname
//                )
//            );
//            publishToGame(roomId, resultMessage);
//
//            //퀴즈 로그 넣기
//            QuizLog log = QuizLog.builder()
//                .memberId(memberId)
//                .quizId(quizId)
//                .userAnswer(userAnswer)
//                .isCorrect(isCorrect)
//                .build();
//
//            quizLogRepository.save(log);
//
//            if (isCorrect) {
//                quizTimerService.cancelQuizTasks(roomId);
//                updateUserLives(gameData, memberId);
//
//                Thread t = roomThreadMap.get(roomId);
//                if (t != null && t.isAlive()) {
//                    t.interrupt();
//                }
//            }
//
//
//        } else if (quizNum == 9) {
//            // 서술형 문제: AI 채점을 호출하여 0~100점 사이의 점수를 획득
//            EssayQuizDto quiz = gameData.getEssayQuiz();
//
//            //이미 작성한 멤버이면 return
//            List<EssayCorrected> correcteds = gameData.getEssayCorrectedList();
//            for (EssayCorrected corrected : correcteds) {
//                if (corrected.getMemberId() == memberId) {
//
//                    return;
//                }
//            }
//
//            quizId = quiz.getQuizId();
//            log.info("quizId={}", quizId);
//            int score = essayAiScoringService.scoreEssayAnswer(quiz.getEssayQuestion(), userAnswer);
//            // 예시 기준: 점수가 70 이상이면 정답으로 간주
//            isCorrect = score >= 70;
//            Map<String, Object> essayResult = Map.of(
//                "quizId", quizId,
//                "score", score,
//                "sender", nickname
//            );
//
//            EventMessage<Map<String, Object>> essayResultMessage = new EventMessage<>(
//                EventType.QUIZ_RESULT,
//                roomId,
//                essayResult
//            );
//
//            publishToGame(roomId, essayResultMessage);
//
//            QuizLog log = QuizLog.builder()
//                .memberId(memberId)
//                .quizId(quizId)
//                .userAnswer(userAnswer)
//                .isCorrect(isCorrect)
//                .build();
//
//            quizLogRepository.save(log);
//
//            //한번 정답을 맟추면 이후 기회가 없도록 redis에 memberId와 정답과 점수를 저장
//            if (isCorrect) {
//                correcteds.add(new EssayCorrected(memberId, score, LocalDateTime.now()));
//                redisGameRepository.save(gameData);
//
//                //member가 정답 2개가 생겼을 때, 점수 높은 쪽이 이기는 쪽으로 저장.
//                if (correcteds.size() >= 2) {
//                    quizTimerService.cancelQuizTasks(roomId);
//                    updateUserLives(gameData, memberId);
//
//                    Thread t = roomThreadMap.get(roomId);
//                    if (t != null && t.isAlive()) {
//                        t.interrupt();
//                    }
//                }
//            }
//        }
//
//    }
//
//    /**
//     * (4) 멤버들의 라이프 업데이트 → WebSocket으로 반영
//     */
//    private void updateUserLives(GameData gameData, Long targetMemberId) {
//        List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
//        if (memberList == null) {
//            return;
//        }
//
//        Long attackedMemberId = -1L;
//
//        //Essay는 별도로 처리
//        if (gameData.getCurrentQuizNum() == 9) {
//            EssayCorrected m1 = gameData.getEssayCorrectedList().get(0);
//            EssayCorrected m2 = gameData.getEssayCorrectedList().get(1);
//
//            if (m1.getScore() > m2.getScore()) {
//                for (GameMemberStatus m : memberList) {
//                    if (m.getMemberId() == m2.getMemberId()) {
//                        attackedMemberId = m.getMemberId();
//                        m.setLife(Math.max(0, m.getLife() - 1));
//                        break;
//                    }
//                }
//            } else if (m1.getScore() < m2.getScore()) {
//                for (GameMemberStatus m : memberList) {
//                    if (m.getMemberId() == m1.getMemberId()) {
//                        attackedMemberId = m.getMemberId();
//                        m.setLife(Math.max(0, m.getLife() - 1));
//                        break;
//                    }
//                }
//            } else {
//                if (m1.getCreatedAt().isAfter(m2.getCreatedAt())) {
//                    for (GameMemberStatus m : memberList) {
//                        if (m.getMemberId() == m2.getMemberId()) {
//                            attackedMemberId = m.getMemberId();
//                            m.setLife(Math.max(0, m.getLife() - 1));
//                            break;
//                        }
//                    }
//                } else {
//                    for (GameMemberStatus m : memberList) {
//                        if (m.getMemberId() == m1.getMemberId()) {
//                            attackedMemberId = m.getMemberId();
//                            m.setLife(Math.max(0, m.getLife() - 1));
//                            break;
//                        }
//                    }
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
//            publishToGame(gameData.getRoomId(), userStatusMessage);
//
//            return;
//        }
//
//        // 정답자 외 모든 유저 라이프 1 감소 (null 안전 비교)
//        for (GameMemberStatus ms : memberList) {
//            if (ms.getMemberId() != targetMemberId) {
//                attackedMemberId = ms.getMemberId();
//                ms.setLife(Math.max(0, ms.getLife() - 1));
//                break;
//            }
//        }
//
//        redisGameRepository.save(gameData);
//
//        Map<String, Object> data = Map.of(
//            "attackedMemberId", attackedMemberId,
//            "memberList", memberList
//        );
//
//        EventMessage<Map<String, Object>> userStatusMessage = new EventMessage<>(
//            EventType.ONE_ATTACK, gameData.getRoomId(), data
//        );
//
//        publishToGame(gameData.getRoomId(), userStatusMessage);
//    }
//
//    public void endGame(Long roomId) {
//        GameData gameData = redisGameRepository.findById(roomId)
//            .orElseThrow(() -> new IllegalArgumentException("해당 roomId의 GameData가 없습니다."));
//
//        long winnerId = -1L;
//        long loserId = -1L;
//
//        //Reward 지급
//        GameMemberStatus member1 = gameData.getGameMemberStatusList().get(0);
//        GameMemberStatus member2 = gameData.getGameMemberStatusList().get(1);
//        if (member1.getLife() > member2.getLife()) {
//            winnerId = member1.getMemberId();
//            loserId = member2.getMemberId();
//        } else if (member2.getLife() > member1.getLife()) {
//            winnerId = member2.getMemberId();
//            loserId = member1.getMemberId();
//        }
//
//        if (winnerId != -1L) {
//            memberRepository.findByMemberId(winnerId).ifPresent(member -> {
//                member.setPoint(member.getPoint() + 300);
//                memberRepository.save(member);
//            });
//
//            memberRepository.findByMemberId(loserId).ifPresent(member -> {
//                member.setPoint(member.getPoint() + 100);
//                memberRepository.save(member);
//            });
//        } else {
//            for (GameMemberStatus m : gameData.getGameMemberStatusList()) {
//                memberRepository.findByMemberId(m.getMemberId()).ifPresent(member -> {
//                    member.setPoint(member.getPoint() + 100);
//                    memberRepository.save(member);
//                });
//            }
//        }
//
//        //redis 룸 삭제
//        redisGameRepository.deleteById(roomId);
//
//        //rdb 룸 상태 변경
//        Room room = roomRepository.findById(roomId)
//            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
//        room.setStatus(RoomStatus.CLOSED);
//        roomRepository.save(room);
//
//        //reward 결과(-1, -1은 무승부)
//        Map<String, Object> data = Map.of(
//            "winner", winnerId,
//            "loser", loserId
//        );
//
//        EventMessage<Map<String, Object>> message = new EventMessage<>(EventType.REWARD, roomId,
//            data);
//        publishToGame(roomId, message);
//    }
//
//    /**
//     * (5) WebSocket + Redis를 통한 메시지 발행 → "topic/game/{roomId}"
//     */
//    private void publishToGame(Long roomId, EventMessage<?> message) {
//        try {
//            String jsonMessage = objectMapper.writeValueAsString(message);
//            redisPublisher.publish("game:" + roomId, jsonMessage);
//            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
//        } catch (JsonProcessingException e) {
//            log.error("❌ JSON 변환 실패: {}", e.getMessage());
//        }
//    }
//}


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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
                int ans = Integer.parseInt(userAnswer);
                isCorrect = quiz.getQuizOptions().stream()
                    .anyMatch(option -> option.getOptionNumber() == ans && option.isCorrect());
                resultMessageText = isCorrect ? "정답입니다" : "오답입니다";
                if (isCorrect) {
                    quizTimerService.cancelQuizTasks(roomId);
                    updateUserLives(gameData, memberId);
                }
            } else {
                isCorrect = false;
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

