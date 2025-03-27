package com.finbattle.domain.ai.controller;

import com.finbattle.domain.ai.dto.QuizAiRequestDto;
import com.finbattle.domain.ai.dto.QuizAiResponseDto;
import com.finbattle.domain.ai.service.QuizAiService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
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
        try {
            Long memberId = authenticationUtil.getMemberId();  // 🔐 JWT에서 사용자 ID 추출
            QuizAiResponseDto feedback = quizAiService.analyze(memberId, dto);  // 🧠 AI 분석 결과
            return ResponseEntity.ok(new BaseResponse<>(feedback));  // 📤 정상 응답
        } catch (RuntimeException e) {
            return ResponseEntity.status(BaseResponseStatus.QUIZ_LOG_NOT_FOUND.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.QUIZ_LOG_NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(BaseResponseStatus.AI_ANALYSIS_FAILED.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.AI_ANALYSIS_FAILED));
        }
    }
}