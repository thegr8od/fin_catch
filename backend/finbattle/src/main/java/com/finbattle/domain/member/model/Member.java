package com.finbattle.domain.member.model;

import com.finbattle.domain.banking.model.FinanceMember;
import com.finbattle.domain.cat.entity.Cat;
import com.finbattle.global.common.model.entity.BaseEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import net.minidev.json.annotate.JsonIgnore;
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

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL)
    private FinanceMember financeMember; // 금융망회원 엔티티 (식별 1:1 관계)

    @Column(nullable = false, unique = true)
    private String providerId;

    private String email;

    @Column(nullable = false, unique = true)
    private String nickname;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // ✅ 기본값 추가
    @JsonIgnore
    private List<MemberCat> memberCats = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default // ✅ 기본값 추가
    private Long exp = 0L; // 경험치 (기본값: 0)

    @Column(nullable = false)
    @Builder.Default // ✅ 기본값 추가
    private Long point = 100000L; // 포인트 (기본값: 0)

    @Schema(description = "사용자 대표 캐릭터", example = "default")
    private String mainCat;

    // @Column(nullable = false)
    private LocalDateTime lastLogin;

    public static Member of(String providerId, String nickname, String email) {
        // Member 생성
        return Member.builder()
            .providerId(providerId)
            .nickname(nickname)
            .email(email)
            .mainCat("classic")
            //.lastLogin(LocalDateTime.now())
            .build();
    }

    // 특정 고양이를 추가하는 메서드
    public void acquireCat(Cat cat) {
        if (!hasCat(cat)) {
            this.memberCats.add(new MemberCat(this, cat));
        }
    }

    // 해당 고양이를 보유하고 있는지 확인
    public boolean hasCat(Cat cat) {
        return memberCats.stream().anyMatch(memberCat -> memberCat.getCat().equals(cat));
    }

    public Long increasePoint(Long point) {
        this.point += point;
        return this.point;
    }

    public Long decreasePoint(Long point) {
        this.point -= point;
        return this.point;
    }

    public Long increaseExp(Long exp) {
        this.exp += exp;
        return this.exp;
    }
}
