package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.transaction.AllTransactionApiRequestDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequestDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionResponseDto;
import com.finbattle.domain.banking.model.CommonRequestHeader;
import com.finbattle.domain.banking.model.FinanceMember;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class FinanceTransactionService {

    public LoadAllTransactionResponseDto loadAllTransaction(LoadAllTransactionRequestDto dto,
        WebClient webClient,
        String financeKey, FinanceMember member) {

        String apiPath = "inquireTransactionHistoryList";
        CommonRequestHeader header = new CommonRequestHeader(apiPath, financeKey,
            member.getFinanceKey());

        AllTransactionApiRequestDto requestbody = toApiRequest(dto, header);
        log.info("Request Data: {}", requestbody.toString());
        return webClient.post()
            .uri("edu/demandDeposit/" + apiPath) // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestbody)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(LoadAllTransactionResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        return Mono.error(
                            new RuntimeException("Finance API 호출 실패: " + errorBody + ", code: "
                                + response.statusCode())); // ✅ return 붙임
                    });
                }
            })
            .block();
    }

    private AllTransactionApiRequestDto toApiRequest(LoadAllTransactionRequestDto req,
        CommonRequestHeader header) {
        return AllTransactionApiRequestDto.builder()
            .Header(header)
            .accountNo(Long.parseLong(req.getAccountNo()))
            .startDate(req.getStartDate())
            .endDate(req.getEndDate())
            .transactionType(req.getTransactionType())
            .orderByType("DESC") // 기본 정렬 설정
            .build();
    }


}
