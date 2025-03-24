package com.finbattle.domain.room.repository;

import com.finbattle.domain.room.model.RedisRoom;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RedisRoomRepository extends CrudRepository<RedisRoom, Long> {

}
