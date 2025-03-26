package com.finbattle.domain.banking.controller;

import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.model.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Tag(name = "금융망 API", description = "금융망의 유저 금융 정보를 담당하는 API입니다.")
public interface FinanceApi {

    @Operation(
        summary = "모든 금융 계좌 조회",
        description = "로그인한 사용자의 금융망 계좌 정보를 모두 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "계좌 조회 성공")
    })
    ResponseEntity<BaseResponse<FindAllAccountResponseDto>> findAllAccount(
        @Parameter(hidden = true) @AuthenticationPrincipal AuthenticatedUser detail);
}
