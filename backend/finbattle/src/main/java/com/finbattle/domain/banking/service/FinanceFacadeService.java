package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.account.AccountDetailDto;
import com.finbattle.domain.banking.dto.account.AccountResponseDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequestDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionResponseDto;
import com.finbattle.domain.banking.model.FinanceMember;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FinanceFacadeService implements FinanceService {

    private final FinanceMemberService financeMemberService;
    private final FinanceAccountService financeAccountService;
    private final FinanceTransactionService financeTransactionService;

    private final WebClient financewebClient;

    @Value("${app.financeKey}")
    private String financeKey;

    @Override
    public FindAllAccountResponseDto findAllAccount(Long memberId) {
        FinanceMember member = financeMemberService.loadmember(memberId, financewebClient,
            financeKey);
        List<AccountResponseDto> lists = financeAccountService.findAllAccount(
            financewebClient, financeKey,
            member);
        FindAllAccountResponseDto res = new FindAllAccountResponseDto();

        if (member.getMainaccount() == 0L) {
            member.changeMainAccount(lists.get(0).getAccountNo());
        }
        res.setMainAccount(member.getMainaccount());
        res.setAccounts(lists);
        return res;
    }

    @Override
    public AccountDetailDto findAccountByNo(Long memberId, Long accountNo) {
        FinanceMember member = financeMemberService.loadmember(memberId, financewebClient,
            financeKey);
        return financeAccountService.findAccountByNo(accountNo, financewebClient, financeKey,
            member);
    }

    @Override
    public LoadAllTransactionResponseDto loadAllTransaction(Long memberId,
        LoadAllTransactionRequestDto dto) {
        FinanceMember member = financeMemberService.loadmember(memberId, financewebClient,
            financeKey);
        return financeTransactionService.loadAllTransaction(dto, financewebClient, financeKey,
            member);

    }
}
