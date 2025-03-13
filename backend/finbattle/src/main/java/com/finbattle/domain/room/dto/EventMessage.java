package com.finbattle.domain.room.dto;

import com.finbattle.domain.room.model.RedisRoom;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventMessage {

    private String event;
    private Long roomId;
    private Long userId;
    private String reason; // JOIN_FAIL, KICK_FAIL 등 실패 이유 저장용
    private int userCount; // 참가자 수
    private RedisRoom roomData;
}
