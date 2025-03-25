package com.finbattle.domain.quiz.controller;

import com.finbattle.domain.quiz.model.QuizLog;
import com.finbattle.domain.quiz.service.QuizAnalysisQueryService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizAnalysisController {

    private final QuizAnalysisQueryService quizAnalysisQueryService;
    private final AuthenticationUtil authenticationUtil;

    @GetMapping("/wrong")
    public ResponseEntity<List<QuizLog>> getWrongQuizLogs() {
        Long memberId = authenticationUtil.getMemberId(); // 인증된 사용자 ID 가져오기
        List<QuizLog> wrongLogs = quizAnalysisQueryService.getWrongQuizLogsByMember(memberId);
        return ResponseEntity.ok(wrongLogs);
    }
}
