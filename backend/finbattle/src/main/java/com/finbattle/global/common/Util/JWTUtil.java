package com.finbattle.global.common.Util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class JWTUtil {

    private SecretKey secretKey;
    @Value("${spring.jwt.access-token-validity}")
    private long accessTokenValidity;
    @Value("${spring.jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    public JWTUtil(@Value("${spring.jwt.secret}") String secret) {
        secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),
            Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    public Long getMemberId(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
            .parseSignedClaims(token).getPayload()
            .get("memberId", Long.class);
    }

    public String getProviderId(String token) {
        return Jwts.parser().verifyWith(secretKey).build()
            .parseSignedClaims(token).getPayload()
            .get("providerId", String.class);
    }


    /**
     * JWT 만료 여부 확인 Exeption 발생 시 만료된 토큰
     */
    public Boolean isExpired(String token) {
        return Jwts.parser().verifyWith(secretKey)
            .build().parseSignedClaims(token).getPayload()
            .getExpiration().before(new Date());
    }

    public String createAccessToken(String providerId, Long memberId) {
        return Jwts.builder()
            .claim("providerId", providerId)
            .claim("memberId", memberId)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
            .signWith(secretKey)
            .compact();
    }

    public String createRefreshToken(String providerId, Long memberId) {
        return Jwts.builder()
            .claim("providerId", providerId)
            .claim("memberId", memberId)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
            .signWith(secretKey)
            .compact();
    }

    /**
     * JWT 전체 유효성 검증 (서명 & 만료 여부 확인)
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            if (isExpired(token)) {
                log.warn("❌ JWT 검증 실패: 토큰이 만료됨");
                return false;
            }

            log.info("✅ JWT 검증 성공");
            return true;
        } catch (JwtException e) {
            log.error("❌ JWT 검증 실패: {}", e.getMessage());
            return false;
        }
    }


    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

}