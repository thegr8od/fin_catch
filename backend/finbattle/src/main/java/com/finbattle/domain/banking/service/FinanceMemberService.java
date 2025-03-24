package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.financemember.FinanceMemberRequestDto;
import com.finbattle.domain.banking.dto.financemember.FinanceMemberResponseDto;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.service.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class FinanceMemberService implements FinanceService {

    private final WebClient webClient;

    private final MemberService memberService;

    @Value("${app.financeKey}")
    private String financeKey;

    public FinanceMemberService(WebClient.Builder webClientBuilder, MemberService memberService) {
        this.webClient = webClientBuilder.baseUrl("https://finopenapi.ssafy.io/ssafy/api/v1/")
            .build();
        this.memberService = memberService;
    }

    @Override
    public Mono<FinanceMemberResponseDto> register(Long userId) {
        Member member = memberService.findByMemberId(userId);
        FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
            member.getEmail());

        return webClient.post()
            .uri("member/") // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .retrieve()
            .bodyToMono(FinanceMemberResponseDto.class);
    }

    @Override
    public Mono<FinanceMemberResponseDto> search(Long userId) {
        Member member = memberService.findByMemberId(userId);
        FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
            member.getEmail());

        return webClient.post()
            .uri("member/search") // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .retrieve()
            .bodyToMono(FinanceMemberResponseDto.class);
    }

}
