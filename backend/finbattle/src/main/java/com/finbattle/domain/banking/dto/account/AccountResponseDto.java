package com.finbattle.domain.banking.dto.account;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountResponseDto {

    private Long accountNo;

    private Integer bankCode;

    private String accountName;

    private Long accountBalance;
}
