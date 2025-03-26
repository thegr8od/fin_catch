package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.account.AccountApiResponseDto;
import com.finbattle.domain.banking.dto.account.AccountResponseDto;
import com.finbattle.domain.banking.dto.account.FindAccountsApiResponseDto;
import com.finbattle.domain.banking.model.Account;
import com.finbattle.domain.banking.model.CommonRequestHeader;
import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.repository.FinanceAccountRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceAccountService {

    private final FinanceAccountRepository financeAccountRepository;

    public List<AccountResponseDto> findAllAccount(Long memberId, WebClient webClient,
        String financeKey,
        FinanceMember member) {
        List<Account> accounts = financeAccountRepository.findByFinancemember_MemberId(memberId);
        if (accounts.isEmpty()) {
            accounts = findAccountsApi(webClient, financeKey, member);
        }
        List<AccountResponseDto> result = new ArrayList<>();
        for (Account account : accounts) {
            AccountResponseDto dto = new AccountResponseDto();
            dto.setAccountNo(account.getAccountNo());
            dto.setBankCode(account.getBankCode());
            dto.setAccountName(account.getAccountName());
            dto.setAccountBalance(account.getAccountBalance());
            result.add(dto);
        }
        return result;
    }

    private List<Account> findAccountsApi(WebClient webClient, String financeKey,
        FinanceMember member) {
        String apiPath = "inquireDemandDepositAccountList";
        CommonRequestHeader header = new CommonRequestHeader(apiPath, financeKey,
            member.getFinanceKey());
        Map<String, CommonRequestHeader> reqdto = new HashMap<>();
        reqdto.put("Header", header);
        FindAccountsApiResponseDto res = webClient.post()
            .uri("edu/demandDeposit/" + apiPath) // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(reqdto)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(FindAccountsApiResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).doOnNext(errorBody -> {
                        log.error("❌ API Error: " + errorBody);
                        log.error("기관거래고유번호: {}", header.getInstitutionTransactionUniqueNo());
                    }).then(
                        Mono.error(new RuntimeException("API 호출 실패: " + response.statusCode())));
                }
            })
            .block();
        log.info("API Response: {}", res);
        List<Account> accounts = new ArrayList<>();
        for (AccountApiResponseDto dto : res.getREC()) {
            Account account = new Account(dto, member);
            accounts.add(account);
        }
        financeAccountRepository.saveAll(accounts);
        return accounts;
    }
}
