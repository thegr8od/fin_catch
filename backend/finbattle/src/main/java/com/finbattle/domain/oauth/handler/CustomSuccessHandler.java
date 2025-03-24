package com.finbattle.domain.oauth.handler;

import com.finbattle.domain.token.service.TokenService;
import com.finbattle.global.common.Util.AuthenticationUtil;
import com.finbattle.global.common.Util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenService tokenService;
    private final CookieUtil cookieUtil;
    private final AuthenticationUtil authenticationUtil;

    @Value("${app.clientUrl}")
    private String baseUrl;
    private static final String LOGIN_SUCCESS_URI = "/signin?success=true";

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
        Authentication authentication) throws IOException {
        Long memberId = authenticationUtil.getMemberId();
        String providerId = authenticationUtil.getProviderId();

        //토큰 생성
        String refreshToken = tokenService.createRefreshToken(providerId, memberId);

        // 응답 설정
        response.addCookie(cookieUtil.createCookie("REFRESH", refreshToken));
        log.info("RefreshToken 생성 완료, {}", refreshToken);
        response.sendRedirect(baseUrl + LOGIN_SUCCESS_URI);
    }
}
