package com.finbattle.domain.room.dto;

import com.finbattle.domain.room.model.RedisRoom;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;

@Data
public class RoomContainer {

    private Map<String, String> users = new HashMap<>();
    // 예: {"1":"3", "2":"2"} ← userId:life
    private RedisRoom data;
    // 기존 RedisRoom: {roomId, maxPeople, status, host, members...}
}
