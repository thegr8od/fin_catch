package com.finbattle.domain.banking.dto.transaction;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoadAllTransactionRequest {

    private String accountNo; // 계좌번호
    private String startDate; // 조회 시작일 (yyyyMMdd)
    private String endDate; // 조회 종료일 (yyyyMMdd)
    private String transactionType; // 거래 구분 (A: 전체, D: 출금, C: 입금 등)

    @Builder
    public LoadAllTransactionRequest(String accountNo, Integer year, Integer month) {
        this.accountNo = accountNo;
        this.transactionType = "A";

        if (year != null && month != null) {
            YearMonth ym = YearMonth.of(year, month);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
            this.startDate = ym.atDay(1).format(formatter);
            this.endDate = ym.atEndOfMonth().format(formatter);
        } else {
            this.startDate = null;
            this.endDate = null;
        }
    }
}
