package com.finbattle.global.common.filter;

import com.finbattle.domain.member.dto.AuthenticUser;
import com.finbattle.domain.oauth.dto.AuthenticatedUser;
import com.finbattle.global.common.Util.JWTUtil;
import com.finbattle.global.common.model.enums.PublicEndpoint;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
@Slf4j
@Component
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestUri = request.getRequestURI();

//        // ✅ 어떤 패턴이 `true`를 반환했는지 로그 출력
//        List<String> matchedPatterns = PublicEndpoint.getAll().stream()
//            .filter(pattern -> requestUri.startsWith(pattern)) // startsWith()가 true인 패턴 찾기
//            .toList(); // Java 16 이상
//
//        // 로그 추가
//        log.info("✅ requestUri: {} | startsWith 결과: {}", requestUri, !matchedPatterns.isEmpty());
//        log.info("✅ 매칭된 패턴들: {}", matchedPatterns);

        // ✅ `matches()`를 사용하여 정확한 패턴 매칭 수행
        return PublicEndpoint.getAll().stream()
            .anyMatch(pattern -> requestUri.matches(pattern.replace("**", ".*")));

    }

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
        FilterChain filterChain) throws ServletException, IOException {
        String accessToken = getTokenFromHeader(request);
        try {
            if (accessToken == null) {
                log.warn("JWT가 없습니다.");
                request.setAttribute("exception", "JWT_MISSING");  // JWT 자체가 없는 경우 추가
            } else {
                if (jwtUtil.validateAccessToken(accessToken)) {
                    authenticateUser(accessToken);
                }
            }
        } catch (ExpiredJwtException e) {
            log.warn("Expired JWT Token: {}", e.getMessage());
            request.setAttribute("exception", "JWT_EXPIRED");
        } catch (Exception e) {
            log.warn("Invalid JWT Token: {}", e.getMessage());
            request.setAttribute("exception", "JWT_INVALID");
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenFromHeader(HttpServletRequest request) {
        // 1️⃣ 요청 헤더에서 "Authorization" 키의 값 가져오기
        String bearerToken = request.getHeader("Authorization");
        // 2️⃣ "Bearer"로 시작하는지 확인
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // "Bearer " 이후의 토큰 값만 반환
        }
        return null;
    }

    private void authenticateUser(String token) {
        // JWT 토큰에서 사용자 정보 추출
        String providerId = jwtUtil.getAccessProviderId(token);
        Long memberId = jwtUtil.getAccessMemberId(token);

        AuthenticUser memberDto = AuthenticUser.builder()
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
    }
}
