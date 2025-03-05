package com.finbattle.global.common.filter;

import com.finbattle.domain.login.dto.AuthenticatedUser;
import com.finbattle.domain.member.entity.dto.MemberDto;
import com.finbattle.global.common.Util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
@Slf4j
public class jwtFilter extends OncePerRequestFilter{
    private final JWTUtil jwtUtil;

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        String token = getTokenFromCookies(request.getCookies());

        if (token == null) {
            log.warn("JWT not found in request");
            filterChain.doFilter(request, response);
            return;
        }

        if(jwtUtil.isExpired(token)){
            log.warn("JWT is expired");
            filterChain.doFilter(request, response);
            return;
        }

        // JWT 토큰에서 사용자 정보 추출
        String providerId = jwtUtil.getProviderId(token);
        Long memberId = jwtUtil.getMemberId(token);

        MemberDto memberDto = MemberDto.builder()
            .providerId(providerId)
            .memberId(memberId)
            .build();

        // Spring Security 인증 객체 생성 및 설정
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(memberDto);
        Authentication authToken = new UsernamePasswordAuthenticationToken(
            authenticatedUser,
            null,
            authenticatedUser.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authToken);
        filterChain.doFilter(request, response);
    }

    /**
     * 쿠키 배열에서 ACCESS 토큰을 추출
     *
     * @param cookies 쿠키 배열
     * @return ACCESS 토큰 값 또는 null
     */
    private String getTokenFromCookies(Cookie[] cookies) {
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("ACCESS")) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
