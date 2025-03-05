package com.finbattle.domain.member.repository;

import com.finbattle.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByProviderId(String providerId);
    Member findByMemberId(Long memberId);
}
