package com.finbattle.domain.member.service;

import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;

    public Member getMemberInfo(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow();
    }
}
