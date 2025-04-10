package com.finbattle.domain.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * EXP나 POINT를 올릴 때 사용하는 DTO 예시
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "경험치 및 포인트 업데이트 요청 DTO")
public class ExpPointUpdateRequestDto {

    @Schema(description = "증가시킬 EXP(경험치) 양", example = "100")
    private Long exp;

    @Schema(description = "증가시킬 POINT(포인트) 양", example = "50")
    private Long point;
}
