package com.finbattle.domain.member.dto;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.domain.cat.entity.CatGrade;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
@Schema(description = "고양이 정보 DTO")
public class CatDto {

    @Schema(description = "고양이 ID", example = "1")
    private Long catId;

    @Schema(description = "고양이 이름", example = "나비")
    private String catName;

    @Schema(description = "고양이 설명", example = "나비는 귀여워요")
    private String description; // 캐릭터 설명

    @Schema(description = "고양이 등급", example = "COMMON")
    private CatGrade grade; // 캐릭터 등급

    public CatDto(Cat cat) {
        this.catId = cat.getCatId();
        this.catName = cat.getCatName();
        this.description = cat.getDescription();
        this.grade = cat.getGrade();
    }
}
