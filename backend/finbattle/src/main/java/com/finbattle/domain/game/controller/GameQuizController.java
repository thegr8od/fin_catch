//package com.finbattle.domain.game.controller;
//
//import com.finbattle.domain.game.dto.AnswerRequest;
//import com.finbattle.domain.game.service.QuizService; // ← quiz 도메인 기준으로 수정
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.messaging.handler.annotation.DestinationVariable;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.stereotype.Controller;
//
//@Slf4j
//@Controller
//@RequiredArgsConstructor
//public class GameQuizController {
//
//    private final QuizService quizService;
//
//    @MessageMapping("/game/{roomId}/getQuiz")
//    public void getQuiz(@DestinationVariable String roomId) {
//        log.info("Received quiz request for roomId: {}", roomId);
//        quizService.publishRandomQuiz(roomId);
//    }
//
//    @MessageMapping("/game/{roomId}/quizHint")
//    public void getQuizHint(@DestinationVariable String roomId) {
//        log.info("Received quiz hint request for roomId: {}", roomId);
//        quizService.publishQuizHint(roomId);
//    }
//
//    @MessageMapping("/game/{roomId}/checkAnswer")
//    public void checkAnswer(@DestinationVariable String roomId, @Payload AnswerRequest request) {
//        log.info("Received quiz answer for roomId: {} with answer: {} from memberId: {}",
//                roomId, request.getUserAnswer(), request.getMemberId());
//        quizService.checkQuizAnswer(roomId, request.getUserAnswer(),
//                Long.parseLong(request.getMemberId()));
//    }
//}
