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
            //log.info("STOMP {} 요청 - Authorization 헤더: {}", accessor.getCommand(), authHeader);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // "Bearer " 제거
                //log.info("추출된 JWT 토큰: {}", token);
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

                    //log.info("✅ STOMP {} 인증 성공 - memberId: {}, providerId: {}", accessor.getCommand(), memberId, providerId);
                } catch (Exception e) {
                    //log.warn("❌ JWT 인증 실패 - 토큰: {}, 오류: {}", token, e.getMessage());
                    throw new IllegalArgumentException(
                        "Invalid WebSocket token: " + e.getMessage());
                }
            } else {
                //log.warn("❌ Authorization 헤더 누락 또는 형식 오류 - 헤더: {}", authHeader);
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }
        }
        return message;
    }
}
//package com.finbattle.global.common.handler;
//
//
//import com.finbattle.domain.chat.model.StompPrincipal;
//import com.finbattle.domain.oauth.dto.AuthenticatedUser;
//import java.security.Principal;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.MessageChannel;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.messaging.support.ChannelInterceptor;
//import org.springframework.messaging.support.MessageHeaderAccessor;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.stereotype.Component;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class StompHandler implements ChannelInterceptor {
//
//    @Override
//    public Message<?> preSend(Message<?> message, MessageChannel channel) {
//        StompHeaderAccessor accessor =
//            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
//        if (accessor != null) {
//            Principal principal = accessor.getUser();
//            // 만약 principal이 Authentication 토큰인 경우 내부의 principal을 확인합니다.
//            if (principal instanceof UsernamePasswordAuthenticationToken token) {
//                Object userObj = token.getPrincipal();
//                if (userObj instanceof AuthenticatedUser user) {
//                    //log.info("user Data" + user.getMemberDto().toString());
//                    log.info("AuthenticatedUser memberId: {}", user.getMemberId());
//                    // 여기서 AuthenticatedUser에서 필요한 값을 꺼내 StompPrincipal 생성
//                    //AuthenticatedUser principal = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//                    StompPrincipal stompPrincipal =
//                        new StompPrincipal(user.getMemberId());
//                    accessor.setUser(stompPrincipal);
//                }
//            }
//        }
//        return message;
//    }
//}