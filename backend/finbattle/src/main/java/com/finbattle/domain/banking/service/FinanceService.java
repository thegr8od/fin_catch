package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.account.AccountDetailDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequestDto;
import com.finbattle.domain.banking.model.TransactionList;

public interface FinanceService {

    FindAllAccountResponseDto findAllAccount(Long memberId);

    AccountDetailDto findAccountByNo(Long memberId, String accountNo);

    void changeAccount(Long memberId, String accountNo);

    FindAllAccountResponseDto updateAllAccount(Long memberId);

    TransactionList loadAllTransaction(Long memberId,
        LoadAllTransactionRequestDto dto);
}
