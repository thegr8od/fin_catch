package com.finbattle.domain.member.dto;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.member.model.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Schema(description = "사용자 정보 DTO")
public class MyInfoDto {

    @Schema(description = "사용자 이메일", example = "user@example.com")
    private String email;

    @Schema(description = "사용자 닉네임", example = "고양이사랑해")
    private String nickname;

    @Schema(description = "사용자 대표 캐릭터", example = "default")
    private String mainCat;

    @Schema(description = "사용자가 보유한 고양이 목록")
    private List<CatDto> cats;

    @Schema(description = "사용자의 경험치", example = "1500")
    private Long exp; // 경험치 (기본값: 0)

    @Schema(description = "사용자의 포인트", example = "500")
    private Long point; // 포인트 (기본값: 0)

    private String main_account;

    public static MyInfoDto from(Member member, List<Cat> cats) {
        List<CatDto> catDtos = cats.stream()
            .map(CatDto::new)
            .toList();
        if (member.getFinanceMember() == null) {
            return new MyInfoDto(
                member.getEmail(),
                member.getNickname(),
                member.getMainCat(),
                catDtos,
                member.getExp(),
                member.getPoint(),
                ""
            );
        }
        return new MyInfoDto(
            member.getEmail(),
            member.getNickname(),
            member.getMainCat(),
            catDtos,
            member.getExp(),
            member.getPoint(),
            member.getFinanceMember().getMainaccount()
        );
    }

}
