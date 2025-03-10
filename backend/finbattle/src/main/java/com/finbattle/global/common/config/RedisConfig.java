package com.finbattle.global.common.config;

import com.finbattle.global.common.redis.*;
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
    public RedisMessageListenerContainer redisContainer(
            RedisConnectionFactory connectionFactory,
            RedisChatSubscriber chatSubscriber,
            RedisGameInfoSubscriber gameInfoSubscriber,
            // 게임 관련 채널은 제외 (힌트는 퀴즈에만 있음)
            RedisGameQuizSubscriber gameQuizSubscriber,
            RedisGameQuizResultSubscriber gameQuizResultSubscriber,
            RedisGameQuizHintSubscriber gameQuizHintSubscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        // 기존 채팅, 게임 정보 리스너
        container.addMessageListener(chatSubscriber, new PatternTopic("chat"));
        container.addMessageListener(gameInfoSubscriber, new PatternTopic("game-info"));

        // 퀴즈 관련 리스너 등록
        container.addMessageListener(gameQuizSubscriber, new PatternTopic("game-quiz"));
        container.addMessageListener(gameQuizResultSubscriber, new PatternTopic("game-quizResult"));
        container.addMessageListener(gameQuizHintSubscriber, new PatternTopic("game-quizHint"));

        return container;
    }
}
