package com.finbattle.domain.room.model;

public enum RoomStatus {
    OPEN,          // 대기중
    IN_PROGRESS,   // 게임 진행중
    CLOSED,        // 게임 종료 or 대기방 삭제
}
