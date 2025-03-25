package com.finbattle.domain.banking.controller;

import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.service.FinanceService;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.model.dto.BaseResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance/member")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "금융망 맴버 API", description = "금융망의 유저 금융 정보를 담당하는 API입니다.")
public class FinanceMemberController {

    private final FinanceService financeService;

    @PostMapping("/")
    // 1. 금융망 유저 생성
    public ResponseEntity<BaseResponse<FinanceMember>> register(
        @AuthenticationPrincipal AuthenticatedUser detail) {

        FinanceMember res = financeService.register(detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>(res));
    }

    @GetMapping("/")
    // 1. 금융망 유저 조회
    public ResponseEntity<BaseResponse<FinanceMember>> search(
        @AuthenticationPrincipal AuthenticatedUser detail) {

        FinanceMember res = financeService.search(detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>(res));
    }
}
