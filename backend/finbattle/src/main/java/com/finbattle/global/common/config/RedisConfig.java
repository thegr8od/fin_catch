package com.finbattle.global.common.config;

import com.finbattle.global.common.redis.RedisChatSubscriber;
import com.finbattle.global.common.redis.RedisGameInfoSubscriber;
import com.finbattle.global.common.redis.RedisGameHintSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        // 기본 설정 (필요 시 host/port 커스터마이징)
        return new LettuceConnectionFactory();
    }


    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        StringRedisSerializer serializer = new StringRedisSerializer();
        template.setKeySerializer(serializer);
        template.setValueSerializer(serializer);
        template.setHashKeySerializer(serializer);
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        return template;
    }


    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
                                                        RedisChatSubscriber chatSubscriber,
                                                        RedisGameInfoSubscriber gameInfoSubscriber,
                                                        RedisGameHintSubscriber gameHintSubscriber) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        // 채팅 메시지 구독 (채널명: "chat")
        container.addMessageListener(chatSubscriber, new PatternTopic("chat"));
        // 게임 정보 메시지 구독 (채널명: "game-info")
        container.addMessageListener(gameInfoSubscriber, new PatternTopic("game-info"));
        // 게임 힌트 메시지 구독 (채널명: "game-hint")
        container.addMessageListener(gameHintSubscriber, new PatternTopic("game-hint"));
        return container;
    }
}
