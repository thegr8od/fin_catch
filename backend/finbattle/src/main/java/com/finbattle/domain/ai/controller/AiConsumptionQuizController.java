package com.finbattle.domain.ai.controller;

import com.finbattle.domain.ai.service.AiConsumptionQuizService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.model.dto.BaseResponse;
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
    private final AuthenticationUtil authenticationUtil;

    @Operation(summary = "소비내역 기반 AI퀴즈 생성")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse<List<Long>>> createConsumptionQuiz(
            @RequestBody Map<String, Long> consumptionMap
    ) {
        Long memberId = authenticationUtil.getMemberId();
        List<Long> aiQuizIds = aiConsumptionQuizService.createConsumptionQuiz(memberId, consumptionMap);
        return ResponseEntity.ok(new BaseResponse<>(aiQuizIds));
    }
}
