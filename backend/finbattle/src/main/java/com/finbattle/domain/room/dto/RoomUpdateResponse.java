package com.finbattle.domain.room.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RoomUpdateResponse {

    private boolean updated;       // 갱신 성공 여부
    private long secondsRemaining; // 남은 시간 (초)
}
