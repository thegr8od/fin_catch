package com.finbattle.domain.banking.dto.account;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountResponseDto {

    @Schema(description = "계좌 번호", example = "3333026965506")
    private Long accountNo;

    @Schema(description = "은행 코드", example = "090")
    private Integer bankCode;

    @Schema(description = "계좌 이름", example = "수시입출금")
    private String accountName;

    @Schema(description = "계좌 잔액", example = "0")
    private Long accountBalance;
}
