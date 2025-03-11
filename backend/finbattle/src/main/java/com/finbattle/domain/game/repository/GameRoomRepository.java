package com.finbattle.domain.game.repository;

import com.finbattle.domain.game.model.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GameRoomRepository extends JpaRepository<GameRoom, Long> {
    Optional<GameRoom> findByRoomId(String roomId);
}
