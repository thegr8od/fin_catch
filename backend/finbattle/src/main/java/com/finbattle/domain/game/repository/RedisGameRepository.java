package com.finbattle.domain.game.repository;

import com.finbattle.domain.game.model.GameData;
import org.springframework.data.repository.CrudRepository;

public interface RedisGameRepository extends CrudRepository<GameData, Long> {
    
}
