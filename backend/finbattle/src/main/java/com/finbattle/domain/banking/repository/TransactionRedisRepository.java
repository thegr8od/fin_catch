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

    private String getDatakey(String accountNo, String date) {
        return "account:" + accountNo + ":date:" + date.substring(0, 6);
    }

    public void save(String accountNo, TransactionList transactions, String date) {
        redisTemplate.opsForValue()
            .set(getDatakey(accountNo, date), transactions, 5, TimeUnit.MINUTES);
    }

    public Optional<TransactionList> findById(String accountNo, String date) {
        Object value = redisTemplate.opsForValue().get(getDatakey(accountNo, date));
        if (value instanceof TransactionList list) {
            return Optional.of(list);
        }
        return Optional.empty();
    }

    public void delete(String accountNo, String date) {
        redisTemplate.delete(getDatakey(accountNo, date));
    }
}
