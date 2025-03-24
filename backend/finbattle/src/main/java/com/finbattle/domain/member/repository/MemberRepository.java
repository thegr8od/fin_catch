package com.finbattle.domain.member.repository;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.model.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByProviderId(String providerId);

    Optional<Member> findByMemberId(Long memberId);

    Optional<Member> findByNickname(String nickname);

    @Query("SELECT mc.cat FROM MemberCat mc WHERE mc.member.memberId = :memberId " +
        "ORDER BY CASE mc.cat.grade " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.LEGENDARY THEN 1 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.EPIC THEN 2 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.COMMON THEN 3 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.DEFAULT THEN 4 " +
        "ELSE 5 END, mc.cat.catName")
    List<Cat> findCatsByMemberId(@Param("memberId") Long memberId);
}
