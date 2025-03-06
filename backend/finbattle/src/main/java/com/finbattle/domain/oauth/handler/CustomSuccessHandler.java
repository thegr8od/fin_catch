package com.finbattle.domain.oauth.handler;

import com.finbattle.domain.token.service.TokenService;
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

    private final TokenService tokenService;
    private final CookieUtil cookieUtil;
    private final AuthenticationUtil authenticationUtil;

    @Value("${app.baseUrl}")
    private String baseUrl;
    private static final String LOGIN_SUCCESS_URI = "/api/member/login";

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {
        Long memberId = authenticationUtil.getMemberId();
        String providerId = authenticationUtil.getProviderId();

        //토큰 생성
        String accessToken = tokenService.createAccessToken(providerId, memberId);
        String refreshToken = tokenService.createRefreshToken(providerId, memberId);

        // 응답 설정
        response.setHeader("Authorization", "Bearer " + accessToken);
        response.addCookie(cookieUtil.createCookie("REFRESH", refreshToken));
        response.sendRedirect(baseUrl + LOGIN_SUCCESS_URI);
    }
}
