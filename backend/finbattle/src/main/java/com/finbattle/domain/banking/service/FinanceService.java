package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;

public interface FinanceService {

    public FindAllAccountResponseDto findAllAccount(Long memberId);
}
