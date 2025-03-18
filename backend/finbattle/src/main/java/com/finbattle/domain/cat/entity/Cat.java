package com.finbattle.domain.cat.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.finbattle.domain.member.model.MemberCat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EntityListeners(AuditingEntityListener.class) // Auditing 기능 활성화
public class Cat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long catId; // 캐릭터 ID

    @Column(nullable = false, unique = true)
    private String catName; // 캐릭터 이름

    @Column(nullable = false)
    private String description; // 캐릭터 설명

    @Enumerated(EnumType.STRING)
    private CatGrade grade; // 캐릭터 등급

    @OneToMany(mappedBy = "cat")
    @JsonIgnore
    @Builder.Default // ✅ 기본값 추가
    private List<MemberCat> memberCats = new ArrayList<>();

    public Cat(String catName, CatGrade grade) {
        this.catName = catName;
        this.description = "냥냥냥";
        this.grade = grade;
    }

}