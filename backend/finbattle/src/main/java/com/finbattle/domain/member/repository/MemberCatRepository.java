package com.finbattle.domain.member.repository;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.model.Member;
import com.finbattle.domain.member.model.MemberCat;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberCatRepository extends JpaRepository<MemberCat, Long> {

    List<MemberCat> findByMember_MemberId(Long memberId);

    boolean existsByMemberAndCat(Member member, Cat cat);
}
