package com.finbattle.domain.banking.model;

import java.util.Arrays;

public enum SpendCategory {

    FOOD("식비"),            // 입에 들어가는 지출: 식사, 간식, 카페, 술
    TRANSPORT("교통"),       // 대중교통, 자차, 주유
    HOUSING("주거"),         // 전기, 수도, 통신, 월세
    MEDICAL("의료"),         // 병원, 약국
    CULTURE("문화"),         // 취미, 영화
    SHOPPING("쇼핑"),        // 옷, 신발, 가전
    EDUCATION("교육"),       // 학원, 책, 등록금
    ETC("기타");             // 기타 항목

    private final String label;

    SpendCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // "식비" 같은 한글 라벨로부터 Enum 매핑
    public static SpendCategory fromLabel(String label) {
        return Arrays.stream(values())
            .filter(c -> c.label.equals(label))
            .findFirst()
            .orElse(ETC); // 없으면 기타로 분류
    }
}

