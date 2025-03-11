package com.finbattle.domain.room.repository;

import com.finbattle.domain.room.model.MemberToRoom;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberToRoomRepository extends JpaRepository<MemberToRoom, Long> {

    List<MemberToRoom> findAllByRoomId(Long roomId);
}
