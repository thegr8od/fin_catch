package com.finbattle.domain.member.repository;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.model.MemberCat;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberCatRepository extends JpaRepository<MemberCat, Long> {

    @Query("SELECT mc.cat FROM MemberCat mc WHERE mc.member.memberId = :memberId " +
        "ORDER BY CASE mc.cat.grade " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.LEGENDARY THEN 1 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.EPIC THEN 2 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.COMMON THEN 3 " +
        "WHEN com.finbattle.domain.cat.entity.CatGrade.DEFAULT THEN 4 " +
        "ELSE 5 END, mc.cat.catName")
    List<Cat> findCatsByMemberId(@Param("memberId") Long memberId);
}
