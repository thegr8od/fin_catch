package com.finbattle.domain.banking.controller;

import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.banking.service.FinanceService;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.model.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController implements FinanceApi {

    private final FinanceService financeService;

    @GetMapping("/all/account")
    @Override
    // 1. 금융망 유저 정보 조회
    public ResponseEntity<BaseResponse<FindAllAccountResponseDto>> findAllAccount(
        @AuthenticationPrincipal AuthenticatedUser detail) {

        FindAllAccountResponseDto res = financeService.findAllAccount(detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>(res));
    }
}
