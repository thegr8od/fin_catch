package com.finbattle.domain.room.model;

// (추가 부분)
// Redis에 저장할 방 정보를 JSON 형태로 매핑하기 위한 DTO/엔티티
// RoomSubscriptionService에서 직렬화/역직렬화하여 사용

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class RedisRoom {

    private Long roomId;
    private int maxPeople;
    private RoomStatus status;    // OPEN, IN_PROGRESS, CLOSED, DELETED
    private RedisRoomMember host; // 방장 정보
    private List<RedisRoomMember> members = new ArrayList<>();
}
