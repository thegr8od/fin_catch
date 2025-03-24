package com.finbattle.domain.ai.controller;

import com.finbattle.domain.ai.dto.QuizAiRequestDto;
import com.finbattle.domain.ai.service.QuizAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class QuizAiController {

    private final QuizAnalysisService quizAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyze(@RequestBody QuizAiRequestDto dto) {
        String feedback = quizAnalysisService.analyze(dto);
        return ResponseEntity.ok(feedback);
    }
}