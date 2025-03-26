package com.finbattle.domain.banking.model;

import com.finbattle.domain.banking.dto.account.AccountApiResponseDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;

@Entity
@NoArgsConstructor
@Getter
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    @JsonIgnore
    private FinanceMember financemember;

    @Column(name = "account_no", nullable = false, unique = true)
    private Long accountNo;

    @Column(name = "bank_code", nullable = false)
    private Integer bankCode;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "account_balance", nullable = false)
    private Long accountBalance;

    public Account(AccountApiResponseDto dto, FinanceMember member) {
        this.financemember = member;
        this.accountNo = Long.parseLong(dto.getAccountNo());
        this.bankCode = Integer.parseInt(dto.getBankCode());
        this.accountName = dto.getAccountTypeName();
        this.accountBalance = Long.parseLong(dto.getAccountBalance());
    }
}
