package com.finbattle.domain.ai.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final QuizAnalysisService quizAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeAnswer(@RequestBody QuizAiRequestDto dto) {
        String result = quizAnalysisService.analyze(dto);
        return ResponseEntity.ok(result);
    }
}
