package com.finbattle.domain.banking.model;

import java.io.Serializable;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class CategorySpending implements Serializable {

    private static final long serialVersionUID = 1L;

    private long totalAmount; // 총합
    private List<TransactionRecord> transactions; // 해당 카테고리 거래 내역
    
    private CategorySpending() {
    }

    @Builder
    public CategorySpending(long totalAmount, List<TransactionRecord> transactions) {
        this.totalAmount = totalAmount;
        this.transactions = transactions;
    }
}
