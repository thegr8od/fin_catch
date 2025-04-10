package com.finbattle.global.common.exception.exception.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.global.common.model.dto.BaseResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException {

        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        // BaseResponse 활용

        String exceptionType = (String) request.getAttribute("exception");
        BaseResponse<String> errorResponse;
        if (exceptionType == null) {
            // JWT 자체가 존재하지 않음 -> 로그인 페이지로 리디렉션
            errorResponse = new BaseResponse<>("JWT does not exist. Redirect to login page.");
            log.warn("JWT가 없습니다. 로그인 페이지로 이동");
        } else {
            switch (exceptionType) {
                case "JWT_EXPIRED":
                    errorResponse = new BaseResponse<>("Access Token expired. Please refresh.");
                    break;
                case "JWT_INVALID":
                    errorResponse = new BaseResponse<>("Invalid JWT Token. Please log in again.");
                    break;
                default:
                    errorResponse = new BaseResponse<>("Unauthorized request. Please log in.");
            }
        }
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
