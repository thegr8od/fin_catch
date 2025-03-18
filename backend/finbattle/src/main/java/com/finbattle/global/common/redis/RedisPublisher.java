package com.finbattle.global.common.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    //  메시지를 객체(여기서는 문자열)를 발행
    public void publish(String channel, Object message) {
        log.info("🚀 Redis Pub/Sub 발행: Channel={}, Message={}", channel, message);
        redisTemplate.convertAndSend(channel, message);
    }
}
