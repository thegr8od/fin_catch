package com.finbattle.domain.room.dto;

// (추가 부분)
// RedisRoom 내부에 들어갈 멤버 정보
// "status"는 READY/NOT_READY 등의 값을 가정

import lombok.Data;

@Data
public class RedisRoomMember {

    private Long memberId;
    private String status; // 예: "READY", "NOT_READY"
    private String nickname;
    private String mainCat;
    
}
