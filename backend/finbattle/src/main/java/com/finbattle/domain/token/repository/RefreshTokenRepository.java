package com.finbattle.domain.token.repository;

import com.finbattle.domain.token.dto.TokenData;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final RedisTemplate redisTemplate;
    private final MeterRegistry meterRegistry;

    @Value("${spring.jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    private final String KEY = "refresh_token:";

    public void save(final TokenData tokenData) {
        String tokenKey = KEY + tokenData.userId();
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(tokenKey, tokenData.token());
        redisTemplate.expire(tokenKey, refreshTokenValidity, TimeUnit.MILLISECONDS);
    }

    public Optional<TokenData> findByToken(final Long memberId) {
        String tokenKey = KEY + memberId; // 저장 시 사용한 KEY 패턴과 동일하게 맞춤
        String token = (String) redisTemplate.opsForValue().get(tokenKey);

        return Optional.ofNullable(token)
            .map(t -> new TokenData(t, memberId));
    }

    public void deleteByToken(final Long memberId) {
        redisTemplate.delete(KEY + memberId);
    }

    public long countActiveUsers() {
        return redisTemplate.keys("refresh_token:*").size();
    }

    public void registerActiveUsersGauge() {
        Gauge.builder("current_active_users", this, RefreshTokenRepository::countActiveUsers)
            .description("현재 동시 접속자 수")
            .register(meterRegistry);
    }
}
