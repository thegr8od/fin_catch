package com.finbattle.domain.banking.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.ACCOUNT_NOT_FOUND;

import com.finbattle.domain.banking.dto.account.AccountDetailDto;
import com.finbattle.domain.banking.dto.account.AccountResponseDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountApiResponseDto;
import com.finbattle.domain.banking.dto.account.FindByNoResponseDto;
import com.finbattle.domain.banking.model.Account;
import com.finbattle.domain.banking.model.CommonRequestHeader;
import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.repository.FinanceAccountRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
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

    public List<AccountResponseDto> findAllAccount(WebClient webClient,
        String financeKey,
        FinanceMember member) {
        List<Account> accounts = financeAccountRepository.findByFinancemember_MemberId(
            member.getMemberId());
        if (accounts.isEmpty()) {
            accounts = findAccountsApi(webClient, financeKey, member);
        }
        List<AccountResponseDto> result = new ArrayList<>();
        for (Account account : accounts) {
            AccountResponseDto dto = new AccountResponseDto(account);
            result.add(dto);
        }
        return result;
    }

    public AccountDetailDto findAccountByNo(Long accountNo, WebClient webClient,
        String financeKey, FinanceMember member) {
        AccountDetailDto account = findAccountApi(accountNo, webClient, financeKey,
            member).getREC();
        if (account.getAccountNo().isEmpty()) {
            throw new BusinessException(ACCOUNT_NOT_FOUND);
        }
        long balance = Long.parseLong(account.getAccountBalance());
        Account myaccount = financeAccountRepository.findByAccountNo(accountNo).orElse(null);
        if (balance != myaccount.getAccountBalance()) {
            myaccount.changeAccountBalance(balance);
            financeAccountRepository.save(myaccount);
        }
        return account;
    }

    private List<Account> findAccountsApi(WebClient webClient, String financeKey,
        FinanceMember member) {
        String apiPath = "inquireDemandDepositAccountList";
        CommonRequestHeader header = new CommonRequestHeader(apiPath, financeKey,
            member.getFinanceKey());
        Map<String, CommonRequestHeader> reqdto = new HashMap<>();
        reqdto.put("Header", header);
        FindAllAccountApiResponseDto res = webClient.post()
            .uri("edu/demandDeposit/" + apiPath) // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(reqdto)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(FindAllAccountApiResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: " + errorBody);
                        return Mono.error(
                            new RuntimeException("Finance API 호출 실패: " + errorBody)); // ✅ return 붙임
                    });
                }
            })
            .block();
        List<Account> accounts = new ArrayList<>();
        for (AccountDetailDto dto : res.getREC()) {
            Account account = new Account(dto, member);
            accounts.add(account);
        }
        financeAccountRepository.saveAll(accounts);
        return accounts;
    }

    private FindByNoResponseDto findAccountApi(Long accountNo, WebClient webClient,
        String financeKey, FinanceMember member) {
        String apiPath = "inquireDemandDepositAccount";
        CommonRequestHeader header = new CommonRequestHeader(apiPath, financeKey,
            member.getFinanceKey());
        Map<String, Object> reqdto = new HashMap<>();
        reqdto.put("Header", header);
        reqdto.put("accountNo", accountNo);
        return webClient.post()
            .uri("edu/demandDeposit/" + apiPath) // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(reqdto)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(FindByNoResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: " + errorBody);
                        return Mono.error(
                            new RuntimeException("Finance API 호출 실패: " + errorBody)); // ✅ return 붙임
                    });
                }
            })
            .block();
    }
}
