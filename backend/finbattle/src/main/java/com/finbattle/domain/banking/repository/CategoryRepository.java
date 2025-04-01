package com.finbattle.domain.banking.repository;

import com.finbattle.domain.banking.dto.analysis.KeywordCategoryMapping;
import com.finbattle.domain.banking.model.SpendCategoryEntity;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<SpendCategoryEntity, Long> {

    @Query("SELECT c.keyword AS keyword, c.category AS category FROM SpendCategoryEntity c WHERE c.keyword IN :summaries")
    List<KeywordCategoryMapping> findKeywordCategoryMappings(
        @Param("summaries") Set<String> summaries);
}
