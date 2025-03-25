package com.finbattle.domain.banking.repository;

import com.finbattle.domain.banking.model.FinanceMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinanceMemberRepository extends JpaRepository<FinanceMember, Long> {

}
