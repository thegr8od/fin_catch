package com.finbattle.domain.room.dto;

import com.finbattle.domain.room.model.QuizType;
import com.finbattle.domain.room.model.RoomStatus;
import com.finbattle.domain.room.model.RoomType;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RoomResponse {

    private Long roomId;
    private String roomTitle;
    private RoomStatus status;
    private RoomType roomType;
    private QuizType quizType;
    private int maxPlayer;
    private LocalDateTime createdAt;
}
