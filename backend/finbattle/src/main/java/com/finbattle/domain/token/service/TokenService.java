package com.finbattle.domain.token.service;

import com.finbattle.domain.token.dto.TokenData;
import com.finbattle.domain.token.repository.RefreshTokenRepository;
import com.finbattle.global.common.Util.JWTUtil;
import com.finbattle.global.common.exception.exception.BusinessException;
import com.finbattle.global.common.model.dto.BaseResponseStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenService {

    private final JWTUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    public String createAccessToken(String providerId, Long memberId) {
        return jwtUtil.createAccessToken(providerId, memberId);
    }

    public String createRefreshToken(String providerId, Long memberId) {
        String refreshToken = jwtUtil.createRefreshToken(providerId, memberId);
        log.info("Refresh Token 저장 완료!", refreshToken);
        refreshTokenRepository.save(new TokenData(refreshToken, memberId));
        return refreshToken;
    }

    public String reissueAccessToken(String refreshToken) {
        if (refreshToken == null) {
            throw new BusinessException(BaseResponseStatus.REFRESH_TOKEN_NOT_FOUND);
        }
        jwtUtil.validateRefreshToken(refreshToken);
        TokenData tokenData = refreshTokenRepository.findByToken(refreshToken)
            .orElseThrow(() -> new BusinessException(BaseResponseStatus.REFRESH_TOKEN_INVALID));
        Long memberId = jwtUtil.getRefreshMemberId(refreshToken);
        String providerId = jwtUtil.getRefreshProviderId(refreshToken);
        String accessToken = jwtUtil.createAccessToken(providerId, memberId);
        log.info("Access Token refresh 성공!");

        return accessToken;
    }

    @Transactional
    public void deleteRefreshToken(String refreshToken) {
        jwtUtil.validateRefreshToken(refreshToken);

        refreshTokenRepository.findByToken(refreshToken).ifPresent(tokenData -> {
            refreshTokenRepository.deleteByToken(refreshToken);
            log.info("사용자 ID {}: 로그아웃이 완료되었습니다.", tokenData.userId());
        });
    }
}
