package com.finbattle.domain.banking.dto.transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoadAllTransactionRequestDto {

    private String accountNo; // 계좌번호
    private String startDate; // 조회 시작일 (yyyyMMdd)
    private String endDate; // 조회 종료일 (yyyyMMdd)
    private String transactionType; // 거래 구분 (A: 전체, D: 출금, C: 입금 등)
}
