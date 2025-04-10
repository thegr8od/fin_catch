package com.finbattle.domain.banking.dto.analysis;

import com.finbattle.domain.banking.model.SpendCategory;

public interface KeywordCategoryMapping {

    String getKeyword();          // 거래 요약어 (예: 스타벅스)

    SpendCategory getCategory(); // 소비 카테고리 (예: 카페)
}