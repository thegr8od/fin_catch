package com.finbattle.domain.member.repository;

import com.finbattle.domain.member.model.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByProviderId(String providerId);

    Optional<Member> findByMemberId(Long memberId);

    Optional<Member> findByNickname(String nickname);
}
