package com.finbattle.domain.banking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.finbattle.domain.banking.dto.account.AccountDetailDto;
import com.finbattle.domain.banking.dto.account.FindAllAccountResponseDto;
import com.finbattle.domain.banking.dto.analysis.AISearchRequestDto;
import com.finbattle.domain.banking.dto.analysis.AnalysisResponseDto;
import com.finbattle.domain.banking.dto.transaction.LoadAllTransactionRequestDto;
import com.finbattle.domain.banking.model.TransactionList;

/**
 * 금융 관련 서비스 로직을 정의한 인터페이스입니다.
 */
public interface FinanceService {

    /**
     * 사용자의 모든 계좌 정보를 조회합니다.
     *
     * @param memberId 사용자 식별자
     * @return 사용자의 모든 계좌 정보를 담은 DTO
     */
    FindAllAccountResponseDto findAllAccount(Long memberId);

    /**
     * 특정 계좌번호에 해당하는 계좌 정보를 조회합니다.
     *
     * @param memberId  사용자 식별자
     * @param accountNo 조회할 계좌 번호
     * @return 계좌 상세 정보를 담은 DTO
     */
    AccountDetailDto findAccountByNo(Long memberId, String accountNo);

    /**
     * 분석에 사용할 대표 계좌를 변경합니다.
     *
     * @param memberId  사용자 식별자
     * @param accountNo 변경할 계좌 번호
     */
    void changeAccount(Long memberId, String accountNo);

    /**
     * 사용자 계좌 정보를 전부 갱신하고 최신 정보를 반환합니다.
     *
     * @param memberId 사용자 식별자
     * @return 갱신된 계좌 정보를 담은 DTO
     */
    FindAllAccountResponseDto updateAllAccount(Long memberId);

    /**
     * 사용자의 모든 거래내역을 불러옵니다.
     *
     * @param memberId 사용자 식별자
     * @param dto      거래 내역 조회 요청 정보를 담은 DTO
     * @return 거래 내역 리스트
     */
    TransactionList loadAllTransaction(Long memberId,
        LoadAllTransactionRequestDto dto);

    /**
     * 사용자의 특정 연/월 소비내역을 분석합니다.
     *
     * @param memberId 사용자 식별자
     * @param year     분석할 연도
     * @param month    분석할 월
     * @return 소비 분석 결과와 GPT 분석이 있는 AnalysisResponseDto로 반환
     * @throws JsonProcessingException JSON 변환 실패 시 발생
     */
    AnalysisResponseDto AnalysisSpend(Long memberId, Integer year, Integer month)
        throws JsonProcessingException;


    String AISearch(AISearchRequestDto dto)
        throws JsonProcessingException;
}
