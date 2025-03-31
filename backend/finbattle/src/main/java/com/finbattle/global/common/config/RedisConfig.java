package com.finbattle.global.common.config;

import com.finbattle.global.common.redis.RedisChatSubscriber;
import com.finbattle.global.common.redis.RedisGameSubscriber;
import com.finbattle.global.common.redis.RedisRoomSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

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
        RedisGameSubscriber gameSubscriber,
        RedisRoomSubscriber roomSubscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        container.addMessageListener(chatSubscriber, new PatternTopic("chat:*"));
        container.addMessageListener(gameSubscriber, new PatternTopic("game:*"));
        container.addMessageListener(roomSubscriber, new PatternTopic("room:*"));

        return container;
    }
}
