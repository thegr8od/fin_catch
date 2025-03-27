package com.finbattle.domain.quiz.controller;

import com.finbattle.domain.quiz.dto.WrongQuizLogDto;
import com.finbattle.domain.quiz.service.QuizService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final AuthenticationUtil authenticationUtil;

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
}
