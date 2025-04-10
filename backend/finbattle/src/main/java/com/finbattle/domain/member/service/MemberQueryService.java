package com.finbattle.domain.member.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.MEMBER_NOT_FOUND;

import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberQueryService {

    private final MemberRepository memberRepository;

    // 특정 회원 조회
    public Member findByMemberId(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));
    }

    // 닉네임 중복 확인
    public boolean findByNickname(String nickname) {
        Member member = memberRepository.findByNickname(nickname).orElse(null);
        return member != null;
    }
}
