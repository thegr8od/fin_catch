package com.finbattle.global.common.config;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 구독할 때 사용할 prefix
        registry.enableSimpleBroker("/topic", "/queue");
        // 클라이언트가 메시지 보낼 때 사용할 prefix
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // setAllowedOrigins("*") 대신 setAllowedOriginPatterns("*") 사용
        registry.addEndpoint("/ws/firechat")
                .setAllowedOriginPatterns("*") // 모든 출처 허용 (운영환경에서는 필요한 도메인만 허용)
                .withSockJS();
    }
}
