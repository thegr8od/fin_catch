package com.finbattle.domain.banking.dto.account;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountApiResponseDto {

    private String bankCode;
    private String bankName;
    private String userName;
    private String accountNo;
    private String accountName;
    private String accountTypeCode;
    private String accountTypeName;
    private String accountCreatedDate;
    private String accountExpiryDate;
    private String dailyTransferLimit;
    private String oneTimeTransferLimit;
    private String accountBalance;
    private String lastTransactionDate;
    private String currency;
}
