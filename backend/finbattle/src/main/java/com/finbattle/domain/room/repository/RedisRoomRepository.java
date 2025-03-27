package com.finbattle.domain.room.repository;

import com.finbattle.domain.room.model.RedisRoom;
import org.springframework.data.repository.CrudRepository;

public interface RedisRoomRepository extends CrudRepository<RedisRoom, Long> {

}
