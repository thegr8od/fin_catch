package com.finbattle.domain.member.service;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
import com.finbattle.domain.member.model.Member;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberFacadeService implements MemberService {

    private final MemberQueryService memberQueryService;
    private final MemberCommandService memberCommandService;
    private final MemberCatService memberCatService;


    // 특정 회원 조회
    @Override
    public MyInfoDto getMyInfo(Long memberId) {
        Member member = memberQueryService.findByMemberId(memberId);
        List<Cat> cats = memberCatService.findCatsByMemberId(memberId);
        return MyInfoDto.from(member, cats);
    }

    @Override
    public boolean findByNickname(String nickname) {
        return memberQueryService.findByNickname(nickname);
    }

    @Override
    public void updateNickname(Long memberId, String nickname) {
        Member member = memberQueryService.findByMemberId(memberId);
        memberCommandService.updateNickname(member, nickname);
    }

    @Override
    public Cat updateMainCat(Long memberId, Long catId) {
        Member member = memberQueryService.findByMemberId(memberId);
        return memberCatService.updateMainCat(member, catId);
    }

    @Override
    public List<CatDto> findCatsByMemberId(Long memberId) {
        List<Cat> cats = memberCatService.findCatsByMemberId(memberId);
        return cats.stream()
            .map(CatDto::new)
            .toList();
    }

    @Override
    public List<CatDto> pickCat(Long memberId, Integer count) {
        Member member = memberQueryService.findByMemberId(memberId);
        return memberCatService.pickCat(member, count);
    }
}
