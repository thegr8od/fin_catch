package com.finbattle.domain.member.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.MEMBER_NOT_FOUND;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.POINT_NOT_ENOUGH;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.repository.CatRepository;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
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
    private final CatRepository catRepository;
    //private final MemberCatRepository memberCatRepository;

    // 1. 특정 회원 조회
    public Member findByMemberId(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));
    }

    // 2. 특정 회원 조회
    public MyInfoDto getMyInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));

        return new MyInfoDto(member.getEmail(), member.getNickname(),
            getCatIdsByMemberId(memberId), member.getExp(), member.getPoint());
    }

    // 3. 모든 회원 조회
    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    // 4. 닉네임 중복 확인
    public boolean findByNickname(String nickname) {
        Member member = memberRepository.findByNickname(nickname).orElse(null);
        return member != null;
    }

    // 5. 닉네임 변경
    public void updateNickname(Long memberId, String nickname) {
        Member member = findByMemberId(memberId);
        member.setNickname(nickname);
        memberRepository.save(member);
    }

    // 6. 회원탈퇴
    public void deleteMember(Long memberId) {
        Member member = findByMemberId(memberId);
        member.changeStatusToInActive();
        memberRepository.save(member);
    }

    // 7. 특정 회원이 보유한 캐릭터 목록 조회
    public List<Cat> getCatIdsByMemberId(Long memberId) {
        return memberRepository.findCatsByMemberId(memberId);
    }

    // 8. 고양이 뽑기
    public CatDto pickCat(Long memberId) {
        Member member = findByMemberId(memberId);
        if (member.getPoint() < 500L) {
            throw new BusinessException(POINT_NOT_ENOUGH);
        }
        member.decreasePoint(500L);
        Cat pickedCat = PickCat();

        if (!member.hasCat(pickedCat)) {
            member.acquireCat(pickedCat);
            log.info("{} 유저가 {}번 고양이를 획득!!", member.getNickname(), pickedCat.getCatId());
        } else {
            member.increasePoint(50L);
            log.info("{} 유저의 {}번 고양이 중복 보유로 50포인트 증가", member.getNickname(), pickedCat.getCatId());
        }
        memberRepository.save(member);
        return new CatDto(pickedCat);
    }

    private Cat PickCat() {
        Long pickedCatId;
        // 고양이 뽑는 로직
        // 랜덤으로 고양이를 뽑아서 반환
        // 2~ n번 고양이 중 랜덤 반환(확률표 정리할 것)
        pickedCatId = 1L;
        return catRepository.findByCatId(pickedCatId).orElse(null);
    }
}
