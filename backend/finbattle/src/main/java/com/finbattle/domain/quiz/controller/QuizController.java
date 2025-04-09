package com.finbattle.domain.quiz.controller;

import com.finbattle.domain.quiz.dto.QuizLogDto;
import com.finbattle.domain.quiz.dto.WrongQuizLogDto;
import com.finbattle.domain.quiz.service.QuizService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Tag(name = "퀴즈 API", description = "퀴즈 기능을 제공하는 컨트롤러")
public class QuizController {

    private final QuizService quizService;
    private final AuthenticationUtil authenticationUtil;

    @Operation(
            summary = "틀린 퀴즈 목록 조회",
            description = "현재 로그인한 사용자의 최근 틀린 퀴즈 로그 목록을 반환합니다."
    )
    @GetMapping("/wrong")
    public ResponseEntity<BaseResponse<List<WrongQuizLogDto>>> getWrongQuizLogs() {
        try {
            Long memberId = authenticationUtil.getMemberId();
            List<WrongQuizLogDto> wrongLogs = quizService.getWrongQuizLogsByMember(memberId);
            if (wrongLogs.isEmpty()) {
                return ResponseEntity.status(BaseResponseStatus.WRONG_QUIZ_LOG_NOT_FOUND.getHttpStatus())
                        .body(new BaseResponse<>(BaseResponseStatus.WRONG_QUIZ_LOG_NOT_FOUND));
            }
            return ResponseEntity.ok(new BaseResponse<>(wrongLogs));
        } catch (RuntimeException e) {
            return ResponseEntity.status(BaseResponseStatus.QUIZ_LOG_NOT_FOUND.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.QUIZ_LOG_NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(BaseResponseStatus.INVALID_QUIZ_TYPE.getHttpStatus())
                    .body(new BaseResponse<>(BaseResponseStatus.INVALID_QUIZ_TYPE));
        }
    }

    @Operation(
            summary = "특정 퀴즈 로그 전체 조회",
            description = "지정된 quiz_id와 관련된 모든 quiz_log를 조회하여 반환합니다."
    )
    @GetMapping("/logs/{quizId}")
    public ResponseEntity<BaseResponse<List<QuizLogDto>>> getQuizLogsByQuizId(@PathVariable Long quizId) {
        List<QuizLogDto> logDtos = quizService.getQuizLogsByQuizId(quizId);
        return ResponseEntity.ok(new BaseResponse<>(logDtos));
    }
}
