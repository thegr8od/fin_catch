package com.finbattle.domain.banking.repository;

import com.finbattle.domain.banking.model.SpendAnalysis;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpendAnalysisRepository extends CrudRepository<SpendAnalysis, Long> {

    Optional<SpendAnalysis> findByMemberId(Long memberId);
}
