package com.finbattle.domain.banking.model;

import com.finbattle.domain.member.model.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class FinanceMember {

    @Id
    @Column(name = "member_id")
    private Long memberId; // 회원 ID (식별 1:1 관계)

    @MapsId
    @OneToOne
    @JoinColumn(name = "member_id")
    private Member member; // 회원 엔티티와 식별 1:1 관계 매핑

    @Column(name = "finance_id", nullable = false, length = 255)
    private String financeId; // 금융망 ID

    @Column(name = "finance_name", nullable = false, length = 255)
    private String financeName; // 금융망 이름

    @Column(name = "finance_key", nullable = false, length = 255)
    private String financeKey; // 금융망 키

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // 생성일 (기본값: 현재 시간)


}
