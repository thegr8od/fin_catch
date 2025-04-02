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
    private final QuizTimerService quizTimerService; // 타이머 서비스 주입
    private final EssayAiScoringService essayAiScoringService; // AI 채점 서비스 주입
    private final RoomRepository roomRepository;
    private final QuizLogRepository quizLogRepository;
    private final MemberRepository memberRepository;

    // 문제 제시
    public void publishNextQuiz(Long roomId) {
        // 1) GameData 가져오기
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 존재하지 않습니다."));

        Integer quizNum = gameData.getQuizNum();
        if (quizNum == null) {
            quizNum = 1; // 기본값
        }

        // 아직 출제되지 않은 퀴즈 번호 리스트 만들기 (1~9)
        List<Integer> remaining = new ArrayList<>();
        for (int i = 1; i <= 9; i++) {
            if ((quizNum & (1 << (i - 1))) == 0) {
                remaining.add(i);
            }
        }

        if (remaining.isEmpty()) {
            log.info("모든 퀴즈가 출제되었습니다.");
            return;
        }

        // 랜덤으로 하나 선택
        int selectedQuizNum = remaining.get((int) (Math.random() * remaining.size()));

        quizNum |= (1 << (selectedQuizNum));
        gameData.setQuizNum(quizNum);
        gameData.setCurrentQuizNum(selectedQuizNum);
        redisGameRepository.save(gameData);

        // 2) quizNum에 따라 문제를 꺼내기
        if (selectedQuizNum >= 1 && selectedQuizNum <= 5) {
            // 객관식 문제 처리
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList()
                .get(selectedQuizNum - 1);
            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.MULTIPLE_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getMultipleQuestion(),
                    "options", quiz.getQuizOptions()
                )
            );
            publishToGame(roomId, message);
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.MULTIPLE_CHOICE,
                quiz);

        } else if (selectedQuizNum >= 6 && selectedQuizNum <= 8) {
            // 단답형 문제 처리
            int index = selectedQuizNum - 6;
            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(index);
            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.SHORT_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getShortQuestion()
                )
            );
            publishToGame(roomId, message);
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.SHORT_ANSWER, quiz);

        } else if (selectedQuizNum == 9) {
            // 서술형 문제 처리
            EssayQuizDto quiz = gameData.getEssayQuiz();
            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.ESSAY_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getEssayQuestion()
                )
            );
            publishToGame(roomId, message);
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.ESSAY, quiz);
        } else {
            log.info("모든 퀴즈 진행 완료 (quizNum={})", quizNum);
        }
    }

    /**
     * 정답 체크 및 결과 발행 → "topic/game/{roomId}"
     */
    public void checkQuizAnswer(Long roomId, String userAnswer, Long memberId) {
        // GameData 조회
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 없습니다."));

        String nickname = gameData.getGameMemberStatusList().stream()
            .filter(member -> member.getMemberId() == memberId).map(GameMemberStatus::getNickname)
            .findFirst().orElse(null);

        int quizNum = gameData.getCurrentQuizNum();
        boolean isCorrect = false;
        Long quizId = null;

        if (quizNum >= 1 && quizNum <= 5) {
            // 객관식 문제
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizNum - 1);
            quizId = quiz.getQuizId();
            Integer ans = Integer.parseInt(userAnswer);
            isCorrect = quiz.getQuizOptions().stream()
                .anyMatch(option -> option.getOptionNumber() == ans && option.isCorrect());

            EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
                EventType.QUIZ_RESULT,
                roomId,
                Map.of(
                    "quizId", quizId,
                    "result", isCorrect ? "정답입니다" : "오답입니다",
                    "sender", nickname
                )
            );

            publishToGame(roomId, resultMessage);

            //퀴즈 로그 넣기
            QuizLog log = QuizLog.builder()
                .memberId(memberId)
                .quizId(quizId)
                .userAnswer(userAnswer)
                .isCorrect(isCorrect)
                .build();

            quizLogRepository.save(log);

            //정답 체크
            if (isCorrect) {
                quizTimerService.cancelQuizTasks(roomId);
                updateUserLives(gameData, memberId);
            }

        } else if (quizNum >= 6 && quizNum <= 8) {
            // 단답형 문제
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

            //퀴즈 로그 넣기
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
            }


        } else if (quizNum == 9) {
            // 서술형 문제: AI 채점을 호출하여 0~100점 사이의 점수를 획득
            EssayQuizDto quiz = gameData.getEssayQuiz();

            //이미 작성한 멤버이면 return
            List<EssayCorrected> correcteds = gameData.getEssayCorrectedList();
            for (EssayCorrected corrected : correcteds) {
                if (corrected.getMemberId() == memberId) {

                    return;
                }
            }

            quizId = quiz.getQuizId();
            log.info("quizId={}", quizId);
            int score = essayAiScoringService.scoreEssayAnswer(quiz.getEssayQuestion(), userAnswer);
            // 예시 기준: 점수가 70 이상이면 정답으로 간주
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

            //한번 정답을 맟추면 이후 기회가 없도록 redis에 memberId와 정답과 점수를 저장
            if (isCorrect) {
                correcteds.add(new EssayCorrected(memberId, score, LocalDateTime.now()));
                redisGameRepository.save(gameData);

                //member가 정답 2개가 생겼을 때, 점수 높은 쪽이 이기는 쪽으로 저장.
                if (correcteds.size() >= 2) {
                    quizTimerService.cancelQuizTasks(roomId);
                    updateUserLives(gameData, memberId);
                }
            }
        }

    }

    /**
     * (4) 멤버들의 라이프 업데이트 → WebSocket으로 반영
     */
    private void updateUserLives(GameData gameData, Long targetMemberId) {
        List<GameMemberStatus> memberList = gameData.getGameMemberStatusList();
        if (memberList == null) {
            return;
        }

        Long attackedMemberId = -1L;

        //Essay는 별도로 처리
        if (gameData.getCurrentQuizNum() == 9) {
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

        // 정답자 외 모든 유저 라이프 1 감소 (null 안전 비교)
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

        //Reward 지급
        GameMemberStatus member1 = gameData.getGameMemberStatusList().get(0);
        GameMemberStatus member2 = gameData.getGameMemberStatusList().get(1);
        if (member1.getLife() > member2.getLife()) {
            winnerId = member1.getMemberId();
            loserId = member2.getMemberId();
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

        //redis 룸 삭제
        redisGameRepository.deleteById(roomId);

        //rdb 룸 상태 변경
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new IllegalArgumentException("방을 찾을 수 없습니다."));
        room.setStatus(RoomStatus.CLOSED);
        roomRepository.save(room);

        //reward 결과(-1, -1은 무승부)
        Map<String, Object> data = Map.of(
            "winner", winnerId,
            "loser", loserId
        );

        EventMessage<Map<String, Object>> message = new EventMessage<>(EventType.REWARD, roomId,
            data);
        publishToGame(roomId, message);
    }

    /**
     * (5) WebSocket + Redis를 통한 메시지 발행 → "topic/game/{roomId}"
     */
    private void publishToGame(Long roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }
}
