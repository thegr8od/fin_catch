package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.financemember.FinanceMemberResponseDto;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface FinanceService {

    public Mono<FinanceMemberResponseDto> register(Long memberId);

    public Mono<FinanceMemberResponseDto> search(Long memberId);
}
