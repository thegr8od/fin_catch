package com.finbattle.domain.member.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.MEMBER_NOT_FOUND;

import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;

    // 특정 회원 조회
    public Member findByMemberId(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));
    }

    // 모든 회원 조회
    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    // 닉네임 중복 확인
    public boolean findByNickname(String nickname) {
        Member member = memberRepository.findByNickname(nickname).orElse(null);
        return member != null;
    }

    // 닉네임 변경
    public void updateNickname(Long memberId, String nickname) {
        Member member = findByMemberId(memberId);
        member.setNickname(nickname);
        memberRepository.save(member);
    }

    // 경험치 증가
    public void increaseExp(Long memberId, Long exp) {
        Member member = findByMemberId(memberId);
        member.setExp(member.getExp() + exp);
        memberRepository.save(member);
    }

    // 회원탈퇴
    public void deleteMember(Long memberId) {
        Member member = findByMemberId(memberId);
        member.changeStatusToInActive();
        memberRepository.save(member);
    }
}
