package com.finbattle.domain.token.repository;

import com.finbattle.domain.token.dto.TokenData;
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

    @Value("${spring.jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    public void save(final TokenData tokenData) {
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(tokenData.token(), String.valueOf(tokenData.userId()));
        redisTemplate.expire(tokenData.token(), refreshTokenValidity, TimeUnit.MILLISECONDS);
    }

    public Optional<TokenData> findByToken(final String token) {
        String userId = (String) redisTemplate.opsForValue().get(token);
        return Optional.ofNullable(userId)
            .map(Long::valueOf)
            .map(id -> new TokenData(token, id));
    }

    public void deleteByToken(final String token) {
        redisTemplate.delete(token);
    }
}
