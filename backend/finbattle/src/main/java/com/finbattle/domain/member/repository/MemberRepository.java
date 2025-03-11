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

    @Query("SELECT mc.cat FROM MemberCat mc WHERE mc.member.memberId = :memberId")
    List<Cat> findCatsByMemberId(@Param("memberId") Long memberId);
}
