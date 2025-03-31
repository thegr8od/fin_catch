package com.finbattle.global.common.metrics;

import com.finbattle.domain.token.repository.RefreshTokenRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;

public class ActiveUsersMetrics {

    private final Gauge activeUsersGauge;

    public ActiveUsersMetrics(MeterRegistry meterRegistry,
        RefreshTokenRepository refreshTokenRepository) {
        this.activeUsersGauge = Gauge.builder("current_active_users",
                refreshTokenRepository,
                r -> r.countActiveUsers() // 실제 Gauge 값
            )
            .description("현재 동시 접속자 수")
            .register(meterRegistry);
    }

    public double getActiveUserCount() {
        return activeUsersGauge.value();
    }
}
