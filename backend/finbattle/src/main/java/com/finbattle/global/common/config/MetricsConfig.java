package com.finbattle.global.common.config;

import com.finbattle.domain.token.repository.RefreshTokenRepository;
import com.finbattle.global.common.metrics.ActiveUsersMetrics;
import com.finbattle.global.common.metrics.CacheMetrics;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class MetricsConfig {

    @Bean
    public CacheMetrics cacheMetrics(MeterRegistry meterRegistry) {
        return new CacheMetrics(meterRegistry);
    }

    @Bean
    public ActiveUsersMetrics activeUserGauge(MeterRegistry meterRegistry,
        RefreshTokenRepository refreshTokenRepository) {
        return new ActiveUsersMetrics(meterRegistry, refreshTokenRepository);
    }
}
