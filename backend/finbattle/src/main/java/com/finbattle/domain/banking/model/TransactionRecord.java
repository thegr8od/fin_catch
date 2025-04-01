package com.finbattle.domain.banking.model;

import com.finbattle.domain.banking.dto.transaction.TransactionRecordDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionRecord {

    private Long transactionUniqueNo;
    private String transactionDate;
    private String transactionTime;
    private String transactionTypeName;
    private String transactionAccountNo;
    private Long transactionBalance;
    private String transactionSummary;

    public static TransactionRecord from(TransactionRecordDto dto) {
        return TransactionRecord.builder()
            .transactionUniqueNo(dto.getTransactionUniqueNo())
            .transactionDate(dto.getTransactionDate())
            .transactionTime(dto.getTransactionTime())
            .transactionTypeName(dto.getTransactionTypeName())
            .transactionAccountNo(dto.getTransactionAccountNo())
            .transactionBalance(dto.getTransactionBalance())
            .transactionSummary(dto.getTransactionSummary())
            .build();
    }
}
