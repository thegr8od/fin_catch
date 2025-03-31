package com.finbattle.domain.banking.model;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@ToString
@RedisHash("SpendingAnalysis")
public class SpendAnalysis {

    @Id
    private Long memberId;

    private Map<String, CategorySpending> categories;

    @TimeToLive(unit = TimeUnit.DAYS)
    private Long ttl = 1L;

    private SpendAnalysis() {
    }

    @Builder
    public SpendAnalysis(Long memberId, Map<String, CategorySpending> categories, Long ttl) {
        this.memberId = memberId;
        this.categories = categories;
        if (ttl != null) {
            this.ttl = ttl;
        }
    }
}
