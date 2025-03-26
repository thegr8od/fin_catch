package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.account.AccountResponseDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
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

    private final WebClient financewebClient;

    @Value("${app.financeKey}")
    private String financeKey;

    public FindAllAccountResponseDto findAllAccount(Long memberId) {
        FinanceMember member = financeMemberService.membersearch(memberId, financewebClient,
            financeKey);
        List<AccountResponseDto> lists = financeAccountService.findAllAccount(memberId,
            financewebClient, financeKey,
            member);
        FindAllAccountResponseDto res = new FindAllAccountResponseDto();

        if (member.getMainaccount() == null) {
            member.changeMainAccount(lists.get(0).getAccountNo());
        }
        res.setMainAccount(member.getMainaccount());
        res.setAccounts(lists);
        return res;
    }
}
