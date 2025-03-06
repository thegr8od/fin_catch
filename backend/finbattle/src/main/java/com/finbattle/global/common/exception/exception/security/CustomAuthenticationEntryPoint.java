package com.finbattle.global.common.exception.exception.security;

import static com.finbattle.global.common.model.dto.BaseResponseStatus.JWT_INVALID;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.JWT_NOT_FOUND;
import static com.finbattle.global.common.model.dto.BaseResponseStatus.UNAUTHORIZED;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finbattle.global.common.model.dto.BaseResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
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
            errorResponse = new BaseResponse<>(UNAUTHORIZED);
        } else {
            switch (exceptionType) {
                case "JWT_NOT_FOUND":
                    errorResponse = new BaseResponse<>(JWT_NOT_FOUND);
                    break;
                case "JWT_INVALID":
                    errorResponse = new BaseResponse<>(JWT_INVALID);
                    break;
                default:
                    errorResponse = new BaseResponse<>(UNAUTHORIZED);
            }
        }
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
