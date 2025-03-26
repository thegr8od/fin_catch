package com.finbattle.domain.banking.repository;

import com.finbattle.domain.banking.model.Account;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinanceAccountRepository extends JpaRepository<Account, Long> {

    public List<Account> findByFinancemember_MemberId(Long memberId);
}
