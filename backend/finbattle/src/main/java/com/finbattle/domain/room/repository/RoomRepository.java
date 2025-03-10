package com.finbattle.domain.room.repository;

import com.finbattle.domain.room.model.Room;
import com.finbattle.domain.room.model.RoomType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByRoomType(RoomType roomType);
}
