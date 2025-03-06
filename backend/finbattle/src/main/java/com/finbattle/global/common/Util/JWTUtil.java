package com.finbattle.global.common.Util;

import com.finbattle.global.common.exception.exception.BusinessException;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
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

    private SecretKey secretAccess;
    private SecretKey secretRefresh;
    @Value("${spring.jwt.access-token-validity}")
    private long accessTokenValidity;
    @Value("${spring.jwt.refresh-token-validity}")
    private long refreshTokenValidity;

    public JWTUtil(@Value("${spring.jwt.secret-access}") String access,
                    @Value("${spring.jwt.secret-refresh}") String refresh) {
        secretAccess = new SecretKeySpec(access.getBytes(StandardCharsets.UTF_8),
            Jwts.SIG.HS256.key().build().getAlgorithm());
        secretRefresh = new SecretKeySpec(refresh.getBytes(StandardCharsets.UTF_8),
            Jwts.SIG.HS256.key().build().getAlgorithm());
    }


    public Long getAccessMemberId(String token) {
        return getMemberId(token, secretAccess);
    }

    public String getAccessProviderId(String token) {
        return getProviderId(token, secretAccess);
    }

    public Long getRefreshMemberId(String token) {
        return getMemberId(token, secretRefresh);
    }

    public String getRefreshProviderId(String token) {
        return getProviderId(token, secretRefresh);
    }


    public String createAccessToken(String providerId, Long memberId) {
        return Jwts.builder()
            .claim("providerId", providerId)
            .claim("memberId", memberId)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
            .signWith(secretAccess)
            .compact();
    }

    public String createRefreshToken(String providerId, Long memberId) {
        return Jwts.builder()
            .claim("providerId", providerId)
            .claim("memberId", memberId)
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
            .signWith(secretRefresh)
            .compact();
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, secretAccess);
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, secretRefresh);
    }

    private Long getMemberId(String token, SecretKey secretkey) {
        return Jwts.parser().verifyWith(secretkey).build()
            .parseSignedClaims(token).getPayload()
            .get("memberId", Long.class);
    }

    private String getProviderId(String token, SecretKey secretkey) {
        return Jwts.parser().verifyWith(secretkey).build()
            .parseSignedClaims(token).getPayload()
            .get("providerId", String.class);
    }


    /**
     * JWT 전체 유효성 검증 (서명 & 만료 여부 확인)
     */
    private boolean validateToken(String token, SecretKey secretKey) {
        try {
            Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new BusinessException(BaseResponseStatus.JWT_EXPIRED);
        } catch (Exception e) {
            throw new BusinessException(BaseResponseStatus.JWT_INVALID);
        }
    }
}