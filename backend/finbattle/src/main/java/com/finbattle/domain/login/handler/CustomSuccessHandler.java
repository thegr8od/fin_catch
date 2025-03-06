package com.finbattle.domain.login.handler;

import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.Util.CookieUtil;
import com.finbattle.global.common.Util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtil jwtUtil;
    private final CookieUtil cookieUtil;
    private final AuthenticationUtil authenticationUtil;

    @Value("${app.baseUrl}")
    private String baseUrl;
    private static final String LOGIN_SUCCESS_URI = "/api/login/success";

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {
        Long memberId = authenticationUtil.getMemberId();
        String providerId = authenticationUtil.getProviderId();

        //토큰 생성
        String access = jwtUtil.createAccessToken(providerId, memberId);
        String refresh = jwtUtil.createRefreshToken(providerId, memberId);

        // 일반 유저의 경우 7일 만료
        //redisService.saveWithExpiry(providerId, refresh, 7, TimeUnit.DAYS);

        // 응답 설정
        response.addCookie(cookieUtil.createCookie("ACCESS", access));
        response.addCookie(cookieUtil.createCookie("REFRESH", refresh));
        response.sendRedirect(baseUrl + LOGIN_SUCCESS_URI);

    }

}
