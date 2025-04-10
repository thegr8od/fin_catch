package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.transaction.AllTransactionApiRequestDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequest;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionResponseDto;
import com.finbattle.domain.banking.model.CommonRequestHeader;
import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.model.TransactionList;
import com.finbattle.domain.banking.model.TransactionRecord;
import com.finbattle.domain.banking.repository.TransactionRedisRepository;
import com.finbattle.global.common.metrics.CacheMetrics;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class FinanceTransactionService {

    private final FinanceApiClient financeApiClient;
    private final TransactionRedisRepository transactionRedisRepository;
    private final CacheMetrics cacheMetrics;

    public TransactionList loadAllTransaction(LoadAllTransactionRequest dto,
        String financeKey, FinanceMember member) {

        TransactionList result = transactionRedisRepository.findById(dto.getAccountNo(),
                dto.getStartDate())
            .orElse(null);

        if (result == null) {
            cacheMetrics.incrementMiss();
            String apiPath = "inquireTransactionHistoryList";
            CommonRequestHeader header = new CommonRequestHeader(apiPath, financeKey,
                member.getFinanceKey());

            AllTransactionApiRequestDto requestbody = toApiRequest(dto, header);
            log.info("Request Data: {}", requestbody.toString());
            List<TransactionRecord> res = financeApiClient.post("edu/demandDeposit/" + apiPath,
                    requestbody, LoadAllTransactionResponseDto.class).getREC().getList().stream()
                .map(TransactionRecord::from)
                .toList();
            result = new TransactionList(res.size(), res);
            transactionRedisRepository.save(dto.getAccountNo(), result, dto.getStartDate());
        } else {
            cacheMetrics.incrementHit();
        }
        return result;
    }

    private AllTransactionApiRequestDto toApiRequest(LoadAllTransactionRequest req,
        CommonRequestHeader header) {
        return AllTransactionApiRequestDto.builder()
            .Header(header)
            .accountNo(req.getAccountNo())
            .startDate(req.getStartDate())
            .endDate(req.getEndDate())
            .transactionType(req.getTransactionType())
            .orderByType("DESC") // 기본 정렬 설정
            .build();
    }


}
