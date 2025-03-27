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
import com.finbattle.domain.quiz.dto.ShortAnswerQuizDto;
import com.finbattle.domain.quiz.model.QuizMode;
import com.finbattle.global.common.redis.RedisPublisher;
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

    // 문제 제시
    public void publishNextQuiz(Long roomId) {
        // 1) GameData 가져오기
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 존재하지 않습니다."));

        Integer quizNum = gameData.getQuizNum();
        if (quizNum == null) {
            quizNum = 1; // 또는 기본값
        }

        // 2) quizNum에 따라 문제를 꺼내기
        if (quizNum >= 1 && quizNum <= 5) {
            // MultipleChoice
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizNum - 1);
            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.MULTIPLE_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getMultipleQuestion(), // MultipleChoice 내 질문
                    "options", quiz.getQuizOptions()
                )
            );
            publishToRoom(roomId, message);

            // 필요 시 타이머 시작
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.MULTIPLE_CHOICE,
                quiz);

        } else if (quizNum >= 6 && quizNum <= 8) {
            // ShortAnswer
            int index = quizNum - 6; // 6->0, 7->1, 8->2
            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(index);

            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.SHORT_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getShortQuestion()
                )
            );
            publishToRoom(roomId, message);

            // 필요 시 타이머 시작
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.SHORT_ANSWER, quiz);

        } else if (quizNum == 9) {
            // Essay
            EssayQuizDto quiz = gameData.getEssayQuiz();

            EventMessage<Map<String, Object>> message = new EventMessage<>(
                EventType.ESSAY_QUIZ,
                roomId,
                Map.of(
                    "quizId", quiz.getQuizId(),
                    "question", quiz.getEssayQuestion()
                )
            );
            publishToRoom(roomId, message);

            // 필요 시 타이머 시작
            quizTimerService.startQuizTimer(roomId, quiz.getQuizId(), QuizMode.ESSAY, quiz);
        } else {
            // 이미 9번까지 끝났다면, 게임 종료 로직 or 다른 처리
            log.info("이미 모든 퀴즈를 진행했습니다. (quizNum={})", quizNum);
            return;
        }

    }

    /**
     * 정답 체크 및 결과 발행 → "topic/game/{roomId}"
     */
    public void checkQuizAnswer(Long roomId, String userAnswer, Long memberId) {
        // GameData 조회
        GameData gameData = redisGameRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("해당 roomId의 GameData가 없습니다."));

        int quizNum = gameData.getQuizNum() == null ? 1 : gameData.getQuizNum();

        boolean isCorrect = false;
        Long quizId = null;

        // quizNum 범위별 퀴즈 찾아서 정답 검사
        if (1 <= quizNum && quizNum <= 5) {
            // MultipleChoice
            MultipleChoiceQuizDto quiz = gameData.getMultipleChoiceQuizList().get(quizNum - 1);
            quizId = quiz.getQuizId();
            Integer ans = Integer.parseInt(userAnswer);
            // 객관식은 '정답 선택지'가 isCorrect = true 인지? 혹은 텍스트 비교?
            // 여기서는 간단히 "userAnswer와 맞는지" 비교한다고 가정
            // (실제로는 QuizOption에서 isCorrect=true 인 optionText와 userAnswer를 비교할 수도)
            isCorrect = quiz.getQuizOptions().stream()
                .anyMatch(option -> option.getOptionNumber() == ans
                    && option.isCorrect());

        } else if (6 <= quizNum && quizNum <= 8) {
            // ShortAnswer
            int index = quizNum - 6;
            ShortAnswerQuizDto quiz = gameData.getShortAnswerQuizList().get(index);
            quizId = quiz.getQuizId();
            isCorrect = quiz.getShortAnswer().equalsIgnoreCase(userAnswer.trim());

        } else if (quizNum == 9) {
            // Essay
            EssayQuizDto quiz = gameData.getEssayQuiz();
            quizId = quiz.getQuizId();
            // 서술형은 정답 판별 로직이 다양할 수 있음
            // 정답 로직은 따로
        }

        // 결과 메시지 발행
        EventMessage<Map<String, Object>> resultMessage = new EventMessage<>(
            EventType.QUIZ_RESULT,
            roomId,
            Map.of(
                "quizId", quizId,
                "result", isCorrect ? "정답입니다" : "오답입니다",
                "memberId", memberId
            )
        );
        publishToRoom(roomId, resultMessage);

        // (2-1) 정답이면 quizNum++
        if (isCorrect) {
            quizTimerService.cancelQuizTasks(roomId);

            gameData.setQuizNum(quizNum + 1);
            redisGameRepository.save(gameData);
        }

        // (2-2) 라이프 업데이트
        updateUserLives(gameData, memberId, isCorrect);
    }

    /**
     * (4) 멤버들의 라이프 업데이트 → WebSocket으로 반영
     */
    private void updateUserLives(GameData gameData, Long correctMemberId, boolean isCorrect) {
        List<GameMemberStatus> userList = gameData.getGameMemberStatusList();
        if (userList == null) {
            return;
        }
        if (isCorrect) {
            // 정답자 외의 모든 유저 life-1
            for (GameMemberStatus ms : userList) {
                if (ms.getMemberId() != correctMemberId) {
                    ms.setLife(ms.getLife() - 1);
                }
            }
        } else {
            // 오답이면 본인만 life-1 이라든지(규칙마다 다름)
            // 예: 문제 설명 상 "첫 정답자 외 모든 사람 -1" 이었으면, 오답자도 -1
            // 여기서는 간단히 "오답이면 아무 변화 없음"으로 가정
            return;
        }

        // 변경사항 Redis 저장
        gameData.setGameMemberStatusList(userList);
        redisGameRepository.save(gameData);

        // 업데이트된 사용자 상태를 WebSocket 전송
        EventMessage<List<GameMemberStatus>> userStatusMessage = new EventMessage<>(
            EventType.USER_STATUS, gameData.getRoomId(), userList
        );

        publishToRoom(gameData.getRoomId(), userStatusMessage);
    }

    /**
     * (5) WebSocket + Redis를 통한 메시지 발행 → "topic/game/{roomId}"
     */
    private void publishToRoom(Long roomId, EventMessage<?> message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisPublisher.publish("game:" + roomId, jsonMessage);
            log.info("🚀 Sent WebSocket message to room {}: {}", roomId, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("❌ JSON 변환 실패: {}", e.getMessage());
        }
    }
}