package com.finbattle.domain.member.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.finbattle.domain.member.model.Member;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Transactional // 테스트 환경에서는 한개 단위테스트가 진행되고 자동으로 롤백됨
class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Test
    @DisplayName("회원가입 테스트")
    public void findByMemberIdTest() throws Exception {
        // Given
        Member member = new Member();
        //member.setMemberId(1L);
        member.setProviderId("1");
        member.setEmail("qkqh9860");
        member.setNickname("Daewon");

        // When
        memberRepository.save(member);

        // Then
        assertEquals(member, memberRepository.findByMemberId(1L));
    }
}