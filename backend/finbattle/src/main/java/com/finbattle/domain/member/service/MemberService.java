package com.finbattle.domain.member.service;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.CAT_ALL_GONE;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.CAT_MAIN_ALREADY;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.CAT_NOT_FOUND;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.MEMBER_NOT_FOUND;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.NOT_HAVE_CAT;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.POINT_NOT_ENOUGH;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.repository.CatRepository;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.repository.MemberRepository;
import com.finbattle.global.common.exception.exception.BusinessException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
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

    // 특정 회원 조회
    public Member findByMemberId(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));
    }

    // 특정 회원 조회
    public MyInfoDto getMyInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new BusinessException(MEMBER_NOT_FOUND));

        return new MyInfoDto(member.getEmail(), member.getNickname(),
            getCatIdsByMemberId(memberId), member.getMainCat(), member.getExp(), member.getPoint());
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

    // 대표 고양이 변경
    public Cat updateMainCat(Long memberId, Long catId) {
        Member member = findByMemberId(memberId);
        Cat cat = catRepository.findByCatId(catId).orElse(null);
        if (cat == null) {
            throw new BusinessException(CAT_NOT_FOUND);
        }
        if (!member.hasCat(cat)) {
            throw new BusinessException(NOT_HAVE_CAT);
        }
        if (member.getMainCat().equals(cat.getCatName())) {
            throw new BusinessException(CAT_MAIN_ALREADY);
        }
        member.setMainCat(cat.getCatName());
        memberRepository.save(member);
        return cat;
    }

    // 회원탈퇴
    public void deleteMember(Long memberId) {
        Member member = findByMemberId(memberId);
        member.changeStatusToInActive();
        memberRepository.save(member);
    }

    // 특정 회원이 보유한 캐릭터 목록 조회
    public List<Cat> getCatIdsByMemberId(Long memberId) {
        return memberRepository.findCatsByMemberId(memberId);
    }

    // 고양이 뽑기
    public List<CatDto> pickCat(Long memberId, Integer count) {
        Member member = findByMemberId(memberId);
        if (member.getPoint() < 500L * count) {
            throw new BusinessException(POINT_NOT_ENOUGH);
        }
        member.decreasePoint(500L * count);
        List<Cat> pickedCats = pickCatList(count);
        log.warn("고양이 뽑기 성공! 뽑은 고양이 수: {}", pickedCats.size());
        for (Cat pickedCat : pickedCats) {
            if (!member.hasCat(pickedCat)) {
                member.acquireCat(pickedCat);
                log.info("{} 유저가 {}번 고양이를 획득!!", member.getNickname(), pickedCat.getCatId());
            } else {
                member.increasePoint(50L);
                log.info("{} 유저의 {}번 고양이 중복 보유로 50포인트 증가", member.getNickname(),
                    pickedCat.getCatId());
            }
        }
        List<CatDto> catDtos = new ArrayList<>();
        for (Cat pickedCat : pickedCats) {
            catDtos.add(new CatDto(pickedCat));
        }
        memberRepository.save(member);
        return catDtos;
    }

    public List<Cat> pickCatList(Integer count) {
        List<Cat> cats = catRepository.findAll();
        if (cats.isEmpty()) {
            throw new BusinessException(CAT_ALL_GONE);
        }

        // 등급별 전체 확률 (개수에 따라 각 개별 확률이 동적으로 조정됨)
        double legendaryTotalRate = 0.01; // LEGENDARY 총 등장 확률 = 1%
        double epicTotalRate = 0.10;       // EPIC 총 등장 확률 = 10%

        // 등급별 고양이 분류
        List<Cat> legendaryCats = new ArrayList<>();
        List<Cat> epicCats = new ArrayList<>();
        List<Cat> commonCats = new ArrayList<>();

        for (Cat cat : cats) {
            switch (cat.getGrade()) {
                case LEGENDARY -> legendaryCats.add(cat);
                case EPIC -> epicCats.add(cat);
                case COMMON -> commonCats.add(cat);
            }
        }

        int totalLegendary = legendaryCats.size();
        int totalEpic = epicCats.size();
        int totalCommon = commonCats.size();

        // 개수 기반 확률 계산
        double perLegendaryRate = (totalLegendary > 0) ? legendaryTotalRate / totalLegendary : 0.0;
        double perEpicRate = (totalEpic > 0) ? epicTotalRate / totalEpic : 0.0;
        double commonTotalRate = 1.0 - (legendaryTotalRate + epicTotalRate); // 나머지 확률 (COMMON)
        double perCommonRate = (totalCommon > 0) ? commonTotalRate / totalCommon : 0.0;

        // 확률 리스트 생성
        List<WeightedCat> weightedCats = new ArrayList<>();
        for (Cat cat : legendaryCats) {
            weightedCats.add(new WeightedCat(cat, perLegendaryRate));
        }
        for (Cat cat : epicCats) {
            weightedCats.add(new WeightedCat(cat, perEpicRate));
        }
        for (Cat cat : commonCats) {
            weightedCats.add(new WeightedCat(cat, perCommonRate));
        }

        // 랜덤 선택
        List<Cat> returnCatList = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < count; i++) {
            double rand = random.nextDouble();
            double cumulativeProbability = 0.0;

            for (WeightedCat wc : weightedCats) {
                cumulativeProbability += wc.weight;
                if (rand <= cumulativeProbability) {
                    returnCatList.add(wc.cat);
                    break;
                }
            }
        }

        // 보정 로직 (아무것도 선택되지 않을 경우 대비)
        if (returnCatList.isEmpty()) {
            catRepository.findByCatName("classic").ifPresent(returnCatList::add);
        }

        return returnCatList;
    }

    // 가중치 정보를 포함한 고양이 객체
    private static class WeightedCat {

        Cat cat;
        double weight;

        WeightedCat(Cat cat, double weight) {
            this.cat = cat;
            this.weight = weight;
        }
    }
}
