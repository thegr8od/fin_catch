package com.finbattle.global.common.handler;

import com.finbattle.domain.chat.model.StompPrincipal;
import com.finbattle.global.common.Util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

    private final JWTUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // StompHeaderAccessor를 통해 메시지의 헤더에 접근
        StompHeaderAccessor accessor = MessageHeaderAccessor
            .getAccessor(message, StompHeaderAccessor.class);

        // CONNECT 또는 SEND 명령일 경우에만 처리
        if (StompCommand.CONNECT.equals(accessor.getCommand()) ||
            StompCommand.SEND.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " 제거
                try {
                    // JWT 검증 및 사용자 정보 추출
                    Long memberId = jwtUtil.getAccessMemberId(token);
                    String providerId = jwtUtil.getAccessProviderId(token);

                    // 인증 객체 생성 후 SecurityContext에 저장
                    StompPrincipal stompPrincipal = new StompPrincipal(memberId);
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(stompPrincipal, null,
                            null);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    accessor.setUser(stompPrincipal);

                } catch (Exception e) {
                    throw new IllegalArgumentException(
                        "Invalid WebSocket token: " + e.getMessage());
                }
            } else {
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }
        }
        return message;
    }
}
