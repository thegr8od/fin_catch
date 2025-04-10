package com.finbattle.global.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

/**
 * 캐시 적중률을 측정하기 위한 공통 로직 예시
 */
public class CacheMetrics {

    private final Counter cacheHitCounter;
    private final Counter cacheMissCounter;

    public CacheMetrics(MeterRegistry meterRegistry) {
        // 캐시 히트 카운터
        this.cacheHitCounter = Counter.builder("cache.transaction.hit")
            .description("Number of transaction cache hits")
            .register(meterRegistry);

        // 캐시 미스 카운터
        this.cacheMissCounter = Counter.builder("cache.transaction.miss")
            .description("Number of transaction cache misses")
            .register(meterRegistry);
    }

    public void incrementHit() {
        cacheHitCounter.increment();
    }

    public void incrementMiss() {
        cacheMissCounter.increment();
    }

    /**
     * 현재까지의 적중률(히트율)을 계산
     */
    public double getHitRatio() {
        double hitCount = cacheHitCounter.count();
        double missCount = cacheMissCounter.count();
        double total = hitCount + missCount;
        if (total == 0) {
            return 0.0;
        }
        return hitCount / total;
    }
}

