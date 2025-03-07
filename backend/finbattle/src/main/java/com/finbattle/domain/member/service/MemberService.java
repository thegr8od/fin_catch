package com.finbattle.domain.member.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.MEMBER_NOT_FOUND;

import com.finbattle.domain.member.entity.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public Member getMemberInfo(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));
    }

    // 모든 회원 조회
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    
}
