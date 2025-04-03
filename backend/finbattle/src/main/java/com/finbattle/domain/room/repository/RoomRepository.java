package com.finbattle.domain.room.repository;

import com.finbattle.domain.quiz.model.SubjectType;
import com.finbattle.domain.room.dto.RoomStatus;
import com.finbattle.domain.room.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {


    Page<Room> findByStatusOrderByUpdateAtDesc(RoomStatus status, Pageable pageable);

    Page<Room> findBySubjectTypeAndStatusOrderByUpdateAtDesc(SubjectType subjectType,
        RoomStatus status, Pageable pageable);
}
