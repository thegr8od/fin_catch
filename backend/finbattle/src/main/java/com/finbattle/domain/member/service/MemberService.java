package com.finbattle.domain.member.service;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.dto.CatDto;
import com.finbattle.domain.member.dto.MyInfoDto;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * 회원 관련 기능을 제공하는 서비스 인터페이스입니다.
 */
@Service
public interface MemberService {

    /**
     * 회원의 마이페이지 정보를 조회합니다.
     *
     * @param memberId 조회할 회원의 ID
     * @return 회원 정보와 관련 고양이 목록이 포함된 {@link MyInfoDto}
     */
    MyInfoDto getMyInfo(Long memberId);

    /**
     * 닉네임의 중복 여부를 확인합니다.
     *
     * @param nickname 중복 확인할 닉네임
     * @return 중복이면 true, 아니면 false
     */
    boolean findByNickname(String nickname);

    /**
     * 회원의 닉네임을 변경합니다.
     *
     * @param memberId 변경할 회원의 ID
     * @param nickname 변경할 새로운 닉네임
     */
    void updateNickname(Long memberId, String nickname);

    /**
     * 회원의 대표 고양이를 변경합니다.
     *
     * @param memberId 대표 고양이를 변경할 회원의 ID
     * @param catId    대표 고양이로 지정할 고양이 ID
     * @return 변경된 대표 고양이 {@link Cat}
     */
    Cat updateMainCat(Long memberId, Long catId);

    /**
     * 회원이 소유한 고양이 목록을 조회합니다.
     *
     * @param memberId 조회할 회원의 ID
     * @return 회원이 소유한 고양이들의 {@link CatDto} 리스트
     */
    List<CatDto> findCatsByMemberId(Long memberId);

    /**
     * 회원이 고양이를 뽑습니다. (랜덤 또는 지정된 수만큼의 뽑기 기능)
     *
     * @param memberId 고양이를 뽑을 회원의 ID
     * @param count    뽑을 고양이 수
     * @return 뽑힌 고양이들의 {@link CatDto} 리스트
     */
    List<CatDto> pickCat(Long memberId, Integer count);

}
