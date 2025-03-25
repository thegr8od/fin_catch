package com.finbattle.domain.banking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.finbattle.domain.banking.dto.financemember.FinanceMemberResponseDto;
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
    private Long memberId;

    @MapsId
    @OneToOne(optional = false)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    @JsonIgnore
    private Member member;

    @Column(name = "finance_key", nullable = false, length = 255)
    private String financeKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public FinanceMember(FinanceMemberResponseDto dto, Member member) {
        this.member = member;
        this.financeKey = dto.getUserKey();
    }
}
