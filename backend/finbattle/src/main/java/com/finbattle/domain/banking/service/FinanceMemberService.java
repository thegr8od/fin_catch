package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.financemember.FinanceMemberRequestDto;
import com.finbattle.domain.banking.dto.financemember.FinanceMemberResponseDto;
import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.repository.FinanceMemberRepository;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class FinanceMemberService {

    private final FinanceMemberRepository financeMemberRepository;
    private final MemberRepository memberRepository;

    public FinanceMember loadmember(Long memberId, WebClient webClient, String financeKey) {
        FinanceMember fmember = financeMemberRepository.findById(memberId).orElse(null);
        if (fmember == null) {
            fmember = searchmember(memberId, webClient, financeKey);
            if (fmember.getFinanceKey() == null) {
                fmember = register(memberId, webClient, financeKey);
            }
        }
        return fmember;
    }

    private FinanceMember register(Long memberId, WebClient webClient, String financeKey) {
        Member member = memberRepository.findByMemberId(memberId).orElse(null);
        FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
            member.getEmail());

        FinanceMemberResponseDto res = webClient.post()
            .uri("member/") // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(FinanceMemberResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: " + errorBody);
                        return Mono.error(
                            new RuntimeException("Finance API 호출 실패: " + errorBody)); // ✅ return 붙임
                    });
                }
            })
            .block();

        FinanceMember fmember = new FinanceMember(res, member);
        financeMemberRepository.save(fmember);
        return fmember;
    }

    private FinanceMember searchmember(Long memberId, WebClient webClient, String financeKey) {
        Member member = memberRepository.findByMemberId(memberId).orElse(null);
        FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
            member.getEmail());

        FinanceMemberResponseDto res = webClient.post()
            .uri("member/search") // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .exchangeToMono(response -> {
                if (response.statusCode().is2xxSuccessful()) {
                    return response.bodyToMono(FinanceMemberResponseDto.class);
                } else {
                    return response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("❌ API Error: " + errorBody);
                        return Mono.error(
                            new RuntimeException("Finance API 호출 실패: " + errorBody)); // ✅ return 붙임
                    });
                }
            })
            .block();

        FinanceMember fmember = new FinanceMember(res, member);
        financeMemberRepository.save(fmember);
        return fmember;
    }

}
