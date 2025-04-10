package com.finbattle.domain.member.service;

import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberCommandService {

    private final MemberRepository memberRepository;

    // 닉네임 변경
    public void updateNickname(Member member, String nickname) {
        member.setNickname(nickname);
        memberRepository.save(member);
    }
    
    // 회원탈퇴
    public void deleteMember(Member member) {
        member.changeStatusToInActive();
        memberRepository.save(member);
    }
}
