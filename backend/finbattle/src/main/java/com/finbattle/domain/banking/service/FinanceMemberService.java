package com.finbattle.domain.banking.service;

import com.finbattle.domain.banking.dto.financemember.FinanceMemberRequestDto;
import com.finbattle.domain.banking.dto.financemember.FinanceMemberResponseDto;
import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.banking.repository.FinanceMemberRepository;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
public class FinanceMemberService implements FinanceService {

    private final WebClient webClient;

    private final FinanceMemberRepository financeMemberRepository;
    private final MemberRepository memberRepository;

    @Value("${app.financeKey}")
    private String financeKey;

    public FinanceMemberService(WebClient.Builder webClientBuilder,
        FinanceMemberRepository financeMemberRepository,
        MemberRepository memberRepository) {
        this.webClient = webClientBuilder.baseUrl("https://finopenapi.ssafy.io/ssafy/api/v1/")
            .build();
        this.financeMemberRepository = financeMemberRepository;
        this.memberRepository = memberRepository;
    }

    @Override
    public FinanceMember register(Long userId) {
        Member member = memberRepository.findByMemberId(userId).orElse(null);
        FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
            member.getEmail());

        FinanceMemberResponseDto res = webClient.post()
            .uri("member/") // 기본 URL이 API_URL이므로 빈 문자열
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(dto)
            .retrieve()
            .bodyToMono(FinanceMemberResponseDto.class).block();

        FinanceMember fmember = new FinanceMember(res, member);
        financeMemberRepository.save(fmember);
        return fmember;
    }

    @Override
    public FinanceMember search(Long userId) {
        FinanceMember fmember = financeMemberRepository.findById(userId).orElse(null);
        if (fmember == null) {
            Member member = memberRepository.findByMemberId(userId).orElse(null);
            log.info(member.toString());
            FinanceMemberRequestDto dto = new FinanceMemberRequestDto(financeKey,
                member.getEmail());

            FinanceMemberResponseDto res = webClient.post()
                .uri("member/search") // 기본 URL이 API_URL이므로 빈 문자열
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(FinanceMemberResponseDto.class).block();
            log.info(res.toString());
            fmember = new FinanceMember(res, member);
            financeMemberRepository.save(fmember);
        }
        return fmember;
    }

}
