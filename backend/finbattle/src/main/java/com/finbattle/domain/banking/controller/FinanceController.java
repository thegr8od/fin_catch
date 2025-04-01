package com.finbattle.domain.banking.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.finbattle.domain.banking.dto.account.AccountDetailDto;
import com.finbattle.domain.banking.dto.account.AccountRequestDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.banking.dto.analysis.AnalysisRequestDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequestDto;
import com.finbattle.domain.banking.model.TransactionList;
import com.finbattle.domain.banking.service.FinanceService;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.model.dto.BaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FinanceController implements FinanceApi {

    private final FinanceService financeService;

    @Override
    public ResponseEntity<BaseResponse<FindAllAccountResponseDto>> findAllAccount(
        AuthenticatedUser detail) {
        FindAllAccountResponseDto res = financeService.findAllAccount(detail.getMemberId());
        log.info("모든 금융 계좌 조회, 사용자 ID: {}, 계좌 개수: {}", detail.getMemberId(),
            res.getAccounts().size());
        return ResponseEntity.ok(new BaseResponse<>(res));
    }

    @Override
    public ResponseEntity<BaseResponse<FindAllAccountResponseDto>> updateAllAccount(
        AuthenticatedUser detail) {
        FindAllAccountResponseDto res = financeService.updateAllAccount(detail.getMemberId());
        log.info("모든 금융 계좌 갱신, 사용자 ID: {}", detail.getMemberId());
        return ResponseEntity.ok(new BaseResponse<>(res));
    }

    @Override
    public ResponseEntity<BaseResponse<AccountDetailDto>> findAccountDetail(
        AuthenticatedUser detail,
        AccountRequestDto requestDto
    ) {
        AccountDetailDto accountDetail = financeService.findAccountByNo(
            detail.getMemberId(),
            requestDto.accountNo()
        );
        log.info("계좌 상세 조회, 사용자 ID: {}, 계좌번호: {}", detail.getMemberId(), requestDto.accountNo());
        return ResponseEntity.ok(new BaseResponse<>(accountDetail));
    }

    @Override
    public ResponseEntity<BaseResponse<String>> changeMainAccount(
        AuthenticatedUser detail,
        AccountRequestDto requestDto
    ) {
        financeService.changeAccount(detail.getMemberId(), requestDto.accountNo());
        log.info("주 거래 계좌 변경, 사용자 ID: {}, 계좌번호: {}", detail.getMemberId(), requestDto.accountNo());
        return ResponseEntity.ok(new BaseResponse<>("계좌 변경 성공!"));
    }

    @Override
    public ResponseEntity<BaseResponse<TransactionList>> findAllTransactionByNo(
        AuthenticatedUser detail,
        LoadAllTransactionRequestDto requestDto
    ) {
        TransactionList transactionList = financeService.loadAllTransaction(
            detail.getMemberId(),
            requestDto
        );
        log.info("거래 내역 조회, 사용자 ID: {}, 조회계좌: {}", detail.getMemberId(), requestDto.accountNo());
        return ResponseEntity.ok(new BaseResponse<>(transactionList));
    }

    @Override
    public ResponseEntity<BaseResponse<String>> analysisTransaction(
        AuthenticatedUser detail, AnalysisRequestDto requestDto) throws JsonProcessingException {
        return ResponseEntity.ok(new BaseResponse<>(
            financeService.AnalysisSpend(detail.getMemberId(), requestDto.year(),
                requestDto.month())));
    }
}
