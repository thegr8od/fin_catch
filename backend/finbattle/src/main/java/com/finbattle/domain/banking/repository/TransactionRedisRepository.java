package com.finbattle.domain.banking.repository;

import com.finbattle.domain.banking.model.TransactionList;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TransactionRedisRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    private String getDatakey(String accountNo) {
        return "account:" + accountNo;
    }

    // 게임 저장
    public void save(String accountNo, TransactionList transactions) {
        redisTemplate.opsForValue().set(getDatakey(accountNo), transactions, 1, TimeUnit.HOURS);
    }

    // 게임 조회
    public Optional<TransactionList> findById(String accountNo) {
        Object value = redisTemplate.opsForValue().get(getDatakey(accountNo));
        if (value instanceof TransactionList list) {
            return Optional.of(list);
        }
        return Optional.empty();
    }

    // 게임 삭제
    public void delete(String accountNo) {
        redisTemplate.delete(getDatakey(accountNo));
    }
}
