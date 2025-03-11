package com.finbattle.domain.member.dto;

import com.finbattle.domain.cat.entity.Cat;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@NoArgsConstructor
@Getter
public class MyInfoDto {

    private String email;

    private String nickname;

    private List<CatDto> Cats;

    private Long exp; // 경험치 (기본값: 0)

    private Long point; // 포인트 (기본값: 0)

    public MyInfoDto(String email, String nickname, List<Cat> Cats, Long exp, Long point) {
        this.email = email;
        this.nickname = nickname;
        this.Cats = Cats.stream()
            .map(CatDto::new)
            .collect(Collectors.toList());
        ;
        this.exp = exp;
        this.point = point;
    }
}
