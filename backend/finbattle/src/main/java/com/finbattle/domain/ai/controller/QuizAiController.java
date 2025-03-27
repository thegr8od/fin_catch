package com.finbattle.domain.ai.controller;

import com.finbattle.domain.ai.dto.QuizAiRequestDto;
import com.finbattle.domain.ai.dto.QuizAiResponseDto;
import com.finbattle.domain.ai.service.QuizAiService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class QuizAiController {

    private final QuizAiService quizAiService;
    private final AuthenticationUtil authenticationUtil;

    @PostMapping("/analyze")
    public ResponseEntity<BaseResponse<QuizAiResponseDto>> analyze(@RequestBody QuizAiRequestDto dto) {
        Long memberId = authenticationUtil.getMemberId();  // 🔐 JWT에서 사용자 ID 추출
        QuizAiResponseDto feedback = quizAiService.analyze(memberId, dto);  // 🧠 구조화된 응답
        BaseResponse<QuizAiResponseDto> response = new BaseResponse<>(feedback);
        return ResponseEntity.ok(response);  // 📤 JSON 응답
    }
}