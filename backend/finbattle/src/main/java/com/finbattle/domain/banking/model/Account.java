package com.finbattle.domain.banking.model;

public class Account {

    private String bankCode; // 은행코드
    private String bankName; // 은행명
    private String username; // 예금주명
    private String accountNo; // 계좌번호
    private String accountName; // 상품명
    private String accountTypeCode; // 상품구분코드 (1: 수시입출금, 2: 정기예금, 3: 정기적금, 4: 대출)
    private String accountTypeName; // 상품종류명
    private String accountCreatedDate; // 계좌개설일 (YYYYMMDD)
    private String accountExpiryDate; // 계좌만기일 (YYYYMMDD)
    private Long dailyTransferLimit = 500000000L; // 1일이체한도 (기본값: 5억)
    private Long oneTimeTransferLimit = 100000000L; // 1회이체한도 (기본값: 1억)
    private Long accountBalance; // 계좌잔액
    private String lastTransactionDate; // 최종거래일 (YYYYMMDD, nullable)
    private String currency; // 통화코드
}
