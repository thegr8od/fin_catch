package com.finbattle.domain.member.model;

import com.finbattle.domain.cat.entity.Cat;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

@Entity
@Table(name = "member_cat")
@Getter
public class MemberCat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberCatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cat_id")
    private Cat cat;

    // 기본 생성자
    protected MemberCat() {
    }

    public MemberCat(Member member, Cat cat) {
        this.member = member;
        this.cat = cat;
    }
}
