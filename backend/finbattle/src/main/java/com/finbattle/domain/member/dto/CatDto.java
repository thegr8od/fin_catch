package com.finbattle.domain.member.dto;

import com.finbattle.domain.cat.entity.Cat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor()
public class CatDto {

    private Long catId;

    private String catName;

    public CatDto(Cat cat) {
        this.catId = cat.getCatId();
        this.catName = cat.getCatName();
    }
}
