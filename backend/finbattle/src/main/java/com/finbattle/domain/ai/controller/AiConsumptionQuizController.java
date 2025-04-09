package com.finbattle.domain.ai.controller;

import com.finbattle.domain.ai.dto.*;
import com.finbattle.domain.ai.service.AiConsumptionQuizService;
import com.finbattle.domain.ai.service.AiQuizAnalysisService;
import com.finbattle.domain.ai.service.AiQuizLogService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/consumption")
@RequiredArgsConstructor
public class AiConsumptionQuizController {

    private final AiConsumptionQuizService aiConsumptionQuizService;
    private final AiQuizLogService aiQuizLogService;
    private final AiQuizAnalysisService aiQuizAnalysisService;
    private final AuthenticationUtil authenticationUtil;

    @Operation(summary = "소비내역 기반 AI퀴즈 생성", description = "소비내역과 회원 ID를 기반으로 AI퀴즈 10개를 생성합니다.")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse<List<Long>>> createConsumptionQuiz(@RequestBody Map<String, Long> consumptionMap) {
        Long memberId = authenticationUtil.getMemberId();
        List<Long> aiQuizIds = aiConsumptionQuizService.createConsumptionQuiz(memberId, consumptionMap);
        return ResponseEntity.ok(new BaseResponse<>(aiQuizIds));
    }

    @Operation(summary = "최신 소비내역 기반 AI퀴즈 조회", description = "현재 로그인한 사용자의 최신 소비내역 기반 AI퀴즈 10개를 조회합니다.")
    @GetMapping("/latest")
    public ResponseEntity<BaseResponse<List<AiConsumptionQuizDto>>> getLatestConsumptionQuizzes() {
        Long memberId = authenticationUtil.getMemberId();
        List<AiConsumptionQuizDto> quizzes = aiConsumptionQuizService.getLatestConsumptionQuizzes(memberId);
        return ResponseEntity.ok(new BaseResponse<>(quizzes));
    }

    @Operation(summary = "소비내역 기반 AI퀴즈 정답 제출", description = "소비내역 기반 AI퀴즈의 정답을 제출하고, ai_quiz_log에 저장합니다.")
    @PostMapping("/submit")
    public ResponseEntity<BaseResponse<Boolean>> submitConsumptionQuizAnswer(@RequestBody AiConsumptionQuizAnswerDto answerDto) {
        Long memberId = authenticationUtil.getMemberId();
        boolean isCorrect = aiQuizLogService.submitAnswer(answerDto.getQuizId(), memberId, answerDto.getSelectedIndex());
        return ResponseEntity.ok(new BaseResponse<>(isCorrect));
    }

    @Operation(summary = "소비내역 기반 AI퀴즈 오답 노트 조회", description = "현재 로그인한 사용자의 소비내역 기반 AI퀴즈 오답 노트를 조회합니다.")
    @GetMapping("/wrong")
    public ResponseEntity<BaseResponse<List<AiQuizWrongNoteDto>>> getAiQuizWrongNotes() {
        Long memberId = authenticationUtil.getMemberId();
        List<AiQuizWrongNoteDto> wrongNotes = aiQuizLogService.getWrongQuizLogsByMember(memberId);
        return ResponseEntity.ok(new BaseResponse<>(wrongNotes));
    }

    @Operation(summary = "소비 기반 AI퀴즈 분석", description = "AI퀴즈 ID를 기반으로 AI가 문제 분석, 취약점, 추천 학습 방향을 제공")
    @PostMapping("/analyze")
    public ResponseEntity<BaseResponse<AiQuizAnalysisResponseDto>> analyze(@RequestParam Long quizId) {
        try {
            Long memberId = authenticationUtil.getMemberId();
            AiQuizAnalysisResponseDto analysis = aiQuizAnalysisService.analyzeAiQuiz(quizId, memberId);
            return ResponseEntity.ok(new BaseResponse<>(analysis));
        } catch (RuntimeException e) {
            return ResponseEntity.status(BaseResponseStatus.QUIZ_LOG_NOT_FOUND.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.QUIZ_LOG_NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(BaseResponseStatus.AI_ANALYSIS_FAILED.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.AI_ANALYSIS_FAILED));
        }
    }

    @Operation(summary = "1개월 소비내역 기반 AI퀴즈 조회",
            description = "현재 로그인한 사용자의 최근 1개월 간 소비내역 기반 AI퀴즈를 모두 조회합니다.")
    @GetMapping("/monthly")
    public ResponseEntity<BaseResponse<List<AiConsumptionQuizDto>>> getMonthlyConsumptionQuizzes() {
        Long memberId = authenticationUtil.getMemberId();
        List<AiConsumptionQuizDto> quizzes = aiConsumptionQuizService.getMonthlyConsumptionQuizzes(memberId);
        return ResponseEntity.ok(new BaseResponse<>(quizzes));
    }

}
