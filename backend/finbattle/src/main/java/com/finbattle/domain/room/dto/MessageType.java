package com.finbattle.domain.room.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum MessageType {
    CREATE,         //방 만들기
    READY,          //방 준비하기
    COUNT,          //방 인원수
    JOIN_FAIL,      //방 참가 실패
    NOT_READY,      //방 준비 안됨
    DELETE,         //방 삭제
    LEAVE,          //방 떠나기
    KICK_FAIL,      //강퇴 실패
    KICK,           //강퇴
    INFO,           //방 정보
    START;        //인원 준비 안됨

    @JsonValue
    @Override
    public String toString() {
        return name();  // ✅ `name()`을 반환하여 대문자로 변환
    }

    @JsonCreator
    public static MessageType fromValue(String value) {
        for (MessageType type : values()) {
            if (type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown MessageType: " + value);
    }
}
