package com.finbattle.domain.game.repository;

import com.finbattle.domain.game.dto.GameData;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RedisGameRepository extends CrudRepository<GameData, Long> {

}
