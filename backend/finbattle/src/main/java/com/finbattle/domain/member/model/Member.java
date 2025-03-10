package com.finbattle.domain.member.model;

import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.global.common.model.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Setter
@Builder
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @Column(nullable = false, unique = true)
    private String providerId;

    private String email;

    @Column(nullable = false, unique = true)
    private String nickname;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // ✅ 기본값 추가
    private List<MemberCat> memberCats = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default // ✅ 기본값 추가
    private Long exp = 0L; // 경험치 (기본값: 0)

    public static Member of(String providerId, String nickname, String email) {
        // Member 생성
        return Member.builder()
            .providerId(providerId)
            .nickname(nickname)
            .email(email)
            //.memberCats(new ArrayList<>())
            .build();
    }

    // 특정 고양이를 추가하는 메서드
    public void acquireCat(Cat cat) {
        if (!hasCat(cat)) {
            this.memberCats.add(new MemberCat(this, cat));
        }
    }

    // 특정 고양이를 삭제하는 메서드
    public void removeCat(Cat cat) {
        memberCats.removeIf(memberCat -> memberCat.getCat().equals(cat));
    }

    // 해당 고양이를 보유하고 있는지 확인
    public boolean hasCat(Cat cat) {
        return memberCats.stream().anyMatch(memberCat -> memberCat.getCat().equals(cat));
    }
}
