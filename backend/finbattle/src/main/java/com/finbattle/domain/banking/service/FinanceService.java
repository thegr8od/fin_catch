package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.model.FinanceMember;
import org.springframework.stereotype.Service;

@Service
public interface FinanceService {

    public FinanceMember register(Long memberId);

    public FinanceMember search(Long memberId);
}
