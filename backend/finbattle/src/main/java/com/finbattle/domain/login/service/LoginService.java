package com.finbattle.domain.login.service;

import com.finbattle.domain.login.dto.AuthenticatedUser;
import com.finbattle.global.common.Util.CookieUtil;
import com.finbattle.global.common.Util.JWTUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final JWTUtil jwtUtil;
    private final CookieUtil cookieUtil;

    private void setTokens(AuthenticatedUser user, HttpServletResponse response) {
        String access = jwtUtil.createAccessToken(user.getProviderId(), user.getMemberId());
        String refresh = jwtUtil.createRefreshToken(user.getProviderId(), user.getMemberId());

        // 쿠키 설정
        response.addCookie(cookieUtil.createCookie("ACCESS", access));
        response.addCookie(cookieUtil.createCookie("REFRESH", refresh));
    }

    @Transactional
    public void logout(AuthenticatedUser user, HttpServletResponse response) {
        // 쿠키 제거
        Cookie accessCookie = cookieUtil.createCookie("ACCESS", null);
        Cookie refreshCookie = cookieUtil.createCookie("REFRESH", null);

        accessCookie.setMaxAge(0);
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}
