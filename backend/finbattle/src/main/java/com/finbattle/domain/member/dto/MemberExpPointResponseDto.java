package com.finbattle.domain.member.dto;

import com.finbattle.domain.member.model.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * EXP/POINT 업데이트 후 반환용 DTO (userId, exp, point 만 포함)
 */
@Getter
@AllArgsConstructor
public class MemberExpPointResponseDto {

    @Schema(description = "사용자 ID", example = "123")
    private final Long userId;

    @Schema(description = "현재 EXP(경험치)", example = "1600")
    private final Long exp;

    @Schema(description = "현재 POINT(포인트)", example = "550")
    private final Long point;

    /**
     * Member 엔티티로부터 userId, exp, point만 추출
     */
    public static MemberExpPointResponseDto from(Member member) {
        return new MemberExpPointResponseDto(
                member.getMemberId(),
                member.getExp(),
                member.getPoint()
        );
    }
}
