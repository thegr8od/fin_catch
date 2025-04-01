package com.finbattle.domain.banking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "spend_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class SpendCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String keyword; // ex: "스타벅스"

    @Enumerated(EnumType.STRING)
    private SpendCategory category; // Enum으로 저장 및 조회

    public SpendCategoryEntity(String keyword, SpendCategory categoryEnum) {
        this.keyword = keyword;
        this.category = categoryEnum;
    }

    // getters, setters...
}
