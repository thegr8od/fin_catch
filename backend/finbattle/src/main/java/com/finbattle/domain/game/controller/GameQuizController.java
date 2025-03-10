package com.finbattle.domain.game.controller;

import com.finbattle.domain.game.dto.AnswerRequest;
import com.finbattle.domain.game.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GameQuizController {

    private final QuizService quizService;

    /**
     * 클라이언트 → 서버: /app/game/{roomId}-getQuiz
     * 랜덤 퀴즈 문제를 가져와 Redis에 발행합니다.
     */
    @MessageMapping("/game/{roomId}-getQuiz")
    public void getQuiz(@DestinationVariable String roomId) {
        log.info("Received quiz request for roomId: {}", roomId);
        quizService.publishRandomQuiz(roomId);
    }

    /**
     * 클라이언트 → 서버: /app/game/{roomId}-quizHint
     * 활성 퀴즈의 힌트(힌트1, 힌트2)를 Redis에 발행합니다.
     */
    @MessageMapping("/game/{roomId}-quizHint")
    public void getQuizHint(@DestinationVariable String roomId) {
        log.info("Received quiz hint request for roomId: {}", roomId);
        quizService.publishQuizHint(roomId);
    }

    /**
     * 클라이언트 → 서버: /app/game/{roomId}-checkAnswer
     * 제출된 정답을 확인하고 결과를 Redis에 발행합니다.
     */
    @MessageMapping("/game/{roomId}-checkAnswer")
    public void checkAnswer(@DestinationVariable String roomId, @Payload AnswerRequest request) {
        log.info("Received quiz answer for roomId: {} with answer: {}", roomId, request.getUserAnswer());
        quizService.checkQuizAnswer(roomId, request.getUserAnswer());
    }
}
