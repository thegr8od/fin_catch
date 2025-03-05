package com.finbattle.domain.member.entity.dto;

import com.finbattle.domain.member.entity.Member;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MemberDto {
    private Long memberId;
    private String providerId;
    private String email;
    private String nickname;

    @Builder
    public MemberDto(Long memberId, String providerId, String email, String nickname) {
        this.memberId = memberId;
        this.providerId = providerId;
        this.email = email;
        this.nickname = nickname;
    }

    public static MemberDto from(Member member) {
        return MemberDto.builder()
            .memberId(member.getMemberId())
            .providerId(member.getProviderId())
            .email(member.getEmail())
            .nickname(member.getNickname())
            .build();
    }
}
