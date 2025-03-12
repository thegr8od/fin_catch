package com.finbattle.domain.room.dto;

import lombok.Data;

@Data
public class RoomCreateRequest {

    private Long userId; // 방을 생성하는 사용자 ID
    private String roomTitle;
    private String password;
    private int maxPlayer;
    private String roomType; // ENUM (QUIZ, GENERAL, PRIVATE)
    private String quizType;
}